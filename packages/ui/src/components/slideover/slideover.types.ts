import type { JSX } from "@solidjs/web";
import type { InferThemeProps } from "../../resolver";
import type { SlotRenderer } from "../../types";
import type { RLSlideoverTheme } from "./slideover.theme";

export type SlideoverSide = "top" | "right" | "bottom" | "left";

export type RLSlideoverProps = Omit<
  InferThemeProps<typeof RLSlideoverTheme>,
  "side" | "children"
> & {
  /**
   * Edge the sheet slides in from.
   *
   * @default "left"
   */
  side?: SlideoverSide | undefined;
  /**
   * Controlled open state.
   */
  open?: boolean | undefined;
  /**
   * Initial open state when uncontrolled.
   *
   * @default false
   */
  defaultOpen?: boolean | undefined;
  /**
   * Title of the sheet. Use `titleSlot` for JSX.
   */
  title?: string | undefined;
  /**
   * Description of the sheet. Use `descriptionSlot` for JSX.
   */
  description?: string | undefined;
  /**
   * Label of a default trigger button. Rendered only when `triggerSlot` is not set.
   */
  triggerLabel?: string | undefined;
  /**
   * Whether the sheet can be dismissed by the close button, Escape, or clicking the backdrop.
   *
   * @default true
   */
  dismissible?: boolean | undefined;
  /**
   * Keep content mounted in the DOM when hidden.
   *
   * @default true
   */
  unmountOnHide?: boolean | undefined;
  /**
   * Render in a portal attached to `document.body` or the given element.
   * Set to false to render inline.
   *
   * @default true
   */
  portal?: boolean | HTMLElement | undefined;
  /**
   * Body content of the sheet.
   */
  children?: JSX.Element | undefined;
  /**
   * Trigger element. Replaces the default trigger button.
   */
  triggerSlot?: SlotRenderer | undefined;
  /**
   * Title content. Takes precedence over the `title` string.
   */
  titleSlot?: SlotRenderer | undefined;
  /**
   * Description content. Takes precedence over the `description` string.
   */
  descriptionSlot?: SlotRenderer | undefined;
  /**
   * Footer content rendered below the body.
   */
  footerSlot?: SlotRenderer | undefined;
  /**
   * Called whenever the open state changes.
   */
  onOpenChange?: ((open: boolean) => void) | undefined;
};
