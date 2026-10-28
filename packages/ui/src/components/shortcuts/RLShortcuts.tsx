import type { RLShortcutsProps, CategorySection } from "./shortcuts.types";
import { RLShortcutsTheme } from "./shortcuts.theme";
import { getUIConfig } from "../../runtime";
import {
  createEffect,
  createMemo,
  createSignal,
  For,
  onSettled,
  Show,
  type Component,
} from "solid-js";
import { Portal } from "@solidjs/web";
import {
  activeShortcutsStore,
  defineShortcuts,
  shortcutsModalOpen,
  setShortcutsModalOpen,
  type RegisteredShortcut,
} from "../../shortcuts";
import { RLIcon } from "../icon/RLIcon";
import { RLKbd } from "../kbd/RLKbd";
import { uiNodes, uiT } from "../../locale";

const OMIT_KEYS = ["categories", "open", "defaultOpen", "onOpenChange"] as const;

export const RLShortcuts: Component<RLShortcutsProps> = (props) => {
  const {
    Tag,
    classes,
    rest,
    id: modalId,
  } = RLShortcutsTheme.setup(props, {
    omit: OMIT_KEYS,
    idPrefix: "rl-shortcuts",
  });

  const [uncontrolledOpen, setUncontrolledOpen] = createSignal(props.defaultOpen ?? false);
  const isOpen = () => {
    if (props.open !== undefined) return Boolean(props.open);
    return uncontrolledOpen() || shortcutsModalOpen();
  };

  const setOpen = (next: boolean) => {
    if (props.open === undefined) {
      setUncontrolledOpen(next);
      setShortcutsModalOpen(next);
    }
    props.onOpenChange?.(next);
  };

  const handleClose = () => setOpen(false);
  const handleToggle = () => setOpen(!isOpen());

  const configCategories = (): Record<string, { label: string }> =>
    getUIConfig().shortcuts?.categories || {};

  const resolvedCategories = createMemo<Record<string, string>>(() => {
    const configKeys = Object.keys(configCategories());
    const allKeys = [...new Set([...configKeys, ...Object.keys(props.categories || {})])];
    const resolved: Record<string, string> = {};
    allKeys.forEach((key) => {
      resolved[key] = props.categories?.[key] || configCategories()[key]?.label || key;
    });
    return resolved;
  });

  const categoryOrder = createMemo(() => Object.keys(configCategories()));

  createEffect(
    () => isOpen(),
    (open) => {
      document.body.style.overflow = open ? "hidden" : "";
      return () => {
        document.body.style.overflow = "";
      };
    },
  );

  onSettled(() => {
    const qShortcutCleanup = defineShortcuts({
      "?": {
        handler: handleToggle,
        label: "Show Keyboard Shortcuts",
        description: "Display this shortcuts help cheat sheet modal",
        category: "system",
        order: 0,
      },
    });

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen()) {
        handleClose();
      }
    };
    window.addEventListener("keydown", onKeyDown);

    return () => {
      window.removeEventListener("keydown", onKeyDown);
      qShortcutCleanup();
    };
  });

  const sections = createMemo<CategorySection[]>(() => {
    const list = activeShortcutsStore;
    if (list.length === 0) return [];

    const grouped: Record<string, RegisteredShortcut[]> = {};
    list.forEach((shortcut) => {
      const cat = (shortcut.category || "system").toLowerCase();
      const arr = grouped[cat];
      if (arr) {
        arr.push(shortcut);
      } else {
        grouped[cat] = [shortcut];
      }
    });

    const sortedKeys = Object.keys(grouped).sort((keyA, keyB) => {
      const indexA = categoryOrder().indexOf(keyA);
      const indexB = categoryOrder().indexOf(keyB);

      if (indexA !== -1 && indexB !== -1) return indexA - indexB;
      if (indexA !== -1) return -1;
      if (indexB !== -1) return 1;

      const labelA = resolvedCategories()[keyA] || keyA;
      const labelB = resolvedCategories()[keyB] || keyB;
      return labelA.localeCompare(labelB);
    });

    return sortedKeys.map((key) => {
      const group = grouped[key] || [];
      group.sort((a, b) => {
        const orderA = a.order ?? -1;
        const orderB = b.order ?? -1;
        if (orderA !== orderB) return orderB - orderA;
        const labelA = a.label || a.id;
        const labelB = b.label || b.id;
        return labelA.localeCompare(labelB);
      });
      return { key, label: resolvedCategories()[key] || key, items: group };
    });
  });

  return (
    <Show when={isOpen()}>
      <Portal>
        <Tag
          class={classes().modal}
          data-slot="modal"
          onClick={(e: MouseEvent & { currentTarget: Element; target: Element }) => {
            if (e.target === e.currentTarget) handleClose();
          }}
          {...rest}
        >
          <div
            id={modalId()}
            class={classes().dialog}
            data-slot="dialog"
            role="dialog"
            aria-modal="true"
            aria-labelledby={`${modalId()}-title`}
          >
            <div class={classes().header} data-slot="header">
              <h3 id={`${modalId()}-title`} class={classes().title} data-slot="title">
                Keyboard Shortcuts
              </h3>
              <button
                type="button"
                class={classes().close}
                aria-label={uiT("shortcuts.close")}
                onClick={handleClose}
                data-slot="close"
              >
                <RLIcon name="x" class="size-4" />
              </button>
            </div>

            <div class={classes().body} data-slot="body">
              <Show
                when={activeShortcutsStore.length > 0}
                fallback={
                  <div class={classes().empty} data-slot="empty">
                    No active shortcuts found on this page.
                  </div>
                }
              >
                <For each={sections()}>
                  {(section) => (
                    <div class={classes().categorySection} data-slot="category-section">
                      <h4 class={classes().categoryTitle} data-slot="category-title">
                        {section.label}
                      </h4>
                      <div class={classes().grid} data-slot="grid">
                        <For each={section.items}>
                          {(shortcut) => (
                            <div class={classes().row} data-slot="row">
                              <div class={classes().info} data-slot="info">
                                <span class={classes().name} data-slot="name">
                                  {shortcut.label || shortcut.id}
                                </span>
                                <Show when={shortcut.description}>
                                  <span class={classes().desc} data-slot="desc">
                                    {shortcut.description}
                                  </span>
                                </Show>
                              </div>
                              <div class={classes().keys} data-slot="keys">
                                <For each={shortcut.keys}>
                                  {(key) => <RLKbd size="sm">{key}</RLKbd>}
                                </For>
                              </div>
                            </div>
                          )}
                        </For>
                      </div>
                    </div>
                  )}
                </For>
              </Show>
            </div>

            <div class={classes().footer} data-slot="footer">
              <span class="flex items-center gap-1">
                {uiNodes("shortcuts.press-to-close", {
                  question: <RLKbd size="sm">?</RLKbd>,
                  escape: <RLKbd size="sm">Esc</RLKbd>,
                })}
              </span>
            </div>
          </div>
        </Tag>
      </Portal>
    </Show>
  );
};
