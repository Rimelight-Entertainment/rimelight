/**
 * Page type definitions for the CMS.
 *
 * Ported from rimelight.com/src/types/pageDefinitions.ts. Each definition specifies typed property
 * groups with field schemas and optional initial template blocks seeded on page creation.
 */

import type { BaseBlock } from "./types/blocks"

// ─── Field type definitions ───────────────────────────────────────────────────

export type FieldType = "text" | "number" | "enum" | "text-array" | "page" | "page-array"

export interface FieldDefinition {
  type: FieldType
  label: { en: string }
  defaultValue: any
  options?: { en: string }[]
  allowedPageTypes?: string[]
}

export interface PropertyGroup {
  label: { en: string }
  defaultOpen: boolean
  fields: Record<string, FieldDefinition>
}

export interface PageDefinition {
  typeLabelKey: string
  properties: Record<string, PropertyGroup>
  /**
   * Factory that returns the initial blocks seeded when a page of this type is created
   */
  initialBlocks?: () => BaseBlock[]
}

function uuid(): string {
  return typeof crypto !== "undefined" && crypto.randomUUID
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2, 11)
}

export function definePageDefinition(def: PageDefinition): PageDefinition {
  return def
}

// ─── Standard base definitions ────────────────────────────────────────────────

export const DOCUMENT_DEFINITION = definePageDefinition({
  typeLabelKey: "page.type.document",
  properties: {}
})

export const BLOG_POST_DEFINITION = definePageDefinition({
  typeLabelKey: "page.type.blogPost",
  properties: {
    meta: {
      label: { en: "Post Metadata" },
      defaultOpen: true,
      fields: {
        category: {
          type: "enum",
          label: { en: "Category" },
          defaultValue: { en: "Company News" },
          options: [{ en: "Company News" }, { en: "Development Log" }, { en: "New Release" }]
        },
        publishedAt: {
          type: "text",
          label: { en: "Published At" },
          defaultValue: { en: "" }
        },
        author: {
          type: "text",
          label: { en: "Author" },
          defaultValue: { en: "" }
        }
      }
    }
  }
})

export const PATCH_NOTE_DEFINITION = definePageDefinition({
  typeLabelKey: "page.type.patchNote",
  properties: {
    version: {
      label: { en: "Version Info" },
      defaultOpen: true,
      fields: {
        versionNumber: {
          type: "text",
          label: { en: "Version Number" },
          defaultValue: "1.0.0"
        },
        releaseDate: {
          type: "text",
          label: { en: "Release Date" },
          defaultValue: { en: "" }
        }
      }
    }
  }
})

export const LOCATION_DEFINITION = definePageDefinition({
  typeLabelKey: "page.type.location",
  properties: {
    geography: {
      label: { en: "Geography" },
      defaultOpen: true,
      fields: {
        region: { type: "text", label: { en: "Region" }, defaultValue: { en: "" } },
        climate: { type: "text", label: { en: "Climate" }, defaultValue: "Temperate" }
      }
    }
  }
})

export const SPECIES_DEFINITION = definePageDefinition({
  typeLabelKey: "page.type.species",
  properties: {
    biology: {
      label: { en: "Biology" },
      defaultOpen: true,
      fields: {
        lifespan: { type: "text", label: { en: "Average Lifespan" }, defaultValue: { en: "" } },
        homeworld: {
          type: "page",
          label: { en: "Homeworld" },
          defaultValue: "",
          allowedPageTypes: ["Location"]
        }
      }
    }
  }
})

export const CHARACTER_DEFINITION = definePageDefinition({
  typeLabelKey: "page.type.character",
  properties: {
    identity: {
      label: { en: "Identity" },
      defaultOpen: true,
      fields: {
        name: { type: "text", label: { en: "Name" }, defaultValue: { en: "" } },
        title: { type: "text", label: { en: "Title" }, defaultValue: { en: "" } },
        aliases: { type: "text-array", label: { en: "Aliases" }, defaultValue: [] },
        pronouns: {
          type: "enum",
          label: { en: "Pronouns" },
          defaultValue: { en: "Unknown" },
          options: [
            { en: "He/Him" },
            { en: "She/Her" },
            { en: "They/Them" },
            { en: "He/They" },
            { en: "She/They" },
            { en: "Other" },
            { en: "Unknown" }
          ]
        },
        flavourText: { type: "text", label: { en: "Flavour Text" }, defaultValue: { en: "" } }
      }
    },
    characteristics: {
      label: { en: "Characteristics" },
      defaultOpen: true,
      fields: {
        species: {
          type: "page",
          label: { en: "Species" },
          defaultValue: "",
          allowedPageTypes: ["Species"]
        },
        sex: {
          type: "enum",
          label: { en: "Sex" },
          defaultValue: { en: "Unknown" },
          options: [{ en: "Male" }, { en: "Female" }, { en: "Other" }, { en: "Unknown" }]
        },
        height: { type: "number", label: { en: "Height" }, defaultValue: 0 },
        weight: { type: "number", label: { en: "Weight" }, defaultValue: 0 },
        dateOfBirth: { type: "text", label: { en: "Date of Birth" }, defaultValue: { en: "" } },
        placeOfBirth: { type: "text", label: { en: "Place of Birth" }, defaultValue: { en: "" } },
        dateOfDeath: { type: "text", label: { en: "Date of Death" }, defaultValue: { en: "" } },
        placeOfDeath: { type: "text", label: { en: "Place of Death" }, defaultValue: { en: "" } }
      }
    },
    inventory: {
      label: { en: "Inventory & Assets" },
      defaultOpen: false,
      fields: {
        equipment: {
          type: "page-array",
          label: { en: "Equipment" },
          defaultValue: [],
          allowedPageTypes: ["Object"]
        },
        pets: {
          type: "page-array",
          label: { en: "Pets" },
          defaultValue: [],
          allowedPageTypes: ["Character"]
        },
        mounts: {
          type: "page-array",
          label: { en: "Mounts" },
          defaultValue: [],
          allowedPageTypes: ["Character"]
        }
      }
    },
    affiliations: {
      label: { en: "Affiliations" },
      defaultOpen: false,
      fields: {
        currentAffiliations: {
          type: "page-array",
          label: { en: "Current Affiliations" },
          defaultValue: [],
          allowedPageTypes: ["Group"]
        },
        formerAffiliations: {
          type: "page-array",
          label: { en: "Former Affiliations" },
          defaultValue: [],
          allowedPageTypes: ["Group"]
        }
      }
    },
    other: {
      label: { en: "Other" },
      defaultOpen: false,
      fields: {
        favouriteFood: {
          type: "page",
          label: { en: "Favourite Food" },
          defaultValue: "",
          allowedPageTypes: ["Object"]
        }
      }
    }
  },
  initialBlocks: () => [
    {
      id: uuid(),
      type: "SectionBlock",
      props: { level: 2, title: "Appearance", children: [] },
      isTemplated: true
    },
    {
      id: uuid(),
      type: "SectionBlock",
      props: { level: 2, title: "Abilities", children: [] },
      isTemplated: true
    },
    {
      id: uuid(),
      type: "SectionBlock",
      props: { level: 2, title: "History", children: [] },
      isTemplated: true
    }
  ]
})

export const SKILL_DEFINITION = definePageDefinition({
  typeLabelKey: "page.type.skill",
  properties: {
    mechanics: {
      label: { en: "Mechanics" },
      defaultOpen: true,
      fields: {
        cooldown: { type: "number", label: { en: "Cooldown (sec)" }, defaultValue: 10 },
        manaCost: { type: "number", label: { en: "Mana Cost" }, defaultValue: 50 },
        damageType: {
          type: "enum",
          label: { en: "Damage Type" },
          defaultValue: { en: "Physical" },
          options: [{ en: "Physical" }, { en: "Magic" }, { en: "True" }, { en: "None" }]
        }
      }
    }
  }
})

export const ITEM_DEFINITION = definePageDefinition({
  typeLabelKey: "page.type.item",
  properties: {
    details: {
      label: { en: "Item Details" },
      defaultOpen: true,
      fields: {
        rarity: {
          type: "enum",
          label: { en: "Rarity" },
          defaultValue: { en: "Common" },
          options: [
            { en: "Common" },
            { en: "Uncommon" },
            { en: "Rare" },
            { en: "Epic" },
            { en: "Legendary" }
          ]
        },
        price: { type: "number", label: { en: "Gold Price" }, defaultValue: 100 },
        isQuestItem: {
          type: "enum",
          label: { en: "Quest Item" },
          defaultValue: { en: "No" },
          options: [{ en: "Yes" }, { en: "No" }]
        }
      }
    }
  }
})

export const OBJECT_DEFINITION = definePageDefinition({
  typeLabelKey: "page.type.object",
  properties: {
    details: {
      label: { en: "Object Details" },
      defaultOpen: true,
      fields: {
        category: { type: "text", label: { en: "Category" }, defaultValue: { en: "Miscellaneous" } }
      }
    }
  }
})

export const GROUP_DEFINITION = definePageDefinition({
  typeLabelKey: "page.type.group",
  properties: {
    details: {
      label: { en: "Group Details" },
      defaultOpen: true,
      fields: {
        leader: {
          type: "page",
          label: { en: "Leader" },
          defaultValue: "",
          allowedPageTypes: ["Character"]
        },
        headquarters: {
          type: "page",
          label: { en: "Headquarters" },
          defaultValue: "",
          allowedPageTypes: ["Location"]
        }
      }
    }
  }
})

export const HERO_DEFINITION = definePageDefinition({
  typeLabelKey: "page.type.hero",
  properties: {
    combat: {
      label: { en: "Combat Stats" },
      defaultOpen: true,
      fields: {
        class: {
          type: "enum",
          label: { en: "Class" },
          defaultValue: { en: "Warrior" },
          options: [{ en: "Warrior" }, { en: "Mage" }, { en: "Rogue" }, { en: "Paladin" }]
        },
        difficulty: { type: "number", label: { en: "Difficulty" }, defaultValue: 1 },
        primaryRole: {
          type: "enum",
          label: { en: "Primary Role" },
          defaultValue: { en: "Tank" },
          options: [{ en: "Tank" }, { en: "DPS" }, { en: "Support" }]
        }
      }
    },
    progression: {
      label: { en: "Progression" },
      defaultOpen: true,
      fields: {
        baseHp: { type: "number", label: { en: "Base HP" }, defaultValue: 500 },
        baseMana: { type: "number", label: { en: "Base Mana" }, defaultValue: 100 }
      }
    }
  },
  initialBlocks: () => [
    {
      id: uuid(),
      type: "SectionBlock",
      props: { level: 2, title: "Playstyle", children: [] },
      isTemplated: true
    },
    {
      id: uuid(),
      type: "SectionBlock",
      props: { level: 2, title: "Background Lore", children: [] },
      isTemplated: true
    }
  ]
})

export const CARD_DEFINITION = definePageDefinition({
  typeLabelKey: "page.type.card",
  properties: {},
  initialBlocks: () => []
})

export const SERIES_DEFINITION = definePageDefinition({
  typeLabelKey: "page.type.series",
  properties: {
    details: {
      label: { en: "Details" },
      defaultOpen: true,
      fields: {
        genre: { type: "text", label: { en: "Genre" }, defaultValue: { en: "Fantasy" } },
        status: {
          type: "enum",
          label: { en: "Status" },
          defaultValue: { en: "In Development" },
          options: [
            { en: "In Development" },
            { en: "Ongoing" },
            { en: "Completed" },
            { en: "Cancelled" }
          ]
        },
        seasons: { type: "number", label: { en: "Seasons" }, defaultValue: 1 }
      }
    }
  },
  initialBlocks: () => [
    {
      id: uuid(),
      type: "SectionBlock",
      props: { level: 2, title: "Overview", children: [] },
      isTemplated: true
    },
    {
      id: uuid(),
      type: "SectionBlock",
      props: { level: 2, title: "Seasons", children: [] },
      isTemplated: true
    }
  ]
})

// ─── Page Map ─────────────────────────────────────────────────────────────────

export const PAGE_MAP: Record<string, PageDefinition> = {
  Document: DOCUMENT_DEFINITION,
  BlogPost: BLOG_POST_DEFINITION,
  PatchNote: PATCH_NOTE_DEFINITION,
  Location: LOCATION_DEFINITION,
  Species: SPECIES_DEFINITION,
  Character: CHARACTER_DEFINITION,
  Skill: SKILL_DEFINITION,
  Item: ITEM_DEFINITION,
  Object: OBJECT_DEFINITION,
  Group: GROUP_DEFINITION,
  Card: CARD_DEFINITION,
  Hero: HERO_DEFINITION,
  Series: SERIES_DEFINITION,
  Tale: definePageDefinition({ typeLabelKey: "page.type.tale", properties: {} }),
  Episode: definePageDefinition({ typeLabelKey: "page.type.episode", properties: {} }),
  Default: definePageDefinition({ typeLabelKey: "page.type.default", properties: {} })
}

export function getPageDefinition(type: string): PageDefinition {
  if (!type) return PAGE_MAP.Default!

  // Exact match
  if (PAGE_MAP[type]) return PAGE_MAP[type]

  // Case-insensitive / normalized lookup
  const normalized = type.toLowerCase().replace(/[^a-z0-9]/g, "")

  const ALIAS_MAP: Record<string, PageDefinition> = {
    blog: BLOG_POST_DEFINITION,
    blogpost: BLOG_POST_DEFINITION,
    article: BLOG_POST_DEFINITION,
    doc: DOCUMENT_DEFINITION,
    document: DOCUMENT_DEFINITION,
    patchnote: PATCH_NOTE_DEFINITION,
    location: LOCATION_DEFINITION,
    species: SPECIES_DEFINITION,
    character: CHARACTER_DEFINITION,
    skill: SKILL_DEFINITION,
    item: ITEM_DEFINITION,
    object: OBJECT_DEFINITION,
    group: GROUP_DEFINITION,
    card: CARD_DEFINITION,
    hero: HERO_DEFINITION,
    series: SERIES_DEFINITION
  }

  if (ALIAS_MAP[normalized]) return ALIAS_MAP[normalized]

  // Fallback scan
  for (const [key, def] of Object.entries(PAGE_MAP)) {
    if (key.toLowerCase() === normalized) return def
  }

  return PAGE_MAP.Default!
}
