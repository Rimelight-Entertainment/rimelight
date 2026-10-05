import type { JSX } from "@solidjs/web";

export interface RLDashboardSidebarToggleProps {
  icon?: string;
  side?: "left" | "right";
  ui?: any;
  class?: any;
  children?: JSX.Element;
  [key: string]: unknown;
}
