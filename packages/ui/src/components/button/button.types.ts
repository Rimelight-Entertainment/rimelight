import type { JSX } from "@solidjs/web";
import type { Theme, ThemeColor } from "../../types";
import type { RLAvatarProps } from "../avatar/avatar.types";

export type ButtonClickHandler = (event: MouseEvent) => unknown;

export interface RLButtonProps {
  /**
   * The text label displayed inside the button.
   */
  label?: string | undefined;
  /**
   * The color scheme applied to the button.
   * @default 'primary'
   */
  color?:
    | "error"
    | "primary"
    | "secondary"
    | "success"
    | "info"
    | "warning"
    | "neutral"
    | ThemeColor
    | undefined;
  /**
   * Color used when button is in active state.
   */
  activeColor?:
    | "error"
    | "primary"
    | "secondary"
    | "success"
    | "info"
    | "warning"
    | "neutral"
    | ThemeColor
    | undefined;
  /**
   * The visual style variant of the button.
   * @default 'solid'
   */
  variant?: "solid" | "outline" | "soft" | "subtle" | "ghost" | "link" | undefined;
  /**
   * Variant used when button is in active state.
   */
  activeVariant?: "solid" | "outline" | "soft" | "subtle" | "ghost" | "link" | undefined;
  /**
   * The size scale of the button.
   * @default 'md'
   */
  size?: "xs" | "sm" | "md" | "lg" | "xl" | undefined;
  /**
   * Render the button with equal padding on all sides.
   */
  square?: boolean | undefined;
  /**
   * Render the button full width.
   */
  block?: boolean | undefined;
  /**
   * Set loading state automatically based on the `@click` / `onClick` promise state.
   */
  loadingAuto?: boolean | undefined;
  /**
   * Display an icon based on the `leading` and `trailing` props.
   */
  icon?: any;
  /**
   * Display an avatar on the left side.
   */
  avatar?: RLAvatarProps | string | undefined;
  /**
   * When `true`, the icon will be displayed on the left side. Also accepts slot JSX.
   */
  leading?: JSX.Element;
  /**
   * Display an icon on the left side.
   */
  leadingIcon?: any;
  /**
   * Slot content rendered in leading position.
   */
  leadingSlot?: JSX.Element;
  /**
   * When `true`, the icon will be displayed on the right side. Also accepts slot JSX.
   */
  trailing?: JSX.Element;
  /**
   * Display an icon on the right side.
   */
  trailingIcon?: any;
  /**
   * Slot content rendered in trailing position.
   */
  trailingSlot?: JSX.Element;
  /**
   * When `true`, the loading icon is displayed and the button is disabled.
   */
  loading?: boolean | undefined;
  /**
   * The icon when the `loading` prop is `true`.
   * @default 'loaderCircle'
   */
  loadingIcon?: any;
  /**
   * Force the link / button to be active independent of the current route.
   */
  active?: boolean | undefined;
  /**
   * Class to apply when the button / link is active.
   */
  activeClass?: string | undefined;
  /**
   * Class to apply when the button / link is inactive.
   */
  inactiveClass?: string | undefined;
  /**
   * Class to apply when the link is exact active.
   */
  exactActiveClass?: string | undefined;
  /**
   * Value passed to the attribute `aria-current` when the link is exact active.
   * @default 'page'
   */
  ariaCurrentValue?: "page" | "step" | "location" | "date" | "time" | "true" | "false" | undefined;
  /**
   * The type of the button when not a link.
   * @default 'button'
   */
  type?: "reset" | "submit" | "button" | undefined;
  /**
   * The element or component this component should render as when not a link.
   * @default 'button'
   */
  as?: any;
  /**
   * Field group style variation when grouped in input or button groups.
   */
  fieldGroup?: "horizontal" | "vertical" | undefined;
  /**
   * Horizontal alignment of content inside the button flex container.
   */
  justify?: "start" | "center" | "end" | "between" | "around" | "evenly" | undefined;
  /**
   * Rounded button corners or pill shape.
   */
  rounded?: boolean | string | undefined;
  /**
   * Theme mode override — pins colors to flat, light, or dark mode.
   */
  theme?: Theme | undefined;
  /**
   * If true, no rel attribute will be added to the link.
   */
  noRel?: boolean | undefined;
  /**
   * Accessible aria-label for screen readers.
   */
  ariaLabel?: string | undefined;
  /**
   * Element ID that labels this button for screen readers.
   */
  ariaLabelledby?: string | undefined;
  /**
   * Slot-specific CSS class overrides.
   */
  ui?: any;
  /**
   * Additional CSS classes to apply to the root element.
   */
  class?: any;
  className?: any;
  /**
   * Default slot children.
   */
  children?: JSX.Element;
  /**
   * Click event handler. Accepts a single handler or an array of handlers.
   */
  onClick?: ButtonClickHandler | ButtonClickHandler[] | undefined;
  /**
   * Disables the link, preventing navigation and applying disabled styling.
   *
   * @default false
   */
  disabled?: boolean | undefined;
  /**
   * The URL the link points to.
   */
  href?: string | undefined;
  /**
   * Alias for `href`.
   */
  to?: string | undefined;
  /**
   * Marks the link as external. External URLs are still detected for `target`/`rel` and the
   * screen-reader hint, but the external icon is only rendered when this prop is explicitly `true`.
   * Never rendered on icon-only buttons.
   *
   * @default false
   */
  external?: boolean | undefined;
  /**
   * Custom external link icon name.
   *
   * @default "externalLink"
   */
  externalIcon?: string | undefined;
  /**
   * Suppress the external link icon.
   *
   * @default false
   */
  noExternalIcon?: boolean | undefined;
  /**
   * Where to open the linked URL. External links default to `"_blank"`.
   *
   * @default undefined
   */
  target?: string | undefined;
  /**
   * Relationship of the linked URL. External links default to `"noopener noreferrer"`. Set to empty
   * string to suppress the attribute entirely.
   *
   * @default undefined
   */
  rel?: string | null | undefined;
  /**
   * Enables Astro's built-in prefetch strategy.
   *
   * @default undefined;
   */
  prefetch?: boolean | "hover" | "tap" | "load" | "viewport" | undefined;
  /**
   * When true, only `class` is applied — all default theme styles are skipped.
   *
   * @default false
   */
  raw?: boolean | undefined;
  [key: string]: unknown;
}
