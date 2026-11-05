import type {
  CommandOptions,
  CommandType,
  Manager,
  ManagerCommands,
} from "./package-managers.types";

export const DEFAULT_MANAGERS: readonly Manager[] = ["npm", "pnpm", "yarn", "deno", "bun", "vp"];

const MANAGER_COMMANDS: Record<Manager, ManagerCommands> = {
  npm: {
    add: "npm i",
    create: "npm create",
    dlx: "npx",
    exec: "npx",
    install: "npm install",
    run: "npm run",
    remove: "npm uninstall",
    dev: "-D",
  },
  yarn: {
    add: "yarn add",
    create: "yarn create",
    dlx: "yarn dlx",
    exec: "yarn",
    install: "yarn install",
    run: "yarn run",
    remove: "yarn remove",
    dev: "-D",
  },
  pnpm: {
    add: "pnpm add",
    create: "pnpm create",
    dlx: "pnpx",
    exec: "pnpm",
    install: "pnpm install",
    run: "pnpm run",
    remove: "pnpm remove",
    dev: "-D",
  },
  deno: {
    add: "deno add",
    create: "deno run -A",
    dlx: "deno run",
    exec: "deno run",
    install: "deno install",
    run: "deno task",
    remove: "deno remove",
    dev: "--dev",
  },
  bun: {
    add: "bun add",
    create: "bun create",
    install: "bun install",
    run: "bun run",
    remove: "bun remove",
    dev: "-d",
  },
  vp: {
    add: "vp add",
    create: "vp create",
    dlx: "vp dlx",
    exec: "vp exec",
    install: "vp install",
    run: "vp run",
    remove: "vp remove",
    dev: "-D",
  },
};

/** Returns the command line for a manager, or `undefined` when the manager has no such command. */
export function buildCommand(
  mgr: Manager,
  type: CommandType,
  options: CommandOptions,
): string | undefined {
  const table = MANAGER_COMMANDS[mgr];
  let cmd = table[type];
  if (cmd === undefined) return undefined;

  if (options.prefix) cmd = `${options.prefix} ${cmd}`;
  if (options.comment) cmd = `# ${options.comment.replaceAll("{PKG}", mgr)}\n${cmd}`;
  if (options.dev && type === "add") cmd += ` ${table.dev}`;

  if (options.pkg) {
    const pkg =
      type === "create" && mgr === "yarn"
        ? options.pkg.replace(/@(?![^@]*\/)\S*$/, "")
        : options.pkg;
    cmd += ` ${pkg}`;
  }

  if (options.args) {
    const needsDoubleDash = mgr === "npm" && !["dlx", "exec", "run"].includes(type);
    cmd += `${needsDoubleDash ? " --" : ""} ${options.args}`;
  }

  return cmd;
}

/** Index of the tab that a horizontal tablist key moves to, or `undefined` for other keys. */
export function nextTabIndex(key: string, index: number, count: number): number | undefined {
  const last = count - 1;
  switch (key) {
    case "ArrowRight":
      return index >= last ? 0 : index + 1;
    case "ArrowLeft":
      return index <= 0 ? last : index - 1;
    case "Home":
      return 0;
    case "End":
      return last;
    default:
      return undefined;
  }
}
