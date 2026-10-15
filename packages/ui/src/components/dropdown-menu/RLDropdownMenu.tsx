import type { RLDropdownMenuProps, DropdownMenuItem } from "./dropdown-menu.types";
import { RLDropdownMenuTheme } from "./dropdown-menu.theme";
import { createSignal, createMemo, omit, onSettled, For, Show, type Component } from "solid-js";
import { Portal } from "@solidjs/web";
import { RLIcon } from "../icon/RLIcon";

export const RLDropdownMenu: Component<RLDropdownMenuProps> = (allProps) => {
  const props = allProps;
  const rest = omit(
    allProps,
    "items",
    "label",
    "icon",
    "size",
    "color",
    "arrow",
    "content",
    "disabled",
    "ui",
    "class",
    "children",
    "trigger",
  );

  const [isOpen, setIsOpen] = createSignal(false);
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
        setIsOpen(false);
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

  const resolvedClasses = createMemo(() =>
    RLDropdownMenuTheme({
      size: props.size ?? "md",
      ui: props.ui,
      class: props.class,
    }),
  );

  const itemGroups = createMemo<DropdownMenuItem[][]>(() => {
    if (!props.items) return [];
    if (props.items.length > 0 && Array.isArray(props.items[0])) {
      return props.items as DropdownMenuItem[][];
    }
    return [props.items as DropdownMenuItem[]];
  });

  const triggerElement = () => props.trigger || (props as any)["slot:trigger"] || props.children;

  return (
    <div
      ref={(el) => {
        menuContainer = el;
      }}
      class={resolvedClasses().root}
      data-slot="root"
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
          setIsOpen(next);
        }}
        class={`${resolvedClasses().trigger} ${!props.label && !triggerElement() ? "aspect-square !px-1.5 !py-1.5 inline-flex items-center justify-center shrink-0" : ""}`}
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
            class={resolvedClasses().content}
            style={{
              position: "fixed",
              "z-index": "99999",
              top: `${coords().top}px`,
              ...(coords().right !== undefined
                ? { right: `${coords().right}px`, left: "auto" }
                : {}),
              ...(coords().left !== undefined ? { left: `${coords().left}px` } : {}),
            }}
            data-slot="content"
            role="menu"
          >
            <Show when={props.arrow}>
              <div class={resolvedClasses().arrow} />
            </Show>
            <div class={resolvedClasses().viewport}>
              <For each={itemGroups()}>
                {(group, groupIdx) => (
                  <div class={resolvedClasses().group}>
                    <Show when={groupIdx() > 0}>
                      <div class={resolvedClasses().separator} />
                    </Show>
                    <For each={group}>
                      {(item) => {
                        if (item.type === "separator") {
                          return <div class={resolvedClasses().separator} />;
                        }
                        if (item.type === "label") {
                          return <div class={resolvedClasses().label}>{item.label}</div>;
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
                                class={resolvedClasses().itemLeadingAvatar}
                              />
                            );
                          }
                          if (item.icon) {
                            return (
                              <RLIcon
                                name={item.icon}
                                size="sm"
                                class={resolvedClasses().itemLeadingIcon}
                              />
                            );
                          }
                          return null;
                        };

                        const renderTrailingContent = () => {
                          if (!item.shortcut && (!item.kbds || item.kbds.length === 0)) return null;
                          return (
                            <span class={resolvedClasses().itemTrailing}>
                              {item.shortcut && (
                                <span class={resolvedClasses().shortcut}>{item.shortcut}</span>
                              )}
                              {item.kbds && (
                                <For each={item.kbds}>
                                  {(kbd) => (
                                    <kbd class={resolvedClasses().itemTrailingKbds}>{kbd}</kbd>
                                  )}
                                </For>
                              )}
                            </span>
                          );
                        };

                        if (item.href) {
                          return (
                            <a
                              href={item.href}
                              target={item.target}
                              class={`${resolvedClasses().item} ${itemColor()} ${item.class || ""}`}
                              data-slot="item"
                              role="menuitem"
                              onClick={(e) => {
                                setIsOpen(false);
                                item.onSelect?.(e);
                              }}
                            >
                              {renderLeadingContent()}
                              <span class={resolvedClasses().itemLabel}>{item.label}</span>
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
                              class={`${resolvedClasses().item} ${itemColor()} ${item.class || ""}`}
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
                              <span class={resolvedClasses().itemLabel}>{item.label}</span>
                              {renderTrailingContent()}
                            </button>
                          );
                        }

                        return (
                          <button
                            type="button"
                            disabled={item.disabled}
                            class={`${resolvedClasses().item} ${itemColor()} ${item.class || ""}`}
                            data-slot="item"
                            role="menuitem"
                            onClick={(e) => {
                              setIsOpen(false);
                              item.onSelect?.(e);
                            }}
                          >
                            {renderLeadingContent()}
                            <span class={resolvedClasses().itemLabel}>{item.label}</span>
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
    </div>
  );
};
