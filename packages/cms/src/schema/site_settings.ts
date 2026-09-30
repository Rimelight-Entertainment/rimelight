import { jsonb, pgTable, text, timestamp } from "drizzle-orm/pg-core";

export interface SiteSettingsBranding {
  logo: {
    alt: string;
  };
  favicon: {
    svg: string;
  };
  colors: {
    themeColor: string;
    backgroundColor: string;
  };
}

export interface SiteSettingsSeo {
  titleTemplate: string;
  ogImageFallback: string;
  maxDescriptionLength: number;
  authorHandle?: string;
}

export const siteSettings = pgTable("site_settings", {
  id: text("id").primaryKey().default("default"),
  name: text("name").notNull(),
  description: text("description").notNull(),
  url: text("url").notNull(),
  ogImage: text("og_image").notNull(),
  author: text("author").notNull(),
  email: text("email").notNull().default(""),
  branding: jsonb("branding").$type<SiteSettingsBranding>().notNull(),
  seo: jsonb("seo").$type<SiteSettingsSeo>().notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});

export type SiteSettings = typeof siteSettings.$inferSelect;
export type InsertSiteSettings = typeof siteSettings.$inferInsert;
