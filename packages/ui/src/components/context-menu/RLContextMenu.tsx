import {
  createEffect,
  createMemo,
  createSignal,
  For,
  onSettled,
  Show,
  type Component,
} from "solid-js";
import { Portal, type JSX } from "@solidjs/web";
import { createControllable } from "../../controllable";
import { renderSlot } from "../../slot";
import { RLIcon } from "../icon/RLIcon";
import { RLContextMenuTheme } from "./context-menu.theme";
import type {
  ContextMenuActionItem,
  ContextMenuCheckboxItem,
  ContextMenuCoords,
  ContextMenuGroupItem,
  ContextMenuItem,
  ContextMenuItemRenderArgs,
  ContextMenuItems,
  ContextMenuLayerProps,
  ContextMenuRadioItem,
  ContextMenuSection,
  RLContextMenuProps,
} from "./context-menu.types";

const OMIT_KEYS = [
  "align",
  "defaultOpen",
  "open",
  "onOpenChange",
  "disabled",
  "gutter",
  "id",
  "overflowPadding",
  "placement",
  "preventScroll",
  "shift",
  "size",
  "items",
  "checkedIcon",
  "submenuIcon",
  "portal",
  "unmountOnHide",
  "longPressDelay",
  "aria-label",
  "aria-labelledby",
  "aria-describedby",
] as const;

function normalizeMenuSections(items: ContextMenuItems | undefined): ContextMenuSection[] {
  if (!items || items.length === 0) return [];

  if (Array.isArray(items[0])) {
    const sections: ContextMenuSection[] = [];
    const groups = items as ContextMenuItem[][];
    for (let i = 0; i < groups.length; i++) {
      const groupItems = groups[i];
      if (!groupItems || groupItems.length === 0) continue;
      if (sections.length > 0) {
        sections.push({ type: "separator" });
      }
      sections.push({
        type: "group",
        items: groupItems,
      });
    }
    return sections;
  }

  const flat = items as ContextMenuItem[];
  const sections: ContextMenuSection[] = [];
  let currentUngrouped: ContextMenuItem[] = [];

  const flushUngrouped = () => {
    if (currentUngrouped.length > 0) {
      sections.push({
        type: "group",
        items: [...currentUngrouped],
      });
      currentUngrouped = [];
    }
  };

  for (let i = 0; i < flat.length; i++) {
    const it = flat[i];
    if (!it) continue;
    if (it.type === "separator") {
      flushUngrouped();
      sections.push({ type: "separator" });
    } else if (it.type === "group") {
      flushUngrouped();
      const grp = it as ContextMenuGroupItem;
      sections.push({
        type: "group",
        label: grp.label,
        items: grp.items ?? [],
      });
    } else {
      currentUngrouped.push(it);
    }
  }

  flushUngrouped();
  return sections;
}

/**
 * Recursive submenu layer component
 */
const MenuLayer: Component<ContextMenuLayerProps> = (props) => {
  const [highlightedIndex, setHighlightedIndex] = createSignal<number>(-1);
  const [openSubmenuIndex, setOpenSubmenuIndex] = createSignal<number | null>(null);
  const [uncontrolledChecked, setUncontrolledChecked] = createSignal<Record<number, boolean>>({});
  const [uncontrolledRadioGroups, setUncontrolledRadioGroups] = createSignal<
    Record<string, string>
  >({});

  const flatItems = createMemo(() => {
    const list: Array<{ item: ContextMenuItem; flatIndex: number }> = [];
    let counter = 0;
    for (const section of props.sections) {
      if (section.type === "group" && section.items) {
        for (const item of section.items) {
          list.push({ item, flatIndex: counter });
          counter++;
        }
      }
    }
    return list;
  });

  const itemEls = new Map<number, HTMLElement>();

  const moveHighlight = (step: number) => {
    const items = flatItems();
    if (items.length === 0) return;
    const current = highlightedIndex();
    let next = current;
    for (let attempts = 0; attempts < items.length; attempts++) {
      next = (next + step + items.length) % items.length;
      const candidate = items[next];
      if (candidate && !candidate.item.disabled && candidate.item.type !== "separator") {
        setHighlightedIndex(candidate.flatIndex);
        itemEls.get(candidate.flatIndex)?.focus();
        return;
      }
    }
  };

  const hasSubmenu = (item: ContextMenuItem): boolean => {
    if (item.type && item.type !== "item") return false;
    const act = item as ContextMenuActionItem;
    return Array.isArray(act.children) && act.children.length > 0;
  };

  const isSubmenuOpenFor = (item: ContextMenuItem, flatIdx: number): boolean => {
    if (!hasSubmenu(item)) return false;
    const act = item as ContextMenuActionItem;
    if (act.open !== undefined) return Boolean(act.open);
    return openSubmenuIndex() === flatIdx;
  };

  const setSubmenuOpenFor = (item: ContextMenuItem, flatIdx: number, nextOpen: boolean) => {
    if (!hasSubmenu(item)) return;
    const act = item as ContextMenuActionItem;
    if (act.open === undefined) {
      setOpenSubmenuIndex(
        nextOpen ? flatIdx : openSubmenuIndex() === flatIdx ? null : openSubmenuIndex(),
      );
    }
    act.onOpenChange?.(nextOpen);
  };

  const isItemChecked = (item: ContextMenuItem, flatIdx: number): boolean => {
    if (item.type === "checkbox") {
      const cb = item as ContextMenuCheckboxItem;
      if (cb.checked !== undefined) return Boolean(cb.checked);
      const map = uncontrolledChecked();
      if (flatIdx in map) return Boolean(map[flatIdx]);
      return Boolean(cb.defaultChecked);
    }
    if (item.type === "radio") {
      const rd = item as ContextMenuRadioItem;
      if (rd.checked !== undefined) return Boolean(rd.checked);
      const grp = rd.group ?? "__default__";
      const map = uncontrolledRadioGroups();
      if (grp in map && rd.value !== undefined) {
        return map[grp] === rd.value;
      }
      return Boolean(rd.defaultChecked);
    }
    return false;
  };

  const activateItem = (item: ContextMenuItem, flatIdx: number, e?: Event) => {
    if (item.disabled || item.type === "separator" || item.type === "group") return;

    if (hasSubmenu(item)) {
      setSubmenuOpenFor(item, flatIdx, true);
      setHighlightedIndex(flatIdx);
      return;
    }

    if (item.type === "checkbox") {
      const cb = item;
      const next = !isItemChecked(cb, flatIdx);
      if (cb.checked === undefined) {
        setUncontrolledChecked((prev) => ({ ...prev, [flatIdx]: next }));
      }
      cb.onCheckedChange?.(next);
      cb.onSelect?.(e);
      props.closeRoot();
      return;
    }

    if (item.type === "radio") {
      const rd = item;
      const grp = rd.group ?? "__default__";
      const val = rd.value ?? "";
      if (rd.checked === undefined) {
        setUncontrolledRadioGroups((prev) => ({ ...prev, [grp]: val }));
      }
      rd.onValueChange?.(val);
      rd.onCheckedChange?.(true);
      rd.onSelect?.(e);
      props.closeRoot();
      return;
    }

    item.onSelect?.(e);
    props.closeRoot();
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      e.stopPropagation();
      moveHighlight(1);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      e.stopPropagation();
      moveHighlight(-1);
    } else if (e.key === "ArrowRight") {
      const currentIdx = highlightedIndex();
      const entry = flatItems().find((it) => it.flatIndex === currentIdx);
      if (entry && hasSubmenu(entry.item) && !entry.item.disabled) {
        e.preventDefault();
        e.stopPropagation();
        setSubmenuOpenFor(entry.item, currentIdx, true);
      }
    } else if (e.key === "ArrowLeft") {
      if (props.isSubmenu && props.closeLayer) {
        e.preventDefault();
        e.stopPropagation();
        props.closeLayer();
      }
    } else if (e.key === "Enter" || e.key === " ") {
      const currentIdx = highlightedIndex();
      const entry = flatItems().find((it) => it.flatIndex === currentIdx);
      if (entry && !entry.item.disabled) {
        e.preventDefault();
        e.stopPropagation();
        activateItem(entry.item, currentIdx, e);
      }
    } else if (e.key === "Escape") {
      e.preventDefault();
      e.stopPropagation();
      if (props.isSubmenu && props.closeLayer) {
        props.closeLayer();
      } else {
        props.closeRoot();
      }
    }
  };

  const renderItem = (item: ContextMenuItem, flatIdx: number) => {
    if (item.type === "separator") {
      return <div role="separator" data-slot="separator" class={props.menuClasses().separator} />;
    }

    const isDisabled = () => Boolean(item.disabled);
    const isDanger = () => item.color === "error";
    const isHighlighted = () => highlightedIndex() === flatIdx;
    const isSelected = () => isItemChecked(item, flatIdx);
    const isSubmenu = () => hasSubmenu(item);
    const isSubOpen = () => isSubmenuOpenFor(item, flatIdx);
    const isCheckable = () => item.type === "checkbox" || item.type === "radio";

    const itemSlot = props.renderItem;
    if (itemSlot) {
      const args: ContextMenuItemRenderArgs = {
        item,
        index: flatIdx,
        disabled: isDisabled(),
        highlighted: isHighlighted(),
        selected: isSelected(),
        expanded: isSubOpen(),
        closeMenu: props.closeRoot,
      };
      return itemSlot(args);
    }

    const role = () => {
      if (item.type === "checkbox") return "menuitemcheckbox";
      if (item.type === "radio") return "menuitemradio";
      return "menuitem";
    };

    const leadingIcon = (): JSX.Element | string | undefined => item.iconSlot ?? item.icon;

    const renderLeadingIcon = (): JSX.Element => {
      const leading = leadingIcon();
      if (typeof leading === "string") {
        return (
          <RLIcon
            name={leading}
            class={props.menuClasses().itemLeadingIcon}
            data-slot="item-leading-icon"
          />
        );
      }
      return leading;
    };

    return (
      <div class={props.menuClasses().itemContainer}>
        <div
          ref={(el) => {
            itemEls.set(flatIdx, el);
          }}
          role={role()}
          tabindex={isDisabled() ? -1 : 0}
          aria-disabled={isDisabled() ? "true" : undefined}
          aria-checked={isCheckable() ? (isSelected() ? "true" : "false") : undefined}
          aria-haspopup={isSubmenu() ? "menu" : undefined}
          aria-expanded={isSubmenu() ? (isSubOpen() ? "true" : "false") : undefined}
          data-slot="item"
          data-disabled={isDisabled() ? "" : undefined}
          data-highlighted={isHighlighted() ? "" : undefined}
          data-danger={isDanger() ? "" : undefined}
          class={props.menuClasses().item}
          onClick={(e) => {
            e.stopPropagation();
            activateItem(item, flatIdx, e);
          }}
          onMouseEnter={() => {
            if (!isDisabled()) {
              setHighlightedIndex(flatIdx);
              if (isSubmenu()) {
                setSubmenuOpenFor(item, flatIdx, true);
              }
            }
          }}
          onMouseLeave={() => {
            if (isSubmenu() && !isSubOpen()) {
              setSubmenuOpenFor(item, flatIdx, false);
            }
          }}
        >
          {/* Leading Icon / Check Indicator */}
          <Show when={leadingIcon() || isCheckable()}>
            <span class={props.menuClasses().itemLeading} data-slot="item-leading">
              <Show
                when={leadingIcon()}
                fallback={
                  <Show when={isSelected()}>
                    <RLIcon
                      name={props.checkedIcon()}
                      class={props.menuClasses().itemIndicator}
                      data-slot="item-indicator"
                    />
                  </Show>
                }
              >
                {renderLeadingIcon()}
              </Show>
            </span>
          </Show>

          {/* Label + Description wrapper */}
          <div class={props.menuClasses().itemWrapper} data-slot="item-wrapper">
            <Show when={item.label}>
              <span class={props.menuClasses().itemLabel} data-slot="item-label">
                {item.label}
              </span>
            </Show>
            <Show when={item.description}>
              <span class={props.menuClasses().itemDescription} data-slot="item-description">
                {item.description}
              </span>
            </Show>
          </div>

          {/* Trailing: Kbds + Submenu indicator */}
          <Show when={(item.kbds && item.kbds.length > 0) || isSubmenu()}>
            <span class={props.menuClasses().itemTrailing} data-slot="item-trailing">
              <Show when={item.kbds && item.kbds.length > 0}>
                <span class={props.menuClasses().itemKbds} data-slot="item-kbds">
                  <For each={item.kbds}>
                    {(kbd) => (
                      <kbd class={props.menuClasses().itemKbd} data-slot="item-kbd">
                        {kbd}
                      </kbd>
                    )}
                  </For>
                </span>
              </Show>

              <Show when={isSubmenu()}>
                <RLIcon
                  name={props.submenuIcon()}
                  class={props.menuClasses().itemSubIndicator}
                  data-slot="item-sub-indicator"
                />
              </Show>
            </span>
          </Show>
        </div>

        {/* Submenu Floating Layer */}
        <Show when={isSubmenu() && isSubOpen()}>
          <div
            class={props.menuClasses().submenu}
            data-slot="submenu"
            onClick={(e) => e.stopPropagation()}
          >
            <div class={props.menuClasses().body} data-slot="body" role="menu" tabindex={-1}>
              <MenuLayer
                sections={normalizeMenuSections((item as ContextMenuActionItem).children)}
                menuClasses={props.menuClasses}
                checkedIcon={props.checkedIcon}
                submenuIcon={props.submenuIcon}
                renderItem={props.renderItem}
                isSubmenu={true}
                closeLayer={() => setSubmenuOpenFor(item, flatIdx, false)}
                closeRoot={props.closeRoot}
              />
            </div>
          </div>
        </Show>
      </div>
    );
  };

  return (
    <div class={props.menuClasses().sections} onKeyDown={handleKeyDown}>
      <For each={props.sections}>
        {(section) => (
          <Show
            when={section.type === "group"}
            fallback={
              <div role="separator" data-slot="separator" class={props.menuClasses().separator} />
            }
          >
            <div role="group" data-slot="group" class={props.menuClasses().group}>
              <Show when={section.label}>
                <div data-slot="group-label" class={props.menuClasses().groupLabel}>
                  {section.label}
                </div>
              </Show>
              <For each={section.items}>
                {(item) => {
                  const entry = flatItems().find((it) => it.item === item);
                  return renderItem(item, entry?.flatIndex ?? 0);
                }}
              </For>
            </div>
          </Show>
        )}
      </For>
    </div>
  );
};

export const RLContextMenu: Component<RLContextMenuProps> = (props) => {
  const {
    Tag,
    classes,
    id: menuId,
    rest,
    slots,
    children,
    theme,
  } = RLContextMenuTheme.setup(props, {
    omit: OMIT_KEYS,
    slots: ["topSlot", "bottomSlot", "itemSlot", "triggerSlot", "bodySlot"] as const,
    variants: () => ({
      size: props.size ?? "md",
    }),
  });

  const [isOpen, setOpen] = createControllable(
    () => props.open,
    props.defaultOpen ?? false,
    props.onOpenChange,
  );

  const [coords, setCoords] = createSignal<ContextMenuCoords>({ x: 0, y: 0 });

  const align = () => props.align ?? "start";
  const placement = () => props.placement ?? "right";
  const gutter = () => props.gutter ?? 0;
  const shift = () => props.shift ?? 0;
  const overflowPadding = () => props.overflowPadding ?? 4;
  const preventScroll = () => props.preventScroll !== false;
  const disabled = () => Boolean(props.disabled);
  const usePortal = () => props.portal !== false;
  const unmountOnHide = () => props.unmountOnHide !== false;
  const longPressDelay = () => props.longPressDelay ?? 700;
  const checkedIcon = () => props.checkedIcon ?? "check";
  const submenuIcon = () => props.submenuIcon ?? "chevron-right";

  const portalMount = () => (typeof props.portal === "object" ? props.portal : undefined);

  let triggerRef: HTMLElement | undefined;
  let contentRef: HTMLElement | undefined;

  const setOpenState = (next: boolean, nextCoords?: ContextMenuCoords) => {
    if (disabled() && next) return;
    if (nextCoords) {
      setCoords(nextCoords);
    }
    setOpen(next);
  };

  const closeMenu = () => setOpenState(false);

  // Prevent scroll when open
  createEffect(
    () => ({ open: isOpen(), lock: preventScroll() }),
    (state) => {
      if (typeof document !== "undefined") {
        document.body.style.overflow = state.open && state.lock ? "hidden" : "";
      }
      return () => {
        if (typeof document !== "undefined") {
          document.body.style.overflow = "";
        }
      };
    },
  );

  // Outside click & window resize dismissal
  onSettled(() => {
    const handleDocClick = (e: MouseEvent) => {
      if (!isOpen()) return;
      if (contentRef && !contentRef.contains(e.target as Node)) {
        closeMenu();
      }
    };

    const handleWindowResize = () => {
      if (isOpen()) closeMenu();
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen()) {
        e.preventDefault();
        closeMenu();
      }
    };

    document.addEventListener("click", handleDocClick, true);
    window.addEventListener("resize", handleWindowResize);
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("click", handleDocClick, true);
      window.removeEventListener("resize", handleWindowResize);
      window.removeEventListener("keydown", handleKeyDown);
    };
  });

  const clampPosition = (x: number, y: number) => {
    if (typeof window === "undefined") return { x, y };
    const pad = overflowPadding();
    const g = gutter();
    const s = shift();

    let targetX = x + (placement() === "right" ? g : placement() === "left" ? -g : s);
    let targetY = y + (placement() === "bottom" ? g : placement() === "top" ? -g : s);

    const winW = window.innerWidth;
    const winH = window.innerHeight;
    const menuW = contentRef?.offsetWidth ?? 200;
    const menuH = contentRef?.offsetHeight ?? 200;

    if (align() === "center") {
      targetY -= menuH / 2;
    } else if (align() === "end") {
      targetY -= menuH;
    }

    if (targetX + menuW > winW - pad) {
      targetX = Math.max(pad, winW - pad - menuW);
    }
    if (targetX < pad) {
      targetX = pad;
    }

    if (targetY + menuH > winH - pad) {
      targetY = Math.max(pad, winH - pad - menuH);
    }
    if (targetY < pad) {
      targetY = pad;
    }

    return { x: targetX, y: targetY };
  };

  const handleContextMenu = (e: MouseEvent) => {
    if (disabled()) return;
    e.preventDefault();
    e.stopPropagation();
    const clamped = clampPosition(e.clientX, e.clientY);
    setOpenState(true, clamped);
  };

  const handleTriggerKeyDown = (e: KeyboardEvent) => {
    if (disabled()) return;
    if (e.key === "ContextMenu" || (e.shiftKey && e.key === "F10")) {
      e.preventDefault();
      e.stopPropagation();
      if (triggerRef) {
        const rect = triggerRef.getBoundingClientRect();
        const clamped = clampPosition(rect.left + rect.width / 2, rect.top + rect.height / 2);
        setOpenState(true, clamped);
      } else {
        setOpenState(true, clampPosition(window.innerWidth / 2, window.innerHeight / 2));
      }
    }
  };

  // Long press touch handling
  let longPressTimer: number | undefined;
  let touchStartPos: { x: number; y: number } | null = null;

  const handleTouchStart = (e: TouchEvent) => {
    if (disabled()) return;
    const touch = e.touches[0];
    if (!touch) return;
    touchStartPos = { x: touch.clientX, y: touch.clientY };

    longPressTimer = window.setTimeout(() => {
      if (touchStartPos) {
        const clamped = clampPosition(touchStartPos.x, touchStartPos.y);
        setOpenState(true, clamped);
      }
    }, longPressDelay());
  };

  const handleTouchMove = (e: TouchEvent) => {
    if (!touchStartPos) return;
    const touch = e.touches[0];
    if (!touch) return;
    const dist = Math.hypot(touch.clientX - touchStartPos.x, touch.clientY - touchStartPos.y);
    if (dist > 10 && longPressTimer) {
      window.clearTimeout(longPressTimer);
      longPressTimer = undefined;
    }
  };

  const handleTouchEnd = () => {
    window.clearTimeout(longPressTimer);
    longPressTimer = undefined;
    touchStartPos = null;
  };

  const sections = createMemo(() => normalizeMenuSections(props.items));

  const renderMenuContent = () => (
    <>
      {/* Backdrop overlay */}
      <div
        class={classes().overlay}
        data-slot="overlay"
        data-state={isOpen() ? "open" : "closed"}
        onClick={closeMenu}
        onContextMenu={(e) => {
          e.preventDefault();
          closeMenu();
        }}
      />

      {/* Positioner */}
      <div
        class={classes().positioner}
        data-slot="positioner"
        data-side={placement()}
        data-align={align()}
        style={{
          "--rl-menu-x": `${coords().x}px`,
          "--rl-menu-y": `${coords().y}px`,
        }}
      >
        <div
          ref={(el) => (contentRef = el)}
          role="menu"
          tabindex={-1}
          aria-orientation="vertical"
          data-slot="body"
          data-state={isOpen() ? "open" : "closed"}
          data-side={placement()}
          data-align={align()}
          class={classes().body}
          onClick={(e) => e.stopPropagation()}
        >
          {renderSlot(slots.topSlot(), { open: isOpen(), closeMenu })}

          <Show when={sections().length > 0}>
            <MenuLayer
              sections={sections()}
              menuClasses={classes}
              checkedIcon={checkedIcon}
              submenuIcon={submenuIcon}
              renderItem={slots.itemSlot()}
              closeRoot={closeMenu}
            />
          </Show>

          {renderSlot(slots.bottomSlot(), { open: isOpen(), closeMenu })}

          {renderSlot(slots.bodySlot())}
        </div>
      </div>
    </>
  );

  return (
    <Tag data-slot="root" data-theme={theme()} class={classes().root} {...rest}>
      <div
        ref={(el: HTMLElement) => (triggerRef = el)}
        id={menuId()}
        class={classes().trigger}
        data-slot="trigger"
        data-state={isOpen() ? "open" : "closed"}
        data-disabled={disabled() ? "" : undefined}
        aria-haspopup="menu"
        aria-expanded={isOpen() ? "true" : "false"}
        aria-label={props["aria-label"]}
        aria-labelledby={props["aria-labelledby"]}
        aria-describedby={props["aria-describedby"]}
        tabindex={disabled() ? undefined : 0}
        onContextMenu={handleContextMenu}
        onKeyDown={handleTriggerKeyDown}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onTouchCancel={handleTouchEnd}
      >
        <Show when={slots.triggerSlot()} fallback={children()}>
          {renderSlot(slots.triggerSlot())}
        </Show>
      </div>

      <Show when={isOpen() || !unmountOnHide()}>
        <Show when={usePortal()} fallback={renderMenuContent()}>
          <Show when={portalMount()} fallback={<Portal>{renderMenuContent()}</Portal>}>
            {(mount) => <Portal mount={mount()}>{renderMenuContent()}</Portal>}
          </Show>
        </Show>
      </Show>
    </Tag>
  );
};
