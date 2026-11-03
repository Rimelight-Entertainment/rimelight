import type { SlotRenderer } from "../../types";
import type { InferThemeProps } from "../../resolver";
import type { RLCollapsibleTheme } from "./collapsible.theme";

export interface CollapsibleSlotContext {
  open: boolean;
}

export type RLCollapsibleProps = InferThemeProps<typeof RLCollapsibleTheme> & {
  /**
   * When `true`, prevents the user from interacting with the collapsible.
   * @default false
   */
  disabled?: boolean | undefined;
  /**
   * The open state when initially rendered, when uncontrolled.
   * @default false
   */
  defaultOpen?: boolean | undefined;
  /**
   * The controlled open state. Pair with `onOpenChange`.
   */
  open?: boolean | undefined;
  /**
   * Called with the next open state when the user toggles the collapsible.
   */
  onOpenChange?: ((open: boolean) => void) | undefined;
  /**
   * When `true`, the content is unmounted while closed. When `false`, it stays mounted and is hidden.
   * @default true
   */
  unmountOnHide?: boolean | undefined;
  /**
   * Trigger element. Receives `{ open }`. When set, `children` renders as the content.
   */
  triggerSlot?: SlotRenderer<CollapsibleSlotContext>;
  /**
   * Body element. Receives `{ open }`. When set, `children` renders as the trigger unless `triggerSlot` is set.
   */
  bodySlot?: SlotRenderer<CollapsibleSlotContext>;
};
