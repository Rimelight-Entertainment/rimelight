import type {
  RLNavigationMenuProps,
  NavigationMenuItem,
  NavigationMenuChildItem,
} from "./navigation-menu.types";
import { RLNavigationMenuTheme } from "./navigation-menu.theme";
import { createMemo, createSignal, omit, For, Show, onSettled, type Component } from "solid-js";
import { RLIcon } from "../icon/RLIcon";

export const RLNavigationMenu: Component<RLNavigationMenuProps> = (allProps) => {
  const props = allProps;
  const rest = omit(
    allProps,
    "items",
    "color",
    "orientation",
    "theme",
    "ui",
    "class",
    "children",
    "slots",
  );

  let navRef: HTMLElement | undefined;
  let viewportRef: HTMLDivElement | undefined;

  const [openIndex, setOpenIndex] = createSignal<number | null>(null);

  const items = createMemo(() => props.items ?? []);
  const orientation = () => props.orientation ?? "horizontal";

  const resolvedClasses = createMemo(() =>
    RLNavigationMenuTheme({
      color: props.color ?? "primary",
      orientation: orientation(),
      ui: props.ui,
      class: props.class,
    }),
  );

  const slotCache = new Map<string, unknown>();
  const getSlotContent = (slotName?: string) => {
    if (!slotName) return null;
    if (slotCache.has(slotName)) return slotCache.get(slotName) ?? null;
    const slots = allProps["slots"] as Record<string, any> | undefined;
    let raw: any = slots ? slots[slotName] : undefined;
    if (raw === undefined) {
      raw = allProps[`${slotName}-content`] ?? allProps[slotName];
    }
    const content = typeof raw === "function" ? raw() : raw;
    const resolved = content ?? null;
    slotCache.set(slotName, resolved);
    return resolved;
  };

  const currentPath = () => {
    if (typeof window === "undefined") return "";
    return (
      window.location.pathname
        .replace(/^\/[a-z]{2}(?:-[a-zA-Z]{2})?(?=\/|$)/, "")
        .replace(/\/+$/, "") || "/"
    );
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
    return !!(
      (item.children && item.children.length > 0) ||
      item.slot ||
      getSlotContent(item.slot)
    );
  });

  return (
    <nav
      ref={(el) => (navRef = el)}
      class={resolvedClasses().root}
      data-slot="root"
      data-theme={props.theme}
      data-nav-menu
      data-orientation={orientation()}
      {...rest}
    >
      <ul class={resolvedClasses().list} data-slot="list" role="list">
        <For each={items()}>
          {(item, i) => {
            const hasChildren = () =>
              !!(
                (item.children && item.children.length > 0) ||
                item.slot ||
                getSlotContent(item.slot)
              );
            const isActive = () => isItemActive(item);
            const isOpen = () => openIndex() === i();

            return (
              <li
                class={resolvedClasses().item}
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
                      class={resolvedClasses().link}
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
                    class={resolvedClasses().trigger}
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
                    class={`${resolvedClasses().content} ${isOpen() ? "" : "hidden"}`}
                    data-slot="content"
                    data-nav-content
                    data-item-index={i()}
                    role="region"
                  >
                    <Show
                      when={getSlotContent(item.slot)}
                      fallback={
                        <ul role="list" class="py-1">
                          <For each={item.children}>
                            {(child) => (
                              <li>
                                <a
                                  href={childHref(child)}
                                  class="flex items-start gap-3 rounded-sm px-3 py-2 text-sm hover:bg-accented hover:text-highlighted transition-colors"
                                >
                                  <Show when={child["icon"]}>
                                    {(icon) => (
                                      <span
                                        class={`${icon()} mt-0.5 size-4 shrink-0 text-muted`}
                                        aria-hidden="true"
                                      />
                                    )}
                                  </Show>
                                  <div>
                                    <div class="font-medium leading-none">{child["label"]}</div>
                                    <Show when={child["description"]}>
                                      {(desc) => (
                                        <p class="mt-1 text-xs text-muted line-clamp-2">{desc()}</p>
                                      )}
                                    </Show>
                                  </div>
                                </a>
                              </li>
                            )}
                          </For>
                        </ul>
                      }
                    >
                      {getSlotContent(item.slot)}
                    </Show>
                  </div>
                </Show>

                {/* Horizontal Mode: Standard Popover Dropdown when item does NOT have a custom slot */}
                <Show
                  when={
                    orientation() === "horizontal" &&
                    hasChildren() &&
                    !item.slot &&
                    !getSlotContent(item.slot)
                  }
                >
                  <div
                    class={`${resolvedClasses().content} ${isOpen() ? "" : "hidden"}`}
                    data-slot="content"
                    data-nav-content
                    data-item-index={i()}
                    role="region"
                  >
                    <ul role="list" class="py-1">
                      <For each={item.children}>
                        {(child) => (
                          <li>
                            <a
                              href={childHref(child)}
                              class="flex items-start gap-3 rounded-sm px-3 py-2 text-sm hover:bg-accented hover:text-highlighted transition-colors"
                            >
                              <Show when={child["icon"]}>
                                {(icon) => (
                                  <span
                                    class={`${icon()} mt-0.5 size-4 shrink-0 text-muted`}
                                    aria-hidden="true"
                                  />
                                )}
                              </Show>
                              <div>
                                <div class="font-medium leading-none">{child["label"]}</div>
                                <Show when={child["description"]}>
                                  {(desc) => (
                                    <p class="mt-1 text-xs text-muted line-clamp-2">{desc()}</p>
                                  )}
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
        class={`${resolvedClasses().viewportWrapper} ${openIndex() !== null && activeItemHasContent() && orientation() === "horizontal" ? "" : "hidden"}`}
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
          class={resolvedClasses().viewport}
          data-slot="viewport"
          data-nav-viewport
          data-state={openIndex() !== null ? "open" : "closed"}
        >
          <For each={items()}>
            {(item, i) => {
              const isOpen = () => openIndex() === i();
              const slotContent = () => getSlotContent(item.slot);

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
                        <ul role="list" class="py-2 px-3 grid grid-cols-2 gap-2">
                          <For each={item.children}>
                            {(child) => (
                              <li>
                                <a
                                  href={childHref(child)}
                                  class="flex items-start gap-3 rounded-md px-3 py-2 text-sm hover:bg-accented hover:text-highlighted transition-colors"
                                >
                                  {child["icon"] && (
                                    <span
                                      class={`${child["icon"]} mt-0.5 size-4 shrink-0 text-muted`}
                                      aria-hidden="true"
                                    />
                                  )}
                                  <div>
                                    <div class="font-medium leading-none">{child["label"]}</div>
                                    {child["description"] && (
                                      <p class="mt-1 text-xs text-muted line-clamp-2">
                                        {child["description"]}
                                      </p>
                                    )}
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
