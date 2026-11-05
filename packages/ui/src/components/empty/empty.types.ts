import type { JSX } from "@solidjs/web";
import type { InferThemeProps } from "../../resolver";
import type { RLAvatarProps } from "../avatar/avatar.types";
import type { RLButtonProps } from "../button/button.types";
import type { RLEmptyTheme } from "./empty.theme";

/**
 * Action rendered as a button in the empty state. Extends the button props.
 */
export type EmptyAction = Omit<RLButtonProps, "children" | "label" | "leadingIcon" | "size"> & {
  /**
   * Button text.
   */
  label: string;

  /**
   * Icon name rendered before the label.
   * @default undefined
   */
  icon?: string;

  /**
   * Target URL. Renders the action as a link; `onClick` is not used when set.
   * @default undefined
   */
  href?: string;
};

/**
 * Empty state props. `@status stable`.
 */
export type RLEmptyProps = InferThemeProps<typeof RLEmptyTheme> & {
  /**
   * Icon displayed above the title.
   * @default undefined
   */
  icon?: string;

  /**
   * Avatar props rendered above the title when no icon is set.
   * @default undefined
   */
  avatar?: RLAvatarProps;

  /**
   * Icon shown while `loading` is true.
   * @default "loader-circle"
   */
  loadingIcon?: string;

  /**
   * Title text. Use `titleSlot` for JSX.
   * @default undefined
   */
  title?: string;

  /**
   * Description text. Use `descriptionSlot` for JSX.
   * @default undefined
   */
  description?: string;

  /**
   * Buttons rendered in the actions area.
   * @default undefined
   */
  actions?: EmptyAction[];

  /**
   * Replaces the header.
   * @default undefined
   */
  headerSlot?: JSX.Element;

  /**
   * Replaces the leading icon or avatar.
   * @default undefined
   */
  leadingSlot?: JSX.Element;

  /**
   * Replaces the title text.
   * @default undefined
   */
  titleSlot?: JSX.Element;

  /**
   * Replaces the description text.
   * @default undefined
   */
  descriptionSlot?: JSX.Element;

  /**
   * Replaces the body (children).
   * @default undefined
   */
  bodySlot?: JSX.Element;

  /**
   * Replaces the actions area.
   * @default undefined
   */
  actionsSlot?: JSX.Element;

  /**
   * Footer content.
   * @default undefined
   */
  footerSlot?: JSX.Element;
};
