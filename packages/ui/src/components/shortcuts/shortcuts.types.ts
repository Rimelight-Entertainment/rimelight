import type { RegisteredShortcut } from "../../shortcuts";

export interface CategorySection {
  key: string;
  label: string;
  items: RegisteredShortcut[];
}

export interface RLShortcutsProps {
  categories?: Record<string, string>;
  ui?: any;
  class?: string;
}
