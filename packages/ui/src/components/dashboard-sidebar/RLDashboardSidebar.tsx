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
    variants: () => ({ collapsed: props.collapsible === true && isCollapsed() }),
  });

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

      if (target.closest("[data-dashboard-sidebar-mobile] a")) {
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
        class={`${classes().overlay} fixed inset-0 z-40 bg-default/80 backdrop-blur-sm transition-opacity duration-300 ${
          isMobileOpen() ? "block" : "hidden"
        } lg:hidden`}
        onClick={() => setMobileOpen(false)}
      />

      <Tag
        data-dashboard-sidebar
        data-side={props.side}
        data-collapsible={props.collapsible === true ? "true" : "false"}
        data-collapsed={props.collapsible === true && isCollapsed() ? "true" : "false"}
        data-mobile-open={isMobileOpen() ? "true" : "false"}
        data-slot="root"
        data-theme={theme()}
        class={`${classes().root} ${
          isMobileOpen()
            ? "!flex fixed inset-y-0 left-0 z-50 w-72 max-w-[85vw] bg-default shadow-2xl border-e border-default"
            : "hidden lg:flex"
        }`}
        {...rest}
      >
        <Show when={slots.headerSlot() !== undefined}>
          <div data-slot="header" class={classes().header}>
            {slots.headerSlot()}
          </div>
        </Show>

        <div data-slot="body" class={classes().body}>
          {children()}
        </div>

        <Show when={slots.footerSlot() !== undefined}>
          <div data-slot="footer" class={classes().footer}>
            {slots.footerSlot()}
          </div>
        </Show>
      </Tag>
    </>
  );
};
