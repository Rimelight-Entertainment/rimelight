import type { RLDashboardNavbarProps } from "./dashboard-navbar.types";
import { RLDashboardNavbarTheme } from "./dashboard-navbar.theme";
import { type Component } from "solid-js";
import { RLIcon } from "../icon/RLIcon";
import { uiT } from "../../locale";

const OMIT_KEYS = ["icon", "title", "toggle", "toggleSide"] as const;

export const RLDashboardNavbar: Component<RLDashboardNavbarProps> = (props) => {
  const showToggle = () => props.toggle ?? true;
  const toggleSide = () => props.toggleSide ?? "left";

  const {
    Tag: Root,
    classes,
    rest,
    slots,
  } = RLDashboardNavbarTheme.setup(props, {
    slots: [
      "leftSlot",
      "centerSlot",
      "rightSlot",
      "leadingSlot",
      "trailingSlot",
      "titleSlot",
    ] as const,
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
        aria-label={uiT("sidebar.toggle")}
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
        aria-label={uiT("sidebar.toggle")}
      >
        <RLIcon name="menu" class="size-5" />
      </button>
    ) : null;

  const leftContent = () => {
    if ("leftSlot" in props) {
      return slots.leftSlot();
    }
    return (
      <>
        {slots.leadingSlot() ??
          (props.icon ? (
            <RLIcon name={props.icon} class={classes().icon} data-slot="icon" />
          ) : null)}
        <h1 data-slot="title" class={classes().title}>
          {"titleSlot" in props ? slots.titleSlot() : props.title}
        </h1>
        {slots.trailingSlot()}
      </>
    );
  };

  const centerContent = () =>
    "centerSlot" in props || "children" in props ? (
      <div data-slot="center" class={classes().center}>
        {"centerSlot" in props ? slots.centerSlot() : props.children}
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
        {slots.rightSlot()}
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
