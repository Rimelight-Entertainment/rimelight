import type { RLDashboardNavbarProps } from "./dashboard-navbar.types";
import { RLDashboardNavbarTheme } from "./dashboard-navbar.theme";
import { type Component } from "solid-js";
import { RLIcon } from "../icon/RLIcon";

const OMIT_KEYS = [
  "icon",
  "title",
  "toggle",
  "toggleSide",
  "leftSlot",
  "rightSlot",
  "centerSlot",
  "titleSlot",
  "leadingSlot",
  "trailingSlot",
] as const;

export const RLDashboardNavbar: Component<RLDashboardNavbarProps> = (props) => {
  const showToggle = () => props.toggle ?? true;
  const toggleSide = () => props.toggleSide ?? "left";

  const {
    Tag: Root,
    classes,
    rest,
  } = RLDashboardNavbarTheme.setup(props, {
    as: "header",
    omit: OMIT_KEYS,
    variants: () => ({ toggleSide: toggleSide() }),
  });

  const leftToggle = () =>
    showToggle() && toggleSide() === "left" ? (
      <button
        type="button"
        data-dashboard-toggle="mobile"
        class={`${classes().toggle} lg:hidden`}
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
        class={`${classes().toggle} lg:hidden`}
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
            <RLIcon name={props.icon} class={classes().icon} data-slot="icon" />
          ) : null)}
        <h1 data-slot="title" class={classes().title}>
          {"titleSlot" in props ? props.titleSlot : props.title}
        </h1>
        {props.trailingSlot}
      </>
    );
  };

  const centerContent = () =>
    "centerSlot" in props || "children" in props ? (
      <div data-slot="center" class={classes().center}>
        {"centerSlot" in props ? props.centerSlot : props.children}
      </div>
    ) : null;

  const navbarBody = () => (
    <>
      <div data-slot="left" class={classes().left}>
        {leftToggle()}
        {leftContent()}
      </div>

      {centerContent()}

      <div data-slot="right" class={classes().right}>
        {props.rightSlot}
        {rightToggle()}
      </div>
    </>
  );

  return (
    <Root class={classes().root} data-slot="root" {...rest}>
      {navbarBody()}
    </Root>
  );
};
