import type { RegisteredShortcut } from "../../shortcuts";

export interface CategorySection {
  key: string;
  label: string;
  items: RegisteredShortcut[];
}

export interface RLShortcutsProps {
  categories?: Record<string, string>;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  ui?: any;
  class?: string;
}
