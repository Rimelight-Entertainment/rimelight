import type { InferThemeProps } from "../../resolver";
import type { SlotRenderer } from "../../types";
import type { RLButtonProps } from "../button/button.types";
import type { RLCalloutTheme } from "./callout.theme";

export type RLCalloutProps = Omit<InferThemeProps<typeof RLCalloutTheme>, "title" | "hasTitle"> & {
  /**
   * Main title text of the callout. Use `titleSlot` for custom content.
   * @default undefined; the title is omitted when unset.
   */
  title?: string | undefined;
  /**
   * Description text of the callout. Use `descriptionSlot` for custom content.
   * @default undefined; the children are used as description when unset.
   */
  description?: string | undefined;
  /**
   * Icon name (built-in name, `set:name`, or `i-<set>-<name>` class) displayed at the start of the callout.
   * @default undefined; no icon is rendered when unset.
   */
  icon?: string | undefined;
  /**
   * Avatar configuration, or an image source URL.
   * @default undefined; no avatar is rendered when unset.
   */
  avatar?: { src: string; alt: string } | string | undefined;
  /**
   * Action buttons. Rendered under the content when `orientation` is `vertical`, and next to the
   * close button when `orientation` is `horizontal`.
   * @default undefined; no actions are rendered when unset.
   */
  actions?: RLButtonProps[] | undefined;
  /**
   * Whether the callout shows a close button and can be dismissed.
   * @default true
   */
  dismissible?: boolean | undefined;
  /**
   * Icon name (built-in name, `set:name`, or `i-<set>-<name>` class) displayed in the close button.
   * @default "x"
   */
  closeIcon?: string | undefined;
  /**
   * Controlled open state. Dismissal sets it to `false` through `onOpenChange`.
   * @default undefined; the callout is uncontrolled.
   */
  open?: boolean | undefined;
  /**
   * Initial open state when uncontrolled.
   * @default true
   */
  defaultOpen?: boolean | undefined;
  /**
   * Called whenever the open state changes.
   * @default undefined
   */
  onOpenChange?: ((open: boolean) => void) | undefined;
  /**
   * Called after the callout is dismissed by the user.
   * @default undefined
   */
  onDismiss?: (() => void) | undefined;
  /**
   * Layout of the actions relative to the content.
   * @default "vertical"
   */
  orientation?: "vertical" | "horizontal" | undefined;
  /**
   * Replaces the leading icon.
   * @default undefined
   */
  iconSlot?: SlotRenderer;
  /**
   * Replaces the title text.
   * @default undefined
   */
  titleSlot?: SlotRenderer;
  /**
   * Replaces the header, rendered between the title and the description.
   * @default undefined
   */
  headerSlot?: SlotRenderer;
  /**
   * Replaces the description text.
   * @default undefined
   */
  descriptionSlot?: SlotRenderer;
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
  /**
   * Replaces the avatar.
   * @default undefined
   */
  avatarSlot?: SlotRenderer;
  /**
   * Accessible label of the callout, used when no title is rendered.
   * @default undefined
   */
  "aria-label"?: string | undefined;
  /**
   * Id of the element that labels the callout. Overrides the title id.
   * @default undefined
   */
  "aria-labelledby"?: string | undefined;
  /**
   * Id of the element that describes the callout. Overrides the description id.
   * @default undefined
   */
  "aria-describedby"?: string | undefined;
};
