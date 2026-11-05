import type { JSX } from "@solidjs/web";
import type { InferThemeProps } from "../../resolver";
import type { RLLinkTheme } from "./link.theme";

/**
 * Navigation link. Renders an `<a>`, adds external-link handling and a screen-reader hint.
 */
export type RLLinkProps = InferThemeProps<typeof RLLinkTheme> & {
  /**
   * The text label displayed inside the link. Alternative to passing children.
   * @default undefined
   */
  label?: string | undefined;

  /**
   * Icon name displayed before the link label.
   * @default undefined
   */
  leadingIcon?: string | undefined;

  /**
   * Icon name displayed after the link label. Replaces the external icon when set.
   * @default undefined
   */
  trailingIcon?: string | undefined;

  /**
   * Custom JSX rendered before the label. Replaces `leadingIcon`.
   * @default undefined
   */
  leadingSlot?: JSX.Element;

  /**
   * Custom JSX rendered after the label. Replaces `trailingIcon` and the external icon.
   * @default undefined
   */
  trailingSlot?: JSX.Element;

  /**
   * The URL the link points to.
   * @default undefined
   */
  href?: string | undefined;

  /**
   * Localize an internal `href` (one starting with `/`) for the current locale.
   * Pass a locale code to link to that locale instead, or `false` to leave the href as-is.
   * External, relative, API and file paths are never changed.
   * @default true
   */
  localize?: boolean | string | undefined;

  /**
   * Forces the link to be treated as an external link.
   * @default false
   */
  external?: boolean | undefined;

  /**
   * Custom external link icon name.
   * @default "external-link"
   */
  externalIcon?: string | undefined;

  /**
   * Suppress the automatic external link icon.
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
   * Suppress the `rel` attribute entirely, including the default external-link value.
   * @default false
   */
  noRel?: boolean | undefined;

  /**
   * Value of `aria-current` when the link is active.
   * @default "page"
   */
  current?: "page" | "step" | "location" | "date" | "time" | "true" | "false" | undefined;

  /**
   * Screen reader accessibility label. When omitted on external links, "(opens in a new tab)" is
   * appended automatically.
   * @default undefined
   */
  "aria-label"?: string | undefined;

  /**
   * Marks the link as the current location. Applies active styling and `aria-current`.
   * @default false
   */
  active?: boolean | undefined;

  /**
   * Disables the link. Removes `href` and applies disabled styling and `aria-disabled`.
   * @default false
   */
  disabled?: boolean | undefined;
};
