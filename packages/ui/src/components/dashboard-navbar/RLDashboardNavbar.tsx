import type { RLDashboardNavbarProps } from "./dashboard-navbar.types";
import { RLDashboardNavbarTheme } from "./dashboard-navbar.theme";
import { createMemo, omit, type Component } from "solid-js";
import { dynamic } from "@solidjs/web";
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
    RLDashboardNavbarTheme({
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
    if ("leftSlot" in props) {
      return props.leftSlot;
    }
    return (
      <>
        {props.leadingSlot ??
          (props.icon ? (
            <RLIcon name={props.icon} class={resolvedClasses().icon} data-slot="icon" />
          ) : null)}
        <h1 data-slot="title" class={resolvedClasses().title}>
          {"titleSlot" in props ? props.titleSlot : props.title}
        </h1>
        {props.trailingSlot}
      </>
    );
  };

  const centerContent = () =>
    "centerSlot" in props || "children" in props ? (
      <div data-slot="center" class={resolvedClasses().center}>
        {"centerSlot" in props ? props.centerSlot : props.children}
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

  const Root = dynamic(() => props.as ?? "header");

  return (
    <Root class={resolvedClasses().root} data-slot="root" {...rest}>
      {navbarBody()}
    </Root>
  );
};
