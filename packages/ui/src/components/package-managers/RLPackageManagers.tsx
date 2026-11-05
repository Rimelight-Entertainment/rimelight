import { createMemo, createSignal, For, Show, type Component } from "solid-js";
import { RLButton } from "../button/RLButton";
import { uiT } from "../../locale";
import { RLPackageManagersTheme } from "./package-managers.theme";
import { buildCommand, DEFAULT_MANAGERS, nextTabIndex } from "./package-managers.helpers";
import type { Manager, RLPackageManagersProps } from "./package-managers.types";

const OMIT_KEYS = ["pkg", "type", "dev", "args", "comment", "prefix", "managers"] as const;

const COPY_FEEDBACK_MS = 2000;

export const RLPackageManagers: Component<RLPackageManagersProps> = (props) => {
  const { Tag, classes, rest, theme, id } = RLPackageManagersTheme.setup(props, {
    omit: OMIT_KEYS,
  });

  const tabs = createMemo(() => {
    const managers: readonly Manager[] = props.managers ?? DEFAULT_MANAGERS;
    const type = props.type ?? "add";
    const options = {
      pkg: props.pkg,
      dev: props.dev,
      args: props.args,
      comment: props.comment,
      prefix: props.prefix,
    };
    return managers.flatMap((mgr) => {
      const cmd = buildCommand(mgr, type, options);
      return cmd === undefined
        ? []
        : [{ mgr, cmd, tabId: `${id()}-tab-${mgr}`, panelId: `${id()}-panel-${mgr}` }];
    });
  });

  const [selected, setSelected] = createSignal<Manager>();
  const activeMgr = createMemo(() => {
    const list = tabs();
    return list.find((tab) => tab.mgr === selected())?.mgr ?? list[0]?.mgr;
  });

  const [copied, setCopied] = createSignal<Manager | null>(null);

  const onTabKeyDown = (event: KeyboardEvent, index: number) => {
    const list = tabs();
    const target = nextTabIndex(event.key, index, list.length);
    const next = target === undefined ? undefined : list[target];
    if (!next) return;
    event.preventDefault();
    setSelected(next.mgr);
    document.getElementById(next.tabId)?.focus();
  };

  const copyCommand = async (mgr: Manager, cmd: string) => {
    try {
      await navigator.clipboard.writeText(cmd);
      setCopied(mgr);
      setTimeout(() => {
        setCopied((current) => (current === mgr ? null : current));
      }, COPY_FEEDBACK_MS);
    } catch {
      setCopied(null);
    }
  };

  return (
    <Tag class={classes().root} data-slot="root" data-theme={theme()} {...rest}>
      <div class={classes().list} role="tablist" data-slot="list">
        <For each={tabs()}>
          {(tab, index) => (
            <RLButton
              type="button"
              role="tab"
              id={tab.tabId}
              aria-controls={tab.panelId}
              aria-selected={activeMgr() === tab.mgr ? "true" : "false"}
              tabindex={activeMgr() === tab.mgr ? 0 : -1}
              class={classes().trigger}
              data-slot="trigger"
              data-state={activeMgr() === tab.mgr ? "active" : "inactive"}
              data-value={tab.mgr}
              onClick={() => setSelected(tab.mgr)}
              onKeyDown={(event: KeyboardEvent) => onTabKeyDown(event, index())}
            >
              {tab.mgr}
            </RLButton>
          )}
        </For>
      </div>
      <For each={tabs()}>
        {(tab) => (
          <div
            id={tab.panelId}
            role="tabpanel"
            aria-labelledby={tab.tabId}
            hidden={activeMgr() === tab.mgr ? undefined : "until-found"}
            class={classes().content}
            data-slot="content"
            data-value={tab.mgr}
          >
            <Show when={activeMgr() === tab.mgr}>
              <pre class={classes().codeBlock} data-slot="code-block">
                <code>{tab.cmd}</code>
              </pre>
              <RLButton
                type="button"
                variant="ghost"
                color="neutral"
                size="sm"
                class={classes().copyButton}
                leadingIcon={copied() === tab.mgr ? "check" : "copy"}
                aria-label={uiT("package-managers.copy")}
                data-slot="copy-button"
                onClick={() => copyCommand(tab.mgr, tab.cmd)}
              >
                <Show when={copied() === tab.mgr} fallback={uiT("package-managers.copyButton")}>
                  {uiT("package-managers.copied")}
                </Show>
              </RLButton>
            </Show>
          </div>
        )}
      </For>
    </Tag>
  );
};
