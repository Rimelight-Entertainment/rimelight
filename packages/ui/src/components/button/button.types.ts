import type { JSX } from "@solidjs/web";
import type { InferThemeProps } from "../../resolver";
import type { RLAvatarProps } from "../avatar/avatar.types";
import type { RLButtonTheme } from "./button.theme";

export type ButtonClickHandler = (event: MouseEvent) => unknown;

type ButtonVariants = InferThemeProps<typeof RLButtonTheme>;

/**
 * Slot accessors used to detect which icon positions have custom JSX.
 */
export type ButtonSlotPresence = {
  leadingSlot: () => unknown;
  trailingSlot: () => unknown;
};

/**
 * Button that renders as a `<button>`, or as an `<a>` when `href` is set.
 */
export type RLButtonProps = Omit<ButtonVariants, "ref"> & {
  /**
   * The text label displayed inside the button.
   * @default undefined
   */
  label?: string | undefined;

  /**
   * Color used when the button is in the active state.
   * @default undefined
   */
  activeColor?: ButtonVariants["color"];

  /**
   * Variant used when the button is in the active state.
   * @default undefined
   */
  activeVariant?: ButtonVariants["variant"];

  /**
   * Whether the button is in the active state. Applies `activeColor`, `activeVariant`, and `activeClass`.
   * @default false
   */
  active?: boolean | undefined;

  /**
   * Shape of the button. `square` is used automatically for icon-only buttons without a label.
   * @default "rounded"
   */
  shape?: ButtonVariants["shape"];

  /**
   * Icon name rendered on both sides. Position follows `leading` and `trailing`.
   * @default undefined
   */
  icon?: string | undefined;

  /**
   * Display an avatar on the left side.
   * @default undefined
   */
  avatar?: RLAvatarProps | string | undefined;

  /**
   * When `true`, the leading icon is displayed. Custom JSX goes in `leadingSlot`.
   * @default false
   */
  leading?: boolean | undefined;

  /**
   * Icon name rendered on the left side.
   * @default undefined
   */
  leadingIcon?: string | undefined;

  /**
   * Custom JSX rendered in the leading position. Replaces `leadingIcon`.
   * @default undefined
   */
  leadingSlot?: JSX.Element;

  /**
   * When `true`, the trailing icon is displayed. Custom JSX goes in `trailingSlot`.
   * @default false
   */
  trailing?: boolean | undefined;

  /**
   * Icon name rendered on the right side.
   * @default undefined
   */
  trailingIcon?: string | undefined;

  /**
   * Custom JSX rendered in the trailing position. Replaces `trailingIcon`.
   * @default undefined
   */
  trailingSlot?: JSX.Element;

  /**
   * When `true`, the loading icon is displayed and the button is disabled.
   * @default false
   */
  loading?: boolean | undefined;

  /**
   * Icon name shown while `loading` is `true`.
   * @default "loader-circle"
   */
  loadingIcon?: string | undefined;

  /**
   * Set loading state automatically based on the `onClick` promise state.
   * @default false
   */
  loadingAuto?: boolean | undefined;

  /**
   * Class applied when `active` is `true`.
   * @default undefined
   */
  activeClass?: string | undefined;

  /**
   * Class applied when `active` is `false`.
   * @default undefined
   */
  inactiveClass?: string | undefined;

  /**
   * Value of `aria-current` when the link is the current item.
   * @default "page"
   */
  current?: "page" | "step" | "location" | "date" | "time" | "true" | "false" | undefined;

  /**
   * The type of the button when not a link.
   * @default "button"
   */
  type?: "reset" | "submit" | "button" | undefined;

  /**
   * Click handler. Accepts a single handler or an array of handlers.
   * @default undefined
   */
  onClick?: ButtonClickHandler | ButtonClickHandler[] | undefined;

  /**
   * Key down handler.
   * @default undefined
   */
  onKeyDown?: ((event: KeyboardEvent) => unknown) | undefined;

  /**
   * Disables the button or link, preventing interaction and applying disabled styling.
   * @default false
   */
  disabled?: boolean | undefined;

  /**
   * The URL the button links to. When set, renders an `<a>`.
   * @default undefined
   */
  href?: string | undefined;

  /**
   * Marks the link as external. Controls `target`/`rel` defaults and the external icon.
   * @default false
   */
  external?: boolean | undefined;

  /**
   * Localize an internal `href` (one starting with `/`) for the current locale.
   * Pass a locale code to link to that locale instead, or `false` to leave the href as-is.
   * @default true
   */
  localize?: boolean | string | undefined;

  /**
   * Icon name used for the external link indicator.
   * @default "external-link"
   */
  externalIcon?: string | undefined;

  /**
   * Suppress the external link icon.
   * @default false
   */
  noExternalIcon?: boolean | undefined;

  /**
   * Where to open the linked URL. External links default to `"_blank"`.
   * @default undefined
   */
  target?: string | undefined;

  /**
   * Relationship of the linked URL. External links default to `"noopener noreferrer"`.
   * Set to an empty string to suppress the attribute.
   * @default undefined
   */
  rel?: string | null | undefined;

  /**
   * If `true`, no `rel` attribute is added to the link.
   * @default false
   */
  noRel?: boolean | undefined;

  /**
   * Accessible label for screen readers.
   * @default undefined
   */
  "aria-label"?: string | undefined;

  /**
   * Element ID that labels this button for screen readers.
   * @default undefined
   */
  "aria-labelledby"?: string | JSX.RemoveAttribute | undefined;

  /**
   * Ref callback for the rendered `button` or `a` element.
   * @default undefined
   */
  ref?: ((el: HTMLElement) => void) | undefined;
};
