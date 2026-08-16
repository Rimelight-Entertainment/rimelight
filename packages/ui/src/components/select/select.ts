import type { ThemeColor } from "../../types"

export type SelectItem =
  | string
  | number
  | boolean
  | {
      label?: string
      value?: any
      description?: string
      icon?: string
      avatar?: { src?: string; alt?: string; loading?: "lazy" | "eager" }
      chip?: { color?: string }
      disabled?: boolean
      type?: "item" | "label" | "separator"
      class?: any
      [key: string]: any
    }
  | SelectItem[]

export interface SelectProps {
  id?: string
  name?: string
  form?: string
  placeholder?: string
  items?: SelectItem[]
  value?: any
  defaultValue?: any
  modelValue?: any
  createItem?: boolean | "always" | { position?: "top" | "bottom"; when?: "always" | "empty" }
  searchInput?: boolean | { placeholder?: string; icon?: string; variant?: string }
  multiple?: boolean
  clear?: boolean | object
  clearIcon?: string
  valueKey?: string
  labelKey?: string
  descriptionKey?: string
  filterFields?: string[]
  ignoreFilter?: boolean
  disabled?: boolean
  required?: boolean
  color?:
    | ThemeColor
    | "primary"
    | "secondary"
    | "success"
    | "info"
    | "warning"
    | "error"
    | "neutral"
  variant?: "outline" | "soft" | "subtle" | "ghost" | "none"
  size?: "xs" | "sm" | "md" | "lg" | "xl"
  highlight?: boolean
  icon?: string
  leadingIcon?: string
  trailingIcon?: string
  selectedIcon?: string
  loadingIcon?: string
  loading?: boolean
  avatar?: { src?: string; alt?: string; loading?: "lazy" | "eager" }
  label?: string
  ui?: any
  class?: any
  [key: string]: unknown
}
