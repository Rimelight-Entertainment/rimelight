import type { JSX } from "@solidjs/web";
import { createSignal, For, Show } from "solid-js";
import type {
  RLSidebarProps,
  SidebarBadge,
  SidebarItem,
  SidebarItemListProps,
} from "./sidebar.types";
import { RLSidebarTheme } from "./sidebar.theme";
import { RLBadge } from "../badge/RLBadge";
import { RLIcon } from "../icon/RLIcon";
import { RLButton } from "../button/RLButton";
import { RLLink } from "../link/RLLink";
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

const SidebarItemList = (props: SidebarItemListProps): JSX.Element => {
  return (
    <div class={props.itemClasses.itemsContainer}>
      <For each={props.items}>
        {(item) => {
          const hasChildren = () => (item.children?.length ?? 0) > 0;
          const isActive = () => item.active || hasActiveChild(item);
          const badge = () => normalizeBadge(item.badge);

          return (
            <div
              class={props.depth === 1 ? props.itemClasses.item : undefined}
              data-slot={props.depth === 1 ? "item" : undefined}
            >
              <Show
                when={hasChildren()}
                fallback={
                  <RLLink
                    localize={false}
                    href={item.href ?? "#"}
                    class={
                      props.depth === 1 ? props.itemClasses.itemLink : props.itemClasses.subItemLink
                    }
                    data-active={isActive() ? "" : undefined}
                    aria-current={isActive() ? "page" : undefined}
                  >
                    <Show when={item.icon}>
                      {(icon) => (
                        <RLIcon
                          name={icon()}
                          class={
                            props.depth === 1
                              ? props.itemClasses.itemIcon
                              : props.itemClasses.subItemIcon
                          }
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
                          class={props.itemClasses.itemBadge}
                          data-slot="item-badge"
                        >
                          {b().label}
                        </RLBadge>
                      )}
                    </Show>
                  </RLLink>
                }
              >
                <details open={isActive()} class={props.itemClasses.itemDetails}>
                  <summary
                    class={
                      props.depth === 1
                        ? props.itemClasses.itemSummary
                        : props.itemClasses.subItemLink
                    }
                    data-active={isActive() ? "" : undefined}
                    data-slot="item-summary"
                  >
                    <Show when={item.icon}>
                      {(icon) => (
                        <RLIcon
                          name={icon()}
                          class={
                            props.depth === 1
                              ? props.itemClasses.itemIcon
                              : props.itemClasses.subItemIcon
                          }
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
                          class={props.itemClasses.itemBadge}
                          data-slot="item-badge"
                        >
                          {b().label}
                        </RLBadge>
                      )}
                    </Show>
                    <RLIcon name="chevron-right" class={props.itemClasses.itemChevron} />
                  </summary>
                  <div
                    class={
                      props.depth === 1
                        ? props.itemClasses.itemChildren
                        : props.itemClasses.subItemChildren
                    }
                  >
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

  const [offcanvasOpen, setOffcanvasOpen] = createSignal(false);

  return (
    <>
      <Tag
        class={classes().root}
        data-slot="root"
        data-theme={theme()}
        data-sidebar
        data-open={offcanvasOpen() ? "" : undefined}
        {...rest}
      >
        <div class={classes().header} data-slot="header">
          <Show
            when={slots.headerSlot()}
            fallback={
              <Show when={props.logo}>
                <span data-slot="logo-wrapper" class={classes().logoWrapper}>
                  <RLIcon name="layers" class={classes().logoIcon} />
                  <span class={classes().logoText}>{props.logo}</span>
                </span>
              </Show>
            }
          >
            {slots.headerSlot()}
          </Show>
        </div>

        <div class={classes().content} data-slot="content">
          <Show
            when={children()}
            fallback={
              <SidebarItemList items={props.items ?? []} depth={1} itemClasses={classes()} />
            }
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
        <RLButton
          type="button"
          data-sidebar-toggle
          class={classes().toggleButton}
          aria-label={uiT("sidebar.toggle")}
          aria-expanded={offcanvasOpen() ? "true" : "false"}
          onClick={() => setOffcanvasOpen((open) => !open)}
        >
          <RLIcon name="panel-left" class={classes().toggleIcon} />
        </RLButton>
      </Show>
    </>
  );
};
