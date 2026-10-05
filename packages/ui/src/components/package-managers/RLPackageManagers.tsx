import type { RLPackageManagersProps, Manager, CommandType } from "./package-managers.types";
import { RLPackageManagersTheme } from "./package-managers.theme";
import { createMemo, createSignal, For, Show, type Component } from "solid-js";
import { RLButton } from "../button/RLButton";

const commands: Record<Manager, Partial<Record<CommandType, string>> & { dev: string }> = {
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

export const RLPackageManagers: Component<RLPackageManagersProps> = (allProps) => {
  const props = allProps;

  const getCommand = (mgr: Manager, cmdType: CommandType): string | undefined => {
    let cmd = commands[mgr][cmdType];
    if (cmd === undefined) return undefined;

    if (props.prefix) cmd = `${props.prefix} ${cmd}`;
    if (props.comment) cmd = `# ${props.comment.replaceAll("{PKG}", mgr)}\n${cmd}`;
    if (props.dev && cmdType === "add") cmd += ` ${commands[mgr].dev}`;

    if (props.pkg) {
      const processedPkg =
        cmdType === "create" && mgr === "yarn"
          ? props.pkg.replace(/@(?![^@]*\/)\S*$/, "")
          : props.pkg;
      cmd += ` ${processedPkg}`;
    }

    if (props.args) {
      const needsDoubleDash = mgr === "npm" && !["dlx", "exec", "run"].includes(cmdType);
      cmd += `${needsDoubleDash ? " --" : ""} ${props.args}`;
    }

    return cmd;
  };

  const tabs = createMemo(() =>
    ((props.managers ?? ["npm", "pnpm", "yarn", "deno", "bun", "vp"]) as Manager[])
      .map((mgr) => ({ mgr, cmd: getCommand(mgr, props.type ?? "add") }))
      .filter((tab): tab is { mgr: Manager; cmd: string } => tab.cmd !== undefined),
  );

  const [activeIdx, setActiveIdx] = createSignal(0);
  const [copied, setCopied] = createSignal<string | null>(null);

  const theme = createMemo(() =>
    RLPackageManagersTheme({
      class: props.class,
    }),
  );

  const copyCommand = async (mgr: string, cmd: string) => {
    try {
      await navigator.clipboard.writeText(cmd);
      setCopied(mgr);
      setTimeout(() => {
        setCopied((current) => (current === mgr ? null : current));
      }, 2000);
    } catch {
      setCopied(null);
    }
  };

  return (
    <div class={theme().root} data-slot="root">
      <div class={theme().list} role="tablist" data-slot="list">
        <For each={tabs()}>
          {(tab, idx) => {
            const active = idx() === activeIdx();
            return (
              <button
                type="button"
                role="tab"
                class={`${theme().trigger} ${active ? "bg-default text-highlighted border border-default border-b-transparent" : "text-muted hover:text-highlighted"}`}
                data-slot="trigger"
                data-state={active ? "active" : "inactive"}
                data-value={tab.mgr}
                aria-selected={active ? "true" : "false"}
                onClick={() => setActiveIdx(idx())}
              >
                {tab.mgr}
              </button>
            );
          }}
        </For>
      </div>

      <For each={tabs()}>
        {(tab, idx) => (
          <div
            role="tabpanel"
            data-value={tab.mgr}
            class={theme().content}
            data-slot="content"
            hidden={idx() !== activeIdx() ? "until-found" : undefined}
          >
            <Show when={idx() === activeIdx()}>
              <div class="relative">
                <pre class={theme().codeBlock}>
                  <code aria-hidden="true">{tab.cmd!}</code>
                </pre>
                <RLButton
                  type="button"
                  variant="ghost"
                  color="neutral"
                  size="sm"
                  class={theme().copyButton}
                  leadingIcon={copied() === tab.mgr ? "check" : "copy"}
                  aria-label="Copy command"
                  data-slot="copy-button"
                  onClick={() => copyCommand(tab.mgr, tab.cmd!)}
                >
                  {copied() === tab.mgr ? "Copied" : "Copy"}
                </RLButton>
              </div>
            </Show>
          </div>
        )}
      </For>
    </div>
  );
};
