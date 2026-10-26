import type { BaseBlock } from "./blocks";
import type { Localized } from "./pages";

export type PageVersionStatus = "pending" | "approved" | "rejected" | "published";

export interface PageVersion {
  id: string;
  pageId: string;
  versionNumber: number;
  status: PageVersionStatus;
  slug: string;
  type: string;
  title: Localized;
  description?: Localized;
  tags?: Localized[];
  authorIds?: string[];
  content: {
    blocks: BaseBlock[];
    properties: Record<string, any>;
  };
  createdBy: string;
  approvedBy: string[];
  approvedAt?: Date | null;
  changeSummary?: string | null;
  createdAt?: Date;
}

export interface PageVersionComment {
  id: string;
  versionId: string;
  userId: string;
  userRole: string;
  content: string;
  blockId?: string | null;
  createdAt?: Date;
}

export interface PageVersionApproval {
  id: string;
  versionId: string;
  userId: string;
  userRole: string;
  approvedAt?: Date;
}
