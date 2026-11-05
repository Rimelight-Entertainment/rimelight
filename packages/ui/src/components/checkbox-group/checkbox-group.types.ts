import type { SlotRenderer, ThemeColor } from "../../types";
import type { CheckboxSide, CheckboxSize } from "../checkbox/checkbox.types";
import type { InferThemeProps } from "../../resolver";
import type { RLCheckboxGroupTheme } from "./checkbox-group.theme";

export type CheckboxGroupItemValue = string | number;

export interface CheckboxGroupItemObject {
  label?: string | undefined;
  description?: string | undefined;
  disabled?: boolean | undefined;
  value?: CheckboxGroupItemValue | undefined;
  id?: string | undefined;
  icon?: string | undefined;
  class?: string | undefined;
}

export type CheckboxGroupItem = CheckboxGroupItemValue | CheckboxGroupItemObject;

export type CheckboxGroupOrientation = "horizontal" | "vertical";
export type CheckboxGroupLayout = "list" | "card" | "table";

export type RLCheckboxGroupProps<T extends CheckboxGroupItem = CheckboxGroupItem> = Omit<
  InferThemeProps<typeof RLCheckboxGroupTheme>,
  "onChange" | "highlight" | "disabled"
> & {
  /**
   * Group legend or title.
   */
  legend?: string | undefined;

  /**
   * When `items` is an array of objects, the field used as the value.
   * @default 'value'
   */
  valueKey?: string | undefined;

  /**
   * When `items` is an array of objects, the field used as the label.
   * @default 'label'
   */
  labelKey?: string | undefined;

  /**
   * When `items` is an array of objects, the field used as the description.
   * @default 'description'
   */
  descriptionKey?: string | undefined;

  /**
   * Items rendered as checkboxes.
   */
  items?: T[] | undefined;

  /**
   * The controlled array of selected values.
   */
  value?: CheckboxGroupItemValue[] | undefined;

  /**
   * The initial uncontrolled array of selected values.
   */
  defaultValue?: CheckboxGroupItemValue[] | undefined;

  /**
   * Size scale for all checkboxes in the group.
   * @default 'md'
   */
  size?: CheckboxSize | undefined;

  /**
   * Layout preset of the group. `table` renders items as a joined bordered table; `card` renders each item as a tile.
   * @default 'list'
   */
  layout?: CheckboxGroupLayout | undefined;

  /**
   * Layout orientation of the items.
   * @default 'vertical'
   */
  orientation?: CheckboxGroupOrientation | undefined;

  /**
   * Color theme variant for child checkboxes.
   * @default 'primary'
   */
  color?: ThemeColor | undefined;

  /**
   * Highlight the ring color like a focus state on every child checkbox.
   * @default false
   */
  highlight?: boolean | undefined;

  /**
   * Edge the checkbox box sits on relative to each label.
   * @default 'start'
   */
  side?: CheckboxSide | undefined;

  /**
   * Whether each checkbox box is rendered. When `false`, the icon is rendered above each label instead.
   * @default true
   */
  hasIndicator?: boolean | undefined;

  /**
   * Bare lucide icon name used by every checkbox in the group.
   * @default 'check'
   */
  icon?: string | undefined;

  /**
   * Whether the entire group is disabled.
   */
  disabled?: boolean | undefined;

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
   * Value change callback.
   */
  onValueChange?: ((value: CheckboxGroupItemValue[]) => void) | undefined;

  /**
   * Replaces the legend. Renders instead of the `legend` prop.
   */
  legendSlot?: SlotRenderer;

  /**
   * Replaces each item label. Receives the normalized item.
   */
  labelSlot?: SlotRenderer<{ item: CheckboxGroupItemObject }>;

  /**
   * Replaces each item description. Receives the normalized item.
   */
  descriptionSlot?: SlotRenderer<{ item: CheckboxGroupItemObject }>;
};
