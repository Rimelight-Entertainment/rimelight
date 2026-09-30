import { pageTemplates } from "../schema/page_templates.ts";
import {
  BLOG_POST_DEFINITION,
  DOCUMENT_DEFINITION,
  CHARACTER_DEFINITION,
  HERO_DEFINITION,
  SERIES_DEFINITION,
  PATCH_NOTE_DEFINITION,
  LOCATION_DEFINITION,
  ITEM_DEFINITION,
  SPECIES_DEFINITION,
  SKILL_DEFINITION,
} from "../core/page-definitions.ts";

export interface BuiltinTemplate {
  slug: string;
  title: { en: string };
  description: { en: string };
  pageType: string;
  version: number;
  allowedRoles: string[];
  rolePermissions: {
    whoCanCreate: string[];
    whoCanEdit: string[];
    whoCanReview: string[];
    whoCanView: string[];
  };
  approvalRules: {
    allowSelfApproval: boolean;
    minApprovals: number;
  };
  defaultProperties: Record<string, any>;
  initialBlocks: any[];
}

export function getBuiltinTemplates(): BuiltinTemplate[] {
  return [
    {
      slug: "blog-post",
      title: { en: "Blog Post" },
      description: {
        en: "Standard blog article with category metadata, author attribution, and formatted headings",
      },
      pageType: "blog",
      version: 1,
      allowedRoles: [],
      rolePermissions: { whoCanCreate: [], whoCanEdit: [], whoCanReview: [], whoCanView: [] },
      approvalRules: { allowSelfApproval: true, minApprovals: 1 },
      defaultProperties: BLOG_POST_DEFINITION.properties,
      initialBlocks: [
        {
          id: crypto.randomUUID(),
          type: "HeadingBlock",
          props: { level: 2, text: "Introduction" },
          isTemplated: false,
        },
        {
          id: crypto.randomUUID(),
          type: "ParagraphBlock",
          props: { content: "Start writing your blog article here..." },
          isTemplated: false,
        },
      ],
    },
    {
      slug: "documentation",
      title: { en: "Documentation Guide" },
      description: {
        en: "Technical documentation page with structured sections, callouts, and code blocks",
      },
      pageType: "doc",
      version: 1,
      allowedRoles: [],
      rolePermissions: { whoCanCreate: [], whoCanEdit: [], whoCanReview: [], whoCanView: [] },
      approvalRules: { allowSelfApproval: true, minApprovals: 1 },
      defaultProperties: DOCUMENT_DEFINITION.properties,
      initialBlocks: [
        {
          id: crypto.randomUUID(),
          type: "HeadingBlock",
          props: { level: 2, text: "Overview" },
          isTemplated: false,
        },
        {
          id: crypto.randomUUID(),
          type: "CalloutBlock",
          props: { variant: "info", content: "Key guide details and prerequisites go here." },
          isTemplated: false,
        },
        {
          id: crypto.randomUUID(),
          type: "HeadingBlock",
          props: { level: 2, text: "Usage" },
          isTemplated: false,
        },
      ],
    },
    {
      slug: "character-profile",
      title: { en: "Character Profile" },
      description: {
        en: "Franchise character sheet with identity, characteristics, inventory, and backstory lore",
      },
      pageType: "character",
      version: 1,
      allowedRoles: [],
      rolePermissions: { whoCanCreate: [], whoCanEdit: [], whoCanReview: [], whoCanView: [] },
      approvalRules: { allowSelfApproval: true, minApprovals: 1 },
      defaultProperties: CHARACTER_DEFINITION.properties,
      initialBlocks: CHARACTER_DEFINITION.initialBlocks ? CHARACTER_DEFINITION.initialBlocks() : [],
    },
    {
      slug: "hero-sheet",
      title: { en: "Hero Combat Sheet" },
      description: {
        en: "Hero character with combat stats, progression mechanics, and playstyle lore",
      },
      pageType: "hero",
      version: 1,
      allowedRoles: [],
      rolePermissions: { whoCanCreate: [], whoCanEdit: [], whoCanReview: [], whoCanView: [] },
      approvalRules: { allowSelfApproval: true, minApprovals: 1 },
      defaultProperties: HERO_DEFINITION.properties,
      initialBlocks: HERO_DEFINITION.initialBlocks ? HERO_DEFINITION.initialBlocks() : [],
    },
    {
      slug: "series-overview",
      title: { en: "Series Overview" },
      description: {
        en: "Media show / series page with genre, season metadata, and episode overviews",
      },
      pageType: "series",
      version: 1,
      allowedRoles: [],
      rolePermissions: { whoCanCreate: [], whoCanEdit: [], whoCanReview: [], whoCanView: [] },
      approvalRules: { allowSelfApproval: true, minApprovals: 1 },
      defaultProperties: SERIES_DEFINITION.properties,
      initialBlocks: SERIES_DEFINITION.initialBlocks ? SERIES_DEFINITION.initialBlocks() : [],
    },
    {
      slug: "patch-note",
      title: { en: "Release / Patch Note" },
      description: {
        en: "Version changelog, release highlights, balance adjustments, and bug fixes",
      },
      pageType: "patchnote",
      version: 1,
      allowedRoles: [],
      rolePermissions: { whoCanCreate: [], whoCanEdit: [], whoCanReview: [], whoCanView: [] },
      approvalRules: { allowSelfApproval: true, minApprovals: 1 },
      defaultProperties: PATCH_NOTE_DEFINITION.properties,
      initialBlocks: [
        {
          id: crypto.randomUUID(),
          type: "HeadingBlock",
          props: { level: 2, text: "Release Highlights" },
          isTemplated: false,
        },
        {
          id: crypto.randomUUID(),
          type: "HeadingBlock",
          props: { level: 3, text: "Bug Fixes & Improvements" },
          isTemplated: false,
        },
      ],
    },
    {
      slug: "location-guide",
      title: { en: "World Location" },
      description: { en: "Worldbuilding geography, climate conditions, and notable landmarks" },
      pageType: "location",
      version: 1,
      allowedRoles: [],
      rolePermissions: { whoCanCreate: [], whoCanEdit: [], whoCanReview: [], whoCanView: [] },
      approvalRules: { allowSelfApproval: true, minApprovals: 1 },
      defaultProperties: LOCATION_DEFINITION.properties,
      initialBlocks: [],
    },
    {
      slug: "game-item",
      title: { en: "Item & Equipment" },
      description: { en: "Item rarity, pricing, quest associations, and equipment stats" },
      pageType: "item",
      version: 1,
      allowedRoles: [],
      rolePermissions: { whoCanCreate: [], whoCanEdit: [], whoCanReview: [], whoCanView: [] },
      approvalRules: { allowSelfApproval: true, minApprovals: 1 },
      defaultProperties: ITEM_DEFINITION.properties,
      initialBlocks: [],
    },
    {
      slug: "species-entry",
      title: { en: "Species Entry" },
      description: { en: "Biological taxonomy, lifespan, and homeworld association" },
      pageType: "species",
      version: 1,
      allowedRoles: [],
      rolePermissions: { whoCanCreate: [], whoCanEdit: [], whoCanReview: [], whoCanView: [] },
      approvalRules: { allowSelfApproval: true, minApprovals: 1 },
      defaultProperties: SPECIES_DEFINITION.properties,
      initialBlocks: [],
    },
    {
      slug: "skill-entry",
      title: { en: "Skill & Ability" },
      description: { en: "Ability cooldown, mana cost, and damage type mechanics" },
      pageType: "skill",
      version: 1,
      allowedRoles: [],
      rolePermissions: { whoCanCreate: [], whoCanEdit: [], whoCanReview: [], whoCanView: [] },
      approvalRules: { allowSelfApproval: true, minApprovals: 1 },
      defaultProperties: SKILL_DEFINITION.properties,
      initialBlocks: [],
    },
  ];
}

/**
 * Ensures built-in page templates exist in the database. If page_templates table is empty,
 * populates it with starter templates.
 */
export async function ensureDefaultTemplates(
  dbInstance: any,
  templateTable = pageTemplates,
): Promise<number> {
  if (!dbInstance) return 0;

  try {
    const existing = await dbInstance.select({ id: templateTable.id }).from(templateTable);
    if (existing.length > 0) {
      return existing.length;
    }

    const defaultTemplates = getBuiltinTemplates();
    for (const tmpl of defaultTemplates) {
      try {
        await dbInstance.insert(templateTable).values(tmpl);
      } catch (insertErr) {
        console.warn(`Failed to seed template ${tmpl.slug}:`, insertErr);
      }
    }

    const seeded = await dbInstance.select().from(templateTable);
    return seeded.length;
  } catch (err) {
    console.warn("Error checking or seeding default templates:", err);
    return 0;
  }
}
