import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { env } from "cloudflare:workers";
import { relations } from "./schema/relations.ts";

type DbInstance = ReturnType<typeof createDb>;

function resolveDatabaseUrl(): string {
  const cfEnv = env as unknown as Record<string, any> | undefined;
  return (
    cfEnv?.["HYPERDRIVE"]?.connectionString ||
    cfEnv?.["HYPERDRIVE_URL"] ||
    cfEnv?.["DATABASE_URL"] ||
    (typeof import.meta.env !== "undefined"
      ? import.meta.env["HYPERDRIVE_URL"] || import.meta.env["DATABASE_URL"]
      : undefined) ||
    (typeof process !== "undefined" && process.env
      ? process.env["HYPERDRIVE_URL"] || process.env["DATABASE_URL"]
      : undefined) ||
    ""
  );
}

function createDb(url: string) {
  return drizzle({ client: neon(url), relations });
}

let cachedUrl = "";
let cachedDb: DbInstance | null = null;

function getDbInstance(): DbInstance {
  const url = resolveDatabaseUrl();
  if (!cachedDb || (url && url !== cachedUrl)) {
    cachedUrl = url;
    cachedDb = createDb(url);
  }
  return cachedDb;
}

export const db: DbInstance = new Proxy({} as DbInstance, {
  get(_target, prop, receiver) {
    const instance = getDbInstance();
    const value = Reflect.get(instance, prop, receiver);
    return typeof value === "function" ? value.bind(instance) : value;
  },
});
