import type { RLDropdownMenuProps, DropdownMenuItem } from "./dropdown-menu.types";
import { RLDropdownMenuTheme } from "./dropdown-menu.theme";
import { createMemo, createSignal, onSettled, For, Show, type Component } from "solid-js";
import { Portal } from "@solidjs/web";
import { RLIcon } from "../icon/RLIcon";
import { createControllable } from "../../controllable";

const OMIT_KEYS = [
  "items",
  "label",
  "icon",
  "color",
  "arrow",
  "content",
  "disabled",
  "open",
  "defaultOpen",
  "onOpenChange",
] as const;

export const RLDropdownMenu: Component<RLDropdownMenuProps> = (props) => {
  const { Tag, classes, rest, slots, children, theme } = RLDropdownMenuTheme.setup(props, {
    omit: OMIT_KEYS,
    slots: ["triggerSlot"] as const,
  });

  const [isOpen, setOpen] = createControllable(
    () => props.open,
    props.defaultOpen ?? false,
    props.onOpenChange,
  );
  const [coords, setCoords] = createSignal<{
    top: number;
    left?: number | undefined;
    right?: number | undefined;
  }>({
    top: 0,
  });
  let menuContainer: HTMLDivElement | undefined;
  let menuContentRef: HTMLDivElement | undefined;
  let triggerBtn: HTMLButtonElement | undefined;

  const updatePosition = () => {
    if (!triggerBtn) return;
    const rect = triggerBtn.getBoundingClientRect();
    const align = props.content?.align || "start";
    const top = rect.bottom + 4;
    if (align === "end") {
      const right = Math.max(0, window.innerWidth - rect.right);
      setCoords({ top, right, left: undefined });
    } else if (align === "center") {
      const left = rect.left + rect.width / 2;
      setCoords({ top, left, right: undefined });
    } else {
      setCoords({ top, left: rect.left, right: undefined });
    }
  };

  onSettled(() => {
    if (typeof window === "undefined" || typeof document === "undefined") return;
    const handleOutsideClick = (e: MouseEvent) => {
      const target = e.target as Node;
      if (
        isOpen() &&
        menuContainer &&
        !menuContainer.contains(target) &&
        (!menuContentRef || !menuContentRef.contains(target))
      ) {
        setOpen(false);
      }
    };
    const handleScroll = () => {
      if (isOpen()) updatePosition();
    };
    document.addEventListener("click", handleOutsideClick);
    window.addEventListener("scroll", handleScroll, true);
    window.addEventListener("resize", handleScroll);
    return () => {
      document.removeEventListener("click", handleOutsideClick);
      window.removeEventListener("scroll", handleScroll, true);
      window.removeEventListener("resize", handleScroll);
    };
  });

  const itemGroups = createMemo<DropdownMenuItem[][]>(() => {
    if (!props.items) return [];
    if (props.items.length > 0 && Array.isArray(props.items[0])) {
      return props.items as DropdownMenuItem[][];
    }
    return [props.items as DropdownMenuItem[]];
  });

  const triggerElement = () => slots.triggerSlot() || children();

  return (
    <Tag
      ref={(el: HTMLDivElement) => {
        menuContainer = el;
      }}
      data-slot="root"
      data-theme={theme()}
      class={classes().root}
      {...rest}
    >
      <button
        ref={(el) => {
          triggerBtn = el;
        }}
        type="button"
        disabled={props.disabled}
        onClick={(e) => {
          e.stopPropagation();
          const next = !isOpen();
          if (next) updatePosition();
          setOpen(next);
        }}
        class={`${classes().trigger} ${!props.label && !triggerElement() ? "aspect-square !px-1.5 !py-1.5 inline-flex items-center justify-center shrink-0" : ""}`}
        data-slot="trigger"
      >
        <Show
          when={triggerElement()}
          fallback={
            <Show
              when={props.icon}
              fallback={
                <Show
                  when={props.label}
                  fallback={<span class="i-lucide-ellipsis-vertical size-4" />}
                >
                  <span>{props.label}</span>
                </Show>
              }
            >
              <RLIcon name={props.icon!} size="sm" class="shrink-0" />
              <Show when={props.label}>
                <span>{props.label}</span>
              </Show>
            </Show>
          }
        >
          {triggerElement()}
        </Show>
      </button>

      <Show when={isOpen()}>
        <Portal>
          <div
            ref={(el) => {
              menuContentRef = el;
            }}
            class={classes().content}
            style={{
              "--rl-dd-top": `${coords().top}px`,
              "--rl-dd-left": coords().left !== undefined ? `${coords().left}px` : undefined,
              "--rl-dd-right": coords().right !== undefined ? `${coords().right}px` : undefined,
            }}
            data-slot="content"
            role="menu"
          >
            <Show when={props.arrow}>
              <div class={classes().arrow} />
            </Show>
            <div class={classes().viewport}>
              <For each={itemGroups()}>
                {(group, groupIdx) => (
                  <div class={classes().group}>
                    <Show when={groupIdx() > 0}>
                      <div class={classes().separator} />
                    </Show>
                    <For each={group}>
                      {(item) => {
                        if (item.type === "separator") {
                          return <div class={classes().separator} />;
                        }
                        if (item.type === "label") {
                          return <div class={classes().label}>{item.label}</div>;
                        }

                        const itemColor = () =>
                          item.color === "error"
                            ? "text-destructive hover:bg-destructive/10"
                            : item.color === "primary"
                              ? "text-primary hover:bg-primary/10"
                              : "";

                        const renderLeadingContent = () => {
                          if (item.avatar) {
                            return (
                              <img
                                src={item.avatar.src}
                                alt={item.avatar.alt || item.label || ""}
                                class={classes().itemLeadingAvatar}
                              />
                            );
                          }
                          if (item.icon) {
                            return (
                              <RLIcon
                                name={item.icon}
                                size="sm"
                                class={classes().itemLeadingIcon}
                              />
                            );
                          }
                          return null;
                        };

                        const renderTrailingContent = () => {
                          if (!item.shortcut && (!item.kbds || item.kbds.length === 0)) return null;
                          return (
                            <span class={classes().itemTrailing}>
                              <Show when={item.shortcut}>
                                {(shortcut) => <span class={classes().shortcut}>{shortcut()}</span>}
                              </Show>
                              <Show when={item.kbds && item.kbds.length > 0}>
                                <For each={item.kbds}>
                                  {(kbd) => <kbd class={classes().itemTrailingKbds}>{kbd}</kbd>}
                                </For>
                              </Show>
                            </span>
                          );
                        };

                        if (item.href) {
                          return (
                            <a
                              href={item.href}
                              target={item.target}
                              class={`${classes().item} ${itemColor()}`}
                              data-slot="item"
                              role="menuitem"
                              onClick={(e) => {
                                setOpen(false);
                                item.onSelect?.(e);
                              }}
                            >
                              {renderLeadingContent()}
                              <span class={classes().itemLabel}>{item.label}</span>
                              {renderTrailingContent()}
                            </a>
                          );
                        }

                        if (item.type === "checkbox") {
                          const isChecked = () => !!item.checked;
                          return (
                            <button
                              type="button"
                              disabled={item.disabled}
                              class={`${classes().item} ${itemColor()}`}
                              data-slot="item"
                              role="menuitemcheckbox"
                              aria-checked={isChecked() ? "true" : "false"}
                              onClick={(e) => {
                                const next = !isChecked();
                                item.onCheckedChange?.(next);
                                item.onSelect?.(e);
                              }}
                            >
                              <span class="shrink-0 size-4 flex items-center justify-center border border-default rounded bg-default">
                                <Show when={isChecked()}>
                                  <RLIcon name="check" size="xs" class="text-primary" />
                                </Show>
                              </span>
                              {renderLeadingContent()}
                              <span class={classes().itemLabel}>{item.label}</span>
                              {renderTrailingContent()}
                            </button>
                          );
                        }

                        return (
                          <button
                            type="button"
                            disabled={item.disabled}
                            class={`${classes().item} ${itemColor()}`}
                            data-slot="item"
                            role="menuitem"
                            onClick={(e) => {
                              setOpen(false);
                              item.onSelect?.(e);
                            }}
                          >
                            {renderLeadingContent()}
                            <span class={classes().itemLabel}>{item.label}</span>
                            {renderTrailingContent()}
                          </button>
                        );
                      }}
                    </For>
                  </div>
                )}
              </For>
            </div>
          </div>
        </Portal>
      </Show>
    </Tag>
  );
};
