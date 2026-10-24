import { defineCollection, type CollectionDefinition } from "@rimelight/cms";

/** Franchise wiki collections (Grand Tale). Generated from the old PAGE_MAP; edit freely. */
export const franchiseCollections: CollectionDefinition[] = [
  {
    slug: "patch-note",
    label: "Patch Note",
    groups: {
      version: {
        label: "Version Info",
        defaultOpen: true,
      },
    },
    fields: {
      versionNumber: {
        type: "text",
        label: "Version Number",
        group: "version",
        defaultValue: "1.0.0",
      },
      releaseDate: {
        type: "text",
        label: "Release Date",
        group: "version",
      },
    },
    features: {
      bylines: true,
      taxonomies: ["category", "tag"],
      routable: "/franchises/grand-tale/wiki/{slug}",
    },
  },
  {
    slug: "location",
    label: "Location",
    groups: {
      geography: {
        label: "Geography",
        defaultOpen: true,
      },
    },
    fields: {
      region: {
        type: "text",
        label: "Region",
        group: "geography",
      },
      climate: {
        type: "text",
        label: "Climate",
        group: "geography",
        defaultValue: "Temperate",
      },
    },
    features: {
      bylines: true,
      taxonomies: ["category", "tag"],
      routable: "/franchises/grand-tale/wiki/{slug}",
    },
  },
  {
    slug: "species",
    label: "Species",
    groups: {
      biology: {
        label: "Biology",
        defaultOpen: true,
      },
    },
    fields: {
      lifespan: {
        type: "text",
        label: "Average Lifespan",
        group: "biology",
      },
      homeworld: {
        type: "reference",
        label: "Homeworld",
        group: "biology",
        defaultValue: "",
        collections: ["location"],
      },
    },
    features: {
      bylines: true,
      taxonomies: ["category", "tag"],
      routable: "/franchises/grand-tale/wiki/{slug}",
    },
  },
  {
    slug: "character",
    label: "Character",
    groups: {
      identity: {
        label: "Identity",
        defaultOpen: true,
      },
      characteristics: {
        label: "Characteristics",
        defaultOpen: true,
      },
      inventory: {
        label: "Inventory & Assets",
        defaultOpen: false,
      },
      affiliations: {
        label: "Affiliations",
        defaultOpen: false,
      },
      other: {
        label: "Other",
        defaultOpen: false,
      },
    },
    fields: {
      name: {
        type: "text",
        label: "Name",
        group: "identity",
      },
      title: {
        type: "text",
        label: "Title",
        group: "identity",
      },
      aliases: {
        type: "tags",
        label: "Aliases",
        group: "identity",
        defaultValue: [],
      },
      pronouns: {
        type: "select",
        label: "Pronouns",
        group: "identity",
        defaultValue: "Unknown",
        options: [
          {
            value: "He/Him",
            label: "He/Him",
          },
          {
            value: "She/Her",
            label: "She/Her",
          },
          {
            value: "They/Them",
            label: "They/Them",
          },
          {
            value: "He/They",
            label: "He/They",
          },
          {
            value: "She/They",
            label: "She/They",
          },
          {
            value: "Other",
            label: "Other",
          },
          {
            value: "Unknown",
            label: "Unknown",
          },
        ],
      },
      flavourText: {
        type: "text",
        label: "Flavour Text",
        group: "identity",
      },
      species: {
        type: "reference",
        label: "Species",
        group: "characteristics",
        defaultValue: "",
        collections: ["species"],
      },
      sex: {
        type: "select",
        label: "Sex",
        group: "characteristics",
        defaultValue: "Unknown",
        options: [
          {
            value: "Male",
            label: "Male",
          },
          {
            value: "Female",
            label: "Female",
          },
          {
            value: "Other",
            label: "Other",
          },
          {
            value: "Unknown",
            label: "Unknown",
          },
        ],
      },
      height: {
        type: "number",
        label: "Height",
        group: "characteristics",
        defaultValue: 0,
      },
      weight: {
        type: "number",
        label: "Weight",
        group: "characteristics",
        defaultValue: 0,
      },
      dateOfBirth: {
        type: "text",
        label: "Date of Birth",
        group: "characteristics",
      },
      placeOfBirth: {
        type: "text",
        label: "Place of Birth",
        group: "characteristics",
      },
      dateOfDeath: {
        type: "text",
        label: "Date of Death",
        group: "characteristics",
      },
      placeOfDeath: {
        type: "text",
        label: "Place of Death",
        group: "characteristics",
      },
      equipment: {
        type: "references",
        label: "Equipment",
        group: "inventory",
        defaultValue: [],
        collections: ["object"],
      },
      pets: {
        type: "references",
        label: "Pets",
        group: "inventory",
        defaultValue: [],
        collections: ["character"],
      },
      mounts: {
        type: "references",
        label: "Mounts",
        group: "inventory",
        defaultValue: [],
        collections: ["character"],
      },
      currentAffiliations: {
        type: "references",
        label: "Current Affiliations",
        group: "affiliations",
        defaultValue: [],
        collections: ["group"],
      },
      formerAffiliations: {
        type: "references",
        label: "Former Affiliations",
        group: "affiliations",
        defaultValue: [],
        collections: ["group"],
      },
      favouriteFood: {
        type: "reference",
        label: "Favourite Food",
        group: "other",
        defaultValue: "",
        collections: ["object"],
      },
    },
    initialBlocks: [
      {
        id: "24756bce-a003-4532-8e26-a4c9188ddf10",
        type: "SectionBlock",
        props: {
          title: "Appearance",
        },
        isTemplated: true,
        children: [],
      },
      {
        id: "4d777afe-f669-4d0d-95a5-ac5d94e15a2d",
        type: "SectionBlock",
        props: {
          title: "Abilities",
        },
        isTemplated: true,
        children: [],
      },
      {
        id: "0f6c9795-7e21-4dc7-a117-b07e9a2e8131",
        type: "SectionBlock",
        props: {
          title: "History",
        },
        isTemplated: true,
        children: [],
      },
    ],
    features: {
      bylines: true,
      taxonomies: ["category", "tag"],
      routable: "/franchises/grand-tale/wiki/{slug}",
    },
  },
  {
    slug: "skill",
    label: "Skill",
    groups: {
      mechanics: {
        label: "Mechanics",
        defaultOpen: true,
      },
    },
    fields: {
      cooldown: {
        type: "number",
        label: "Cooldown (sec)",
        group: "mechanics",
        defaultValue: 10,
      },
      manaCost: {
        type: "number",
        label: "Mana Cost",
        group: "mechanics",
        defaultValue: 50,
      },
      damageType: {
        type: "select",
        label: "Damage Type",
        group: "mechanics",
        defaultValue: "Physical",
        options: [
          {
            value: "Physical",
            label: "Physical",
          },
          {
            value: "Magic",
            label: "Magic",
          },
          {
            value: "True",
            label: "True",
          },
          {
            value: "None",
            label: "None",
          },
        ],
      },
    },
    features: {
      bylines: true,
      taxonomies: ["category", "tag"],
      routable: "/franchises/grand-tale/wiki/{slug}",
    },
  },
  {
    slug: "item",
    label: "Item",
    groups: {
      details: {
        label: "Item Details",
        defaultOpen: true,
      },
    },
    fields: {
      rarity: {
        type: "select",
        label: "Rarity",
        group: "details",
        defaultValue: "Common",
        options: [
          {
            value: "Common",
            label: "Common",
          },
          {
            value: "Uncommon",
            label: "Uncommon",
          },
          {
            value: "Rare",
            label: "Rare",
          },
          {
            value: "Epic",
            label: "Epic",
          },
          {
            value: "Legendary",
            label: "Legendary",
          },
        ],
      },
      price: {
        type: "number",
        label: "Gold Price",
        group: "details",
        defaultValue: 100,
      },
      isQuestItem: {
        type: "select",
        label: "Quest Item",
        group: "details",
        defaultValue: "No",
        options: [
          {
            value: "Yes",
            label: "Yes",
          },
          {
            value: "No",
            label: "No",
          },
        ],
      },
    },
    features: {
      bylines: true,
      taxonomies: ["category", "tag"],
      routable: "/franchises/grand-tale/wiki/{slug}",
    },
  },
  {
    slug: "object",
    label: "Object",
    groups: {
      details: {
        label: "Object Details",
        defaultOpen: true,
      },
    },
    fields: {
      category: {
        type: "text",
        label: "Category",
        group: "details",
        defaultValue: "Miscellaneous",
      },
    },
    features: {
      bylines: true,
      taxonomies: ["category", "tag"],
      routable: "/franchises/grand-tale/wiki/{slug}",
    },
  },
  {
    slug: "group",
    label: "Group",
    groups: {
      details: {
        label: "Group Details",
        defaultOpen: true,
      },
    },
    fields: {
      leader: {
        type: "reference",
        label: "Leader",
        group: "details",
        defaultValue: "",
        collections: ["character"],
      },
      headquarters: {
        type: "reference",
        label: "Headquarters",
        group: "details",
        defaultValue: "",
        collections: ["location"],
      },
    },
    features: {
      bylines: true,
      taxonomies: ["category", "tag"],
      routable: "/franchises/grand-tale/wiki/{slug}",
    },
  },
  {
    slug: "card",
    label: "Card",
    groups: {},
    fields: {},
    initialBlocks: [],
    features: {
      bylines: true,
      taxonomies: ["category", "tag"],
      routable: "/franchises/grand-tale/wiki/{slug}",
    },
  },
  {
    slug: "hero",
    label: "Hero",
    groups: {
      combat: {
        label: "Combat Stats",
        defaultOpen: true,
      },
      progression: {
        label: "Progression",
        defaultOpen: true,
      },
    },
    fields: {
      class: {
        type: "select",
        label: "Class",
        group: "combat",
        defaultValue: "Warrior",
        options: [
          {
            value: "Warrior",
            label: "Warrior",
          },
          {
            value: "Mage",
            label: "Mage",
          },
          {
            value: "Rogue",
            label: "Rogue",
          },
          {
            value: "Paladin",
            label: "Paladin",
          },
        ],
      },
      difficulty: {
        type: "number",
        label: "Difficulty",
        group: "combat",
        defaultValue: 1,
      },
      primaryRole: {
        type: "select",
        label: "Primary Role",
        group: "combat",
        defaultValue: "Tank",
        options: [
          {
            value: "Tank",
            label: "Tank",
          },
          {
            value: "DPS",
            label: "DPS",
          },
          {
            value: "Support",
            label: "Support",
          },
        ],
      },
      baseHp: {
        type: "number",
        label: "Base HP",
        group: "progression",
        defaultValue: 500,
      },
      baseMana: {
        type: "number",
        label: "Base Mana",
        group: "progression",
        defaultValue: 100,
      },
    },
    initialBlocks: [
      {
        id: "b18366d3-8c8b-4525-a712-92a9aa1c281b",
        type: "SectionBlock",
        props: {
          title: "Playstyle",
        },
        isTemplated: true,
        children: [],
      },
      {
        id: "ee6267ab-4bf3-495e-bea2-69eb7e36c083",
        type: "SectionBlock",
        props: {
          title: "Background Lore",
        },
        isTemplated: true,
        children: [],
      },
    ],
    features: {
      bylines: true,
      taxonomies: ["category", "tag"],
      routable: "/franchises/grand-tale/wiki/{slug}",
    },
  },
  {
    slug: "series",
    label: "Series",
    groups: {
      details: {
        label: "Details",
        defaultOpen: true,
      },
    },
    fields: {
      genre: {
        type: "text",
        label: "Genre",
        group: "details",
        defaultValue: "Fantasy",
      },
      status: {
        type: "select",
        label: "Status",
        group: "details",
        defaultValue: "In Development",
        options: [
          {
            value: "In Development",
            label: "In Development",
          },
          {
            value: "Ongoing",
            label: "Ongoing",
          },
          {
            value: "Completed",
            label: "Completed",
          },
          {
            value: "Cancelled",
            label: "Cancelled",
          },
        ],
      },
      seasons: {
        type: "number",
        label: "Seasons",
        group: "details",
        defaultValue: 1,
      },
    },
    initialBlocks: [
      {
        id: "ea14bd90-0e37-47c8-8633-064dd973945f",
        type: "SectionBlock",
        props: {
          title: "Overview",
        },
        isTemplated: true,
        children: [],
      },
      {
        id: "610cc506-20bf-4985-be11-a41c25bb40c7",
        type: "SectionBlock",
        props: {
          title: "Seasons",
        },
        isTemplated: true,
        children: [],
      },
    ],
    features: {
      bylines: true,
      taxonomies: ["category", "tag"],
      routable: "/franchises/grand-tale/wiki/{slug}",
    },
  },
  {
    slug: "tale",
    label: "Tale",
    groups: {},
    fields: {},
    features: {
      bylines: true,
      taxonomies: ["category", "tag"],
      routable: "/franchises/grand-tale/wiki/{slug}",
    },
  },
  {
    slug: "episode",
    label: "Episode",
    groups: {},
    fields: {},
    features: {
      bylines: true,
      taxonomies: ["category", "tag"],
      routable: "/franchises/grand-tale/wiki/{slug}",
    },
  },
].map((c) => defineCollection(c as CollectionDefinition));
