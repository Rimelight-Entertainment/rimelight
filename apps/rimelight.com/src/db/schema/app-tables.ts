/**
 * The tables drizzle-kit manages, which is the app's schema without the CMS. The CMS tables are
 * created and altered by the CMS migrator (@rimelight/cms), so drizzle-kit reads this file instead of
 * the index (see drizzle.config.ts). Keep it in step with the index when a table is added.
 */
export * from "./employees.ts";
export * from "./users.ts";
export * from "./auth/index.ts";
export * from "./projects/index.ts";
export * from "./component-metadata.ts";
export * from "./title-settings.ts";
export * from "./title-currencies.ts";
export * from "./title-items.ts";
