import type {
  RLNavigationMenuProps,
  NavigationMenuItem,
  NavigationMenuChildItem,
} from "./navigation-menu.types";
import { RLNavigationMenuTheme } from "./navigation-menu.theme";
import { createMemo, createSignal, For, Show, onSettled, type Component } from "solid-js";
import { RLIcon } from "../icon/RLIcon";

const OMIT_KEYS = ["items", "color", "contentSlot", "itemSlot"] as const;

export const RLNavigationMenu: Component<RLNavigationMenuProps> = (props) => {
  const { classes, rest } = RLNavigationMenuTheme.setup(props, { omit: OMIT_KEYS });

  let navRef: HTMLElement | undefined;
  let viewportRef: HTMLDivElement | undefined;

  const [openIndex, setOpenIndex] = createSignal<number | null>(null);

  const items = createMemo(() => props.items ?? []);
  const orientation = () => props.orientation ?? "horizontal";

  const [currentPath, setCurrentPath] = createSignal("");

  onSettled(() => {
    if (typeof window === "undefined") return;
    const path =
      window.location.pathname
        .replace(/^\/[a-z]{2}(?:-[a-zA-Z]{2})?(?=\/|$)/, "")
        .replace(/\/+$/, "") || "/";
    setCurrentPath(path);
  });

  const getContentForIndex = (item: NavigationMenuItem, index: number) => {
    if (props.contentSlot) {
      return props.contentSlot({ item, index });
    }
    return null;
  };

  const isItemActive = (item: NavigationMenuItem) => {
    if (item["active"] !== undefined) return !!item["active"];
    const rawPath = (item["href"] ?? "#") as string;
    const normalizedPath =
      rawPath.replace(/^\/[a-z]{2}(?:-[a-zA-Z]{2})?(?=\/|$)/, "").replace(/\/+$/, "") || "/";
    const path = currentPath();
    if (normalizedPath !== "" && normalizedPath !== "/") return path.startsWith(normalizedPath);
    return path === "/";
  };

  let closeTimer: ReturnType<typeof setTimeout> | undefined;

  const openItem = (index: number) => {
    if (closeTimer) clearTimeout(closeTimer);
    setOpenIndex(index);
  };

  const closeAll = () => {
    if (closeTimer) clearTimeout(closeTimer);
    setOpenIndex(null);
  };

  const scheduleClose = () => {
    if (closeTimer) clearTimeout(closeTimer);
    closeTimer = setTimeout(() => {
      setOpenIndex(null);
    }, 150);
  };

  onSettled(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (
        openIndex() !== null &&
        navRef &&
        !navRef.contains(e.target as Node) &&
        (!viewportRef || !viewportRef.contains(e.target as Node))
      ) {
        closeAll();
      }
    };
    document.addEventListener("click", handleOutsideClick);

    return () => {
      document.removeEventListener("click", handleOutsideClick);
      if (closeTimer) clearTimeout(closeTimer);
    };
  });

  const itemHref = (item: NavigationMenuItem) =>
    typeof item["href"] === "string" ? item["href"] : "#";

  const childHref = (child: NavigationMenuChildItem) =>
    typeof child["href"] === "string" ? child["href"] : "#";

  const activeItem = createMemo(() => (openIndex() !== null ? items()[openIndex()!] : null));
  const activeItemHasContent = createMemo(() => {
    const item = activeItem();
    if (!item) return false;
    const idx = openIndex()!;
    return !!((item.children && item.children.length > 0) || getContentForIndex(item, idx));
  });

  return (
    <nav
      ref={(el) => (navRef = el)}
      class={classes().root}
      data-slot="root"
      data-theme={props.theme}
      data-nav-menu
      data-orientation={orientation()}
      {...rest}
    >
      <ul class={classes().list} data-slot="list" role="list">
        <For each={items()}>
          {(item, i) => {
            const hasChildren = () =>
              !!((item.children && item.children.length > 0) || getContentForIndex(item, i()));
            const isActive = () => isItemActive(item);
            const isOpen = () => openIndex() === i();

            return (
              <li
                class={classes().item}
                data-slot="item"
                data-nav-item
                data-index={i()}
                onMouseEnter={() => {
                  if (orientation() === "horizontal" && hasChildren()) openItem(i());
                }}
                onMouseLeave={() => {
                  if (orientation() === "horizontal" && hasChildren()) scheduleClose();
                }}
              >
                <Show
                  when={hasChildren()}
                  fallback={
                    <a
                      href={itemHref(item)}
                      class={classes().link}
                      data-slot="link"
                      aria-current={isActive() ? "page" : undefined}
                    >
                      <Show when={item.icon}>
                        {(icon) => <span class={`${icon()} mr-1.5 size-4`} aria-hidden="true" />}
                      </Show>
                      {item.label}
                    </a>
                  }
                >
                  <button
                    type="button"
                    class={classes().trigger}
                    data-slot="trigger"
                    data-nav-trigger
                    aria-expanded={isOpen() ? "true" : "false"}
                    aria-haspopup="true"
                    data-state={isOpen() ? "open" : "closed"}
                    onClick={(e) => {
                      e.stopPropagation();
                      if (isOpen()) {
                        closeAll();
                      } else {
                        openItem(i());
                      }
                    }}
                  >
                    <Show when={item.icon}>
                      {(icon) => <span class={`${icon()} mr-1.5 size-4`} aria-hidden="true" />}
                    </Show>
                    {item.label}
                    <RLIcon
                      name="chevron-down"
                      class={`ml-1 size-3.5 transition-transform duration-200 ${isOpen() ? "rotate-180" : ""}`}
                      aria-hidden="true"
                      data-chevron
                    />
                  </button>
                </Show>

                {/* Vertical Mode: Accordion Content */}
                <Show when={orientation() === "vertical" && hasChildren()}>
                  <div
                    class={`${classes().content} ${isOpen() ? "" : "hidden"}`}
                    data-slot="content"
                    data-nav-content
                    data-item-index={i()}
                    role="region"
                  >
                    <Show
                      when={getContentForIndex(item, i())}
                      fallback={
                        <ul role="list" class={classes().childList}>
                          <For each={item.children}>
                            {(child) => (
                              <li>
                                <a href={childHref(child)} class={classes().childLink}>
                                  <Show when={child["icon"]}>
                                    {(icon) => (
                                      <span
                                        class={`${icon()} ${classes().childIcon}`}
                                        aria-hidden="true"
                                      />
                                    )}
                                  </Show>
                                  <div>
                                    <div class={classes().childLabel}>{child["label"]}</div>
                                    <Show when={child["description"]}>
                                      {(desc) => <p class={classes().childDescription}>{desc()}</p>}
                                    </Show>
                                  </div>
                                </a>
                              </li>
                            )}
                          </For>
                        </ul>
                      }
                    >
                      {getContentForIndex(item, i())}
                    </Show>
                  </div>
                </Show>

                {/* Horizontal Mode: Standard Popover Dropdown when item does NOT have custom content */}
                <Show
                  when={
                    orientation() === "horizontal" &&
                    hasChildren() &&
                    !getContentForIndex(item, i())
                  }
                >
                  <div
                    class={`${classes().content} ${isOpen() ? "" : "hidden"}`}
                    data-slot="content"
                    data-nav-content
                    data-item-index={i()}
                    role="region"
                  >
                    <ul role="list" class={classes().childList}>
                      <For each={item.children}>
                        {(child) => (
                          <li>
                            <a href={childHref(child)} class={classes().childLink}>
                              <Show when={child["icon"]}>
                                {(icon) => (
                                  <span
                                    class={`${icon()} ${classes().childIcon}`}
                                    aria-hidden="true"
                                  />
                                )}
                              </Show>
                              <div>
                                <div class={classes().childLabel}>{child["label"]}</div>
                                <Show when={child["description"]}>
                                  {(desc) => <p class={classes().childDescription}>{desc()}</p>}
                                </Show>
                              </div>
                            </a>
                          </li>
                        )}
                      </For>
                    </ul>
                  </div>
                </Show>
              </li>
            );
          }}
        </For>
      </ul>

      {/* Horizontal Viewport Wrapper for Mega Menus */}
      <div
        class={`${classes().viewportWrapper} ${openIndex() !== null && activeItemHasContent() && orientation() === "horizontal" ? "" : "hidden"}`}
        data-slot="viewport-wrapper"
        data-nav-viewport-wrapper
        data-state={openIndex() !== null ? "open" : "closed"}
        onMouseEnter={() => {
          if (closeTimer) clearTimeout(closeTimer);
        }}
        onMouseLeave={() => {
          scheduleClose();
        }}
      >
        <div
          ref={(el) => (viewportRef = el)}
          class={classes().viewport}
          data-slot="viewport"
          data-nav-viewport
          data-state={openIndex() !== null ? "open" : "closed"}
        >
          <For each={items()}>
            {(item, i) => {
              const isOpen = () => openIndex() === i();
              const slotContent = () => getContentForIndex(item, i());

              return (
                <div
                  class={isOpen() ? "w-full" : "hidden"}
                  data-nav-viewport-content
                  data-index={i()}
                >
                  <Show
                    when={slotContent()}
                    fallback={
                      <Show when={item.children && item.children.length > 0}>
                        <ul role="list" class={classes().childList}>
                          <For each={item.children}>
                            {(child) => (
                              <li>
                                <a href={childHref(child)} class={classes().childLink}>
                                  <Show when={child["icon"]}>
                                    {(icon) => (
                                      <span
                                        class={`${icon()} ${classes().childIcon}`}
                                        aria-hidden="true"
                                      />
                                    )}
                                  </Show>
                                  <div>
                                    <div class={classes().childLabel}>{child["label"]}</div>
                                    <Show when={child["description"]}>
                                      {(desc) => <p class={classes().childDescription}>{desc()}</p>}
                                    </Show>
                                  </div>
                                </a>
                              </li>
                            )}
                          </For>
                        </ul>
                      </Show>
                    }
                  >
                    {slotContent()}
                  </Show>
                </div>
              );
            }}
          </For>
        </div>
      </div>
    </nav>
  );
};
