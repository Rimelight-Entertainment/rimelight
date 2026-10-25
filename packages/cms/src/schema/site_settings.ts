import { jsonb, pgTable, text, timestamp, type PgTableWithColumns } from "drizzle-orm/pg-core";

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

export const siteSettings: PgTableWithColumns<any> = pgTable("site_settings", {
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

export interface SiteSettings {
  id: string;
  name: string;
  description: string;
  url: string;
  ogImage: string;
  author: string;
  email: string;
  branding: SiteSettingsBranding;
  seo: SiteSettingsSeo;
  createdAt: Date;
  updatedAt: Date;
}

export type InsertSiteSettings = Partial<SiteSettings> & {
  name: string;
  description: string;
  url: string;
  ogImage: string;
  author: string;
  branding: SiteSettingsBranding;
  seo: SiteSettingsSeo;
};
