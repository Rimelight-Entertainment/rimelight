import { eq } from "drizzle-orm";
import type { InsertSiteSettings, SiteSettings } from "../schema/site_settings";
import type { CmsContext } from "./context";

export const DEFAULT_SITE_SETTINGS: InsertSiteSettings = {
  id: "default",
  name: "Rimelight",
  description: "Built with Rimelight CMS",
  url: "https://rimelight.com",
  ogImage: "https://cdn.rimelight.com/images/og-placeholder.webp",
  author: "Rimelight",
  email: "",
  branding: {
    logo: {
      alt: "Rimelight",
    },
    favicon: {
      svg: "/favicon.svg",
    },
    colors: {
      themeColor: "#ffffff",
      backgroundColor: "#ffffff",
    },
  },
  seo: {
    titleTemplate: "%s | Rimelight",
    ogImageFallback: "https://cdn.rimelight.com/images/og-placeholder.webp",
    maxDescriptionLength: 160,
  },
};

function fallbackSettings(overrides?: Partial<InsertSiteSettings>): SiteSettings {
  return {
    id: overrides?.id ?? "default",
    name: overrides?.name ?? DEFAULT_SITE_SETTINGS.name,
    description: overrides?.description ?? DEFAULT_SITE_SETTINGS.description,
    url: overrides?.url ?? DEFAULT_SITE_SETTINGS.url,
    ogImage: overrides?.ogImage ?? DEFAULT_SITE_SETTINGS.ogImage,
    author: overrides?.author ?? DEFAULT_SITE_SETTINGS.author,
    email: overrides?.email ?? "",
    branding: overrides?.branding ?? DEFAULT_SITE_SETTINGS.branding,
    seo: overrides?.seo ?? DEFAULT_SITE_SETTINGS.seo,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}

/**
 * Retrieves the dynamic site settings from the database. If no settings are found, seeds the
 * default record and returns it.
 */
export async function getSiteSettings(
  ctx: CmsContext,
  fallbackDefaults?: Partial<InsertSiteSettings>,
): Promise<SiteSettings> {
  const { db } = ctx;
  const siteSettings = ctx.t.siteSettings;

  try {
    const records = await db
      .select()
      .from(siteSettings)
      .where(eq(siteSettings.id, "default"))
      .limit(1);

    if (records.length > 0) {
      return records[0];
    }

    const initial: InsertSiteSettings = {
      ...DEFAULT_SITE_SETTINGS,
      ...fallbackDefaults,
      id: "default",
    };

    const inserted = await db.insert(siteSettings).values(initial).returning();
    return inserted[0];
  } catch (error) {
    console.warn("Failed to fetch site settings from DB, using fallback:", error);
    return fallbackSettings(fallbackDefaults);
  }
}

/**
 * Updates dynamic site settings in the database.
 */
export async function updateSiteSettings(
  ctx: CmsContext,
  updates: Partial<InsertSiteSettings>,
  id: string = "default",
): Promise<SiteSettings> {
  const { db } = ctx;
  const siteSettings = ctx.t.siteSettings;
  const current = await getSiteSettings(ctx);
  const { createdAt: _c, id: _i, ...safe } = updates as any;
  updates = safe;

  const updatedValues = {
    ...updates,
    branding: updates.branding ? { ...current.branding, ...updates.branding } : current.branding,
    seo: updates.seo ? { ...current.seo, ...updates.seo } : current.seo,
    updatedAt: new Date(),
  };

  const result = await db
    .update(siteSettings)
    .set(updatedValues)
    .where(eq(siteSettings.id, id))
    .returning();

  return result[0];
}
