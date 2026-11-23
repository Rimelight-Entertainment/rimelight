/**
 * Rimelight Space people read routes on the website Worker (port of the read handlers in people_service.rs,
 * the SQL in pg_people.rs and the seat reads in people_seats.rs). Read-only: the directory, one person and their
 * org position, the org chart, departments, teams, positions, seats and my own profile.
 *
 * Visibility follows the Rust rules: work fields for every signed-in person; personal contact fields for the
 * person, admins and HR, and anyone above the person in the manager chain; inactive people for admins only.
 * The org seat chart carries no money.
 */
import { Hono, type Context } from "hono";
import { getDb } from "../db/index.ts";
import { caller, isResponse } from "./session.ts";

type Sql = ReturnType<typeof getDb>["$client"];

const people = new Hono();

const ROLE_ADMIN = "admin";
const ROLE_HR = "hr";
const SEAT_CLOSED = "closed";

const DEFAULT_PAGE_LIMIT = 50;
const MAX_PAGE_LIMIT = 100;
const ORG_TREE_LIMIT = 10000;
const TEAM_MEMBER_LIMIT = 1000;
/** Guard for the manager chain walk (as in the Rust code). */
const MAX_ANCESTOR_DEPTH = 64;
/** Guard for the department tree depth (as in the Rust code). */
const MAX_DEPARTMENT_DEPTH = 32;
/** Guard for the seat chart depth (as in the Rust code). */
const MAX_SEAT_DEPTH = 10000;

const UUID = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;
const isUuid = (value: string) => UUID.test(value);

const noStore = { "Cache-Control": "no-store" };

/** One person as the database returns them (aliases match the JSON field names where they differ). */
type PersonRow = {
  id: string;
  email: string;
  display_name: string;
  preferred_name: string | null;
  pronouns: string | null;
  title: string | null;
  position_id: string | null;
  department_id: string | null;
  department_name: string | null;
  team_id: string | null;
  team_name: string | null;
  manager_id: string | null;
  location: string | null;
  timezone: string | null;
  work_phone: string | null;
  bio: string | null;
  skills: string[];
  start_date: string | null;
  avatar_key: string | null;
  is_active: boolean;
  roles: string[];
  personal_phone: string | null;
  personal_email: string | null;
  address: string | null;
  birthday: string | null;
  emergency_contact: string | null;
};

type DepartmentRow = {
  id: string;
  name: string;
  parent_department_id: string | null;
  head_id: string | null;
  member_count: number;
};

type TeamRow = {
  id: string;
  name: string;
  department_id: string;
  lead_id: string | null;
  member_count: number;
};

/** A job title (decision 0042). Salary is not read here: the directory carries no money. */
type PositionRow = {
  id: string;
  title: string;
  level: string;
  description: string;
  salary_min: null;
  salary_max: null;
  currency: null;
  seat_count: number;
  filled_count: number;
  open_count: number;
};

/** A slot in a team holding a position. Title and level come from the position; money is not read here. */
type SeatJson = {
  id: string;
  team_id: string;
  team_name: string;
  job_profile_id: string;
  job_profile_title: string;
  level: string;
  salary_min: null;
  salary_max: null;
  currency: null;
  state: string;
  person_id: string | null;
  person_name: string | null;
  reports_to_seat_id: string | null;
};

type SeatNode = { seat: SeatJson; reports: SeatNode[] };

type DepartmentNode = { department: DepartmentRow; children: DepartmentNode[] };

type PeopleFilter = {
  q: string | null;
  teamId: string | null;
  departmentId: string | null;
  includeInactive: boolean;
};

/** Columns of a person with the derived title, department, team and roles. Callers add WHERE, ORDER BY and LIMIT. */
function personSelect(sql: Sql) {
  return sql`SELECT u.id::text AS id, u.email, u.name AS display_name,
      u.preferred_name, u.pronouns,
      COALESCE(p.title, u.title) AS title,
      u.position_id::text AS position_id,
      u.department_id::text AS department_id, d.name AS department_name,
      u.team_id::text AS team_id, t.name AS team_name,
      u.manager_id::text AS manager_id,
      u.location, u.timezone, u.work_phone, u.bio,
      u.skills::text[] AS skills,
      u.start_date::text AS start_date, u.avatar_key, u.is_active,
      u.personal_phone, u.personal_email, u.address,
      u.birthday::text AS birthday, u.emergency_contact,
      COALESCE((SELECT array_agg(r.role ORDER BY r.role) FROM user_roles r WHERE r.user_id = u.id), '{}')::text[] AS roles
    FROM employees u
    LEFT JOIN positions p ON p.id = u.position_id
    LEFT JOIN departments d ON d.id = u.department_id
    LEFT JOIN teams t ON t.id = u.team_id`;
}

/** Any non-deleted person, active or not. */
async function loadPerson(sql: Sql, id: string): Promise<PersonRow | null> {
  const rows = await sql`${personSelect(sql)} WHERE u.id = ${id}::uuid AND u.deleted_at IS NULL`;
  return (rows[0] as unknown as PersonRow | undefined) ?? null;
}

function unauthorizedResponse(): Response {
  return Response.json(
    { error: "unauthorized", message: "Sign in to continue." },
    { status: 401, headers: noStore },
  );
}

/** The signed-in person with their roles, or the 401/500 response to send back. */
async function viewer(c: Context, sql: Sql): Promise<PersonRow | Response> {
  const who = await caller(c);
  if (isResponse(who)) return who;
  const me = await loadPerson(sql, who.id);
  return me ?? unauthorizedResponse();
}

const isAdmin = (p: PersonRow) => p.roles.includes(ROLE_ADMIN);
const seesAllPersonal = (p: PersonRow) => p.roles.includes(ROLE_ADMIN) || p.roles.includes(ROLE_HR);

/** A person another employee may look up. Inactive people are visible to admins only. */
async function visiblePerson(sql: Sql, me: PersonRow, id: string): Promise<PersonRow | null> {
  if (!isUuid(id)) return null;
  const subject = await loadPerson(sql, id);
  if (!subject) return null;
  return subject.is_active || isAdmin(me) ? subject : null;
}

/** Ancestors of a person, nearest first, that still exist (not deleted). */
async function managerChain(sql: Sql, id: string): Promise<PersonRow[]> {
  const ancestors = await sql`
    WITH RECURSIVE up(uid, depth) AS (
      SELECT manager_id, 1 FROM employees WHERE id = ${id}::uuid
      UNION ALL
      SELECT m.manager_id, up.depth + 1 FROM up JOIN employees m ON m.id = up.uid
       WHERE up.uid IS NOT NULL AND up.depth < ${MAX_ANCESTOR_DEPTH}
    )
    SELECT uid::text AS uid FROM up WHERE uid IS NOT NULL ORDER BY depth`;
  const chain: PersonRow[] = [];
  for (const row of ancestors) {
    const ancestor = await loadPerson(sql, row["uid"] as string);
    if (ancestor) chain.push(ancestor);
  }
  return chain;
}

/** Active people who report directly to a person, in name order. */
async function directReports(sql: Sql, id: string): Promise<PersonRow[]> {
  const rows = await sql`${personSelect(sql)}
    WHERE u.manager_id = ${id}::uuid AND u.is_active AND u.deleted_at IS NULL
    ORDER BY lower(u.name), u.id::text`;
  return rows as unknown as PersonRow[];
}

/** People in name order, after the cursor id, up to `limit`. Same filter rules as the Rust store. */
async function listPeople(
  sql: Sql,
  filter: PeopleFilter,
  after: string | null,
  limit: number,
): Promise<PersonRow[]> {
  const pattern = filter.q === null ? null : `%${filter.q.replace(/[\\%_]/g, (m) => `\\${m}`)}%`;
  const rows = await sql`${personSelect(sql)}
    WHERE u.deleted_at IS NULL
      AND (${filter.includeInactive}::bool OR u.is_active)
      AND (${pattern}::text IS NULL OR u.name ILIKE ${pattern}::text
           OR u.email ILIKE ${pattern}::text
           OR COALESCE(p.title, u.title, '') ILIKE ${pattern}::text)
      AND (${filter.teamId}::text IS NULL OR u.team_id = ${filter.teamId}::text::uuid)
      AND (${filter.departmentId}::text IS NULL OR u.department_id = ${filter.departmentId}::text::uuid)
      AND (${after}::text IS NULL OR (lower(u.name), u.id::text) > (
            SELECT lower(a.name), a.id::text FROM employees a WHERE a.id = ${after}::text::uuid))
    ORDER BY lower(u.name), u.id::text
    LIMIT ${limit}::bigint`;
  return rows as unknown as PersonRow[];
}

/** Whether `me` may see the personal fields of `subject`. */
async function canSeePersonal(sql: Sql, me: PersonRow, subject: PersonRow): Promise<boolean> {
  if (me.id === subject.id || seesAllPersonal(me)) return true;
  const chain = await managerChain(sql, subject.id);
  return chain.some((manager) => manager.id === me.id);
}

const avatarUrl = (p: PersonRow) => (p.avatar_key == null ? null : `/v1/avatars/${p.avatar_key}`);

function summary(p: PersonRow) {
  return {
    id: p.id,
    display_name: p.display_name,
    title: p.title,
    team: p.team_name,
    avatar_url: avatarUrl(p),
  };
}

function profile(p: PersonRow) {
  return {
    id: p.id,
    email: p.email,
    display_name: p.display_name,
    preferred_name: p.preferred_name,
    pronouns: p.pronouns,
    title: p.title,
    position_id: p.position_id,
    department_id: p.department_id,
    department_name: p.department_name,
    team_id: p.team_id,
    team_name: p.team_name,
    manager_id: p.manager_id,
    location: p.location,
    timezone: p.timezone,
    work_phone: p.work_phone,
    bio: p.bio,
    skills: p.skills,
    start_date: p.start_date,
    avatar_url: avatarUrl(p),
    is_active: p.is_active,
    roles: p.roles,
  };
}

function personal(p: PersonRow) {
  return {
    personal_phone: p.personal_phone,
    personal_email: p.personal_email,
    address: p.address,
    birthday: p.birthday,
    emergency_contact: p.emergency_contact,
  };
}

/** A query id: absent or empty is null, a non-uuid is "invalid", else the lower-case id. */
function uuidQuery(raw: string | undefined): string | null {
  const value = raw?.trim();
  if (!value) return null;
  if (!isUuid(value)) return "invalid";
  return value.toLowerCase();
}

/** The page size: absent is the default, a number from 1 up (capped at 100), anything else is "invalid". */
function pageLimit(raw: string | undefined): number | "invalid" {
  if (raw === undefined) return DEFAULT_PAGE_LIMIT;
  const value = raw.trim();
  if (!/^\+?\d+$/.test(value)) return "invalid";
  const n = Number(value);
  if (n === 0 || n > 4294967295) return "invalid";
  return Math.min(n, MAX_PAGE_LIMIT);
}

function badRequest(c: Context, message: string) {
  return c.json({ error: "invalid_request", message }, 400, noStore);
}

function notFound(c: Context, message: string) {
  return c.json({ error: "not_found", message }, 404, noStore);
}

function serverError(c: Context) {
  return c.json(
    { error: "server_error", message: "Something went wrong. Try again in a moment." },
    500,
    noStore,
  );
}

async function listDepartments(sql: Sql): Promise<DepartmentRow[]> {
  const rows = await sql`
    SELECT d.id::text AS id, d.name,
           d.parent_department_id::text AS parent_department_id,
           d.head_id::text AS head_id,
           (SELECT count(*)::int FROM employees m
             WHERE m.department_id = d.id AND m.deleted_at IS NULL) AS member_count
      FROM departments d
     ORDER BY d.name`;
  return rows as unknown as DepartmentRow[];
}

/** Builds the department tree from the flat list. Depth is capped as a guard against bad data. */
function departmentTree(
  all: DepartmentRow[],
  parent: string | null,
  depth: number,
): DepartmentNode[] {
  if (depth > MAX_DEPARTMENT_DEPTH) return [];
  return all
    .filter((d) => (d.parent_department_id ?? null) === parent)
    .map((d) => ({ department: d, children: departmentTree(all, d.id, depth + 1) }));
}

async function listTeams(sql: Sql): Promise<TeamRow[]> {
  const rows = await sql`
    SELECT t.id::text AS id, t.name, t.department_id::text AS department_id,
           t.lead_id::text AS lead_id,
           (SELECT count(*)::int FROM employees m
             WHERE m.team_id = t.id AND m.deleted_at IS NULL) AS member_count
      FROM teams t
     ORDER BY t.name`;
  return rows as unknown as TeamRow[];
}

async function listPositions(sql: Sql): Promise<PositionRow[]> {
  const rows = await sql`
    SELECT p.id::text AS id, p.title, p.level, p.description,
           (SELECT count(*)::int FROM seats s WHERE s.job_profile_id = p.id) AS seat_count,
           (SELECT count(*)::int FROM seats s WHERE s.job_profile_id = p.id AND s.state = 'filled') AS filled_count,
           (SELECT count(*)::int FROM seats s WHERE s.job_profile_id = p.id AND s.state = 'open') AS open_count
      FROM positions p
     ORDER BY p.title, p.id::text`;
  return rows.map((r) => ({
    id: r["id"] as string,
    title: r["title"] as string,
    level: r["level"] as string,
    description: r["description"] as string,
    salary_min: null,
    salary_max: null,
    currency: null,
    seat_count: Number(r["seat_count"]),
    filled_count: Number(r["filled_count"]),
    open_count: Number(r["open_count"]),
  }));
}

/** Every seat, in team name, position title and id order. Money is not read: the org chart carries none. */
async function listSeats(sql: Sql): Promise<SeatJson[]> {
  const rows = await sql`
    SELECT s.id::text AS id, s.team_id::text AS team_id, t.name AS team_name,
           s.job_profile_id::text AS job_profile_id, p.title AS job_profile_title, p.level, s.state,
           s.person_id::text AS person_id, u.name AS person_name,
           s.reports_to_seat_id::text AS reports_to_seat_id
      FROM seats s
      JOIN teams t ON t.id = s.team_id
      JOIN positions p ON p.id = s.job_profile_id
      LEFT JOIN employees u ON u.id = s.person_id
     ORDER BY t.name, p.title, s.id::text`;
  return rows.map((r) => ({
    id: r["id"] as string,
    team_id: r["team_id"] as string,
    team_name: r["team_name"] as string,
    job_profile_id: r["job_profile_id"] as string,
    job_profile_title: r["job_profile_title"] as string,
    level: r["level"] as string,
    state: r["state"] as string,
    person_id: (r["person_id"] as string | null) ?? null,
    person_name: (r["person_name"] as string | null) ?? null,
    reports_to_seat_id: (r["reports_to_seat_id"] as string | null) ?? null,
    salary_min: null,
    salary_max: null,
    currency: null,
  }));
}

/** The org chart from every seat that is not closed. A seat whose parent is missing or closed is a root. */
function seatTree(seats: SeatJson[]): SeatNode[] {
  const live = seats.filter((s) => s.state !== SEAT_CLOSED);
  const ids = new Set(live.map((s) => s.id));
  const node = (seat: SeatJson, depth: number): SeatNode => ({
    seat,
    reports:
      depth >= MAX_SEAT_DEPTH
        ? []
        : live.filter((s) => s.reports_to_seat_id === seat.id).map((s) => node(s, depth + 1)),
  });
  return live
    .filter((s) => {
      const parent = s.reports_to_seat_id;
      return parent == null || !ids.has(parent);
    })
    .map((s) => node(s, 0));
}

/** GET /departments/tree: every department as a tree, by name. */
people.get("/departments/tree", async (c) => {
  try {
    const sql = getDb().$client;
    const me = await viewer(c, sql);
    if (isResponse(me)) return me;
    return c.json(departmentTree(await listDepartments(sql), null, 0), 200, noStore);
  } catch (err) {
    console.error("space /departments/tree failed", err);
    return serverError(c);
  }
});

/** GET /teams: every team with its member count, by name. */
people.get("/teams", async (c) => {
  try {
    const sql = getDb().$client;
    const me = await viewer(c, sql);
    if (isResponse(me)) return me;
    return c.json(await listTeams(sql), 200, noStore);
  } catch (err) {
    console.error("space /teams failed", err);
    return serverError(c);
  }
});

/** GET /teams/:id: one team with its active members (up to 1000). */
people.get("/teams/:id", async (c) => {
  try {
    const sql = getDb().$client;
    const me = await viewer(c, sql);
    if (isResponse(me)) return me;
    const id = c.req.param("id");
    const team = (await listTeams(sql)).find((t) => t.id === id);
    if (!team) return notFound(c, "There is no such team.");
    const members = await listPeople(
      sql,
      { q: null, teamId: team.id, departmentId: null, includeInactive: false },
      null,
      TEAM_MEMBER_LIMIT,
    );
    return c.json({ team, members: members.map(summary) }, 200, noStore);
  } catch (err) {
    console.error("space /teams/:id failed", err);
    return serverError(c);
  }
});

/** GET /positions: every job position with its holder count, by title. */
people.get("/positions", async (c) => {
  try {
    const sql = getDb().$client;
    const me = await viewer(c, sql);
    if (isResponse(me)) return me;
    return c.json(await listPositions(sql), 200, noStore);
  } catch (err) {
    console.error("space /positions failed", err);
    return serverError(c);
  }
});

/** GET /people: the directory. Query: q, team, department, cursor, limit (1 to 100, default 50). */
people.get("/people", async (c) => {
  try {
    const sql = getDb().$client;
    const me = await viewer(c, sql);
    if (isResponse(me)) return me;

    const q = c.req.query("q")?.trim() ?? "";
    const team = uuidQuery(c.req.query("team"));
    const department = uuidQuery(c.req.query("department"));
    const cursor = uuidQuery(c.req.query("cursor"));
    if (team === "invalid" || department === "invalid" || cursor === "invalid") {
      return badRequest(c, "A query id is not a valid id.");
    }
    const limit = pageLimit(c.req.query("limit"));
    if (limit === "invalid") return badRequest(c, "limit must be a number from 1 to 100.");

    const rows = await listPeople(
      sql,
      {
        q: q === "" ? null : q,
        teamId: team,
        departmentId: department,
        includeInactive: false,
      },
      cursor,
      limit + 1,
    );
    const hasMore = rows.length > limit;
    const items = (hasMore ? rows.slice(0, limit) : rows).map(summary);
    const nextCursor = hasMore ? (rows[limit - 1]?.id ?? null) : null;
    return c.json({ items, next_cursor: nextCursor }, 200, noStore);
  } catch (err) {
    console.error("space /people failed", err);
    return serverError(c);
  }
});

/** GET /people/:id: one person's work profile, and their personal fields when the caller may see them. */
people.get("/people/:id", async (c) => {
  try {
    const sql = getDb().$client;
    const me = await viewer(c, sql);
    if (isResponse(me)) return me;
    const subject = await visiblePerson(sql, me, c.req.param("id"));
    if (!subject) return notFound(c, "There is no such person.");
    const personalFields = (await canSeePersonal(sql, me, subject)) ? personal(subject) : null;
    return c.json({ profile: profile(subject), personal: personalFields }, 200, noStore);
  } catch (err) {
    console.error("space /people/:id failed", err);
    return serverError(c);
  }
});

/** GET /people/:id/org: a person's summary, their manager chain (nearest first) and direct reports. */
people.get("/people/:id/org", async (c) => {
  try {
    const sql = getDb().$client;
    const me = await viewer(c, sql);
    if (isResponse(me)) return me;
    const subject = await visiblePerson(sql, me, c.req.param("id"));
    if (!subject) return notFound(c, "There is no such person.");
    const chain = await managerChain(sql, subject.id);
    const reports = await directReports(sql, subject.id);
    return c.json(
      {
        person: summary(subject),
        manager_chain: chain.map(summary),
        direct_reports: reports.map(summary),
      },
      200,
      noStore,
    );
  } catch (err) {
    console.error("space /people/:id/org failed", err);
    return serverError(c);
  }
});

/** GET /org/tree: every active person, in name order, for the company org chart (manager_id links them). */
people.get("/org/tree", async (c) => {
  try {
    const sql = getDb().$client;
    const me = await viewer(c, sql);
    if (isResponse(me)) return me;
    const rows = await listPeople(
      sql,
      { q: null, teamId: null, departmentId: null, includeInactive: false },
      null,
      ORG_TREE_LIMIT,
    );
    return c.json(
      rows.map((p) => ({
        id: p.id,
        name: p.display_name,
        title: p.title,
        avatar_url: avatarUrl(p),
        manager_id: p.manager_id,
        team: p.team_name,
      })),
      200,
      noStore,
    );
  } catch (err) {
    console.error("space /org/tree failed", err);
    return serverError(c);
  }
});

/** GET /org/seats: the org chart built from seats, for every employee. No money. */
people.get("/org/seats", async (c) => {
  try {
    const sql = getDb().$client;
    const me = await viewer(c, sql);
    if (isResponse(me)) return me;
    return c.json(seatTree(await listSeats(sql)), 200, noStore);
  } catch (err) {
    console.error("space /org/seats failed", err);
    return serverError(c);
  }
});

/** GET /me/profile: the signed-in person's work profile and personal fields. */
people.get("/me/profile", async (c) => {
  try {
    const sql = getDb().$client;
    const me = await viewer(c, sql);
    if (isResponse(me)) return me;
    return c.json({ profile: profile(me), personal: personal(me) }, 200, noStore);
  } catch (err) {
    console.error("space /me/profile failed", err);
    return serverError(c);
  }
});

export default people;
