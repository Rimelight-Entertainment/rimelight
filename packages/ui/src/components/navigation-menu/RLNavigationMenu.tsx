import type {
  RLNavigationMenuProps,
  NavigationMenuItem,
  NavigationMenuChildItem,
  NavigationMenuPanelContext,
  NavigationMenuItemContext,
} from "./navigation-menu.types";
import { RLNavigationMenuTheme } from "./navigation-menu.theme";
import { createMemo, createSignal, For, Show, onSettled, type Component } from "solid-js";
import type { JSX } from "@solidjs/web";
import { RLIcon } from "../icon/RLIcon";
import { localizeHref } from "../link/helpers";
import type { SlotRenderer } from "../../types";

const OMIT_KEYS = ["items", "panels"] as const;

const LOCALE_PREFIX = /^\/[a-z]{2}(?:-[a-zA-Z]{2})?(?=\/|$)/;
const normalizePath = (p: string) => p.replace(LOCALE_PREFIX, "").replace(/\/+$/, "") || "/";

/** Items accept either `href` or `to` (RLLink convention). Internal hrefs are localized. */
const resolveHref = (item: NavigationMenuChildItem): string | undefined => {
  const h = item.href ?? item.to;
  return typeof h === "string" ? localizeHref(h, item.localize) : undefined;
};

const hasChildren = (item: NavigationMenuChildItem) => !!item.children && item.children.length > 0;

const renderSlot = <C,>(renderer: SlotRenderer<C>, ctx: C) =>
  typeof renderer === "function" ? renderer(ctx) : renderer;

export const RLNavigationMenu: Component<RLNavigationMenuProps> = (props) => {
  const { Tag, classes, rest, slots, children, theme } = RLNavigationMenuTheme.setup(props, {
    as: "nav",
    omit: OMIT_KEYS,
    slots: ["panelSlot", "itemSlot"] as const,
  });

  let navRef: HTMLElement | undefined;

  const [openIndex, setOpenIndex] = createSignal<number | null>(null);
  const [currentPath, setCurrentPath] = createSignal("");

  const items = createMemo(() => props.items ?? []);
  // The theme defaults `orientation` to "horizontal"; any value other than "vertical" is horizontal.
  const isHorizontal = () => props.orientation !== "vertical";
  const orientation = () => (isHorizontal() ? "horizontal" : "vertical");

  /**
   * Custom panel renderer for an item. `panels[item.panel]` wins, `panelSlot` is the
   * generic fallback. Returns the renderer without calling it, so checking for a panel
   * doesn't instantiate the panel's JSX.
   */
  const rendererFor = (item: NavigationMenuItem) => {
    if (item.panel && props.panels?.[item.panel]) return props.panels[item.panel];
    return slots.panelSlot();
  };

  const hasPanel = (item: NavigationMenuItem) => hasChildren(item) || !!rendererFor(item);

  const isItemActive = (item: NavigationMenuItem) => {
    if (item.active !== undefined) return !!item.active;
    const href = resolveHref(item);
    if (!href) return false;
    const target = normalizePath(href);
    const path = currentPath();
    if (target === "/") return path === "/";
    return path === target || path.startsWith(`${target}/`);
  };

  let closeTimer: ReturnType<typeof setTimeout> | undefined;
  const cancelClose = () => {
    clearTimeout(closeTimer);
    closeTimer = undefined;
  };
  const openItem = (index: number) => {
    cancelClose();
    setOpenIndex(index);
  };
  const closeAll = () => {
    cancelClose();
    setOpenIndex(null);
  };
  const scheduleClose = () => {
    cancelClose();
    closeTimer = setTimeout(() => setOpenIndex(null), 150);
  };

  onSettled(() => {
    if (typeof window === "undefined") return;
    setCurrentPath(normalizePath(window.location.pathname));

    const onClick = (e: MouseEvent) => {
      if (openIndex() !== null && navRef && !navRef.contains(e.target as Node)) closeAll();
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && openIndex() !== null) closeAll();
    };
    document.addEventListener("click", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("click", onClick);
      document.removeEventListener("keydown", onKey);
      cancelClose();
    };
  });

  const Icon = (p: { name?: string | undefined; class?: string }) => (
    <Show when={p.name}>
      {(name) => <span class={`${name()} ${p.class ?? ""}`} aria-hidden="true" />}
    </Show>
  );

  const ChildLink = (p: { child: NavigationMenuChildItem }) => (
    <a href={resolveHref(p.child) ?? "#"} class={classes().childLink} onClick={() => closeAll()}>
      <Icon name={p.child.icon} class={classes().childIcon} />
      <div>
        <div class={classes().childLabel}>{p.child.label}</div>
        <Show when={p.child.description}>
          {(desc) => <p class={classes().childDescription}>{desc()}</p>}
        </Show>
      </div>
    </a>
  );

  /**
   * Default panel for items without a custom renderer. Children that themselves have
   * children render as titled groups (columns); leaf children render as plain links.
   */
  const DefaultPanel = (p: { item: NavigationMenuItem }) => {
    const groups = () => (p.item.children ?? []).filter((c) => c.children?.length);
    const leaves = () => (p.item.children ?? []).filter((c) => !c.children?.length);
    return (
      <div class={classes().panel} data-slot="panel">
        <Show when={leaves().length > 0}>
          <ul role="list" class={classes().childList}>
            <For each={leaves()}>
              {(child) => (
                <li>
                  <ChildLink child={child} />
                </li>
              )}
            </For>
          </ul>
        </Show>
        <For each={groups()}>
          {(group) => (
            <div class={classes().group} data-slot="group">
              <Show
                when={resolveHref(group)}
                fallback={<div class={classes().groupTitle}>{group.label}</div>}
              >
                {(href) => (
                  <a href={href()} class={classes().groupTitle}>
                    {group.label}
                  </a>
                )}
              </Show>
              <ul role="list" class={classes().childList}>
                <For each={group.children}>
                  {(child) => (
                    <li>
                      <ChildLink child={child} />
                    </li>
                  )}
                </For>
              </ul>
            </div>
          )}
        </For>
      </div>
    );
  };

  /** Plain function (not a component) — called from a JSX expression, so every
   *  read it does is tracked by the compiled expression's computation. */
  const renderPanel = (item: NavigationMenuItem, index: number): JSX.Element => {
    const context: NavigationMenuPanelContext = { item, index };
    if (item.panel && props.panels?.[item.panel]) return props.panels[item.panel]!(context);
    const fallback = slots.panelSlot();
    return fallback ? renderSlot(fallback, context) : <DefaultPanel item={item} />;
  };

  /** Custom item renderer, or `undefined` for the default link or trigger. */
  const renderItemSlot = (item: NavigationMenuItem, index: number, active: boolean) => {
    const renderer = slots.itemSlot();
    if (!renderer) return undefined;
    const context: NavigationMenuItemContext = { item, index, active };
    return renderSlot(renderer, context);
  };

  return (
    <Tag
      ref={(el: HTMLElement) => (navRef = el)}
      class={classes().root}
      data-slot="root"
      data-theme={theme()}
      data-nav-menu
      data-orientation={orientation()}
      onMouseLeave={() => {
        if (isHorizontal()) scheduleClose();
      }}
      {...rest}
    >
      <ul class={classes().list} data-slot="list" role="list">
        <For each={items()}>
          {(item, i) => {
            const isOpen = () => openIndex() === i();
            const isActive = () => isItemActive(item);

            return (
              <li
                class={classes().item}
                data-slot="item"
                data-nav-item
                data-index={i()}
                onMouseEnter={() => {
                  if (!isHorizontal()) return;
                  if (hasPanel(item)) openItem(i());
                  else scheduleClose();
                }}
              >
                {renderItemSlot(item, i(), isActive()) ?? (
                  <Show
                    when={hasPanel(item)}
                    fallback={
                      <a
                        href={resolveHref(item) ?? "#"}
                        class={classes().link}
                        data-slot="link"
                        aria-current={isActive() ? "page" : undefined}
                      >
                        <Icon name={item.icon} class="size-4" />
                        {item.label}
                      </a>
                    }
                  >
                    {/* Trigger shares the `link` slot so `ui.link` styles both. */}
                    <button
                      type="button"
                      class={`${classes().link} ${classes().trigger}`}
                      data-slot="trigger"
                      data-nav-trigger
                      aria-expanded={isOpen() ? "true" : "false"}
                      aria-haspopup="true"
                      aria-current={isActive() ? "page" : undefined}
                      data-state={isOpen() ? "open" : "closed"}
                      onClick={(e) => {
                        e.stopPropagation();
                        if (isOpen()) closeAll();
                        else openItem(i());
                      }}
                    >
                      <Icon name={item.icon} class="size-4" />
                      {item.label}
                      <RLIcon
                        name="chevron-down"
                        class={`size-3.5 transition-transform duration-200 ${isOpen() ? "rotate-180" : ""}`}
                        aria-hidden="true"
                        data-chevron
                      />
                    </button>
                  </Show>
                )}

                {/* Vertical: inline accordion. Uses the item's slot panel when one exists,
                    otherwise the item's own links. */}
                <Show when={!isHorizontal() && hasChildren(item)}>
                  <div
                    class={`${classes().content} ${isOpen() ? "" : "hidden"}`}
                    data-slot="content"
                    data-nav-content
                    data-item-index={i()}
                    role="region"
                  >
                    {renderPanel(item, i())}
                  </div>
                </Show>
              </li>
            );
          }}
        </For>
      </ul>

      {children()}

      {/* Horizontal: single shared viewport — the ONLY place panels render. */}
      <Show when={isHorizontal()}>
        <div
          class={`${classes().viewportWrapper} ${openIndex() !== null ? "" : "hidden"}`}
          data-slot="viewport-wrapper"
          data-nav-viewport-wrapper
          data-state={openIndex() !== null ? "open" : "closed"}
          onMouseEnter={cancelClose}
        >
          <div
            class={classes().viewport}
            data-slot="viewport"
            data-nav-viewport
            data-state={openIndex() !== null ? "open" : "closed"}
          >
            <For each={items()}>
              {(item, i) => (
                <Show when={hasPanel(item)}>
                  <div
                    class={openIndex() === i() ? "w-full" : "hidden"}
                    data-nav-viewport-content
                    data-index={i()}
                  >
                    {renderPanel(item, i())}
                  </div>
                </Show>
              )}
            </For>
          </div>
        </div>
      </Show>
    </Tag>
  );
};
