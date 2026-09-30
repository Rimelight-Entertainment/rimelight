export interface DashboardSearchButtonProps {
  icon?: string | false;
  label?: string;
  collapsed?: boolean;
  kbds?: Array<string | { value: string; variant?: string }>;
  ui?: any;
  class?: any;
  [key: string]: unknown;
}
