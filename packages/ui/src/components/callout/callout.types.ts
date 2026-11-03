import type { JSX } from "@solidjs/web";
import type { InferThemeProps } from "../../resolver";
import type { RLButtonProps } from "../button/button.types";
import type { RLCalloutTheme } from "./callout.theme";

export type RLCalloutProps = Omit<InferThemeProps<typeof RLCalloutTheme>, "title"> & {
  /**
   * Main title text of the callout. Use `titleSlot` for JSX.
   */
  title?: string | undefined;
  /**
   * Secondary description text of the callout. Use `descriptionSlot` for JSX.
   */
  description?: string | undefined;
  /**
   * Icon name displayed at the start of the callout.
   */
  icon?: string | undefined;
  /**
   * Avatar configuration or image source URL.
   */
  avatar?: { src: string; alt: string } | string | undefined;
  /**
   * Action buttons. Rendered under the content when `orientation` is `vertical`, and next to the
   * close button when `orientation` is `horizontal`.
   */
  actions?: RLButtonProps[] | undefined;
  /**
   * Whether the callout shows a close button and can be dismissed.
   *
   * @default true
   */
  dismissible?: boolean | undefined;
  /**
   * Icon name displayed in the close button.
   *
   * @default "x"
   */
  closeIcon?: string | undefined;
  /**
   * Controlled open state. Dismissal sets it to `false` through `onOpenChange`.
   */
  open?: boolean | undefined;
  /**
   * Initial open state when uncontrolled.
   *
   * @default true
   */
  defaultOpen?: boolean | undefined;
  /**
   * Called whenever the open state changes.
   */
  onOpenChange?: ((open: boolean) => void) | undefined;
  /**
   * Called after the callout is dismissed by the user.
   */
  onDismiss?: (() => void) | undefined;
  /**
   * Layout of the actions relative to the content.
   *
   * @default "vertical"
   */
  orientation?: "vertical" | "horizontal" | undefined;
  /**
   * Replaces the leading icon.
   */
  iconSlot?: JSX.Element | undefined;
  /**
   * Replaces the title text.
   */
  titleSlot?: JSX.Element | undefined;
  /**
   * Content rendered between the title and the description.
   */
  headerSlot?: JSX.Element | undefined;
  /**
   * Replaces the description text.
   */
  descriptionSlot?: JSX.Element | undefined;
  /**
   * Replaces the action buttons.
   */
  actionsSlot?: JSX.Element | undefined;
  /**
   * Replaces the close button.
   */
  closeSlot?: JSX.Element | undefined;
  /**
   * Replaces the avatar.
   */
  avatarSlot?: JSX.Element | undefined;
  /**
   * Accessible label of the callout.
   */
  "aria-label"?: string | undefined;
  /**
   * Accessible labelledby override.
   */
  "aria-labelledby"?: string | undefined;
  /**
   * Accessible describedby override.
   */
  "aria-describedby"?: string | undefined;
};
