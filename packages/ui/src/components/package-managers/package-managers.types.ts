import type { InferThemeProps } from "../../resolver";
import type { RLPackageManagersTheme } from "./package-managers.theme";

export type Manager = "npm" | "pnpm" | "yarn" | "deno" | "bun" | "vp";
export type CommandType = "add" | "create" | "dlx" | "exec" | "install" | "remove" | "run";

/**
 * Package manager tabs props. `@status stable`.
 */
export type RLPackageManagersProps = InferThemeProps<typeof RLPackageManagersTheme> & {
  /**
   * Package name(s) appended to the command.
   * @default undefined
   */
  pkg?: string;

  /**
   * Command to render for every manager.
   * @default "add"
   */
  type?: CommandType;

  /**
   * Adds the dev flag to `add` commands.
   * @default false
   */
  dev?: boolean;

  /**
   * Extra arguments appended to the command.
   * @default undefined
   */
  args?: string;

  /**
   * Comment line rendered above the command. `{PKG}` is replaced by the manager name.
   * @default undefined
   */
  comment?: string;

  /**
   * Text prepended to the command.
   * @default undefined
   */
  prefix?: string;

  /**
   * Managers to show, in order.
   * @default ["npm", "pnpm", "yarn", "deno", "bun", "vp"]
   */
  managers?: Manager[];
};
