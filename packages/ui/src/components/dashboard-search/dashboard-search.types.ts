import type { JSX } from "@solidjs/web";

export interface RLDashboardSearchProps {
  open?: boolean;
  shortcut?: string;
  ui?: any;
  class?: any;
  children?: JSX.Element;
  onOpenChange?: (open: boolean) => void;
  [key: string]: unknown;
}
