import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
const require = createRequire(
  "c:/Users/idant/WebstormProjects/rimelight/packages/cms/package.json",
);
const { neon } = require("@neondatabase/serverless");

const branchUri = readFileSync(
  "C:/Users/idant/.gemini/antigravity/brain/3c75fdb0-e279-4da4-bb9a-c0d1bda65971/scratch/branch-uri.txt",
  "utf8",
).trim();
const sql = neon(branchUri);

const [{ count }] = await sql`SELECT count(*)::int as count FROM pages`;
console.log("Branch successfully verified! Pages count on new branch:", count);
