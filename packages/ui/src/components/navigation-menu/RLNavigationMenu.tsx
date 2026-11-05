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
import { RLButton } from "../button/RLButton";
import { RLIcon } from "../icon/RLIcon";
import { RLLink } from "../link/RLLink";
import { localizeHref } from "../link/link.helpers";
import { renderSlot } from "../../slot";

const OMIT_KEYS = ["items", "panels"] as const;

const LOCALE_PREFIX = /^\/[a-z]{2}(?:-[a-zA-Z]{2})?(?=\/|$)/;
const normalizePath = (p: string) => p.replace(LOCALE_PREFIX, "").replace(/\/+$/, "") || "/";

/** Items accept either `href` or `to` (RLLink convention). Internal hrefs are localized. */
const resolveHref = (item: NavigationMenuChildItem): string | undefined => {
  const h = item.href ?? item.to;
  return typeof h === "string" ? localizeHref(h, item.localize) : undefined;
};

const hasChildren = (item: NavigationMenuChildItem) => !!item.children && item.children.length > 0;

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
  // Trigger carries the `link` slot too, so one `ui.link` override styles both.
  const triggerClass = createMemo(() => `${classes().link} ${classes().trigger}`);

  /** `panels[item.panel]` wins over the generic `panelSlot`. Returns the renderer, never calls it. */
  const customPanel = (item: NavigationMenuItem) =>
    item.panel ? props.panels?.[item.panel] : undefined;

  const hasPanel = (item: NavigationMenuItem) =>
    hasChildren(item) || !!customPanel(item) || !!slots.panelSlot();

  const isItemActive = (item: NavigationMenuItem) => {
    if (item.active !== undefined) return !!item.active;
    const href = resolveHref(item);
    if (!href) return false;
    const target = normalizePath(href);
    const path = currentPath();
    if (target === "/") return path === "/";
    return path === target || path.startsWith(`${target}/`);
  };

  let closeTimer: number | undefined;
  const cancelClose = () => {
    window.clearTimeout(closeTimer);
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
    closeTimer = window.setTimeout(() => setOpenIndex(null), 150);
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

  const ChildLink = (p: { child: NavigationMenuChildItem }) => (
    <RLLink
      href={resolveHref(p.child) ?? "#"}
      localize={false}
      class={classes().childLink}
      onClick={() => closeAll()}
    >
      <Show when={p.child.icon}>
        {(icon) => <RLIcon name={icon()} class={classes().childIcon} />}
      </Show>
      <div>
        <div class={classes().childLabel}>{p.child.label}</div>
        <Show when={p.child.description}>
          {(desc) => <p class={classes().childDescription}>{desc()}</p>}
        </Show>
      </div>
    </RLLink>
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
                  <RLLink href={href()} localize={false} class={classes().groupTitle}>
                    {group.label}
                  </RLLink>
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
    const custom = customPanel(item);
    if (custom) return custom(context);
    const fallback = slots.panelSlot();
    if (fallback) return renderSlot(fallback, context);
    return <DefaultPanel item={item} />;
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
                <Show
                  when={slots.itemSlot()}
                  fallback={
                    <Show
                      when={hasPanel(item)}
                      fallback={
                        <RLLink
                          href={resolveHref(item) ?? "#"}
                          localize={false}
                          unstyled
                          class={classes().link}
                          data-slot="link"
                          aria-current={isActive() ? "page" : undefined}
                        >
                          <Show when={item.icon}>
                            {(icon) => <RLIcon name={icon()} class={classes().itemIcon} />}
                          </Show>
                          {item.label}
                        </RLLink>
                      }
                    >
                      <RLButton
                        variant="unstyled"
                        shape="bare"
                        class={triggerClass()}
                        data-slot="trigger"
                        data-nav-trigger
                        aria-expanded={isOpen() ? "true" : "false"}
                        aria-haspopup="true"
                        aria-current={isActive() ? "page" : undefined}
                        data-state={isOpen() ? "open" : "closed"}
                        onClick={(e: MouseEvent) => {
                          e.stopPropagation();
                          if (isOpen()) closeAll();
                          else openItem(i());
                        }}
                      >
                        <Show when={item.icon}>
                          {(icon) => <RLIcon name={icon()} class={classes().itemIcon} />}
                        </Show>
                        {item.label}
                        <RLIcon
                          name="chevron-down"
                          class={classes().chevron}
                          data-state={isOpen() ? "open" : "closed"}
                        />
                      </RLButton>
                    </Show>
                  }
                >
                  {(renderer) =>
                    renderSlot(renderer(), {
                      item,
                      index: i(),
                      active: isActive(),
                    } satisfies NavigationMenuItemContext)
                  }
                </Show>

                {/* Vertical: inline accordion. Uses the item's slot panel when one exists,
                    otherwise the item's own links. */}
                <Show when={!isHorizontal() && hasChildren(item)}>
                  <div
                    class={classes().content}
                    data-slot="content"
                    data-nav-content
                    data-item-index={i()}
                    data-state={isOpen() ? "open" : "closed"}
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
          class={classes().viewportWrapper}
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
                    class={classes().viewportItem}
                    data-slot="viewport-item"
                    data-nav-viewport-content
                    data-index={i()}
                    data-state={openIndex() === i() ? "open" : "closed"}
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
