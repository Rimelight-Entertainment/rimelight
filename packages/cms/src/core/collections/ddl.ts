import type { Dialect } from "../../db/index";
import type { CollectionFieldDefinition } from "./fields";

export function generateCollectionTableSql(
  slug: string,
  fields: CollectionFieldDefinition[],
  dialect: Dialect,
): string[] {
  const tableName = `ec_${slug}`;
  const stmts: string[] = [];

  if (dialect === "sqlite") {
    const colDefs: string[] = [
      "`id` text PRIMARY KEY NOT NULL",
      "`slug` text NOT NULL",
      "`status` text DEFAULT 'draft' NOT NULL",
      "`parent_id` text",
      "`sort` integer DEFAULT 0 NOT NULL",
      "`published_revision_id` text",
      "`published_at` integer",
      "`scheduled_at` integer",
      "`created_by` text",
      "`created_at` integer NOT NULL",
      "`updated_at` integer",
      "`deleted_at` integer",
      "`data` text DEFAULT '{}' NOT NULL",
    ];

    for (const f of fields) {
      if (!f.queryable) continue;
      if (f.type === "currency") {
        colDefs.push(`\`${f.key}_amount\` integer DEFAULT 0`);
        colDefs.push(`\`${f.key}_currency\` text DEFAULT 'USD'`);
      } else if (f.type === "number") {
        colDefs.push(`\`${f.key}\` real`);
      } else if (f.type === "boolean") {
        colDefs.push(`\`${f.key}\` integer DEFAULT 0`);
      } else if (f.type === "date" || f.type === "datetime") {
        colDefs.push(`\`${f.key}\` integer`);
      } else {
        colDefs.push(`\`${f.key}\` text`);
      }
    }

    stmts.push(`CREATE TABLE IF NOT EXISTS \`${tableName}\` (\n  ${colDefs.join(",\n  ")}\n);`);
    stmts.push(
      `CREATE INDEX IF NOT EXISTS \`${tableName}_slug_idx\` ON \`${tableName}\` (\`slug\`);`,
    );
    stmts.push(
      `CREATE INDEX IF NOT EXISTS \`${tableName}_status_idx\` ON \`${tableName}\` (\`status\`);`,
    );
  } else {
    // Postgres
    const colDefs: string[] = [
      `"id" text PRIMARY KEY NOT NULL`,
      `"slug" text NOT NULL`,
      `"status" text DEFAULT 'draft' NOT NULL`,
      `"parent_id" text`,
      `"sort" integer DEFAULT 0 NOT NULL`,
      `"published_revision_id" text`,
      `"published_at" timestamp with time zone`,
      `"scheduled_at" timestamp with time zone`,
      `"created_by" text`,
      `"created_at" timestamp with time zone DEFAULT now() NOT NULL`,
      `"updated_at" timestamp with time zone`,
      `"deleted_at" timestamp with time zone`,
      `"data" jsonb DEFAULT '{}'::jsonb NOT NULL`,
    ];

    for (const f of fields) {
      if (!f.queryable) continue;
      if (f.type === "currency") {
        colDefs.push(`"${f.key}_amount" integer DEFAULT 0`);
        colDefs.push(`"${f.key}_currency" text DEFAULT 'USD'`);
      } else if (f.type === "number") {
        colDefs.push(`"${f.key}" double precision`);
      } else if (f.type === "boolean") {
        colDefs.push(`"${f.key}" boolean DEFAULT false`);
      } else if (f.type === "date" || f.type === "datetime") {
        colDefs.push(`"${f.key}" timestamp with time zone`);
      } else {
        colDefs.push(`"${f.key}" text`);
      }
    }

    stmts.push(`CREATE TABLE IF NOT EXISTS "${tableName}" (\n  ${colDefs.join(",\n  ")}\n);`);
    stmts.push(`CREATE INDEX IF NOT EXISTS "${tableName}_slug_idx" ON "${tableName}" ("slug");`);
    stmts.push(
      `CREATE INDEX IF NOT EXISTS "${tableName}_status_idx" ON "${tableName}" ("status");`,
    );
  }

  return stmts;
}
