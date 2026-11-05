import type { JSX } from "@solidjs/web";
import { For, Show } from "solid-js";
import type { RLSidebarProps, SidebarBadge, SidebarItem } from "./sidebar.types";
import { RLSidebarTheme, type SidebarClasses } from "./sidebar.theme";
import { RLBadge } from "../badge/RLBadge";
import { RLIcon } from "../icon/RLIcon";
import { uiT } from "../../locale";

function hasActiveChild(item: SidebarItem): boolean {
  if (item.active) return true;
  return (item.children ?? []).some((c) => hasActiveChild(c));
}

function normalizeBadge(badge: SidebarItem["badge"]): Required<SidebarBadge> | null {
  if (!badge) return null;
  if (typeof badge === "string") {
    return { label: badge, color: "primary", variant: "soft" };
  }
  return {
    label: badge.label,
    color: badge.color ?? "primary",
    variant: badge.variant ?? "soft",
  };
}

interface SidebarItemListProps {
  items: SidebarItem[];
  depth: number;
  itemClasses: SidebarClasses;
}

const SidebarItemList = (props: SidebarItemListProps): JSX.Element => {
  const indentClass = () => (props.depth === 0 ? "ml-6" : props.depth === 1 ? "ml-4" : "ml-3");

  return (
    <div class={props.itemClasses.itemsContainer}>
      <For each={props.items}>
        {(item) => {
          const hasChildren = () => (item.children?.length ?? 0) > 0;
          const isActive = () => item.active || hasActiveChild(item);
          const badge = () => normalizeBadge(item.badge);

          return (
            <div
              class={props.depth === 1 ? props.itemClasses.item : ""}
              data-slot={props.depth === 1 ? "item" : undefined}
            >
              <Show
                when={hasChildren()}
                fallback={
                  <a
                    href={item.href ?? "#"}
                    class={`${
                      props.depth === 1 ? props.itemClasses.itemLink : props.itemClasses.subItemLink
                    } ${isActive() ? " text-highlighted bg-muted" : ""}`}
                    aria-current={isActive() ? "page" : undefined}
                  >
                    <Show when={item.icon}>
                      {(icon) => (
                        <span
                          class={`${
                            props.depth === 1
                              ? props.itemClasses.itemIcon
                              : props.itemClasses.subItemIcon
                          } ${icon()}`}
                          aria-hidden="true"
                        />
                      )}
                    </Show>
                    <span data-slot="item-text" class={props.itemClasses.itemText}>
                      {item.label}
                    </span>
                    <Show when={badge()}>
                      {(b) => (
                        <RLBadge
                          variant={b().variant}
                          color={b().color}
                          size="sm"
                          class="ml-auto select-none"
                          data-slot="item-badge"
                        >
                          {b().label}
                        </RLBadge>
                      )}
                    </Show>
                  </a>
                }
              >
                <details open={isActive()} class="group/details">
                  <summary
                    class={`${
                      props.depth === 1
                        ? props.itemClasses.itemSummary
                        : props.itemClasses.subItemLink
                    } ${isActive() ? " text-highlighted bg-muted" : ""}`}
                    data-slot="item-summary"
                  >
                    <Show when={item.icon}>
                      {(icon) => (
                        <span
                          class={`${
                            props.depth === 1
                              ? props.itemClasses.itemIcon
                              : props.itemClasses.subItemIcon
                          } ${icon()}`}
                          aria-hidden="true"
                        />
                      )}
                    </Show>
                    <span data-slot="item-text" class={props.itemClasses.itemText}>
                      {item.label}
                    </span>
                    <Show when={badge()}>
                      {(b) => (
                        <RLBadge
                          variant={b().variant}
                          color={b().color}
                          size="sm"
                          class="ml-auto select-none"
                          data-slot="item-badge"
                        >
                          {b().label}
                        </RLBadge>
                      )}
                    </Show>
                    <RLIcon name="chevron-right" class={props.itemClasses.itemChevron} />
                  </summary>
                  <div class={`mt-0.5 ${indentClass()} flex flex-col gap-0.5`}>
                    <SidebarItemList
                      items={item.children ?? []}
                      depth={props.depth + 1}
                      itemClasses={props.itemClasses}
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

const OMIT_KEYS = [
  "items",
  "logo",
  "side",
  "collapsible",
  "layout",
  "headerSlot",
  "footerSlot",
] as const;

export const RLSidebar = (props: RLSidebarProps): JSX.Element => {
  const { Tag, classes, rest, slots, children, theme } = RLSidebarTheme.setup(props, {
    as: "aside",
    omit: OMIT_KEYS,
    slots: ["headerSlot", "footerSlot"] as const,
  });

  const items = () => props.items ?? [];

  let sidebarRef: HTMLElement | null = null;

  const toggleSidebar = () => {
    if (sidebarRef) {
      sidebarRef.classList.toggle("-translate-x-full");
    }
  };

  const headerContent = () => (
    <Show
      when={slots.headerSlot()}
      fallback={
        <Show when={props.logo}>
          <span data-slot="sidebar-logo" class={classes().logoWrapper}>
            <RLIcon name="i-lucide-layers" class="size-5 text-primary" />
            <span class="truncate">{props.logo}</span>
          </span>
        </Show>
      }
    >
      {slots.headerSlot()}
    </Show>
  );

  return (
    <>
      <Tag
        ref={(el: HTMLElement) => (sidebarRef = el)}
        class={classes().root}
        data-slot="root"
        data-theme={theme()}
        data-sidebar
        {...rest}
      >
        <div class={classes().header} data-slot="header">
          {headerContent()}
        </div>

        <div class={classes().content} data-slot="content">
          <Show
            when={children()}
            fallback={<SidebarItemList items={items()} depth={1} itemClasses={classes()} />}
          >
            {children()}
          </Show>
        </div>

        <Show when={slots.footerSlot()}>
          <div class={classes().footer} data-slot="footer">
            {slots.footerSlot()}
          </div>
        </Show>
      </Tag>

      <Show when={props.collapsible === "offcanvas"}>
        <button
          type="button"
          data-sidebar-toggle
          class={classes().toggleButton}
          aria-label={uiT("sidebar.toggle")}
          onClick={toggleSidebar}
        >
          <RLIcon name="i-lucide-panel-left" class="size-4" />
        </button>
      </Show>
    </>
  );
};
