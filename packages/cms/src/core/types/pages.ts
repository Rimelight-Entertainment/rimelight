import type { BaseBlock } from "./blocks";

export type Localized<T = string> = Record<string, T>;

export type EntryStatus = "draft" | "scheduled" | "published" | "archived";

export interface PageMetadata {
  id: string;
  slug: string;
  type: string;
  templateId?: string | null;
  templateVersion?: number;
  title: Localized;
  description?: Localized;
  tags?: Localized[];
  authorIds?: string[];
  status?: EntryStatus;
  scheduledAt?: Date | null;
  publishedVersionId?: string | null;
  postedAt?: Date | null;
  createdAt?: Date;
  updatedAt?: Date;
  deletedAt?: Date | null;
}

export interface PageContent<P = Record<string, any>> {
  blocks: BaseBlock[];
  properties: P;
}
