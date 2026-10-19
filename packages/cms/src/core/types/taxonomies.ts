import type { Localized } from "./pages";

export interface TaxonomyTerm {
  id: string;
  taxonomy: string;
  slug: string;
  label: Localized | string;
  name?: string;
  description?: Localized | string | null;
  parentId?: string | null;
  displayOrder?: number;
  children?: TaxonomyTerm[];
  count?: number;
  postCount?: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface TaxonomyQueryOptions {
  includeCounts?: boolean;
  locale?: string;
}
