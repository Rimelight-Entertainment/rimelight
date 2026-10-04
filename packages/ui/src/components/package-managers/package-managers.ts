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
}
