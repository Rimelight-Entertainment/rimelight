import { createMemo, omit, type Component } from "solid-js";
import { Dynamic } from "@solidjs/web";
import type { RLDashboardNavbarProps } from "./dashboard-navbar.types";
import { dashboardNavbarTheme } from "./dashboard-navbar.theme";
import { RLIcon } from "../icon/RLIcon";

export const RLDashboardNavbar: Component<RLDashboardNavbarProps> = (allProps) => {
  const props = allProps;
  const rest = omit(
    allProps,
    "as",
    "icon",
    "title",
    "toggle",
    "toggleSide",
    "ui",
    "class",
    "children",
    "leftSlot",
    "rightSlot",
    "centerSlot",
    "titleSlot",
    "leadingSlot",
    "trailingSlot",
  );

  const showToggle = () => props.toggle ?? true;
  const toggleSide = () => props.toggleSide ?? "left";

  const resolvedClasses = createMemo(() =>
    dashboardNavbarTheme({
      toggleSide: toggleSide(),
      ui: props.ui,
      class: props.class,
    }),
  );

  const leftToggle = () =>
    showToggle() && toggleSide() === "left" ? (
      <button
        type="button"
        data-dashboard-toggle="mobile"
        class={`${resolvedClasses().toggle} lg:hidden`}
        data-slot="toggle"
        aria-label="Toggle sidebar"
      >
        <RLIcon name="menu" class="size-5" />
      </button>
    ) : null;

  const rightToggle = () =>
    showToggle() && toggleSide() === "right" ? (
      <button
        type="button"
        data-dashboard-toggle="mobile"
        class={`${resolvedClasses().toggle} lg:hidden`}
        data-slot="toggle"
        aria-label="Toggle sidebar"
      >
        <RLIcon name="menu" class="size-5" />
      </button>
    ) : null;

  const leftContent = () => {
    if (props.leftSlot !== undefined) {
      return props.leftSlot;
    }
    return (
      <>
        {props.leadingSlot ??
          (props.icon ? (
            <RLIcon name={props.icon} class={resolvedClasses().icon} data-slot="icon" />
          ) : null)}
        <h1 data-slot="title" class={resolvedClasses().title}>
          {props.titleSlot !== undefined ? props.titleSlot : props.title}
        </h1>
        {props.trailingSlot}
      </>
    );
  };

  const centerContent = () =>
    props.centerSlot !== undefined || props.children !== undefined ? (
      <div data-slot="center" class={resolvedClasses().center}>
        {props.centerSlot !== undefined ? props.centerSlot : props.children}
      </div>
    ) : null;

  const navbarBody = () => (
    <>
      <div data-slot="left" class={resolvedClasses().left}>
        {leftToggle()}
        {leftContent()}
      </div>

      {centerContent()}

      <div data-slot="right" class={resolvedClasses().right}>
        {props.rightSlot}
        {rightToggle()}
      </div>
    </>
  );

  if (props.as) {
    return (
      <Dynamic component={props.as} class={resolvedClasses().root} data-slot="root" {...rest}>
        {navbarBody()}
      </Dynamic>
    );
  }

  return (
    <header class={resolvedClasses().root} data-slot="root" {...rest}>
      {navbarBody()}
    </header>
  );
};
