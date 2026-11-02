import {
  createContext,
  createEffect,
  createMemo,
  createSignal,
  For,
  onCleanup,
  onSettled,
  Show,
  useContext,
  type Accessor,
  type Component,
} from "solid-js";
import { Portal, type JSX } from "@solidjs/web";
import { cx } from "../../resolver";
import { RLIcon } from "../icon/RLIcon";
import { RLContextMenuTheme } from "./context-menu.theme";
import type {
  ContextMenuActionItem,
  ContextMenuAlign,
  ContextMenuCheckboxItem,
  ContextMenuGroupItem,
  ContextMenuItem,
  ContextMenuItemRenderProps,
  ContextMenuItems,
  ContextMenuPlacement,
  ContextMenuRadioItem,
  ContextMenuSize,
  RLContextMenuContentProps,
  RLContextMenuProps,
  RLContextMenuSlot,
  RLContextMenuTriggerProps,
} from "./context-menu.types";

const ROOT_OMIT_KEYS = [
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

const TRIGGER_OMIT_KEYS = ["as", "disabled", "children", "class", "style"] as const;

const CONTENT_OMIT_KEYS = [
  "items",
  "checkedIcon",
  "submenuIcon",
  "topRender",
  "bottomRender",
  "itemRender",
  "class",
  "style",
  "children",
] as const;

interface AnchorCoords {
  x: number;
  y: number;
}

interface ContextMenuContextValue {
  id: Accessor<string>;
  isOpen: Accessor<boolean>;
  setOpenState: (open: boolean, coords?: AnchorCoords) => void;
  close: () => void;
  disabled: Accessor<boolean>;
  align: Accessor<ContextMenuAlign>;
  placement: Accessor<ContextMenuPlacement>;
  gutter: Accessor<number>;
  shift: Accessor<number>;
  overflowPadding: Accessor<number>;
  preventScroll: Accessor<boolean>;
  size: Accessor<ContextMenuSize>;
  portal: Accessor<boolean | Node>;
  unmountOnHide: Accessor<boolean>;
  longPressDelay: Accessor<number>;
  anchorCoords: Accessor<AnchorCoords | null>;
  getTriggerRef: () => HTMLElement | undefined;
  setTriggerRef: (el: HTMLElement | undefined) => void;
  getContentRef: () => HTMLElement | undefined;
  setContentRef: (el: HTMLElement | undefined) => void;
  classes: Accessor<Record<RLContextMenuSlot, string>>;
  styles: Accessor<Partial<Record<RLContextMenuSlot, JSX.CSSProperties | string>> | undefined>;
  theme: Accessor<string | undefined>;
  rootProps: RLContextMenuProps;
}

const ContextMenuContext = createContext<ContextMenuContextValue | null>(null);

interface ResolvedMenuSection {
  type: "group" | "separator";
  label?: JSX.Element | undefined;
  items?: ContextMenuItem[] | undefined;
  item?: ContextMenuItem | undefined;
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
        items: currentUngrouped,
      });
      currentUngrouped = [];
    }
  };

  for (let i = 0; i < flat.length; i++) {
    const entry = flat[i];
    if (!entry) continue;

    if (entry.type === "separator") {
      flushUngrouped();
      sections.push({ type: "separator", item: entry });
    } else if (entry.type === "group") {
      flushUngrouped();
      const groupEntry = entry as ContextMenuGroupItem;
      const children = groupEntry.items ?? groupEntry.children ?? [];
      sections.push({
        type: "group",
        label: groupEntry.label,
        items: children,
        item: groupEntry,
      });
    } else if (
      entry.type === undefined &&
      !entry.icon &&
      !entry.leading &&
      !(entry as ContextMenuActionItem).onSelect &&
      !(entry as ContextMenuActionItem).href &&
      Array.isArray((entry as ContextMenuActionItem).children) &&
      i === 0 &&
      flat.length === 1
    ) {
      // Top-level single group object shorthand without explicit `type: 'group'`:
      // e.g. items={[{ label: 'Actions', children: [...] }]}
      flushUngrouped();
      const groupLike = entry as ContextMenuActionItem;
      const children = Array.isArray(groupLike.children?.[0])
        ? (groupLike.children as ContextMenuItem[][]).flat()
        : ((groupLike.children as ContextMenuItem[] | undefined) ?? []);
      sections.push({
        type: "group",
        label: groupLike.label,
        items: children,
        item: entry,
      });
    } else {
      currentUngrouped.push(entry);
    }
  }

  flushUngrouped();
  return sections;
}

function mergeStyle(
  a?: JSX.CSSProperties | string,
  b?: JSX.CSSProperties | string,
): JSX.CSSProperties | string | undefined {
  if (!a) return b;
  if (!b) return a;
  if (typeof a === "string" || typeof b === "string") {
    const strA =
      typeof a === "string"
        ? a
        : Object.entries(a)
            .map(([k, v]) => `${k}:${String(v)}`)
            .join(";");
    const strB =
      typeof b === "string"
        ? b
        : Object.entries(b)
            .map(([k, v]) => `${k}:${String(v)}`)
            .join(";");
    return `${strA};${strB}`;
  }
  return { ...a, ...b };
}

function renderCustomSlot<P extends Record<string, any>>(
  slot: JSX.Element | Component<P> | undefined,
  props: P,
): JSX.Element {
  if (slot === undefined || slot === null) return null;
  if (typeof slot === "function") {
    return (slot as Component<P>)(props);
  }
  return slot;
}

function isCustomElementIcon(val: unknown): val is JSX.Element {
  return val !== undefined && val !== null && typeof val !== "string";
}

function findInitialOpenSubmenuIndex(sections: ResolvedMenuSection[]): number | null {
  let idx = 0;
  for (const sec of sections) {
    if (sec.type === "group" && sec.items) {
      for (const it of sec.items) {
        if (it.type === undefined || it.type === "item") {
          const actionIt = it as ContextMenuActionItem;
          if (actionIt.open || actionIt.defaultOpen) {
            return idx;
          }
        }
        idx++;
      }
    }
  }
  return null;
}

interface MenuLayerProps {
  items: ContextMenuItems | undefined;
  classes: Accessor<Record<RLContextMenuSlot, string>>;
  styles: Accessor<Partial<Record<RLContextMenuSlot, JSX.CSSProperties | string>> | undefined>;
  checkedIcon: Accessor<string>;
  submenuIcon: Accessor<string>;
  topRender?: JSX.Element | Component<{ open: boolean; close: () => void }> | undefined;
  bottomRender?: JSX.Element | Component<{ open: boolean; close: () => void }> | undefined;
  itemRender?: Component<ContextMenuItemRenderProps> | undefined;
  isOpen: Accessor<boolean>;
  closeRoot: () => void;
  closeLayer?: (() => void) | undefined;
  isSubmenu?: boolean | undefined;
  align: Accessor<ContextMenuAlign>;
  side: Accessor<ContextMenuPlacement>;
  size: Accessor<ContextMenuSize>;
  contentClass?: any;
  contentStyle?: JSX.CSSProperties | string | undefined;
  contentRef?: ((el: HTMLDivElement) => void) | undefined;
  children?: JSX.Element | undefined;
  restProps?: Record<string, unknown> | undefined;
}

const MenuLayer: Component<MenuLayerProps> = (props) => {
  const sections = createMemo(() => normalizeMenuSections(props.items));

  const [highlightedIndex, setHighlightedIndex] = createSignal<number>(-1);
  const [openSubmenuIndex, setOpenSubmenuIndex] = createSignal<number | null>(
    findInitialOpenSubmenuIndex(sections()),
  );
  const [uncontrolledChecked, setUncontrolledChecked] = createSignal<Record<number, boolean>>({});
  const [uncontrolledRadioGroups, setUncontrolledRadioGroups] = createSignal<
    Record<string, string>
  >({});

  const itemEls = new Map<number, HTMLElement>();

  // Flatten interactive/navigable items for keyboard indexing
  const flatItems = createMemo(() => {
    const list: { item: ContextMenuItem; flatIndex: number }[] = [];
    let idx = 0;
    for (const sec of sections()) {
      if (sec.type === "group" && sec.items) {
        for (const it of sec.items) {
          if (it.type !== "separator" && it.type !== "group") {
            list.push({ item: it, flatIndex: idx });
          }
          idx++;
        }
      }
    }
    return list;
  });

  const moveHighlight = (delta: number) => {
    const navigable = flatItems().filter((entry) => !entry.item.disabled);
    if (navigable.length === 0) return;
    const current = highlightedIndex();
    const currentPos = navigable.findIndex((e) => e.flatIndex === current);
    let nextPos: number;
    if (currentPos === -1) {
      nextPos = delta > 0 ? 0 : navigable.length - 1;
    } else {
      nextPos = (currentPos + delta + navigable.length) % navigable.length;
    }
    const nextFlatIdx = navigable[nextPos]!.flatIndex;
    setHighlightedIndex(nextFlatIdx);
    itemEls.get(nextFlatIdx)?.focus();
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
          style={mergeStyle(props.styles()?.separator, item.style)}
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

    const itemRole = (): "menuitemcheckbox" | "menuitemradio" | "menuitem" =>
      item.type === "checkbox"
        ? "menuitemcheckbox"
        : item.type === "radio"
          ? "menuitemradio"
          : "menuitem";

    const leadingSource = () => item.icon ?? item.leading;

    const itemContent = (
      <>
        <Show when={leadingSource() !== undefined}>
          <span
            data-slot="itemLeading"
            class={cx(props.classes().itemLeading, item.ui?.itemLeading)}
            style={props.styles()?.itemLeading}
          >
            {isCustomElementIcon(leadingSource()) ? (
              leadingSource()
            ) : (
              <RLIcon
                name={leadingSource() as string}
                size="sm"
                class={cx(props.classes().itemLeadingIcon, item.ui?.itemLeadingIcon)}
              />
            )}
          </span>
        </Show>

        <span
          data-slot="itemWrapper"
          class={cx(props.classes().itemWrapper, item.ui?.itemWrapper)}
          style={props.styles()?.itemWrapper}
        >
          <Show when={item.label !== undefined}>
            <span
              data-slot="itemLabel"
              class={cx(props.classes().itemLabel, item.ui?.itemLabel)}
              style={props.styles()?.itemLabel}
            >
              {item.label}
            </span>
          </Show>
          <Show when={item.description !== undefined}>
            <span
              data-slot="itemDescription"
              class={cx(props.classes().itemDescription, item.ui?.itemDescription)}
              style={props.styles()?.itemDescription}
            >
              {item.description}
            </span>
          </Show>
        </span>

        <Show
          when={
            (item.kbds && item.kbds.length > 0) ||
            item.type === "checkbox" ||
            item.type === "radio" ||
            isSubmenu()
          }
        >
          <span
            data-slot="itemTrailing"
            class={cx(props.classes().itemTrailing, item.ui?.itemTrailing)}
            style={props.styles()?.itemTrailing}
          >
            <Show when={item.kbds && item.kbds.length > 0}>
              <span
                data-slot="itemKbds"
                class={cx(props.classes().itemKbds, item.ui?.itemKbds)}
                style={props.styles()?.itemKbds}
              >
                <For each={item.kbds}>
                  {(kbd) => (
                    <kbd
                      data-slot="itemKbd"
                      class={cx(props.classes().itemKbd, item.ui?.itemKbd)}
                      style={props.styles()?.itemKbd}
                    >
                      {kbd}
                    </kbd>
                  )}
                </For>
              </span>
            </Show>

            <Show when={(item.type === "checkbox" || item.type === "radio") && isSelected()}>
              <span
                data-slot="itemIndicator"
                class={cx(props.classes().itemIndicator, item.ui?.itemIndicator)}
                style={props.styles()?.itemIndicator}
              >
                <RLIcon name={props.checkedIcon()} size="xs" />
              </span>
            </Show>

            <Show when={isSubmenu()}>
              <span
                data-slot="itemSubIndicator"
                class={cx(props.classes().itemSubIndicator, item.ui?.itemSubIndicator)}
                style={props.styles()?.itemSubIndicator}
              >
                <RLIcon name={props.submenuIcon()} size="xs" />
              </span>
            </Show>
          </span>
        </Show>

        <Show when={isSubmenu() && isSubOpen()}>
          <div
            data-slot="positioner"
            class={cx(props.classes().positioner, "absolute left-full top-0 ml-1")}
            style={props.styles()?.positioner}
          >
            <MenuLayer
              items={(item as ContextMenuActionItem).children}
              classes={props.classes}
              styles={props.styles}
              checkedIcon={props.checkedIcon}
              submenuIcon={props.submenuIcon}
              itemRender={props.itemRender}
              isOpen={isSubOpen}
              closeRoot={props.closeRoot}
              closeLayer={() => setSubmenuOpenFor(item, flatIdx, false)}
              isSubmenu={true}
              align={props.align}
              side={() => "right"}
              size={props.size}
            />
          </div>
        </Show>
      </>
    );

    const commonAttrs = () => ({
      "data-slot": "item",
      "data-disabled": isDisabled() ? "" : undefined,
      "data-danger": isDanger() ? "" : undefined,
      "data-highlighted": isHighlighted() ? "" : undefined,
      "data-selected": isSelected() ? "" : undefined,
      "data-expanded": isSubmenu() && isSubOpen() ? "" : undefined,
      "data-closed": isSubmenu() && !isSubOpen() ? "" : undefined,
      "data-state":
        item.type === "checkbox" || item.type === "radio"
          ? isSelected()
            ? "checked"
            : "unchecked"
          : isSubmenu()
            ? isSubOpen()
              ? "open"
              : "closed"
            : undefined,
      role: itemRole(),
      "aria-disabled": isDisabled() ? ("true" as const) : undefined,
      "aria-checked":
        item.type === "checkbox" || item.type === "radio"
          ? isSelected()
            ? ("true" as const)
            : ("false" as const)
          : undefined,
      "aria-haspopup": isSubmenu() ? ("menu" as const) : undefined,
      "aria-expanded": isSubmenu()
        ? isSubOpen()
          ? ("true" as const)
          : ("false" as const)
        : undefined,
      tabindex: isDisabled() ? -1 : isHighlighted() ? 0 : -1,
      class: cx(props.classes().item, item.ui?.item, item.class),
      style: mergeStyle(props.styles()?.item, item.style),
      onMouseEnter: () => {
        if (isDisabled()) return;
        setHighlightedIndex(flatIdx);
        if (isSubmenu()) {
          setSubmenuOpenFor(item, flatIdx, true);
        } else if (openSubmenuIndex() !== null && openSubmenuIndex() !== flatIdx) {
          setOpenSubmenuIndex(null);
        }
      },
      onFocus: () => {
        if (!isDisabled()) setHighlightedIndex(flatIdx);
      },
      onClick: (e: MouseEvent) => {
        e.stopPropagation();
        activateItem(item, flatIdx, e);
      },
    });

    const actItem = item as ContextMenuActionItem;
    if (actItem.href) {
      return (
        <a
          ref={(el) => {
            itemEls.set(flatIdx, el);
          }}
          href={actItem.href}
          target={actItem.target}
          {...commonAttrs()}
        >
          {itemContent}
        </a>
      );
    }

    return (
      <button
        ref={(el) => {
          itemEls.set(flatIdx, el);
        }}
        type="button"
        disabled={isDisabled()}
        {...commonAttrs()}
      >
        {itemContent}
      </button>
    );
  };

  return (
    <div
      ref={(el) => {
        props.contentRef?.(el);
      }}
      role="menu"
      tabindex={-1}
      data-slot="content"
      data-state={props.isOpen() ? "open" : "closed"}
      data-expanded={props.isOpen() ? "" : undefined}
      data-closed={!props.isOpen() ? "" : undefined}
      data-align={props.align()}
      data-side={props.side()}
      class={cx(props.classes().content, props.contentClass)}
      style={mergeStyle(props.styles()?.content, props.contentStyle)}
      onKeyDown={handleKeyDown}
      onClick={(e) => e.stopPropagation()}
      onContextMenu={(e) => e.preventDefault()}
      {...props.restProps}
    >
      {renderCustomSlot(props.topRender, {
        open: props.isOpen(),
        close: props.closeRoot,
      })}

      {(() => {
        let runningIdx = 0;
        return (
          <For each={sections()}>
            {(section) => {
              if (section.type === "separator") {
                return (
                  <div
                    role="separator"
                    data-slot="separator"
                    class={cx(props.classes().separator, section.item?.class)}
                    style={mergeStyle(props.styles()?.separator, section.item?.style)}
                  />
                );
              }

              const startIdx = runningIdx;
              const groupItems = section.items ?? [];
              runningIdx += groupItems.length;

              return (
                <div
                  role="group"
                  data-slot="group"
                  class={cx(props.classes().group, section.item?.class)}
                  style={mergeStyle(props.styles()?.group, section.item?.style)}
                >
                  <Show when={section.label !== undefined}>
                    <div
                      data-slot="groupLabel"
                      class={cx(props.classes().groupLabel, section.item?.ui?.groupLabel)}
                      style={props.styles()?.groupLabel}
                    >
                      {section.label}
                    </div>
                  </Show>
                  <For each={groupItems}>
                    {(it, localIdx) => renderItem(it, startIdx + localIdx())}
                  </For>
                </div>
              );
            }}
          </For>
        );
      })()}

      {props.children}

      {renderCustomSlot(props.bottomRender, {
        open: props.isOpen(),
        close: props.closeRoot,
      })}
    </div>
  );
};

export const RLContextMenuTrigger: Component<RLContextMenuTriggerProps> = (props) => {
  const ctx = useContext(ContextMenuContext);

  const Tag = RLContextMenuTheme.tag(props as any, "div");
  const rest = RLContextMenuTheme.omit(props, ...TRIGGER_OMIT_KEYS);

  const isDisabled = () => Boolean(props.disabled ?? ctx?.disabled());
  const isOpen = () => Boolean(ctx?.isOpen());

  let longPressTimer: ReturnType<typeof setTimeout> | undefined;

  const clearLongPress = () => {
    if (longPressTimer !== undefined) {
      clearTimeout(longPressTimer);
      longPressTimer = undefined;
    }
  };

  onCleanup(clearLongPress);

  const openAt = (x: number, y: number) => {
    if (isDisabled() || !ctx) return;
    ctx.setOpenState(true, { x, y });
  };

  const openAtTriggerCenter = (target: HTMLElement) => {
    if (isDisabled() || !ctx) return;
    const rect = target.getBoundingClientRect();
    openAt(rect.left + rect.width / 2, rect.top + rect.height / 2);
  };

  return (
    <Tag
      ref={(el: HTMLElement) => {
        ctx?.setTriggerRef(el);
      }}
      data-slot="trigger"
      data-state={isOpen() ? "open" : "closed"}
      data-expanded={isOpen() ? "" : undefined}
      data-closed={!isOpen() ? "" : undefined}
      data-disabled={isDisabled() ? "" : undefined}
      aria-disabled={isDisabled() ? "true" : undefined}
      aria-expanded={isOpen() ? "true" : "false"}
      aria-haspopup="menu"
      tabindex={isDisabled() ? undefined : (rest["tabindex"] ?? 0)}
      class={cx(ctx?.classes().trigger, props.class)}
      style={mergeStyle(ctx?.styles()?.trigger, props.style)}
      onContextMenu={(e: MouseEvent) => {
        if (typeof rest["onContextMenu"] === "function") {
          (rest["onContextMenu"] as (ev: MouseEvent) => void)(e);
        }
        if (isDisabled()) return;
        e.preventDefault();
        e.stopPropagation();
        openAt(e.clientX, e.clientY);
      }}
      onKeyDown={(e: KeyboardEvent) => {
        if (typeof rest["onKeyDown"] === "function") {
          (rest["onKeyDown"] as (ev: KeyboardEvent) => void)(e);
        }
        if (isDisabled()) return;
        if (e.key === "ContextMenu" || (e.shiftKey && e.key === "F10")) {
          e.preventDefault();
          e.stopPropagation();
          openAtTriggerCenter(e.currentTarget as HTMLElement);
        }
      }}
      onPointerDown={(e: PointerEvent) => {
        if (typeof rest["onPointerDown"] === "function") {
          (rest["onPointerDown"] as (ev: PointerEvent) => void)(e);
        }
        if (isDisabled()) return;
        if (e.pointerType === "touch" || e.pointerType === "pen") {
          clearLongPress();
          const x = e.clientX;
          const y = e.clientY;
          const delay = ctx?.longPressDelay() ?? 700;
          longPressTimer = setTimeout(() => {
            longPressTimer = undefined;
            openAt(x, y);
          }, delay);
        }
      }}
      onPointerUp={(e: PointerEvent) => {
        if (typeof rest["onPointerUp"] === "function") {
          (rest["onPointerUp"] as (ev: PointerEvent) => void)(e);
        }
        clearLongPress();
      }}
      onPointerCancel={(e: PointerEvent) => {
        if (typeof rest["onPointerCancel"] === "function") {
          (rest["onPointerCancel"] as (ev: PointerEvent) => void)(e);
        }
        clearLongPress();
      }}
      onPointerMove={(e: PointerEvent) => {
        if (typeof rest["onPointerMove"] === "function") {
          (rest["onPointerMove"] as (ev: PointerEvent) => void)(e);
        }
        if (longPressTimer !== undefined) {
          clearLongPress();
        }
      }}
      {...rest}
    >
      {props.children}
    </Tag>
  );
};

export const RLContextMenuContent: Component<RLContextMenuContentProps> = (props) => {
  const ctx = useContext(ContextMenuContext);

  const rest = RLContextMenuTheme.omit(props, ...CONTENT_OMIT_KEYS);

  const isOpen = () => Boolean(ctx?.isOpen());
  const unmountOnHide = () => ctx?.unmountOnHide() ?? true;
  const usePortal = () => (ctx ? ctx.portal() !== false : false);
  const portalMount = typeof ctx?.portal() === "object" ? (ctx.portal() as any) : undefined;

  const checkedIcon = () => props.checkedIcon ?? ctx?.rootProps.checkedIcon ?? "check";
  const submenuIcon = () => props.submenuIcon ?? ctx?.rootProps.submenuIcon ?? "chevron-right";
  const items = () => props.items ?? ctx?.rootProps.items;
  const topRender = () => props.topRender ?? ctx?.rootProps.topRender ?? ctx?.rootProps.topSlot;
  const bottomRender = () =>
    props.bottomRender ?? ctx?.rootProps.bottomRender ?? ctx?.rootProps.bottomSlot;
  const itemRender = () => props.itemRender ?? ctx?.rootProps.itemRender ?? ctx?.rootProps.itemSlot;

  const positionStyle = createMemo<JSX.CSSProperties>(() => {
    if (!ctx) return {};
    const anchor = ctx.anchorCoords();
    const triggerEl = ctx.getTriggerRef();
    const gutter = ctx.gutter();
    const shift = ctx.shift();
    const pad = ctx.overflowPadding();
    const placement = ctx.placement();
    const align = ctx.align();

    let baseX = anchor?.x ?? 0;
    let baseY = anchor?.y ?? 0;

    if (!anchor && triggerEl && typeof triggerEl.getBoundingClientRect === "function") {
      const rect = triggerEl.getBoundingClientRect();
      baseX = rect.left + rect.width / 2;
      baseY = rect.top + rect.height / 2;
    }

    let x = baseX;
    let y = baseY;

    if (placement === "right") {
      x += gutter;
      y += shift;
    } else if (placement === "left") {
      x -= gutter;
      y += shift;
    } else if (placement === "bottom") {
      x += shift;
      y += gutter;
    } else if (placement === "top") {
      x += shift;
      y -= gutter;
    }

    if (typeof window !== "undefined") {
      x = Math.max(pad, Math.min(x, Math.max(pad, window.innerWidth - pad)));
      y = Math.max(pad, Math.min(y, Math.max(pad, window.innerHeight - pad)));
    }

    const transforms: string[] = [];
    if (placement === "left") transforms.push("translateX(-100%)");
    if (placement === "top") transforms.push("translateY(-100%)");
    if (placement === "top" || placement === "bottom") {
      if (align === "center") transforms.push("translateX(-50%)");
      else if (align === "end") transforms.push("translateX(-100%)");
    } else {
      if (align === "center") transforms.push("translateY(-50%)");
      else if (align === "end") transforms.push("translateY(-100%)");
    }

    return {
      position: "fixed",
      left: `${x}px`,
      top: `${y}px`,
      ...(transforms.length > 0 ? { transform: transforms.join(" ") } : {}),
    };
  });

  const renderTree = () => (
    <>
      <div
        data-slot="overlay"
        data-state={isOpen() ? "open" : "closed"}
        class={ctx?.classes().overlay}
        style={{
          ...(typeof ctx?.styles()?.overlay === "object"
            ? (ctx.styles()!.overlay as JSX.CSSProperties)
            : {}),
          ...(isOpen() ? {} : { display: "none" }),
        }}
        onClick={(e) => {
          e.stopPropagation();
          ctx?.close();
        }}
        onContextMenu={(e) => {
          e.preventDefault();
          e.stopPropagation();
          ctx?.close();
        }}
      />
      <div
        data-slot="positioner"
        data-state={isOpen() ? "open" : "closed"}
        data-align={ctx?.align() ?? "start"}
        data-side={ctx?.placement() ?? "right"}
        data-theme={ctx?.theme()}
        class={ctx?.classes().positioner}
        style={{
          ...positionStyle(),
          ...(typeof ctx?.styles()?.positioner === "object"
            ? (ctx.styles()!.positioner as JSX.CSSProperties)
            : {}),
          ...(isOpen() ? {} : { display: "none" }),
        }}
      >
        <MenuLayer
          items={items()}
          classes={() =>
            ctx?.classes() ??
            RLContextMenuTheme({
              size: "md",
            })
          }
          styles={() => ctx?.styles()}
          checkedIcon={checkedIcon}
          submenuIcon={submenuIcon}
          topRender={topRender()}
          bottomRender={bottomRender()}
          itemRender={itemRender()}
          isOpen={isOpen}
          closeRoot={() => {
            ctx?.close();
          }}
          align={() => ctx?.align() ?? "start"}
          side={() => ctx?.placement() ?? "right"}
          size={() => ctx?.size() ?? "md"}
          contentClass={props.class}
          contentStyle={props.style}
          contentRef={(el) => {
            ctx?.setContentRef(el);
          }}
          restProps={rest}
        >
          {props.children}
        </MenuLayer>
      </div>
    </>
  );

  return (
    <Show when={isOpen() || !unmountOnHide()}>
      <Show when={usePortal()} fallback={renderTree()}>
        <Portal mount={portalMount}>{renderTree()}</Portal>
      </Show>
    </Show>
  );
};

const RLContextMenuBase: Component<RLContextMenuProps> = (props) => {
  const [uncontrolledOpen, setUncontrolledOpen] = createSignal(props.defaultOpen ?? false);
  const [anchorCoords, setAnchorCoords] = createSignal<AnchorCoords | null>(null);

  let triggerRef: HTMLElement | undefined;
  let contentRef: HTMLElement | undefined;

  const isOpen = () => (props.open !== undefined ? Boolean(props.open) : uncontrolledOpen());
  const isDisabled = () => Boolean(props.disabled);
  const align = () => props.align ?? "start";
  const placement = () => props.placement ?? "right";
  const gutter = () => props.gutter ?? 0;
  const shift = () => props.shift ?? 0;
  const overflowPadding = () => props.overflowPadding ?? 4;
  const preventScroll = () => props.preventScroll !== false;
  const size = () => props.size ?? "md";
  const portal = () => props.portal ?? true;
  const unmountOnHide = () => props.unmountOnHide !== false;
  const longPressDelay = () => props.longPressDelay ?? 700;

  const { classes, rest, id } = RLContextMenuTheme.setup(props, {
    omit: ROOT_OMIT_KEYS,
    idPrefix: "rl-context-menu",
    variants: () => ({
      size: size(),
      disabled: isDisabled(),
      ...(props.classes || props.ui
        ? {
            ui: {
              ...props.classes,
              ...props.ui,
            },
          }
        : {}),
    }),
  });

  const setOpenState = (next: boolean, coords?: AnchorCoords) => {
    if (next && isDisabled()) return;
    if (coords) {
      setAnchorCoords(coords);
    }
    if (props.open === undefined) {
      setUncontrolledOpen(next);
    }
    props.onOpenChange?.(next);
  };

  const close = () => setOpenState(false);

  // Scroll lock when preventScroll is active and menu is open
  createEffect(
    () => ({ open: isOpen(), lock: preventScroll() }),
    ({ open, lock }) => {
      if (typeof document === "undefined") return;
      if (open && lock) {
        const prev = document.body.style.overflow;
        document.body.style.overflow = "hidden";
        return () => {
          document.body.style.overflow = prev;
        };
      }
      return undefined;
    },
  );

  // Escape and outside click listeners
  onSettled(() => {
    if (typeof window === "undefined" || typeof document === "undefined") return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen()) {
        e.preventDefault();
        close();
      }
    };

    const onPointerDown = (e: MouseEvent) => {
      if (!isOpen()) return;
      const target = e.target as Node | null;
      if (contentRef && target && !contentRef.contains(target)) {
        close();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    document.addEventListener("mousedown", onPointerDown);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("mousedown", onPointerDown);
    };
  });

  const contextValue: ContextMenuContextValue = {
    id,
    isOpen,
    setOpenState,
    close,
    disabled: isDisabled,
    align,
    placement,
    gutter,
    shift,
    overflowPadding,
    preventScroll,
    size,
    portal,
    unmountOnHide,
    longPressDelay,
    anchorCoords,
    getTriggerRef: () => triggerRef,
    setTriggerRef: (el) => {
      triggerRef = el;
    },
    getContentRef: () => contentRef,
    setContentRef: (el) => {
      contentRef = el;
    },
    classes,
    styles: () => props.styles,
    theme: () => props.theme,
    rootProps: props,
  };

  const hasSingleComponentProps = () =>
    props.items !== undefined ||
    props.content !== undefined ||
    props.contentSlot !== undefined ||
    props.trigger !== undefined ||
    props.triggerSlot !== undefined;

  const triggerElement = () => props.triggerSlot ?? props.trigger;
  const contentElement = () => props.contentSlot ?? props.content;

  return (
    <ContextMenuContext value={contextValue}>
      <div
        id={id()}
        data-slot="root"
        data-state={isOpen() ? "open" : "closed"}
        data-disabled={isDisabled() ? "" : undefined}
        data-theme={props.theme}
        class={classes().root}
        style={props.styles?.root}
        {...rest}
      >
        <Show
          when={!hasSingleComponentProps() || triggerElement() === undefined}
          fallback={
            <RLContextMenuTrigger
              as={props.as}
              disabled={props.disabled}
              class={props.class}
              style={props.style}
            >
              {triggerElement()}
            </RLContextMenuTrigger>
          }
        >
          <Show
            when={!hasSingleComponentProps()}
            fallback={
              <RLContextMenuTrigger
                as={props.as}
                disabled={props.disabled}
                class={props.class}
                style={props.style}
              >
                {props.children}
              </RLContextMenuTrigger>
            }
          >
            {props.children}
          </Show>
        </Show>

        <Show
          when={
            hasSingleComponentProps() &&
            (props.items !== undefined || contentElement() !== undefined)
          }
        >
          <RLContextMenuContent
            items={props.items}
            checkedIcon={props.checkedIcon}
            submenuIcon={props.submenuIcon}
            topRender={props.topRender ?? props.topSlot}
            bottomRender={props.bottomRender ?? props.bottomSlot}
            itemRender={props.itemRender ?? props.itemSlot}
          >
            {contentElement()}
          </RLContextMenuContent>
        </Show>
      </div>
    </ContextMenuContext>
  );
};

export type RLContextMenuCompound = Component<RLContextMenuProps> & {
  Trigger: Component<RLContextMenuTriggerProps>;
  Content: Component<RLContextMenuContentProps>;
};

export const RLContextMenu: RLContextMenuCompound = Object.assign(RLContextMenuBase, {
  Trigger: RLContextMenuTrigger,
  Content: RLContextMenuContent,
});
