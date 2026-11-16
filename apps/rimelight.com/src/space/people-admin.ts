/**
 * Rimelight Space people ADMIN write routes on the website Worker (port of the admin handlers in
 * people_service.rs, the seat and budget handlers in people_seats.rs, and the SQL in pg_people.rs).
 *
 * Admin routes need the `admin` role. The money reads (`GET /admin/seats`, `GET /admin/team-budgets`) allow
 * `admin` or `hr`, as the Rust `money_viewer` does. Errors use the Rust codes and messages; an unexpected
 * database failure is a 500 `server_error`.
 */
import type { Context } from "hono";
import { Hono } from "hono";
import { getDb } from "../db/index.ts";
import {
  Auth0Error,
  createEmployeeAccount,
  deleteAccount,
  managementToken,
  sendPasswordSetupEmail,
} from "./auth0-management.ts";
import { caller, isResponse } from "./session.ts";
import type { Caller } from "./session.ts";

type Sql = ReturnType<typeof getDb>["$client"];
// Postgres rows and parsed request bodies are untyped JSON; each field is checked where it is used.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Row = any;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Body = any;

const ROLE_ADMIN = "admin";
const ROLE_HR = "hr";
const ROLES = [ROLE_ADMIN, ROLE_HR];

const SEAT_OPEN = "open";
const SEAT_FILLED = "filled";
const SEAT_CLOSED = "closed";
const SEAT_STATES = ["planned", "open", "filled", "closed"];

const DEFAULT_PAGE_LIMIT = 50;
const MAX_PAGE_LIMIT = 100;
const MAX_CHAIN = 10_000;
const MAX_WHOLE_MONEY = 9_999_999_999;

const ADMIN_DENIED = "Only admins can do this.";
const MONEY_DENIED = "Only admins and HR can see this.";
const UUID = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;
const SEAT_FIELDS = [
  "team_id",
  "job_profile_id",
  "title",
  "level",
  "state",
  "person_id",
  "reports_to_seat_id",
  "salary_min",
  "salary_max",
  "currency",
];

/** Carries a ready-made error response out of a handler. */
class Failure {
  readonly response: Response;
  constructor(response: Response) {
    this.response = response;
  }
}

const admin = new Hono();

// ---------------------------------------------------------------------------------------------
// Errors and small helpers
// ---------------------------------------------------------------------------------------------

function apiError(status: number, code: string, message: string): Response {
  return Response.json(
    { error: code, message },
    { status, headers: { "Cache-Control": "no-store" } },
  );
}

function serverError(): Response {
  return apiError(500, "server_error", "Something went wrong. Try again in a moment.");
}

function fail(status: number, code: string, message: string): never {
  throw new Failure(apiError(status, code, message));
}

function notFound(message: string): never {
  return fail(404, "not_found", message);
}

function invalid(field: string, message: string): never {
  return fail(422, "invalid_field", `${field}: ${message}`);
}

function conflict(code: string, message: string): never {
  return fail(409, code, message);
}

function badRequest(message = "The request body is not valid."): never {
  return fail(400, "invalid_request", message);
}

/** Runs a handler body; a Failure becomes its response, anything else a 500. */
async function handle(c: Context, run: () => Promise<Response>): Promise<Response> {
  try {
    return await run();
  } catch (err) {
    if (err instanceof Failure) return err.response;
    const detail = err instanceof Error ? `${err.name}: ${err.message}` : String(err);
    console.error(`space people-admin failed ${c.req.method} ${c.req.path}: ${detail}`);
    return serverError();
  }
}

/** A Postgres unique or foreign-key violation (the store's `Conflict`). */
function isConstraint(err: unknown): boolean {
  const code = (err as { code?: unknown } | null)?.code;
  return code === "23505" || code === "23503";
}

function isUuid(value: string): boolean {
  return UUID.test(value);
}

/** Absent or empty is `null`; anything else is kept as given. */
function emptyToNull(value: string | undefined): string | null {
  return value === undefined || value === "" ? null : value;
}

/** A query id: absent or empty is `null`, a non-uuid is a 400, a uuid is lower-cased. */
function uuidParam(raw: string | undefined): string | null {
  const value = raw?.trim() ?? "";
  if (value === "") return null;
  if (isUuid(value)) return value.toLowerCase();
  return badRequest("A query id is not a valid id.");
}

function pageLimit(raw: string | undefined): number {
  if (raw === undefined) return DEFAULT_PAGE_LIMIT;
  const text = raw.trim();
  if (!/^\+?[0-9]+$/.test(text)) return badRequest("limit must be a number from 1 to 100.");
  const n = Number(text);
  if (n === 0 || n > 4_294_967_295) return badRequest("limit must be a number from 1 to 100.");
  return Math.min(n, MAX_PAGE_LIMIT);
}

/** Trims a text field and enforces its length. An empty value is kept (it means "clear" in a patch). */
function text(field: string, value: string | undefined, max: number): string | undefined {
  if (value === undefined) return undefined;
  const trimmed = value.trim();
  if (Array.from(trimmed).length > max) invalid(field, `at most ${max} characters`);
  return trimmed;
}

/** A required text field: trimmed, non-empty, within `max` characters. */
function required(field: string, value: string | undefined, max: number): string {
  const trimmed = (value ?? "").trim();
  if (trimmed === "") invalid(field, "is required");
  if (Array.from(trimmed).length > max) invalid(field, `at most ${max} characters`);
  return trimmed;
}

/** `YYYY-MM-DD` with a real calendar day. An empty value is kept (it means "clear"). */
function date(field: string, value: string | undefined): string | undefined {
  if (value === undefined) return undefined;
  const trimmed = value.trim();
  if (trimmed === "" || isIsoDate(trimmed)) return trimmed;
  return invalid(field, "use the form YYYY-MM-DD");
}

function isIsoDate(value: string): boolean {
  if (!/^[0-9]{4}-[0-9]{2}-[0-9]{2}$/.test(value)) return false;
  const year = Number(value.slice(0, 4));
  const month = Number(value.slice(5, 7));
  const day = Number(value.slice(8, 10));
  const leap = (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
  const days = [31, leap ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31][month - 1];
  if (days === undefined) return false;
  return day >= 1 && day <= days;
}

/** The value a patch will leave in place: the patch's own value when it sets one, else the current one. */
function pick(patch: string | undefined, current: string | null): string | null {
  if (patch !== undefined) return patch === "" ? null : patch;
  return current;
}

/**
 * Parses a JSON object body. Unknown keys, a non-object body and wrong types are a 400, as serde's
 * `deny_unknown_fields` is in Rust. `null` and a missing key both read as `undefined` (serde's `None`).
 */
async function readBody(
  c: Context,
  strings: readonly string[],
  bools: readonly string[] = [],
  requiredStrings: readonly string[] = [],
): Promise<Body> {
  let raw: unknown;
  try {
    raw = await c.req.json();
  } catch {
    return badRequest();
  }
  if (typeof raw !== "object" || raw === null || Array.isArray(raw)) return badRequest();
  const source = raw as Record<string, unknown>;
  const allowed = new Set([...strings, ...bools]);
  for (const key of Object.keys(source)) {
    if (!allowed.has(key)) return badRequest();
  }
  const out: Body = {};
  for (const key of strings) {
    const value = source[key];
    if (value === undefined || value === null) {
      if (requiredStrings.includes(key)) return badRequest();
      out[key] = undefined;
    } else if (typeof value === "string") {
      out[key] = value;
    } else {
      return badRequest();
    }
  }
  for (const key of bools) {
    const value = source[key];
    if (value === undefined || value === null) {
      out[key] = undefined;
    } else if (typeof value === "boolean") {
      out[key] = value;
    } else {
      return badRequest();
    }
  }
  return out;
}

// ---------------------------------------------------------------------------------------------
// Authorisation
// ---------------------------------------------------------------------------------------------

/** The signed-in person when they hold one of `roles`, else the 403 (or 401/500) to send back. */
async function gate(
  c: Context,
  roles: readonly string[],
  denied: string,
): Promise<Caller | Response> {
  const who = await caller(c);
  if (isResponse(who)) return who;
  try {
    const sql = getDb().$client;
    const rows: Row[] = await sql`
      SELECT 1 FROM user_roles r
       WHERE r.user_id = ${who.id}::text::uuid
         AND r.role = ANY(${[...roles]}::text[])
       LIMIT 1`;
    if (rows.length > 0) return who;
  } catch (err) {
    console.error("space people-admin role check failed", err);
    return serverError();
  }
  return apiError(403, "forbidden", denied);
}

// ---------------------------------------------------------------------------------------------
// People
// ---------------------------------------------------------------------------------------------

type Person = {
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
};

const str = (value: unknown): string | null =>
  value === null || value === undefined ? null : String(value);

function toPerson(r: Row): Person {
  return {
    id: String(r.id),
    email: String(r.email),
    display_name: String(r.display_name),
    preferred_name: str(r.preferred_name),
    pronouns: str(r.pronouns),
    title: str(r.title),
    position_id: str(r.position_id),
    department_id: str(r.department_id),
    department_name: str(r.department_name),
    team_id: str(r.team_id),
    team_name: str(r.team_name),
    manager_id: str(r.manager_id),
    location: str(r.location),
    timezone: str(r.timezone),
    work_phone: str(r.work_phone),
    bio: str(r.bio),
    skills: (r.skills as string[] | null) ?? [],
    start_date: str(r.start_date),
    avatar_key: str(r.avatar_key),
    is_active: r.is_active === true,
    roles: (r.roles as string[] | null) ?? [],
  };
}

function avatarUrl(person: Person): string | null {
  return person.avatar_key === null ? null : `/v1/avatars/${person.avatar_key}`;
}

/** Work fields of one person (the `Profile` the admin users page reads). */
function profile(person: Person) {
  return {
    id: person.id,
    email: person.email,
    display_name: person.display_name,
    preferred_name: person.preferred_name,
    pronouns: person.pronouns,
    title: person.title,
    position_id: person.position_id,
    department_id: person.department_id,
    department_name: person.department_name,
    team_id: person.team_id,
    team_name: person.team_name,
    manager_id: person.manager_id,
    location: person.location,
    timezone: person.timezone,
    work_phone: person.work_phone,
    bio: person.bio,
    skills: person.skills,
    start_date: person.start_date,
    avatar_url: avatarUrl(person),
    is_active: person.is_active,
    roles: person.roles,
  };
}

/** Short form used in lists (`PersonSummary`). */
function summary(person: Person) {
  return {
    id: person.id,
    display_name: person.display_name,
    title: person.title,
    team: person.team_name,
    avatar_url: avatarUrl(person),
  };
}

/** The person select of pg_people.rs (`PERSON_SELECT`) with the columns the admin routes return. */
function personSelect(sql: Sql) {
  return sql`
    SELECT u.id::text AS id, u.email, u.name AS display_name, u.preferred_name, u.pronouns,
           COALESCE(p.title, u.title) AS title,
           u.position_id::text AS position_id, u.department_id::text AS department_id, d.name AS department_name,
           u.team_id::text AS team_id, t.name AS team_name, u.manager_id::text AS manager_id,
           u.location, u.timezone, u.work_phone, u.bio, u.skills,
           u.start_date::text AS start_date, u.avatar_key, u.is_active,
           COALESCE((SELECT array_agg(r.role::text ORDER BY r.role::text)
                       FROM user_roles r WHERE r.user_id = u.id), '{}') AS roles
      FROM employees u
      LEFT JOIN positions p ON p.id = u.position_id
      LEFT JOIN departments d ON d.id = u.department_id
      LEFT JOIN teams t ON t.id = u.team_id`;
}

/** One active or deactivated person, not deleted. */
async function getPerson(sql: Sql, id: string): Promise<Person | null> {
  const rows: Row[] = await sql`${personSelect(sql)}
    WHERE u.id = ${id}::text::uuid AND u.deleted_at IS NULL`;
  return rows[0] ? toPerson(rows[0]) : null;
}

function likePattern(q: string): string {
  const escaped = q.replace(/\\/g, "\\\\").replace(/%/g, "\\%").replace(/_/g, "\\_");
  return `%${escaped}%`;
}

async function listPeople(
  sql: Sql,
  filter: {
    q: string | null;
    team: string | null;
    department: string | null;
    includeInactive: boolean;
  },
  after: string | null,
  limit: number,
): Promise<Person[]> {
  const pattern = filter.q === null ? null : likePattern(filter.q);
  const rows: Row[] = await sql`${personSelect(sql)}
    WHERE u.deleted_at IS NULL
      AND (${filter.includeInactive}::bool OR u.is_active)
      AND (${pattern}::text IS NULL OR u.name ILIKE ${pattern}::text
           OR u.email ILIKE ${pattern}::text
           OR COALESCE(p.title, u.title, '') ILIKE ${pattern}::text)
      AND (${filter.team}::text IS NULL OR u.team_id = ${filter.team}::text::uuid)
      AND (${filter.department}::text IS NULL OR u.department_id = ${filter.department}::text::uuid)
      AND (${after}::text IS NULL OR (lower(u.name), u.id::text) >
           (SELECT lower(a.name), a.id::text FROM employees a WHERE a.id = ${after}::text::uuid))
    ORDER BY lower(u.name), u.id::text
    LIMIT ${limit}::bigint`;
  return rows.map(toPerson);
}

/** Ancestors of a person, nearest first, capped at 64 levels. */
async function managerChain(sql: Sql, id: string): Promise<Person[]> {
  const rows: Row[] = await sql`
    WITH RECURSIVE up(uid, depth) AS (
      SELECT manager_id, 1 FROM employees WHERE id = ${id}::text::uuid
      UNION ALL
      SELECT m.manager_id, up.depth + 1 FROM up JOIN employees m ON m.id = up.uid
       WHERE up.uid IS NOT NULL AND up.depth < 64)
    SELECT uid::text AS uid FROM up WHERE uid IS NOT NULL ORDER BY depth`;
  const chain: Person[] = [];
  for (const row of rows as Row[]) {
    const person = await getPerson(sql, String(row.uid));
    if (person) chain.push(person);
  }
  return chain;
}

async function peopleWithRole(sql: Sql, role: string): Promise<Person[]> {
  const rows: Row[] = await sql`${personSelect(sql)}
    WHERE u.is_active AND u.deleted_at IS NULL
      AND EXISTS (SELECT 1 FROM user_roles x WHERE x.user_id = u.id AND x.role = ${role}::text)
    ORDER BY lower(u.name), u.id::text`;
  return rows.map(toPerson);
}

// ---------------------------------------------------------------------------------------------
// Departments, teams, positions, seats (reads used by the writes)
// ---------------------------------------------------------------------------------------------

type Department = {
  id: string;
  name: string;
  parent_department_id: string | null;
  head_id: string | null;
  member_count: number;
};

type Team = {
  id: string;
  name: string;
  department_id: string;
  lead_id: string | null;
  member_count: number;
};

type Position = {
  id: string;
  title: string;
  department_id: string | null;
  level: string;
  description: string;
  member_count: number;
};

type Seat = {
  id: string;
  team_id: string;
  team_name: string;
  job_profile_id: string | null;
  title: string;
  level: string;
  state: string;
  person_id: string | null;
  person_name: string | null;
  reports_to_seat_id: string | null;
  salary_min: string | null;
  salary_max: string | null;
  currency: string | null;
};

type TeamBudgetRow = {
  team_id: string;
  team_name: string;
  cap: string | null;
  currency: string | null;
};

async function listDepartments(sql: Sql): Promise<Department[]> {
  const rows: Row[] = await sql`
    SELECT d.id::text AS id, d.name, d.parent_department_id::text AS parent_department_id,
           d.head_id::text AS head_id,
           (SELECT count(*)::int FROM employees m WHERE m.department_id = d.id AND m.deleted_at IS NULL) AS member_count
      FROM departments d
     ORDER BY d.name`;
  return rows.map((r: Row) => ({
    id: String(r.id),
    name: String(r.name),
    parent_department_id: str(r.parent_department_id),
    head_id: str(r.head_id),
    member_count: Number(r.member_count),
  }));
}

async function listTeams(sql: Sql): Promise<Team[]> {
  const rows: Row[] = await sql`
    SELECT t.id::text AS id, t.name, t.department_id::text AS department_id, t.lead_id::text AS lead_id,
           (SELECT count(*)::int FROM employees m WHERE m.team_id = t.id AND m.deleted_at IS NULL) AS member_count
      FROM teams t
     ORDER BY t.name`;
  return rows.map((r: Row) => ({
    id: String(r.id),
    name: String(r.name),
    department_id: String(r.department_id),
    lead_id: str(r.lead_id),
    member_count: Number(r.member_count),
  }));
}

async function listPositions(sql: Sql): Promise<Position[]> {
  const rows: Row[] = await sql`
    SELECT p.id::text AS id, p.title, p.department_id::text AS department_id, p.level, p.description,
           (SELECT count(*)::int FROM employees m WHERE m.position_id = p.id AND m.deleted_at IS NULL) AS member_count
      FROM positions p
     ORDER BY p.title`;
  return rows.map((r: Row) => ({
    id: String(r.id),
    title: String(r.title),
    department_id: str(r.department_id),
    level: String(r.level),
    description: String(r.description),
    member_count: Number(r.member_count),
  }));
}

async function listSeats(sql: Sql): Promise<Seat[]> {
  const rows: Row[] = await sql`
    SELECT s.id::text AS id, s.team_id::text AS team_id, t.name AS team_name,
           s.job_profile_id::text AS job_profile_id, s.title, s.level, s.state,
           s.person_id::text AS person_id, u.name AS person_name,
           s.reports_to_seat_id::text AS reports_to_seat_id,
           s.salary_min::text AS salary_min, s.salary_max::text AS salary_max, s.currency::text AS currency
      FROM seats s
      JOIN teams t ON t.id = s.team_id
      LEFT JOIN employees u ON u.id = s.person_id
     ORDER BY t.name, s.title, s.id::text`;
  return rows.map((r: Row) => ({
    id: String(r.id),
    team_id: String(r.team_id),
    team_name: String(r.team_name),
    job_profile_id: str(r.job_profile_id),
    title: String(r.title),
    level: String(r.level),
    state: String(r.state),
    person_id: str(r.person_id),
    person_name: str(r.person_name),
    reports_to_seat_id: str(r.reports_to_seat_id),
    salary_min: str(r.salary_min),
    salary_max: str(r.salary_max),
    currency: str(r.currency),
  }));
}

async function listTeamBudgets(sql: Sql): Promise<TeamBudgetRow[]> {
  const rows: Row[] = await sql`
    SELECT t.id::text AS team_id, t.name AS team_name, t.budget_cap::text AS cap,
           t.budget_currency::text AS currency
      FROM teams t
     ORDER BY t.name`;
  return rows.map((r: Row) => ({
    team_id: String(r.team_id),
    team_name: String(r.team_name),
    cap: str(r.cap),
    currency: str(r.currency),
  }));
}

async function syncSeatedPeople(sql: Sql): Promise<void> {
  await sql`
    UPDATE employees u
       SET team_id = s.team_id, manager_id = ms.person_id
      FROM seats s
      LEFT JOIN seats ms ON ms.id = s.reports_to_seat_id
     WHERE s.person_id = u.id AND s.state = 'filled'`;
}

// ---------------------------------------------------------------------------------------------
// Money (people_seats.rs)
// ---------------------------------------------------------------------------------------------

/** Parses a decimal amount such as "52000" or "52000.5" into minor units. Non-negative, at most two decimals. */
function parseMoney(value: string): number | null {
  const dot = value.indexOf(".");
  const whole = dot < 0 ? value : value.slice(0, dot);
  const frac = dot < 0 ? "" : value.slice(dot + 1);
  const digits = (s: string) => /^[0-9]*$/.test(s);
  if (whole === "" || !digits(whole) || !digits(frac) || frac.length > 2) return null;
  const wholeAmount = Number(whole);
  if (wholeAmount > MAX_WHOLE_MONEY) return null;
  const cents = frac === "" ? 0 : Number(frac.padEnd(2, "0"));
  return wholeAmount * 100 + cents;
}

/** Formats minor units as a two-decimal string such as "52000.00". */
function formatMoney(minor: number): string {
  const sign = minor < 0 ? "-" : "";
  const abs = Math.abs(minor);
  const cents = String(abs % 100).padStart(2, "0");
  return `${sign}${Math.floor(abs / 100)}.${cents}`;
}

/** A three-letter upper-case currency code such as GBP. */
function currencyCode(value: string): string | null {
  const code = value.trim();
  return /^[A-Z]{3}$/.test(code) ? code : null;
}

/** The budget of each team: `used` is the top of the salary range of its filled and open seats in the budget currency. */
function budgetRows(rows: TeamBudgetRow[], seats: Seat[]) {
  return rows.map((row) => {
    let used = 0;
    if (row.currency !== null) {
      for (const seat of seats) {
        if (
          seat.team_id === row.team_id &&
          (seat.state === SEAT_FILLED || seat.state === SEAT_OPEN) &&
          seat.currency === row.currency &&
          seat.salary_max !== null
        ) {
          const max = parseMoney(seat.salary_max);
          if (max !== null) used += max;
        }
      }
    }
    const cap = row.cap === null ? null : parseMoney(row.cap);
    return {
      team_id: row.team_id,
      team_name: row.team_name,
      cap: row.cap,
      currency: row.currency,
      used: formatMoney(used),
      remaining: cap === null ? null : formatMoney(cap - used),
    };
  });
}

// ---------------------------------------------------------------------------------------------
// Reference checks (people_service.rs check_refs and check_department_refs)
// ---------------------------------------------------------------------------------------------

async function checkRefs(
  sql: Sql,
  department: string | null,
  team: string | null,
  manager: string | null,
  position: string | null,
): Promise<void> {
  for (const value of [department, team, manager, position]) {
    if (value !== null && !isUuid(value)) {
      fail(422, "unknown_reference", "A referenced id does not exist.");
    }
  }
  if (department !== null) {
    const found = (await listDepartments(sql)).some((d) => d.id === department);
    if (!found) fail(422, "unknown_department", "That department does not exist.");
  }
  if (team !== null) {
    const found = (await listTeams(sql)).find((t) => t.id === team);
    if (!found) fail(422, "unknown_team", "That team does not exist.");
    if (department !== null && found.department_id !== department) {
      fail(422, "team_department_mismatch", "The team belongs to a different department.");
    }
  }
  if (manager !== null && !(await getPerson(sql, manager))) {
    fail(422, "unknown_manager", "That manager does not exist.");
  }
  if (position !== null && !(await listPositions(sql)).some((p) => p.id === position)) {
    fail(422, "unknown_position", "That position does not exist.");
  }
}

async function checkDepartmentRefs(
  sql: Sql,
  parent: string | null,
  own: string | null,
  head: string | null,
): Promise<void> {
  if (parent !== null) {
    const departments = await listDepartments(sql);
    if (!isUuid(parent) || !departments.some((d) => d.id === parent)) {
      fail(422, "unknown_department", "The parent department does not exist.");
    }
    // Walk up from the parent: reaching the department being edited would make a loop.
    if (own !== null) {
      let cursor: string | null = parent;
      let steps = 0;
      while (cursor !== null) {
        if (cursor === own || steps > 64) {
          fail(422, "department_cycle", "That parent would make a loop.");
        }
        const current: string = cursor;
        cursor = departments.find((d) => d.id === current)?.parent_department_id ?? null;
        steps += 1;
      }
    }
  }
  if (head !== null && (!isUuid(head) || !(await getPerson(sql, head)))) {
    fail(422, "unknown_head", "The head of department does not exist.");
  }
}

// ---------------------------------------------------------------------------------------------
// Seats (people_seats.rs resolve, check_parent, salary)
// ---------------------------------------------------------------------------------------------

function checkParent(parent: string, selfId: string | null, seats: Seat[]): void {
  const first = seats.find((s) => s.id === parent);
  if (!first) invalid("reports_to_seat_id", "does not exist");
  if (first.state === SEAT_CLOSED) invalid("reports_to_seat_id", "is closed");
  let cursor: string | null = parent;
  for (let i = 0; i < MAX_CHAIN; i++) {
    if (cursor === null) return;
    if (selfId !== null && cursor === selfId) {
      conflict("reporting_loop", "That seat reports, through its chain, back to this seat.");
    }
    const current: string = cursor;
    cursor = seats.find((s) => s.id === current)?.reports_to_seat_id ?? null;
  }
  conflict("reporting_loop", "The reporting chain is too long.");
}

function salaryField(
  field: string,
  value: string | undefined,
  current: string | null,
): string | null {
  if (value === "") return null;
  if (value !== undefined) {
    const minor = parseMoney(value.trim());
    if (minor === null) invalid(field, "must be an amount such as 52000.00");
    return formatMoney(minor);
  }
  return current;
}

type SeatWrite = {
  team_id: string;
  job_profile_id: string;
  title: string;
  level: string;
  state: string;
  person_id: string;
  reports_to_seat_id: string;
  salary_min: string;
  salary_max: string;
  currency: string;
};

/** Resolves a seat write into the full row to store. `current` is the seat being updated (null on create). */
function resolveSeat(
  current: Seat | null,
  body: Body,
  teams: Team[],
  positions: Position[],
  seats: Seat[],
  budgets: TeamBudgetRow[],
  person: (id: string) => Person | null,
): SeatWrite {
  const selfId = current === null ? null : current.id;

  let teamId: string;
  if (body.team_id === undefined) {
    if (current === null) invalid("team_id", "is required");
    teamId = current.team_id;
  } else if (body.team_id === "") {
    invalid("team_id", "is required");
  } else {
    if (!teams.some((t) => t.id === body.team_id)) invalid("team_id", "does not exist");
    teamId = body.team_id;
  }

  let title: string;
  if (body.title !== undefined) {
    title = required("title", body.title, 120);
  } else if (current !== null) {
    title = current.title;
  } else {
    invalid("title", "is required");
  }

  let level: string;
  if (body.level !== undefined) {
    level = Array.from(String(body.level).trim()).slice(0, 60).join("");
  } else {
    level = current === null ? "" : current.level;
  }

  let jobProfileId: string;
  if (body.job_profile_id === undefined) {
    jobProfileId = current?.job_profile_id ?? "";
  } else if (body.job_profile_id === "") {
    jobProfileId = "";
  } else {
    if (!positions.some((p) => p.id === body.job_profile_id)) {
      invalid("job_profile_id", "does not exist");
    }
    jobProfileId = body.job_profile_id;
  }

  let reportsTo: string;
  if (body.reports_to_seat_id === undefined) {
    reportsTo = current?.reports_to_seat_id ?? "";
  } else if (body.reports_to_seat_id === "") {
    reportsTo = "";
  } else {
    checkParent(body.reports_to_seat_id, selfId, seats);
    reportsTo = body.reports_to_seat_id;
  }

  let personId: string;
  if (body.person_id === undefined) {
    personId = current?.person_id ?? "";
  } else if (body.person_id === "") {
    personId = "";
  } else {
    const value: string = body.person_id;
    if (!isUuid(value) || person(value)?.is_active !== true) {
      invalid("person_id", "is not an active person");
    }
    if (seats.some((s) => s.person_id === value && s.id !== selfId)) {
      conflict("person_seated", "This person already holds a seat.");
    }
    personId = value;
  }
  const hasPerson = personId !== "";

  let state: string;
  const requested: string | undefined = body.state;
  if (requested !== undefined && !SEAT_STATES.includes(requested)) {
    invalid("state", "is not a seat state");
  }
  if (requested === SEAT_CLOSED) {
    if (hasPerson) conflict("seat_filled", "Vacate the seat before closing it.");
    state = SEAT_CLOSED;
  } else if (requested === SEAT_FILLED) {
    if (!hasPerson) invalid("state", "a filled seat needs a person");
    state = SEAT_FILLED;
  } else if (requested !== undefined && hasPerson) {
    state = SEAT_FILLED;
  } else if (requested !== undefined) {
    state = requested;
  } else if (hasPerson) {
    state = SEAT_FILLED;
  } else if (current !== null && current.state === SEAT_FILLED) {
    state = SEAT_OPEN;
  } else {
    state = current === null ? SEAT_OPEN : current.state;
  }

  const budgetCurrency = budgets.find((b) => b.team_id === teamId)?.currency ?? null;
  const min = salaryField("salary_min", body.salary_min, current?.salary_min ?? null);
  const max = salaryField("salary_max", body.salary_max, current?.salary_max ?? null);
  if (min !== null && max !== null && (parseMoney(min) ?? 0) > (parseMoney(max) ?? 0)) {
    invalid("salary_max", "must be at least salary_min");
  }

  let currency: string | null;
  if (body.currency === undefined) {
    currency = current?.currency ?? null;
  } else if (body.currency === "") {
    currency = null;
  } else {
    const code = currencyCode(body.currency);
    if (code === null) invalid("currency", "must be a code such as GBP");
    currency = code;
  }
  if (min !== null || max !== null) {
    if (currency === null) invalid("currency", "is required with a salary");
    if (budgetCurrency !== null && budgetCurrency !== currency) {
      invalid("currency", "must match the team's budget currency");
    }
  }

  return {
    team_id: teamId,
    job_profile_id: jobProfileId,
    title,
    level,
    state,
    person_id: personId,
    reports_to_seat_id: reportsTo,
    salary_min: min ?? "",
    salary_max: max ?? "",
    currency: currency ?? "",
  };
}

/** Loads what resolveSeat needs and resolves a write. */
async function resolveFor(sql: Sql, current: Seat | null, body: Body): Promise<SeatWrite> {
  const teams = await listTeams(sql);
  const positions = await listPositions(sql);
  const seats = await listSeats(sql);
  const budgets = await listTeamBudgets(sql);
  const people = new Map<string, Person>();
  const personId: string | undefined = body.person_id;
  if (personId && isUuid(personId)) {
    const found = await getPerson(sql, personId);
    if (found) people.set(personId, found);
  }
  return resolveSeat(
    current,
    body,
    teams,
    positions,
    seats,
    budgets,
    (id) => people.get(id) ?? null,
  );
}

/** Inserts a seat; a constraint violation is `seat_conflict`, as in write_seat. */
async function insertSeat(sql: Sql, input: SeatWrite): Promise<string> {
  try {
    const rows: Row[] = await sql`
      INSERT INTO seats (team_id, job_profile_id, title, level, state, person_id,
                         reports_to_seat_id, salary_min, salary_max, currency)
      VALUES (${input.team_id}::text::uuid, NULLIF(${input.job_profile_id}::text, '')::uuid,
              ${input.title}::text, ${input.level}::text, ${input.state}::text,
              NULLIF(${input.person_id}::text, '')::uuid, NULLIF(${input.reports_to_seat_id}::text, '')::uuid,
              NULLIF(${input.salary_min}::text, '')::numeric, NULLIF(${input.salary_max}::text, '')::numeric,
              NULLIF(${input.currency}::text, ''))
      RETURNING id::text AS id`;
    return String(rows[0]?.id);
  } catch (err) {
    if (isConstraint(err)) conflict("seat_conflict", "This seat conflicts with another seat.");
    throw err;
  }
}

// ---------------------------------------------------------------------------------------------
// Routes: users and roles
// ---------------------------------------------------------------------------------------------

/** POST /admin/users */
admin.post("/admin/users", (c) =>
  handle(c, async () => {
    const actor = await gate(c, [ROLE_ADMIN], ADMIN_DENIED);
    if (isResponse(actor)) return actor;
    const body = await readBody(
      c,
      [
        "email",
        "display_name",
        "title",
        "position_id",
        "department_id",
        "team_id",
        "manager_id",
        "start_date",
      ],
      [],
      ["email", "display_name"],
    );
    const email = required("email", body.email, 254).toLowerCase();
    if (!email.includes("@") || /\s/.test(email)) invalid("email", "is not an email address");
    const displayName = required("display_name", body.display_name, 200);
    const title = text("title", body.title, 200);
    const positionId = emptyToNull(body.position_id);
    const departmentId = emptyToNull(body.department_id);
    const teamId = emptyToNull(body.team_id);
    const managerId = emptyToNull(body.manager_id);
    const startDate = date("start_date", body.start_date);

    const sql = getDb().$client;
    await checkRefs(sql, departmentId, teamId, managerId, positionId);

    // The Auth0 account comes first; the employees row is inserted only once it exists, so a failed
    // Auth0 call leaves no row behind.
    let token: string;
    let account: { userId: string; created: boolean };
    try {
      token = await managementToken();
      account = await createEmployeeAccount(token, email, displayName);
    } catch (err) {
      console.error(
        "space people-admin: Auth0 account create failed",
        err instanceof Auth0Error ? err.message : "unexpected error",
      );
      return fail(502, "auth0_error", "The sign-in account could not be created. Try again.");
    }

    let id: string;
    try {
      const rows: Row[] = await sql`
        INSERT INTO employees (email, name, title, position_id, department_id, team_id, manager_id, start_date, auth0_id)
        VALUES (${email}::text, ${displayName}::text, NULLIF(${title ?? ""}::text, ''),
                NULLIF(${positionId ?? ""}::text, '')::uuid, NULLIF(${departmentId ?? ""}::text, '')::uuid,
                NULLIF(${teamId ?? ""}::text, '')::uuid, NULLIF(${managerId ?? ""}::text, '')::uuid,
                NULLIF(${startDate ?? ""}::text, '')::date, ${account.userId}::text)
        RETURNING id::text AS id`;
      id = String(rows[0]?.id);
    } catch (err) {
      // Roll back only an account this request created; a reused account belongs to someone already.
      if (account.created) {
        try {
          await deleteAccount(token, account.userId);
        } catch (rollbackErr) {
          console.error(
            "space people-admin: Auth0 rollback failed",
            rollbackErr instanceof Auth0Error ? rollbackErr.message : "unexpected error",
          );
        }
      }
      if (isConstraint(err)) conflict("email_taken", "Another person already has this email.");
      throw err;
    }

    // The password setup email is best effort: the person exists and can still use Forgot password.
    try {
      await sendPasswordSetupEmail(token, account.userId);
    } catch (err) {
      console.error(
        "space people-admin: password setup email failed",
        err instanceof Auth0Error ? err.message : "unexpected error",
      );
    }

    const created = await getPerson(sql, id);
    if (!created) throw new Error("created person not found");
    return c.json(profile(created), 201, { "Cache-Control": "no-store" });
  }),
);

/** GET /admin/users: the directory's paging and search, with deactivated people too. */
admin.get("/admin/users", (c) =>
  handle(c, async () => {
    const actor = await gate(c, [ROLE_ADMIN], ADMIN_DENIED);
    if (isResponse(actor)) return actor;
    const q = c.req.query("q")?.trim() ?? "";
    const team = uuidParam(c.req.query("team"));
    const department = uuidParam(c.req.query("department"));
    const after = uuidParam(c.req.query("cursor"));
    const limit = pageLimit(c.req.query("limit"));

    const sql = getDb().$client;
    const rows = await listPeople(
      sql,
      { q: q === "" ? null : q, team, department, includeInactive: true },
      after,
      limit + 1,
    );
    let items = rows;
    let nextCursor: string | null = null;
    if (rows.length > limit) {
      items = rows.slice(0, limit);
      const last = items[items.length - 1];
      nextCursor = last ? last.id : null;
    }
    return c.json({ items: items.map(profile), next_cursor: nextCursor }, 200, {
      "Cache-Control": "no-store",
    });
  }),
);

/** PATCH /admin/users/:id */
admin.patch("/admin/users/:id", (c) =>
  handle(c, async () => {
    const actor = await gate(c, [ROLE_ADMIN], ADMIN_DENIED);
    if (isResponse(actor)) return actor;
    const id = c.req.param("id") ?? "";
    if (!isUuid(id)) notFound("There is no such person.");
    const sql = getDb().$client;
    const current = await getPerson(sql, id);
    if (!current) notFound("There is no such person.");

    const body = await readBody(
      c,
      ["title", "position_id", "department_id", "team_id", "manager_id", "start_date"],
      ["is_active"],
    );
    // An admin cannot deactivate their own account (the last admin would be locked out).
    if (body.is_active === false && actor.id === id) {
      conflict("self_deactivation", "An admin cannot deactivate their own account.");
    }
    const patch = {
      title: text("title", body.title, 200),
      position_id: body.position_id as string | undefined,
      department_id: body.department_id as string | undefined,
      team_id: body.team_id as string | undefined,
      manager_id: body.manager_id as string | undefined,
      start_date: date("start_date", body.start_date),
      is_active: body.is_active as boolean | undefined,
    };
    const effectiveDepartment = pick(patch.department_id, current.department_id);
    const effectiveTeam = pick(patch.team_id, current.team_id);
    const effectiveManager = pick(patch.manager_id, current.manager_id);
    const effectivePosition = pick(patch.position_id, current.position_id);
    await checkRefs(sql, effectiveDepartment, effectiveTeam, effectiveManager, effectivePosition);

    // Manager changes: a person cannot manage themselves, and the new manager cannot sit under them.
    if (patch.manager_id !== undefined && patch.manager_id !== "") {
      const newManager = patch.manager_id;
      if (newManager === id) fail(422, "manager_is_self", "A person cannot be their own manager.");
      const above = await managerChain(sql, newManager);
      if (above.some((p) => p.id === id)) {
        fail(422, "manager_cycle", "That manager reports to this person.");
      }
    }

    // A team moved to another department would leave its members in the wrong one.
    if (
      patch.department_id !== undefined &&
      patch.department_id !== "" &&
      effectiveDepartment !== current.department_id &&
      effectiveTeam !== null &&
      patch.team_id === undefined
    ) {
      fail(422, "team_department_mismatch", "Move the person to a team in the new department too.");
    }

    const title = patch.title ?? null;
    const positionId = patch.position_id ?? null;
    const departmentId = patch.department_id ?? null;
    const teamId = patch.team_id ?? null;
    const managerId = patch.manager_id ?? null;
    const startDate = patch.start_date ?? null;
    const isActive = patch.is_active ?? null;
    const rows: Row[] = await sql`
      UPDATE employees SET
        title = CASE WHEN ${title}::text IS NULL THEN title ELSE NULLIF(${title}::text, '') END,
        position_id = CASE WHEN ${positionId}::text IS NULL THEN position_id ELSE NULLIF(${positionId}::text, '')::uuid END,
        department_id = CASE WHEN ${departmentId}::text IS NULL THEN department_id ELSE NULLIF(${departmentId}::text, '')::uuid END,
        team_id = CASE WHEN ${teamId}::text IS NULL THEN team_id ELSE NULLIF(${teamId}::text, '')::uuid END,
        manager_id = CASE WHEN ${managerId}::text IS NULL THEN manager_id ELSE NULLIF(${managerId}::text, '')::uuid END,
        start_date = CASE WHEN ${startDate}::text IS NULL THEN start_date ELSE NULLIF(${startDate}::text, '')::date END,
        is_active = COALESCE(${isActive}::bool, is_active),
        updated_at = now()
      WHERE id = ${id}::text::uuid AND deleted_at IS NULL
      RETURNING id::text AS id`;
    if (rows.length === 0) notFound("There is no such person.");
    const updated = await getPerson(sql, id);
    if (!updated) notFound("There is no such person.");
    return c.json(profile(updated), 200, { "Cache-Control": "no-store" });
  }),
);

/** Grants (PUT) or revokes (DELETE) a role on a person. */
async function setRole(c: Context, grant: boolean): Promise<Response> {
  const actor = await gate(c, [ROLE_ADMIN], ADMIN_DENIED);
  if (isResponse(actor)) return actor;
  const id = c.req.param("id") ?? "";
  const role = c.req.param("role") ?? "";
  if (!ROLES.includes(role)) notFound("There is no such role.");
  if (!isUuid(id)) notFound("There is no such person.");
  const sql = getDb().$client;
  const subject = await getPerson(sql, id);
  if (!subject) notFound("There is no such person.");
  if (!grant && role === ROLE_ADMIN && subject.roles.includes(ROLE_ADMIN)) {
    const admins = await peopleWithRole(sql, ROLE_ADMIN);
    if (admins.length <= 1) conflict("last_admin", "The last admin cannot lose the admin role.");
  }
  const exists: Row[] = await sql`
    SELECT 1 FROM employees WHERE id = ${id}::text::uuid AND deleted_at IS NULL`;
  if (exists.length === 0) throw new Error("role target not found");
  if (grant) {
    await sql`
      INSERT INTO user_roles (user_id, role) VALUES (${id}::text::uuid, ${role}::text)
      ON CONFLICT DO NOTHING`;
  } else {
    await sql`
      DELETE FROM user_roles WHERE user_id = ${id}::text::uuid AND role = ${role}::text`;
  }
  const updated = await getPerson(sql, id);
  if (!updated) notFound("There is no such person.");
  return c.json(profile(updated), 200, { "Cache-Control": "no-store" });
}

admin.put("/admin/users/:id/roles/:role", (c) => handle(c, () => setRole(c, true)));
admin.delete("/admin/users/:id/roles/:role", (c) => handle(c, () => setRole(c, false)));

/** GET /admin/roles: the members of each role. */
admin.get("/admin/roles", (c) =>
  handle(c, async () => {
    const actor = await gate(c, [ROLE_ADMIN], ADMIN_DENIED);
    if (isResponse(actor)) return actor;
    const sql = getDb().$client;
    const out = [];
    for (const role of ROLES) {
      const members = await peopleWithRole(sql, role);
      out.push({ role, members: members.map(summary) });
    }
    return c.json(out, 200, { "Cache-Control": "no-store" });
  }),
);

// ---------------------------------------------------------------------------------------------
// Routes: departments
// ---------------------------------------------------------------------------------------------

/** POST /admin/departments */
admin.post("/admin/departments", (c) =>
  handle(c, async () => {
    const actor = await gate(c, [ROLE_ADMIN], ADMIN_DENIED);
    if (isResponse(actor)) return actor;
    const body = await readBody(c, ["name", "parent_department_id", "head_id"]);
    const name = required("name", body.name, 100);
    const parent = emptyToNull(body.parent_department_id);
    const head = emptyToNull(body.head_id);
    const sql = getDb().$client;
    await checkDepartmentRefs(sql, parent, null, head);
    const rows: Row[] = await sql`
      INSERT INTO departments (name, parent_department_id, head_id)
      VALUES (${name}::text, NULLIF(${parent ?? ""}::text, '')::uuid, NULLIF(${head ?? ""}::text, '')::uuid)
      RETURNING id::text AS id, name, parent_department_id::text AS parent_department_id, head_id::text AS head_id`;
    const row = rows[0];
    if (!row) throw new Error("department insert returned no row");
    // A new department has no members yet, so its count is zero.
    const created = {
      id: String(row.id),
      name: String(row.name),
      parent_department_id: str(row.parent_department_id),
      head_id: str(row.head_id),
      member_count: 0,
    };
    return c.json(created, 201, { "Cache-Control": "no-store" });
  }),
);

/** PATCH /admin/departments/:id */
admin.patch("/admin/departments/:id", (c) =>
  handle(c, async () => {
    const actor = await gate(c, [ROLE_ADMIN], ADMIN_DENIED);
    if (isResponse(actor)) return actor;
    const id = c.req.param("id") ?? "";
    const sql = getDb().$client;
    const existing = (await listDepartments(sql)).find((d) => d.id === id);
    if (!existing) notFound("There is no such department.");
    const body = await readBody(c, ["name", "parent_department_id", "head_id"]);
    const name = body.name === undefined ? undefined : required("name", body.name, 100);
    const parent: string | undefined = body.parent_department_id;
    const head: string | undefined = body.head_id;
    await checkDepartmentRefs(sql, emptyToNull(parent), existing.id, emptyToNull(head));
    const rows: Row[] = await sql`
      UPDATE departments SET
        name = COALESCE(${name ?? null}::text, name),
        parent_department_id = CASE WHEN ${parent ?? null}::text IS NULL THEN parent_department_id
                                    ELSE NULLIF(${parent ?? null}::text, '')::uuid END,
        head_id = CASE WHEN ${head ?? null}::text IS NULL THEN head_id
                       ELSE NULLIF(${head ?? null}::text, '')::uuid END
      WHERE id = ${id}::text::uuid
      RETURNING id::text AS id`;
    if (rows.length === 0) notFound("There is no such department.");
    const updated = (await listDepartments(sql)).find((d) => d.id === id);
    if (!updated) notFound("There is no such department.");
    return c.json(updated, 200, { "Cache-Control": "no-store" });
  }),
);

/** DELETE /admin/departments/:id */
admin.delete("/admin/departments/:id", (c) =>
  handle(c, async () => {
    const actor = await gate(c, [ROLE_ADMIN], ADMIN_DENIED);
    if (isResponse(actor)) return actor;
    const id = c.req.param("id") ?? "";
    const sql = getDb().$client;
    const flat = await listDepartments(sql);
    const target = flat.find((d) => d.id === id);
    if (!target) notFound("There is no such department.");
    if (target.member_count > 0) {
      conflict("department_has_members", "Move the people out of this department first.");
    }
    const child = flat.some((d) => d.parent_department_id === id);
    const hasTeam = (await listTeams(sql)).some((t) => t.department_id === id);
    if (child || hasTeam) {
      conflict("department_in_use", "Move or delete its child departments and teams first.");
    }
    let deleted: Row[];
    try {
      deleted =
        await sql`DELETE FROM departments WHERE id = ${id}::text::uuid RETURNING id::text AS id`;
    } catch (err) {
      if (isConstraint(err)) conflict("department_in_use", "This department is still referenced.");
      throw err;
    }
    if (deleted.length === 0) notFound("There is no such department.");
    return c.json({ ok: true }, 200, { "Cache-Control": "no-store" });
  }),
);

// ---------------------------------------------------------------------------------------------
// Routes: teams and team budgets
// ---------------------------------------------------------------------------------------------

/** POST /admin/teams */
admin.post("/admin/teams", (c) =>
  handle(c, async () => {
    const actor = await gate(c, [ROLE_ADMIN], ADMIN_DENIED);
    if (isResponse(actor)) return actor;
    const body = await readBody(c, ["name", "department_id", "lead_id"]);
    const name = required("name", body.name, 100);
    const department = required("department_id", body.department_id, 36);
    const lead = emptyToNull(body.lead_id);
    const sql = getDb().$client;
    await checkRefs(sql, department, null, lead, null);
    const rows: Row[] = await sql`
      INSERT INTO teams (name, department_id, lead_id)
      VALUES (${name}::text, ${department}::text::uuid, NULLIF(${lead ?? ""}::text, '')::uuid)
      RETURNING id::text AS id`;
    const id = String(rows[0]?.id);
    const created = (await listTeams(sql)).find((t) => t.id === id);
    if (!created) throw new Error("created team not found");
    return c.json(created, 201, { "Cache-Control": "no-store" });
  }),
);

/** PATCH /admin/teams/:id */
admin.patch("/admin/teams/:id", (c) =>
  handle(c, async () => {
    const actor = await gate(c, [ROLE_ADMIN], ADMIN_DENIED);
    if (isResponse(actor)) return actor;
    const id = c.req.param("id") ?? "";
    const sql = getDb().$client;
    const existing = (await listTeams(sql)).find((t) => t.id === id);
    if (!existing) notFound("There is no such team.");
    const body = await readBody(c, ["name", "department_id", "lead_id"]);
    const name = body.name === undefined ? undefined : required("name", body.name, 100);
    const department = emptyToNull(body.department_id);
    const lead: string | undefined = body.lead_id;
    const moving = department !== null && department !== existing.department_id;
    if (moving && existing.member_count > 0) {
      conflict("team_has_members", "Move the members out of this team first.");
    }
    await checkRefs(sql, department ?? existing.department_id, null, emptyToNull(lead), null);
    const rows: Row[] = await sql`
      UPDATE teams SET
        name = COALESCE(${name ?? null}::text, name),
        department_id = COALESCE(NULLIF(${department ?? ""}::text, '')::uuid, department_id),
        lead_id = CASE WHEN ${lead ?? null}::text IS NULL THEN lead_id
                       ELSE NULLIF(${lead ?? null}::text, '')::uuid END
      WHERE id = ${id}::text::uuid
      RETURNING id::text AS id`;
    if (rows.length === 0) notFound("There is no such team.");
    const updated = (await listTeams(sql)).find((t) => t.id === id);
    if (!updated) notFound("There is no such team.");
    return c.json(updated, 200, { "Cache-Control": "no-store" });
  }),
);

/** DELETE /admin/teams/:id */
admin.delete("/admin/teams/:id", (c) =>
  handle(c, async () => {
    const actor = await gate(c, [ROLE_ADMIN], ADMIN_DENIED);
    if (isResponse(actor)) return actor;
    const id = c.req.param("id") ?? "";
    const sql = getDb().$client;
    const team = (await listTeams(sql)).find((t) => t.id === id);
    if (!team) notFound("There is no such team.");
    if (team.member_count > 0) {
      conflict("team_has_members", "Move the members out of this team first.");
    }
    let deleted: Row[];
    try {
      deleted = await sql`DELETE FROM teams WHERE id = ${id}::text::uuid RETURNING id::text AS id`;
    } catch (err) {
      if (isConstraint(err)) conflict("team_in_use", "This team is still referenced.");
      throw err;
    }
    if (deleted.length === 0) notFound("There is no such team.");
    return c.json({ ok: true }, 200, { "Cache-Control": "no-store" });
  }),
);

/** PUT /admin/teams/:id/budget. `cap` is required; an empty `cap` removes the budget. */
admin.put("/admin/teams/:id/budget", (c) =>
  handle(c, async () => {
    const actor = await gate(c, [ROLE_ADMIN], ADMIN_DENIED);
    if (isResponse(actor)) return actor;
    const id = c.req.param("id") ?? "";
    const body = await readBody(c, ["cap", "currency"]);
    if (body.cap === undefined) {
      invalid("cap", "is required (send an empty string to remove the budget)");
    }
    const capText = String(body.cap).trim();
    let cap = "";
    let currency = "";
    if (capText !== "") {
      const minor = parseMoney(capText);
      if (minor === null || minor <= 0)
        invalid("cap", "must be a positive amount such as 52000.00");
      const code = body.currency === undefined ? null : currencyCode(String(body.currency));
      if (code === null) invalid("currency", "must be a code such as GBP");
      cap = formatMoney(minor);
      currency = code;
    }
    const sql = getDb().$client;
    const changed: Row[] = await sql`
      UPDATE teams SET
        budget_cap = CASE WHEN ${cap}::text = '' THEN NULL ELSE ${cap}::text::numeric END,
        budget_currency = CASE WHEN ${cap}::text = '' THEN NULL ELSE ${currency}::text END
      WHERE id = ${id}::text::uuid
      RETURNING id::text AS id`;
    if (changed.length === 0) notFound("There is no such team.");
    const row = (await listTeamBudgets(sql)).find((r) => r.team_id === id);
    if (!row) notFound("There is no such team.");
    const seats = await listSeats(sql);
    const budget = budgetRows([row], seats)[0];
    return c.json(budget, 200, { "Cache-Control": "no-store" });
  }),
);

/** GET /admin/team-budgets: every team's cap, used and remaining. Admin or HR. */
admin.get("/admin/team-budgets", (c) =>
  handle(c, async () => {
    const viewer = await gate(c, [ROLE_ADMIN, ROLE_HR], MONEY_DENIED);
    if (isResponse(viewer)) return viewer;
    const sql = getDb().$client;
    const rows = await listTeamBudgets(sql);
    const seats = await listSeats(sql);
    return c.json(budgetRows(rows, seats), 200, { "Cache-Control": "no-store" });
  }),
);

// ---------------------------------------------------------------------------------------------
// Routes: positions
// ---------------------------------------------------------------------------------------------

/** POST /admin/positions */
admin.post("/admin/positions", (c) =>
  handle(c, async () => {
    const actor = await gate(c, [ROLE_ADMIN], ADMIN_DENIED);
    if (isResponse(actor)) return actor;
    const body = await readBody(c, ["title", "department_id", "level", "description"]);
    const title = required("title", body.title, 120);
    const department = emptyToNull(body.department_id);
    const level = text("level", body.level, 60);
    const description = text("description", body.description, 2000);
    const sql = getDb().$client;
    await checkRefs(sql, department, null, null, null);
    const rows: Row[] = await sql`
      INSERT INTO positions (title, department_id, level, description)
      VALUES (${title}::text, NULLIF(${department ?? ""}::text, '')::uuid,
              ${level ?? ""}::text, ${description ?? ""}::text)
      RETURNING id::text AS id`;
    const id = String(rows[0]?.id);
    const created = (await listPositions(sql)).find((p) => p.id === id);
    if (!created) throw new Error("created position not found");
    return c.json(created, 201, { "Cache-Control": "no-store" });
  }),
);

/** PATCH /admin/positions/:id. `title` stays required. */
admin.patch("/admin/positions/:id", (c) =>
  handle(c, async () => {
    const actor = await gate(c, [ROLE_ADMIN], ADMIN_DENIED);
    if (isResponse(actor)) return actor;
    const id = c.req.param("id") ?? "";
    const sql = getDb().$client;
    if (!(await listPositions(sql)).some((p) => p.id === id)) {
      notFound("There is no such position.");
    }
    const body = await readBody(c, ["title", "department_id", "level", "description"]);
    const title = text("title", body.title, 120);
    if (title === undefined || title === "") invalid("title", "is required");
    const level = text("level", body.level, 60);
    const description = text("description", body.description, 2000);
    const department = emptyToNull(body.department_id);
    await checkRefs(sql, department, null, null, null);
    const rows: Row[] = await sql`
      UPDATE positions SET
        title = COALESCE(${title}::text, title),
        department_id = CASE WHEN ${department}::text IS NULL THEN department_id
                             ELSE NULLIF(${department}::text, '')::uuid END,
        level = COALESCE(${level ?? null}::text, level),
        description = COALESCE(${description ?? null}::text, description)
      WHERE id = ${id}::text::uuid
      RETURNING id::text AS id`;
    if (rows.length === 0) notFound("There is no such position.");
    const updated = (await listPositions(sql)).find((p) => p.id === id);
    if (!updated) notFound("There is no such position.");
    return c.json(updated, 200, { "Cache-Control": "no-store" });
  }),
);

/** DELETE /admin/positions/:id */
admin.delete("/admin/positions/:id", (c) =>
  handle(c, async () => {
    const actor = await gate(c, [ROLE_ADMIN], ADMIN_DENIED);
    if (isResponse(actor)) return actor;
    const id = c.req.param("id") ?? "";
    const sql = getDb().$client;
    const position = (await listPositions(sql)).find((p) => p.id === id);
    if (!position) notFound("There is no such position.");
    if (position.member_count > 0) conflict("position_in_use", "People still hold this position.");
    let deleted: Row[];
    try {
      deleted =
        await sql`DELETE FROM positions WHERE id = ${id}::text::uuid RETURNING id::text AS id`;
    } catch (err) {
      if (isConstraint(err)) conflict("position_in_use", "This position is still referenced.");
      throw err;
    }
    if (deleted.length === 0) notFound("There is no such position.");
    return c.json({ ok: true }, 200, { "Cache-Control": "no-store" });
  }),
);

// ---------------------------------------------------------------------------------------------
// Routes: seats
// ---------------------------------------------------------------------------------------------

/** GET /admin/seats: every seat with its money. Admin or HR. */
admin.get("/admin/seats", (c) =>
  handle(c, async () => {
    const viewer = await gate(c, [ROLE_ADMIN, ROLE_HR], MONEY_DENIED);
    if (isResponse(viewer)) return viewer;
    const sql = getDb().$client;
    return c.json(await listSeats(sql), 200, { "Cache-Control": "no-store" });
  }),
);

/** POST /admin/seats */
admin.post("/admin/seats", (c) =>
  handle(c, async () => {
    const actor = await gate(c, [ROLE_ADMIN], ADMIN_DENIED);
    if (isResponse(actor)) return actor;
    const body = await readBody(c, SEAT_FIELDS);
    const sql = getDb().$client;
    const input = await resolveFor(sql, null, body);
    const id = await insertSeat(sql, input);
    await syncSeatedPeople(sql);
    const created = (await listSeats(sql)).find((s) => s.id === id);
    if (!created) throw new Error("created seat not found");
    return c.json(created, 201, { "Cache-Control": "no-store" });
  }),
);

/** PATCH /admin/seats/:id. Absent fields keep their value; "" clears. */
admin.patch("/admin/seats/:id", (c) =>
  handle(c, async () => {
    const actor = await gate(c, [ROLE_ADMIN], ADMIN_DENIED);
    if (isResponse(actor)) return actor;
    const id = c.req.param("id") ?? "";
    const sql = getDb().$client;
    const current = (await listSeats(sql)).find((s) => s.id === id);
    if (!current) notFound("There is no such seat.");
    const body = await readBody(c, SEAT_FIELDS);
    const input = await resolveFor(sql, current, body);
    let rows: Row[];
    try {
      rows = await sql`
        UPDATE seats SET
          team_id = ${input.team_id}::text::uuid,
          job_profile_id = CASE WHEN ${input.job_profile_id}::text = '' THEN NULL
                                ELSE ${input.job_profile_id}::text::uuid END,
          title = ${input.title}::text,
          level = ${input.level}::text,
          state = ${input.state}::text,
          person_id = CASE WHEN ${input.person_id}::text = '' THEN NULL
                           ELSE ${input.person_id}::text::uuid END,
          reports_to_seat_id = CASE WHEN ${input.reports_to_seat_id}::text = '' THEN NULL
                                    ELSE ${input.reports_to_seat_id}::text::uuid END,
          salary_min = CASE WHEN ${input.salary_min}::text = '' THEN NULL
                            ELSE ${input.salary_min}::text::numeric END,
          salary_max = CASE WHEN ${input.salary_max}::text = '' THEN NULL
                            ELSE ${input.salary_max}::text::numeric END,
          currency = CASE WHEN ${input.currency}::text = '' THEN NULL ELSE ${input.currency}::text END
        WHERE id = ${id}::text::uuid
        RETURNING id::text AS id`;
    } catch (err) {
      if (isConstraint(err)) conflict("seat_conflict", "This seat conflicts with another seat.");
      throw err;
    }
    await syncSeatedPeople(sql);
    if (rows.length === 0) notFound("There is no such seat.");
    const updated = (await listSeats(sql)).find((s) => s.id === id);
    if (!updated) notFound("There is no such seat.");
    return c.json(updated, 200, { "Cache-Control": "no-store" });
  }),
);

/** DELETE /admin/seats/:id. A filled seat must be vacated first; a seat with reports must be moved first. */
admin.delete("/admin/seats/:id", (c) =>
  handle(c, async () => {
    const actor = await gate(c, [ROLE_ADMIN], ADMIN_DENIED);
    if (isResponse(actor)) return actor;
    const id = c.req.param("id") ?? "";
    const sql = getDb().$client;
    const seat = (await listSeats(sql)).find((s) => s.id === id);
    if (!seat) notFound("There is no such seat.");
    if (seat.state === SEAT_FILLED) conflict("seat_filled", "Vacate the seat before deleting it.");
    let deleted: Row[];
    try {
      deleted = await sql`DELETE FROM seats WHERE id = ${id}::text::uuid RETURNING id::text AS id`;
    } catch (err) {
      if (isConstraint(err)) conflict("seat_has_reports", "Other seats report to this seat.");
      throw err;
    }
    if (deleted.length === 0) notFound("There is no such seat.");
    await syncSeatedPeople(sql);
    return c.json({ ok: true }, 200, { "Cache-Control": "no-store" });
  }),
);

export default admin;
