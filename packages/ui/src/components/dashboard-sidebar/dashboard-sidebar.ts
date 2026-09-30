export interface DashboardSidebarProps {
  side?: "left" | "right";
  collapsible?: boolean;
  collapsed?: boolean;
  resizable?: boolean;
  defaultSize?: number;
  minSize?: number;
  maxSize?: number;
  collapsedSize?: number;
  ui?: any;
  class?: any;
  [key: string]: unknown;
}
