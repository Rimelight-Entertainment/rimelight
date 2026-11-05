import type { InferThemeProps } from "../../resolver";
import type { SlotRenderer } from "../../types";
import type { RLButtonProps } from "../button/button.types";
import type { RLBannerTheme } from "./banner.theme";

export type RLBannerProps = Omit<
  InferThemeProps<typeof RLBannerTheme>,
  "contain" | "sticky" | "fixed"
> & {
  /**
   * Title text of the banner. Use `titleSlot` for custom content.
   * @default undefined; the children are used as title when unset.
   */
  title?: string | undefined;
  /**
   * Icon name (built-in name, `set:name`, or `i-<set>-<name>` class) displayed next to the title. Use `iconSlot` for custom content.
   * @default undefined; no icon is rendered when unset.
   */
  icon?: string | undefined;
  /**
   * Action buttons displayed before the close button.
   * @default undefined; no actions are rendered when unset.
   */
  actions?: RLButtonProps[] | undefined;
  /**
   * Whether the banner shows a close button and can be dismissed.
   * Dismissal hides the banner and persists it when `id` is set.
   * @default false
   */
  dismissible?: boolean | undefined;
  /**
   * Icon name (built-in name, `set:name`, or `i-<set>-<name>` class) displayed in the close button.
   * @default "x"
   */
  closeIcon?: string | undefined;
  /**
   * Called after the banner is dismissed.
   * @default undefined
   */
  onDismiss?: (() => void) | undefined;
  /**
   * Whether to contain the banner content within a max-width container.
   * @default true
   */
  contain?: boolean | undefined;
  /**
   * Whether the banner is sticky at the top of the viewport.
   * @default false
   */
  sticky?: boolean | undefined;
  /**
   * Whether the banner is fixed at the top of the viewport.
   * @default false
   */
  fixed?: boolean | undefined;
  /**
   * Position in the header stack.
   * @default 0
   */
  stackIndex?: number | undefined;
  /**
   * Whether to hide the banner when scrolling down and show it when scrolling up.
   * @default false
   */
  hideOnScroll?: boolean | undefined;
  /**
   * Link text. When `href` is set the whole banner becomes a link.
   * @default undefined
   */
  label?: string | undefined;
  /**
   * Icon name (built-in name, `set:name`, or `i-<set>-<name>` class) displayed before the link label.
   * @default undefined
   */
  leadingIcon?: string | undefined;
  /**
   * Icon name (built-in name, `set:name`, or `i-<set>-<name>` class) displayed after the link label. Replaces the external icon when set.
   * @default undefined
   */
  trailingIcon?: string | undefined;
  /**
   * URL the banner links to. Setting it makes the banner a link.
   * @default undefined
   */
  href?: string | undefined;
  /**
   * Forces the link to be treated as an external link.
   * @default false
   */
  external?: boolean | undefined;
  /**
   * Icon name (built-in name, `set:name`, or `i-<set>-<name>` class) for the external link indicator.
   * @default "external-link"
   */
  externalIcon?: string | undefined;
  /**
   * Suppresses the automatic external link icon.
   * @default false
   */
  noExternalIcon?: boolean | undefined;
  /**
   * Where to open the linked URL. External links default to `"_blank"`.
   * @default undefined
   */
  target?: string | undefined;
  /**
   * Relationship of the linked URL. External links default to `"noopener noreferrer"`. Set to an
   * empty string to suppress the attribute.
   * @default undefined
   */
  rel?: string | null | undefined;
  /**
   * Applies active styling to the link.
   * @default undefined
   */
  active?: boolean | undefined;
  /**
   * Disables the link, preventing navigation and applying disabled styling.
   * @default false
   */
  disabled?: boolean | undefined;
  /**
   * Accessible label. For external links "(opens in a new tab)" is appended when omitted.
   * @default undefined
   */
  "aria-label"?: string | undefined;
  /**
   * Value of `aria-current` when the link is the current page.
   * @default "page"
   */
  "aria-current"?:
    | "page"
    | "step"
    | "location"
    | "date"
    | "time"
    | "true"
    | "false"
    | boolean
    | undefined;
  /**
   * Replaces the icon.
   * @default undefined
   */
  iconSlot?: SlotRenderer;
  /**
   * Content rendered in the left area.
   * @default undefined
   */
  leadingSlot?: SlotRenderer;
  /**
   * Replaces the title text.
   * @default undefined
   */
  titleSlot?: SlotRenderer;
  /**
   * Replaces the center area (icon and title).
   * @default undefined
   */
  centerSlot?: SlotRenderer;
  /**
   * Content rendered in the right area, before actions and the close button.
   * @default undefined
   */
  trailingSlot?: SlotRenderer;
  /**
   * Replaces the action buttons.
   * @default undefined
   */
  actionsSlot?: SlotRenderer;
  /**
   * Replaces the close button.
   * @default undefined
   */
  closeSlot?: SlotRenderer;
};
