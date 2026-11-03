import type { InferThemeProps } from "../../resolver";
import type { RLLinkGroupTheme } from "./link-group.theme";
import type { RLLinkProps } from "../link/link.types";

/**
 * Titled group of navigation links. Renders a `<div>` with a heading and a list.
 */
export type RLLinkGroupProps = InferThemeProps<typeof RLLinkGroupTheme> & {
  /**
   * The direct text label of the group heading.
   * @default undefined
   */
  label?: string | undefined;

  /**
   * Leading icon name of the group heading.
   * @default undefined
   */
  leadingIcon?: string | undefined;

  /**
   * Trailing icon name of the group heading.
   * @default undefined
   */
  trailingIcon?: string | undefined;

  /**
   * Hyperlink target URL for the group heading.
   * @default undefined
   */
  href?: string | undefined;

  /**
   * The links in the group. Each entry takes the full `RLLink` props.
   * @default undefined
   */
  links?: RLLinkProps | RLLinkProps[] | undefined;
};
