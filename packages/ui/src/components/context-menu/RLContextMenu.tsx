import {
  createEffect,
  createMemo,
  createSignal,
  For,
  onCleanup,
  onSettled,
  Show,
  type Component,
} from "solid-js";
import { Portal, type JSX } from "@solidjs/web";
import { cx } from "../../resolver";
import { RLIcon } from "../icon/RLIcon";
import { RLContextMenuTheme } from "./context-menu.theme";
import type {
  ContextMenuActionItem,
  ContextMenuCheckboxItem,
  ContextMenuGroupItem,
  ContextMenuItem,
  ContextMenuItems,
  ContextMenuRadioItem,
  RLContextMenuProps,
  RLContextMenuSlot,
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
  "topRender",
  "topSlot",
  "bottomRender",
  "bottomSlot",
  "itemRender",
  "itemSlot",
  "trigger",
  "triggerSlot",
  "content",
  "contentSlot",
  "portal",
  "unmountOnHide",
  "longPressDelay",
  "classes",
  "styles",
  "style",
] as const;

interface AnchorCoords {
  x: number;
  y: number;
}

interface ResolvedMenuSection {
  type: "group" | "separator";
  label?: JSX.Element | undefined;
  items?: ContextMenuItem[] | undefined;
}

function normalizeMenuSections(items: ContextMenuItems | undefined): ResolvedMenuSection[] {
  if (!items || items.length === 0) return [];

  if (Array.isArray(items[0])) {
    const sections: ResolvedMenuSection[] = [];
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
  const sections: ResolvedMenuSection[] = [];
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
    } else if (
      it.type === "group" ||
      (!it.type && "items" in it && Array.isArray((it as unknown as ContextMenuGroupItem).items))
    ) {
      flushUngrouped();
      const grp = it as ContextMenuGroupItem;
      const grpItems = grp.items ?? grp.children ?? [];
      sections.push({
        type: "group",
        label: grp.label,
        items: grpItems,
      });
    } else {
      currentUngrouped.push(it);
    }
  }

  flushUngrouped();
  return sections;
}

function mergeStyle(
  base: JSX.CSSProperties | string | undefined,
  extra: JSX.CSSProperties | string | undefined,
): JSX.CSSProperties | string | undefined {
  if (!base) return extra;
  if (!extra) return base;
  if (typeof base === "string" && typeof extra === "string") {
    return `${base}; ${extra}`;
  }
  if (typeof base === "object" && typeof extra === "object") {
    return { ...base, ...extra };
  }
  return extra;
}

/**
 * Recursive submenu layer component
 */
interface MenuLayerProps {
  sections: ResolvedMenuSection[];
  classes: ReturnType<typeof RLContextMenuTheme.setup>["classes"];
  styles?: Partial<Record<RLContextMenuSlot, JSX.CSSProperties | string>> | undefined;
  checkedIcon: () => string;
  submenuIcon: () => string;
  itemRender?: RLContextMenuProps["itemRender"];
  isSubmenu?: boolean;
  closeLayer?: () => void;
  closeRoot: () => void;
}

const MenuLayer: Component<MenuLayerProps> = (props) => {
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
      return (
        <div
          role="separator"
          data-slot="separator"
          class={cx(props.classes().separator, item.class)}
          style={mergeStyle(props.styles?.separator, item.style)}
        />
      );
    }

    const isDisabled = () => Boolean(item.disabled);
    const isDanger = () => item.variant === "danger";
    const isHighlighted = () => highlightedIndex() === flatIdx;
    const isSelected = () => isItemChecked(item, flatIdx);
    const isSubmenu = () => hasSubmenu(item);
    const isSubOpen = () => isSubmenuOpenFor(item, flatIdx);

    if (props.itemRender) {
      return props.itemRender({
        item,
        index: flatIdx,
        disabled: isDisabled(),
        highlighted: isHighlighted(),
        selected: isSelected(),
        expanded: isSubOpen(),
        close: props.closeRoot,
      });
    }

    const role = () => {
      if (item.type === "checkbox") return "menuitemcheckbox";
      if (item.type === "radio") return "menuitemradio";
      return "menuitem";
    };

    const leadingIcon = () => item.icon ?? item.leading;

    return (
      <div class="relative w-full">
        <div
          ref={(el) => {
            itemEls.set(flatIdx, el);
          }}
          role={role() as any}
          tabindex={isDisabled() ? -1 : 0}
          aria-disabled={isDisabled() ? "true" : undefined}
          aria-checked={
            item.type === "checkbox" || item.type === "radio"
              ? isSelected()
                ? "true"
                : "false"
              : undefined
          }
          aria-haspopup={isSubmenu() ? "menu" : undefined}
          aria-expanded={isSubmenu() ? (isSubOpen() ? "true" : "false") : undefined}
          data-slot="item"
          data-disabled={isDisabled() ? "" : undefined}
          data-highlighted={isHighlighted() ? "" : undefined}
          data-selected={isSelected() ? "" : undefined}
          data-danger={isDanger() ? "" : undefined}
          data-expanded={isSubOpen() ? "" : undefined}
          class={cx(
            props.classes().item,
            isDisabled() && "opacity-50 pointer-events-none",
            isDanger() && "text-error hover:bg-error/10 focus-visible:bg-error/10",
            item.class,
          )}
          style={mergeStyle(props.styles?.item, item.style) as any}
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
          <Show when={leadingIcon() || item.type === "checkbox" || item.type === "radio"}>
            <span
              class={props.classes().itemLeading}
              data-slot="itemLeading"
              style={props.styles?.itemLeading}
            >
              <Show
                when={leadingIcon()}
                fallback={
                  <Show when={isSelected()}>
                    <RLIcon
                      name={props.checkedIcon()}
                      class={props.classes().itemIndicator}
                      data-slot="itemIndicator"
                    />
                  </Show>
                }
              >
                {typeof leadingIcon() === "string" ? (
                  <RLIcon
                    name={leadingIcon() as string}
                    class={props.classes().itemLeadingIcon}
                    data-slot="itemLeadingIcon"
                  />
                ) : (
                  (leadingIcon() as JSX.Element)
                )}
              </Show>
            </span>
          </Show>

          {/* Label + Description wrapper */}
          <div
            class={props.classes().itemWrapper}
            data-slot="itemWrapper"
            style={props.styles?.itemWrapper}
          >
            <Show when={item.label}>
              <span
                class={props.classes().itemLabel}
                data-slot="itemLabel"
                style={props.styles?.itemLabel}
              >
                {item.label}
              </span>
            </Show>
            <Show when={item.description}>
              <span
                class={props.classes().itemDescription}
                data-slot="itemDescription"
                style={props.styles?.itemDescription}
              >
                {item.description}
              </span>
            </Show>
          </div>

          {/* Trailing: Kbds + Submenu indicator */}
          <Show when={(item.kbds && item.kbds.length > 0) || isSubmenu()}>
            <span
              class={props.classes().itemTrailing}
              data-slot="itemTrailing"
              style={props.styles?.itemTrailing}
            >
              <Show when={item.kbds && item.kbds.length > 0}>
                <span
                  class={props.classes().itemKbds}
                  data-slot="itemKbds"
                  style={props.styles?.itemKbds}
                >
                  <For each={item.kbds}>
                    {(kbd) => (
                      <kbd
                        class={props.classes().itemKbd}
                        data-slot="itemKbd"
                        style={props.styles?.itemKbd}
                      >
                        {kbd}
                      </kbd>
                    )}
                  </For>
                </span>
              </Show>

              <Show when={isSubmenu()}>
                <RLIcon
                  name={props.submenuIcon()}
                  class={props.classes().itemSubIndicator}
                  data-slot="itemSubIndicator"
                />
              </Show>
            </span>
          </Show>
        </div>

        {/* Submenu Floating Layer */}
        <Show when={isSubmenu() && isSubOpen()}>
          <div
            class={cx("absolute left-full top-0 ml-1 z-50", props.classes().content)}
            data-slot="content"
            role="menu"
            tabindex={-1}
            onClick={(e) => e.stopPropagation()}
          >
            <MenuLayer
              sections={normalizeMenuSections((item as ContextMenuActionItem).children)}
              classes={props.classes}
              styles={props.styles}
              checkedIcon={props.checkedIcon}
              submenuIcon={props.submenuIcon}
              itemRender={props.itemRender}
              isSubmenu={true}
              closeLayer={() => setSubmenuOpenFor(item, flatIdx, false)}
              closeRoot={props.closeRoot}
            />
          </div>
        </Show>
      </div>
    );
  };

  return (
    <div class="flex flex-col w-full" onKeyDown={handleKeyDown}>
      <For each={props.sections}>
        {(section) => (
          <Show
            when={section.type === "group"}
            fallback={
              <div
                role="separator"
                data-slot="separator"
                class={props.classes().separator}
                style={props.styles?.separator}
              />
            }
          >
            <div
              role="group"
              data-slot="group"
              class={props.classes().group}
              style={props.styles?.group}
            >
              <Show when={section.label}>
                <div
                  data-slot="groupLabel"
                  class={props.classes().groupLabel}
                  style={props.styles?.groupLabel}
                >
                  {section.label}
                </div>
              </Show>
              <For each={section.items}>
                {(item) => {
                  const entry = flatItems().find((it) => it.item === item);
                  return renderItem(item, entry ? entry.flatIndex : 0);
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
  const setupProps = props.classes ? { ...props, ui: { ...props.classes, ...props.ui } } : props;
  const {
    Tag,
    classes,
    rest,
    id: menuId,
  } = RLContextMenuTheme.setup(setupProps, {
    omit: OMIT_KEYS,
    idPrefix: "rl-context-menu",
    variants: () => ({
      size: props.size ?? "md",
      disabled: Boolean(props.disabled),
    }),
  });

  const [uncontrolledOpen, setUncontrolledOpen] = createSignal(props.defaultOpen ?? false);
  const isOpen = () => (props.open !== undefined ? Boolean(props.open) : uncontrolledOpen());

  const [coords, setCoords] = createSignal<AnchorCoords>({ x: 0, y: 0 });

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

  const portalMount =
    typeof props.portal === "object" && props.portal !== null && "nodeType" in props.portal
      ? (props.portal as Element)
      : undefined;

  let triggerRef: HTMLElement | undefined;
  let contentRef: HTMLElement | undefined;

  const setOpenState = (next: boolean, nextCoords?: AnchorCoords) => {
    if (disabled() && next) return;
    if (nextCoords) {
      setCoords(nextCoords);
    }
    if (props.open === undefined) {
      setUncontrolledOpen(next);
    }
    props.onOpenChange?.(next);
  };

  const closeMenu = () => setOpenState(false);

  // Prevent scroll when open
  createEffect(
    () => ({ open: isOpen(), lock: preventScroll() }),
    ({ open, lock }) => {
      if (typeof document !== "undefined") {
        document.body.style.overflow = open && lock ? "hidden" : "";
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

    onCleanup(() => {
      document.removeEventListener("click", handleDocClick, true);
      window.removeEventListener("resize", handleWindowResize);
      window.removeEventListener("keydown", handleKeyDown);
    });
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
  let longPressTimer: ReturnType<typeof setTimeout> | undefined;
  let touchStartPos: { x: number; y: number } | null = null;

  const handleTouchStart = (e: TouchEvent) => {
    if (disabled()) return;
    const touch = e.touches[0];
    if (!touch) return;
    touchStartPos = { x: touch.clientX, y: touch.clientY };

    longPressTimer = setTimeout(() => {
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
      clearTimeout(longPressTimer);
      longPressTimer = undefined;
    }
  };

  const handleTouchEnd = () => {
    if (longPressTimer) {
      clearTimeout(longPressTimer);
      longPressTimer = undefined;
    }
    touchStartPos = null;
  };

  const sections = createMemo(() => normalizeMenuSections(props.items));

  const resolveRenderProp = (renderProp: unknown, ctx: { open: boolean; close: () => void }) => {
    if (typeof renderProp === "function") {
      return (renderProp as (c: typeof ctx) => JSX.Element)(ctx);
    }
    return renderProp as JSX.Element;
  };

  const topRenderContent = () =>
    resolveRenderProp(props.topSlot ?? props.topRender, { open: isOpen(), close: closeMenu });

  const bottomRenderContent = () =>
    resolveRenderProp(props.bottomSlot ?? props.bottomRender, { open: isOpen(), close: closeMenu });

  const triggerContent = () => props.triggerSlot ?? props.trigger ?? props.children;

  const slotStyles = () => props.styles;

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
        class={cx("fixed pointer-events-auto", classes().positioner)}
        data-slot="positioner"
        data-side={placement()}
        data-align={align()}
        style={{
          left: `${coords().x}px`,
          top: `${coords().y}px`,
          ...(typeof slotStyles()?.positioner === "object"
            ? (slotStyles()!.positioner as JSX.CSSProperties)
            : {}),
        }}
      >
        <div
          ref={(el) => (contentRef = el)}
          role="menu"
          tabindex={-1}
          aria-orientation="vertical"
          data-slot="content"
          data-state={isOpen() ? "open" : "closed"}
          data-expanded={isOpen() ? "" : undefined}
          data-closed={!isOpen() ? "" : undefined}
          data-side={placement()}
          data-align={align()}
          class={classes().content}
          style={slotStyles()?.content}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Top custom render */}
          <Show when={topRenderContent()}>
            <div data-slot="topRender">{topRenderContent()}</div>
          </Show>

          {/* Menu Items */}
          <Show when={sections().length > 0}>
            <MenuLayer
              sections={sections()}
              classes={classes}
              styles={slotStyles()}
              checkedIcon={checkedIcon}
              submenuIcon={submenuIcon}
              itemRender={props.itemSlot ?? props.itemRender}
              closeRoot={closeMenu}
            />
          </Show>

          {/* Bottom custom render */}
          <Show when={bottomRenderContent()}>
            <div data-slot="bottomRender">{bottomRenderContent()}</div>
          </Show>

          {/* Custom content Slot */}
          <Show when={props.contentSlot ?? props.content}>
            {props.contentSlot ?? props.content}
          </Show>
        </div>
      </div>
    </>
  );

  return (
    <>
      <Tag
        ref={(el: HTMLElement) => (triggerRef = el)}
        id={menuId()}
        class={cx("rl-context-menu-trigger", classes().trigger, classes().root, props.class)}
        style={mergeStyle(slotStyles()?.trigger, props.style)}
        data-slot="trigger"
        data-state={isOpen() ? "open" : "closed"}
        data-expanded={isOpen() ? "" : undefined}
        data-closed={!isOpen() ? "" : undefined}
        data-disabled={disabled() ? "" : undefined}
        tabindex={disabled() ? undefined : 0}
        onContextMenu={handleContextMenu}
        onKeyDown={handleTriggerKeyDown}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onTouchCancel={handleTouchEnd}
        {...rest}
      >
        {triggerContent()}
      </Tag>

      <Show when={isOpen() || !unmountOnHide()}>
        <Show when={usePortal()} fallback={renderMenuContent()}>
          <Show when={portalMount} fallback={<Portal>{renderMenuContent()}</Portal>}>
            {(mount) => <Portal mount={mount()}>{renderMenuContent()}</Portal>}
          </Show>
        </Show>
      </Show>
    </>
  );
};
