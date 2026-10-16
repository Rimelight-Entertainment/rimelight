import type { RLSidebarProps, SidebarItem } from "./sidebar.types";
import { RLSidebarTheme } from "./sidebar.theme";
import { createMemo, For, Show, omit, type Component } from "solid-js";
import { RLBadge } from "../badge/RLBadge";
import { RLIcon } from "../icon/RLIcon";

function hasActiveChild(item: SidebarItem): boolean {
  if (item.active) return true;
  return (item.children ?? []).some((c) => hasActiveChild(c));
}

function normalizeBadge(badge: any) {
  if (!badge) return null;
  if (typeof badge === "string") {
    return { text: badge, color: "primary" as const, variant: "soft" as const, class: "" };
  }
  let color = badge.color || "primary";
  let badgeVariant = badge.variant || "soft";
  if (badge.variant) {
    const v = String(badge.variant).toLowerCase();
    if (v === "tip" || v === "success") {
      color = "success";
      badgeVariant = "soft";
    } else if (v === "caution" || v === "warning") {
      color = "warning";
      badgeVariant = "soft";
    } else if (v === "error") {
      color = "error";
      badgeVariant = "soft";
    } else if (v === "note" || v === "default") {
      color = "primary";
      badgeVariant = "soft";
    }
  }
  return {
    text: badge.text || badge.label || "",
    color,
    variant: badgeVariant as "solid" | "outline" | "soft" | "ghost",
    class: badge.class || "",
  };
}

const RLSidebarItems: Component<{
  items: SidebarItem[];
  t: (key: string) => string;
  _depth: number;
  themeClasses: any;
}> = (props) => {
  const indentClass = () => (props._depth === 0 ? "ml-6" : props._depth === 1 ? "ml-4" : "ml-3");

  return (
    <div class={props.themeClasses.itemsContainer}>
      <For each={props.items}>
        {(item) => {
          const hasChildren = () => (item.children?.length ?? 0) > 0;
          const isActive = () => item.active || hasActiveChild(item);
          const b = () => normalizeBadge(item.badge);

          return (
            <div
              class={props._depth === 1 ? props.themeClasses.item : ""}
              data-slot={props._depth === 1 ? "item" : undefined}
            >
              <Show
                when={hasChildren()}
                fallback={
                  <a
                    href={item.href ?? "#"}
                    class={`${
                      props._depth === 1
                        ? props.themeClasses.itemLink
                        : props.themeClasses.subItemLink
                    } ${isActive() ? " text-highlighted bg-muted" : ""}`}
                    aria-current={isActive() ? "page" : undefined}
                  >
                    <Show when={item.icon}>
                      {(icon) => (
                        <span
                          class={`${
                            props._depth === 1
                              ? props.themeClasses.itemIcon
                              : props.themeClasses.subItemIcon
                          } ${icon()}`}
                          aria-hidden="true"
                        />
                      )}
                    </Show>
                    <span data-slot="item-text" class={props.themeClasses.itemText}>
                      {props.t(item.label || "")}
                    </span>
                    <Show when={b()}>
                      {(badge) => (
                        <RLBadge
                          variant={badge().variant}
                          color={badge().color as any}
                          size="sm"
                          class={`ml-auto select-none ${badge().class}`}
                          data-slot="item-badge"
                        >
                          {props.t(badge().text)}
                        </RLBadge>
                      )}
                    </Show>
                  </a>
                }
              >
                <details open={isActive()} class="group/details">
                  <summary
                    class={`${
                      props._depth === 1
                        ? props.themeClasses.itemSummary
                        : props.themeClasses.subItemLink
                    } ${isActive() ? " text-highlighted bg-muted" : ""}`}
                    data-slot="item-summary"
                  >
                    <Show when={item.icon}>
                      {(icon) => (
                        <span
                          class={`${
                            props._depth === 1
                              ? props.themeClasses.itemIcon
                              : props.themeClasses.subItemIcon
                          } ${icon()}`}
                          aria-hidden="true"
                        />
                      )}
                    </Show>
                    <span data-slot="item-text" class={props.themeClasses.itemText}>
                      {props.t(item.label || "")}
                    </span>
                    <Show when={b()}>
                      {(badge) => (
                        <RLBadge
                          variant={badge().variant}
                          color={badge().color as any}
                          size="sm"
                          class={`ml-auto select-none ${badge().class}`}
                          data-slot="item-badge"
                        >
                          {props.t(badge().text)}
                        </RLBadge>
                      )}
                    </Show>
                    <RLIcon name="chevron-right" class={props.themeClasses.itemChevron} />
                  </summary>
                  <div class={`mt-0.5 ${indentClass()} flex flex-col gap-0.5`}>
                    <RLSidebarItems
                      items={item.children ?? []}
                      t={props.t}
                      _depth={props._depth + 1}
                      themeClasses={props.themeClasses}
                    />
                  </div>
                </details>
              </Show>
            </div>
          );
        }}
      </For>
    </div>
  );
};

export const RLSidebar: Component<RLSidebarProps> = (props) => {
  const rest = omit(
    props,
    "items",
    "collapsible",
    "variant",
    "logo",
    "t",
    "_depth",
    "ui",
    "class",
    "children",
    "header",
    "headerSlot",
    "footer",
    "footerSlot",
  );

  const t = () => props.t ?? ((key: string) => key);
  const depth = () => props._depth ?? 0;
  const items = () => props.items ?? [];
  const isRoot = () => depth() === 0;

  const classes = createMemo(() =>
    RLSidebarTheme({
      collapsible: props.collapsible,
      variant: props.variant,
      ui: props.ui,
      class: props.class,
    }),
  );

  let sidebarRef: HTMLElement | null = null;

  const toggleSidebar = () => {
    if (sidebarRef) {
      sidebarRef.classList.toggle("-translate-x-full");
    }
  };

  const headerContent = () => (
    <Show
      when={props.header}
      fallback={
        <Show
          when={props.headerSlot}
          fallback={
            <Show when={props.logo}>
              <span data-slot="sidebar-logo" class={classes().logoWrapper}>
                <RLIcon name="i-lucide-layers" class="size-5 text-primary" />
                <span class="truncate">{props.logo}</span>
              </span>
            </Show>
          }
        >
          {props.headerSlot}
        </Show>
      }
    >
      {props.header}
    </Show>
  );

  const footerContent = () => props.footer || props.footerSlot;

  return (
    <Show
      when={isRoot()}
      fallback={
        <RLSidebarItems items={items()} t={t()} _depth={depth()} themeClasses={classes()} />
      }
    >
      <aside
        ref={(el) => (sidebarRef = el)}
        class={classes().root}
        data-slot="root"
        data-sidebar
        {...rest}
      >
        <div class={classes().header} data-slot="header">
          {headerContent()}
        </div>

        <div class={classes().content} data-slot="content">
          <Show
            when={props.children}
            fallback={
              <RLSidebarItems items={items()} t={t()} _depth={1} themeClasses={classes()} />
            }
          >
            {props.children}
          </Show>
        </div>

        <Show when={footerContent()}>
          <div class={classes().footer} data-slot="footer">
            {footerContent()}
          </div>
        </Show>
      </aside>

      <Show when={props.collapsible === "offcanvas"}>
        <button
          type="button"
          data-sidebar-toggle
          class={classes().toggleButton}
          aria-label="Toggle sidebar"
          onClick={toggleSidebar}
        >
          <RLIcon name="i-lucide-panel-left" class="size-4" />
        </button>
      </Show>
    </Show>
  );
};
