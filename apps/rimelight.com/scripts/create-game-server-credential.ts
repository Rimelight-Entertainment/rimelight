/**
 * Creates a game server credential for one title and prints it once. The secret is shown only here: the database keeps its
 * SHA-256 and nothing else. Set the printed values on that game server instance as GT_SERVER_ID and GT_SERVER_SECRET.
 *
 * Usage: DATABASE_URL=<connection string> vpx ./scripts/create-game-server-credential.ts <title-slug> <label>
 */
import { randomBytes, randomUUID } from "node:crypto";
import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";
import { hashGameServerSecret } from "../src/api/game-server-credentials.ts";
import { isTitleSlug } from "../src/api/titles.ts";
import { gameServerCredentials } from "../src/db/schema/game-server-credentials.ts";

const usage = "Usage: vpx ./scripts/create-game-server-credential.ts <title-slug> <label>";
const [title, label] = process.argv.slice(2);
if (!title || !label || !isTitleSlug(title)) throw new Error(usage);

const connectionString = process.env["DATABASE_URL"];
if (!connectionString) throw new Error("DATABASE_URL is not set.");

const id = randomUUID();
const secret = randomBytes(32).toString("base64url");

const client = postgres(connectionString, { prepare: false, max: 1 });
try {
  await drizzle({ client })
    .insert(gameServerCredentials)
    .values({
      id,
      title,
      label,
      secretHash: hashGameServerSecret(secret),
    });
} finally {
  await client.end();
}

console.log(`GT_SERVER_ID=${id}`);
console.log(`GT_SERVER_SECRET=${secret}`);
