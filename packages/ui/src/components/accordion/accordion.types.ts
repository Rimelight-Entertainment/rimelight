import type { ClassValue, SlotRenderer, ThemeUI } from "../../types";
import type { InferThemeProps } from "../../resolver";
import type { RLAccordionTheme } from "./accordion.theme";

export interface AccordionItem {
  /**
   * Visible label of the trigger.
   */
  label?: string | undefined;
  /**
   * Unique value identifying the item. Used for controlled state (`value` / `defaultValue`).
   * Falls back to the item index as a string.
   */
  value?: string | undefined;
  /**
   * Icon name rendered before the label.
   */
  icon?: string | undefined;
  /**
   * Icon name rendered after the label. Overrides the component's `trailingIcon`.
   */
  trailingIcon?: string | undefined;
  /**
   * Body content rendered when the item is open.
   */
  content?: string | undefined;
  /**
   * Disables this item.
   * @default false
   */
  disabled?: boolean | undefined;
  /**
   * Per-item slot class overrides, merged over the component `ui`.
   */
  ui?: ThemeUI | undefined;
  /**
   * Additional classes for this item's root slot.
   */
  class?: ClassValue | undefined;
}

export type AccordionValue = string | string[] | undefined;

export type RLAccordionProps = InferThemeProps<typeof RLAccordionTheme> & {
  /**
   * An array of accordion items to render.
   */
  items?: AccordionItem[] | undefined;
  /**
   * The summary text displayed when the accordion is collapsed (single-item usage, no `items`).
   */
  summary?: string | undefined;
  /**
   * Whether one or several items can be open at a time.
   * @default "single"
   */
  type?: "single" | "multiple" | undefined;
  /**
   * When `type` is `"single"`, allows closing the open item by clicking its trigger.
   * Ignored when `type` is `"multiple"`.
   * @default true
   */
  collapsible?: boolean | undefined;
  /**
   * Initially open value(s) when uncontrolled. A string for `type="single"`, an array for `type="multiple"`.
   */
  defaultValue?: string | string[] | undefined;
  /**
   * Controlled open value(s). A string for `type="single"`, an array for `type="multiple"`.
   * Pair with `onValueChange`.
   */
  value?: string | string[] | undefined;
  /**
   * Called with the next open value(s) whenever the user changes them.
   */
  onValueChange?: ((value: AccordionValue) => void) | undefined;
  /**
   * Icon name displayed on the right side of each trigger, resolved via RLIcon.
   * @default "chevron-down"
   */
  trailingIcon?: string | undefined;
  /**
   * Prevents the user from interacting with the accordion and all its items.
   * @default false
   */
  disabled?: boolean | undefined;
  /**
   * When `true`, collapsed content is unmounted from the DOM. When `false`, content stays mounted
   * and is hidden natively by the closed `<details>`.
   * @default true
   */
  unmountOnHide?: boolean | undefined;
  /**
   * Explicit native group name for the `<details>` items. When omitted no `name` renders, so
   * independent accordions never merge into one native group.
   */
  name?: string | undefined;
  /**
   * Custom leading content per item. Falls back to `item.icon`.
   */
  leadingSlot?: SlotRenderer<{ item: AccordionItem; index: number }>;
  /**
   * Custom trailing content per item. Falls back to the `trailingIcon` prop or `item.trailingIcon`.
   */
  trailingSlot?: SlotRenderer<{ item: AccordionItem; index: number }>;
  /**
   * Custom body content per item. Falls back to `item.content`.
   */
  bodySlot?: SlotRenderer<{ item: AccordionItem; index: number }>;
};
