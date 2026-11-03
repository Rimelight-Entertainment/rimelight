import type { ValidComponent } from "@solidjs/web";
import type { JSX } from "@solidjs/web";
import type { Theme } from "../../types";
import type {
  RLCheckboxColor,
  RLCheckboxIndicator,
  RLCheckboxSize,
  RLCheckboxUiSlots,
} from "../checkbox/checkbox.types";
import type { InferThemeProps } from "../../resolver";
import type { RLCheckboxGroupTheme } from "./checkbox-group.theme";

export type RLCheckboxGroupItemValue = string | number;

export interface RLCheckboxGroupItemObject {
  label?: string | undefined;
  description?: string | undefined;
  disabled?: boolean | undefined;
  value?: RLCheckboxGroupItemValue | undefined;
  id?: string | undefined;
  icon?: string | undefined;
  class?: string | undefined;
  ui?:
    | (Partial<{
        item?: string | undefined;
      }> &
        Omit<RLCheckboxUiSlots, "root">)
    | undefined;
  [key: string]: any;
}

export type RLCheckboxGroupItem = RLCheckboxGroupItemValue | RLCheckboxGroupItemObject;

export type RLCheckboxGroupOrientation = "horizontal" | "vertical";
export type RLCheckboxGroupLayout = "list" | "card" | "table";

export interface RLCheckboxGroupUiSlots {
  root?: string | undefined;
  fieldset?: string | undefined;
  legend?: string | undefined;
  item?: string | undefined;
}

export type RLCheckboxGroupProps<
  T extends RLCheckboxGroupItem = RLCheckboxGroupItem,
  V = RLCheckboxGroupItemValue,
> = Omit<InferThemeProps<typeof RLCheckboxGroupTheme>, "onChange"> & {
  /**
   * The element or component this component should render as.
   * @default 'div'
   */
  as?: ValidComponent;

  /**
   * Group legend or title.
   */
  legend?: string | undefined;

  /**
   * When `items` is an array of objects, select the field to use as the value.
   * @default 'value'
   */
  valueKey?: string | undefined;

  /**
   * When `items` is an array of objects, select the field to use as the label.
   * @default 'label'
   */
  labelKey?: string | undefined;

  /**
   * When `items` is an array of objects, select the field to use as the description.
   * @default 'description'
   */
  descriptionKey?: string | undefined;

  /**
   * List of items to display as checkboxes.
   */
  items?: T[] | undefined;

  /**
   * The controlled value array of selected values.
   */
  value?: V[] | undefined;

  /**
   * The initial uncontrolled value array.
   */
  defaultValue?: V[] | undefined;

  /**
   * Size scale for all checkboxes in the group.
   * @default 'md'
   */
  size?: RLCheckboxSize | undefined;

  /**
   * Layout preset of the group. `table` renders items as a joined bordered table; `card` renders each item as a tile.
   * @default 'list'
   */
  layout?: RLCheckboxGroupLayout | undefined;

  /**
   * Layout orientation of the items.
   * @default 'vertical'
   */
  orientation?: RLCheckboxGroupOrientation | undefined;

  /**
   * Color theme variant for child checkboxes.
   * @default 'primary'
   */
  color?: RLCheckboxColor | undefined;

  /**
   * Highlight focus state ring.
   * @default false
   */
  highlight?: boolean | undefined;

  /**
   * Indicator position.
   * @default 'start'
   */
  indicator?: RLCheckboxIndicator | undefined;

  /**
   * Checkbox icon.
   * @default 'check'
   */
  icon?: string | undefined;

  /**
   * Whether the entire group is disabled.
   */
  disabled?: boolean | undefined;

  /**
   * Loop keyboard navigation.
   * @default false
   */
  loop?: boolean | undefined;

  /**
   * The maximum number of values that can be selected.
   */
  max?: number | null | undefined;

  /**
   * Form field name for all inputs in the group.
   */
  name?: string | undefined;

  /**
   * Whether selecting at least one item is required.
   */
  required?: boolean | undefined;

  /**
   * Unique ID for the group.
   */
  id?: string | undefined;

  /**
   * Slot-specific CSS class overrides.
   */
  ui?: (RLCheckboxGroupUiSlots & RLCheckboxUiSlots) | undefined;

  /**
   * Additional CSS classes to apply to the root element.
   */
  class?: string | undefined;

  /**
   * Theme mode override.
   */
  theme?: Theme | undefined;

  /**
   * Value change callback for reactive binding.
   */
  onValueChange?: ((value: V[]) => void) | undefined;

  /**
   * Custom legend slot.
   */
  legendSlot?: JSX.Element | undefined;

  /**
   * Custom item label slot renderer.
   */
  labelSlot?:
    | ((props: {
        item: T & {
          id: string;
          label?: string;
          description?: string;
          value?: RLCheckboxGroupItemValue;
        };
      }) => JSX.Element)
    | undefined;

  /**
   * Custom item description slot renderer.
   */
  descriptionSlot?:
    | ((props: {
        item: T & {
          id: string;
          label?: string;
          description?: string;
          value?: RLCheckboxGroupItemValue;
        };
      }) => JSX.Element)
    | undefined;

  /**
   * Custom children (alternative to items prop).
   */
  children?: JSX.Element;
};
