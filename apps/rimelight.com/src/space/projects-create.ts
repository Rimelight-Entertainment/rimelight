/**
 * Rimelight Space: create a project (POST /v1/projects on the website Worker). Port of create_project in
 * project_service.rs and pg_projects.rs, with one change the owner asked for: any signed-in person may create a
 * project (the Rust handler requires a global admin). The creator becomes the project's admin.
 */
import { Hono, type Context } from "hono";
import { getDb } from "../db/index.ts";
import { caller, isResponse } from "./session.ts";
import {
  NAME_MAX,
  TEXT_MAX,
  activePerson,
  asciiUpper,
  handle,
  invalid,
  nowSecs,
  optStr,
  projectRow,
  readBody,
  reqStr,
  requiredField,
  textField,
  validProjectKey,
  withConflict,
} from "./projects-write.ts";

const projectsCreate = new Hono();

/** POST /projects: the body is { key, name, description?, lead_id? }. Replies 201 with the project. */
async function createProject(c: Context): Promise<Response> {
  const who = await caller(c);
  if (isResponse(who)) return who;
  const sql = getDb().$client;
  const now = nowSecs();
  const body = await readBody(c, ["key", "name", "description", "lead_id"]);
  const key = asciiUpper(reqStr(body, "key").trim());
  const name = reqStr(body, "name");
  const description = optStr(body, "description");
  const leadRaw = optStr(body, "lead_id");

  if (!validProjectKey(key))
    throw invalid("key", "use 2 to 10 letters or digits, starting with a letter");
  const projectName = requiredField("name", name, NAME_MAX);
  const projectDescription = textField("description", description, TEXT_MAX) ?? "";
  const leadId =
    leadRaw !== undefined && leadRaw.trim() !== ""
      ? await activePerson(sql, "lead_id", leadRaw)
      : null;

  await withConflict("project_key_taken", "Another project already uses this key.", () =>
    sql.begin(async (tx) => {
      const rows =
        await tx`INSERT INTO projects (key, name, description, lead_id, created_at, updated_at)
         VALUES (${key}::text, ${projectName}::text, ${projectDescription}::text, ${leadId}::text::uuid,
                 to_timestamp(${now}::bigint), to_timestamp(${now}::bigint))
         RETURNING id::text AS id`;
      const projectId = rows[0]?.["id"] as string;
      await tx`INSERT INTO workflow_states (project_id, name, category, position, created_at, updated_at)
         SELECT ${projectId}::text::uuid, s.name, s.category, s.position, to_timestamp(${now}::bigint), to_timestamp(${now}::bigint)
         FROM (VALUES ('Open', 'Unstarted', 1), ('In Progress', 'Started', 2), ('In Review', 'Started', 3),
                      ('On Hold', 'Started', 4), ('Done', 'Done', 5), ('Won''t Do', 'Cancelled', 6),
                      ('Canceled', 'Cancelled', 7)) AS s (name, category, position)`;
      await tx`INSERT INTO project_members (project_id, user_id, role, created_at, updated_at)
         VALUES (${projectId}::text::uuid, ${who.id}::text::uuid, 'admin', to_timestamp(${now}::bigint), to_timestamp(${now}::bigint))`;
    }),
  );
  const project = await projectRow(sql, key, who.id);
  if (!project) throw new Error("project vanished after create");
  return Response.json(project, { status: 201, headers: { "Cache-Control": "no-store" } });
}

projectsCreate.post("/projects", handle(createProject));

export default projectsCreate;
