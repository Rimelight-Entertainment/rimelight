import type { RLDashboardSidebarProps } from "./dashboard-sidebar.types";
import { RLDashboardSidebarTheme } from "./dashboard-sidebar.theme";
import { onSettled, Show, type Component } from "solid-js";
import { createControllable } from "../../controllable";

const OMIT_KEYS = [
  "collapsible",
  "collapsed",
  "defaultCollapsed",
  "onCollapseChange",
  "openMobile",
  "defaultOpenMobile",
  "onOpenMobileChange",
] as const;

export const RLDashboardSidebar: Component<RLDashboardSidebarProps> = (props) => {
  const [isCollapsed, setCollapsed] = createControllable(
    () => props.collapsed,
    props.defaultCollapsed ?? false,
    props.onCollapseChange,
  );
  const [isMobileOpen, setMobileOpen] = createControllable(
    () => props.openMobile,
    props.defaultOpenMobile ?? false,
    props.onOpenMobileChange,
  );

  const { Tag, classes, rest, slots, children, theme } = RLDashboardSidebarTheme.setup(props, {
    slots: ["headerSlot", "footerSlot"] as const,
    omit: OMIT_KEYS,
  });

  let rootEl: HTMLElement | undefined;

  onSettled(() => {
    const handleClick = (e: MouseEvent) => {
      const target = e.target as Element | null;
      if (!target) return;

      const toggle = target.closest<HTMLElement>("[data-dashboard-toggle]");
      if (toggle) {
        const toggleType = toggle.dataset["dashboardToggle"];
        if (toggleType === "mobile") {
          setMobileOpen(!isMobileOpen());
        }
        if (toggleType === "collapse" && props.collapsible === true) {
          setCollapsed(!isCollapsed());
        }
        return;
      }

      if (isMobileOpen() && rootEl?.contains(target) && target.closest("a")) {
        setMobileOpen(false);
      }
    };

    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isMobileOpen()) {
        setMobileOpen(false);
      }
    };

    document.addEventListener("click", handleClick);
    document.addEventListener("keydown", handleKey);

    return () => {
      document.removeEventListener("click", handleClick);
      document.removeEventListener("keydown", handleKey);
    };
  });

  return (
    <>
      <div
        data-dashboard-sidebar-overlay
        data-slot="overlay"
        data-mobile-open={isMobileOpen() ? "" : undefined}
        class={classes().overlay}
        onClick={() => setMobileOpen(false)}
      />

      <Tag
        ref={(el: HTMLElement) => {
          rootEl = el;
        }}
        data-dashboard-sidebar
        data-side={props.side ?? "left"}
        data-collapsible={props.collapsible === true ? "" : undefined}
        data-collapsed={props.collapsible === true && isCollapsed() ? "" : undefined}
        data-mobile-open={isMobileOpen() ? "" : undefined}
        data-slot="root"
        data-theme={theme()}
        class={classes().root}
        {...rest}
      >
        <Show when={slots.headerSlot()}>
          <div data-slot="header" class={classes().header}>
            {slots.headerSlot()}
          </div>
        </Show>

        <div data-slot="body" class={classes().body}>
          {children()}
        </div>

        <Show when={slots.footerSlot()}>
          <div data-slot="footer" class={classes().footer}>
            {slots.footerSlot()}
          </div>
        </Show>
      </Tag>
    </>
  );
};
