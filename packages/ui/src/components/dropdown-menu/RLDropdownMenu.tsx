import type { RLDropdownMenuProps, DropdownMenuItem } from "./dropdown-menu.types";
import { RLDropdownMenuTheme } from "./dropdown-menu.theme";
import { createMemo, createSignal, onSettled, For, Show, type Component } from "solid-js";
import { Portal } from "@solidjs/web";
import { RLIcon } from "../icon/RLIcon";
import { RLButton } from "../button/RLButton";
import { RLImage } from "../image/RLImage";
import { RLLink } from "../link/RLLink";
import { createControllable } from "../../controllable";
import { renderSlot } from "../../slot";

const OMIT_KEYS = [
  "items",
  "label",
  "icon",
  "hasArrow",
  "body",
  "disabled",
  "open",
  "defaultOpen",
  "onOpenChange",
  "aria-label",
  "aria-labelledby",
  "aria-describedby",
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
  let triggerBtn: HTMLElement | undefined;

  const updatePosition = () => {
    if (!triggerBtn) return;
    const rect = triggerBtn.getBoundingClientRect();
    const align = props.body?.align || "start";
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

  const itemClass = (item: DropdownMenuItem) =>
    item.color ? `${classes().item} rl-color-${item.color}` : classes().item;

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
      <RLButton
        ref={(el) => {
          triggerBtn = el;
        }}
        type="button"
        variant="outline"
        color="neutral"
        disabled={props.disabled}
        aria-haspopup="menu"
        aria-expanded={isOpen() ? "true" : "false"}
        aria-label={props["aria-label"]}
        aria-labelledby={props["aria-labelledby"]}
        aria-describedby={props["aria-describedby"]}
        onClick={(e: MouseEvent) => {
          e.stopPropagation();
          const next = !isOpen();
          if (next) updatePosition();
          setOpen(next);
        }}
        class={classes().trigger}
        data-slot="trigger"
        data-icon-only={
          !props.label && slots.triggerSlot() === undefined && children() === undefined
            ? ""
            : undefined
        }
      >
        <Show
          when={slots.triggerSlot() !== undefined || children() !== undefined}
          fallback={
            <>
              <Show when={props.icon}>
                {(icon) => <RLIcon name={icon()} size="sm" class={classes().triggerIcon} />}
              </Show>
              <Show when={props.label}>{(label) => <span>{label()}</span>}</Show>
              <Show when={!props.icon && !props.label}>
                <RLIcon name="ellipsis-vertical" size="sm" class={classes().triggerIcon} />
              </Show>
            </>
          }
        >
          <Show when={slots.triggerSlot()} fallback={children()}>
            {(trigger) => renderSlot(trigger())}
          </Show>
        </Show>
      </RLButton>

      <Show when={isOpen()}>
        <Portal>
          <div
            ref={(el) => {
              menuContentRef = el;
            }}
            class={classes().body}
            style={{
              "--rl-dd-top": `${coords().top}px`,
              "--rl-dd-left": coords().left !== undefined ? `${coords().left}px` : undefined,
              "--rl-dd-right": coords().right !== undefined ? `${coords().right}px` : undefined,
            }}
            data-slot="body"
            role="menu"
          >
            <Show when={props.hasArrow}>
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

                        const renderLeadingContent = () => {
                          if (item.avatar) {
                            return (
                              <RLImage
                                src={item.avatar.src}
                                alt={item.avatar.alt || item.label || ""}
                                lightbox={false}
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
                            <RLLink
                              href={item.href}
                              target={item.target}
                              localize={false}
                              class={itemClass(item)}
                              data-slot="item"
                              data-color={item.color}
                              role="menuitem"
                              onClick={(e) => {
                                setOpen(false);
                                item.onSelect?.(e);
                              }}
                            >
                              {renderLeadingContent()}
                              <span class={classes().itemLabel}>{item.label}</span>
                              {renderTrailingContent()}
                            </RLLink>
                          );
                        }

                        if (item.type === "checkbox") {
                          const isChecked = () => !!item.checked;
                          return (
                            <RLButton
                              type="button"
                              variant="ghost"
                              color="neutral"
                              disabled={item.disabled}
                              class={itemClass(item)}
                              data-slot="item"
                              data-color={item.color}
                              role="menuitemcheckbox"
                              aria-checked={isChecked() ? "true" : "false"}
                              onClick={(e: MouseEvent) => {
                                const next = !isChecked();
                                item.onCheckedChange?.(next);
                                item.onSelect?.(e);
                              }}
                            >
                              <span class={classes().itemIndicator}>
                                <Show when={isChecked()}>
                                  <RLIcon
                                    name="check"
                                    size="xs"
                                    class={classes().itemIndicatorIcon}
                                  />
                                </Show>
                              </span>
                              {renderLeadingContent()}
                              <span class={classes().itemLabel}>{item.label}</span>
                              {renderTrailingContent()}
                            </RLButton>
                          );
                        }

                        return (
                          <RLButton
                            type="button"
                            variant="ghost"
                            color="neutral"
                            disabled={item.disabled}
                            class={itemClass(item)}
                            data-slot="item"
                            data-color={item.color}
                            role="menuitem"
                            onClick={(e: MouseEvent) => {
                              setOpen(false);
                              item.onSelect?.(e);
                            }}
                          >
                            {renderLeadingContent()}
                            <span class={classes().itemLabel}>{item.label}</span>
                            {renderTrailingContent()}
                          </RLButton>
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
