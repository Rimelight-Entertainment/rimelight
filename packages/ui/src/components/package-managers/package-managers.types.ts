import type { Theme } from "../../types";

export type Manager = "npm" | "pnpm" | "yarn" | "deno" | "bun" | "vp";
export type CommandType = "add" | "create" | "dlx" | "exec" | "install" | "remove" | "run";

export interface RLPackageManagersProps {
  pkg?: string;
  type?: CommandType;
  dev?: boolean;
  args?: string;
  comment?: string;
  prefix?: string;
  managers?: Manager[];
  /**
   * Theme mode override — pins colors to flat, light, or dark mode.
   */
  theme?: Theme | undefined;
  /**
   * Slot-specific CSS class overrides.
   */
  ui?: any;
  /**
   * Additional CSS classes to apply to the root element.
   */
  class?: any;
}
