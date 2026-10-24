export interface CollectionFeatures {
  versioned?: boolean;
  localized?: boolean;
  hierarchical?: boolean;
  routable?: { pattern: string } | boolean;
  scheduled?: boolean;
}

export interface CollectionWorkflow {
  minApprovals?: number;
  allowSelfApproval?: boolean;
  requiredRolesForApproval?: string[];
}

export type CollectionKind = "document" | "singleton" | "data";

export interface CollectionDefinition {
  id?: string;
  slug: string;
  label: Record<string, string>;
  description?: Record<string, string>;
  icon?: string;
  kind?: CollectionKind;
  features?: CollectionFeatures;
  workflow?: CollectionWorkflow;
  initialBlocks?: any[];
  defaultLocale?: string;
  locales?: string[];
  schemaVersion?: number;
}

export function defineCollection(def: CollectionDefinition): CollectionDefinition {
  return {
    kind: "document",
    defaultLocale: "en",
    locales: ["en"],
    schemaVersion: 1,
    features: {
      versioned: true,
      localized: false,
      hierarchical: false,
      routable: true,
      scheduled: false,
      ...def.features,
    },
    workflow: {
      minApprovals: 1,
      allowSelfApproval: true,
      ...def.workflow,
    },
    ...def,
  };
}
