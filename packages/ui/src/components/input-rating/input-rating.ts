import type { ThemeColor } from "../../index"

export interface InputRatingProps {
  /**
   * The component or element the root should render as.
   */
  as?: any
  /**
   * The id of the rating component.
   */
  id?: string
  /**
   * Make the rating readonly (non-interactive).
   *
   * @default false
   */
  readonly?: boolean
  /**
   * The icon displayed for each rating value.
   *
   * @default "star"
   */
  icon?: any
  /**
   * The icon displayed for empty rating values. Defaults to `icon` when not provided.
   */
  emptyIcon?: any
  /**
   * The color theme of the rating component.
   *
   * @default "primary"
   */
  color?: ThemeColor
  /**
   * The size scale of the component.
   *
   * @default "md"
   */
  size?: "xs" | "sm" | "md" | "lg" | "xl"
  /**
   * The orientation of the rating items.
   *
   * @default "horizontal"
   */
  orientation?: "horizontal" | "vertical"
  /**
   * Slot-specific class overrides.
   */
  ui?: {
    root?: any
    item?: any
    indicator?: any
    icon?: any
    emptyIcon?: any
  }
  /**
   * The granularity each rating item is divided into.
   *
   * @default 1
   */
  step?: 1 | 0.5 | 0.25 | 0.1
  /**
   * When `true`, prevents the user from interacting with rating items.
   */
  disabled?: boolean
  /**
   * When `true`, indicates that the user must set the value before form submission.
   */
  required?: boolean
  /**
   * The name of the field, submitted with form data.
   */
  name?: string
  /**
   * The controlled rating value. Can be bound with v-model.
   */
  modelValue?: number
  /**
   * The initial rating value when rendered.
   *
   * @default 0
   */
  defaultValue?: number
  /**
   * The number of rating items to render.
   *
   * @default 5
   */
  length?: number
  /**
   * When `true`, clicking the currently selected rating resets it to 0.
   *
   * @default false
   */
  clearable?: boolean
  /**
   * When `true`, preview the hovered value when pointer hovers over stars.
   *
   * @default false
   */
  hoverable?: boolean
  /**
   * Additional CSS classes to apply to the root element.
   */
  class?: any
}
