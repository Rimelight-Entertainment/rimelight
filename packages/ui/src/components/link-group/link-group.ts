import type { JSX } from "@solidjs/web";
import type { Theme } from "../../types";
import type { RLLinkProps } from "../link/link";

export interface RLLinkGroupProps {
  /**
   * The direct text label of the group heading.
   */
  label?: string | undefined;
  /**
   * Leading icon of the group heading.
   */
  leadingIcon?: string | undefined;
  /**
   * Trailing icon of the group heading.
   */
  trailingIcon?: string | undefined;
  /**
   * Hyperlink target URL for the group heading.
   */
  href?: string | undefined;
  /**
   * The links in the group. Supports full button/link properties.
   */
  links?: RLLinkProps | RLLinkProps[] | undefined;
  /**
   * Slot-specific CSS class overrides.
   */
  ui?: any;
  /**
   * Force a color-scheme context on the link group.
   */
  theme?: Theme | undefined;
  /**
   * Additional CSS classes to apply to the root element.
   */
  class?: any;
  children?: JSX.Element;
  [key: string]: unknown;
}
