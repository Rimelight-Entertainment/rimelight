import { createContext, useContext, type Accessor } from "solid-js";
import type { BlockRegistry } from "../core/blocks/registry";
import type { ResolvedCollection } from "../core/collections/types";
import type { CmsActor } from "../services/context";
import type { CmsApi } from "./api";

export interface Toast {
  id: number;
  kind: "success" | "error" | "info";
  message: string;
}

export interface DashboardContextValue {
  api: CmsApi;
  user: Accessor<CmsActor | null>;
  collections: Accessor<ResolvedCollection[]>;
  collection: (slug: string) => ResolvedCollection | undefined;
  reloadCollections: () => Promise<void>;
  registry: BlockRegistry;
  locales: string[];
  /** Absolute href for a dashboard path, e.g. href("/c/blog") → "/en/cms/c/blog". */
  href: (path: string) => string;
  navigate: (path: string) => void;
  toast: (message: string, kind?: Toast["kind"]) => void;
}

export const DashboardContext = createContext<DashboardContextValue>();

export function useDashboard(): DashboardContextValue {
  const ctx = useContext(DashboardContext);
  if (!ctx) throw new Error("useDashboard() must be used inside <CmsDashboard>");
  return ctx;
}
