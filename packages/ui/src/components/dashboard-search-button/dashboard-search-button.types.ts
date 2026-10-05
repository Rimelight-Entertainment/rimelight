import type { JSX } from "@solidjs/web";

export interface RLDashboardSearchButtonProps {
  icon?: string | false;
  label?: string;
  collapsed?: boolean;
  kbds?: Array<string | { value: string; variant?: string }>;
  ui?: any;
  class?: any;
  children?: JSX.Element;
  trailingSlot?: JSX.Element;
  [key: string]: unknown;
}
