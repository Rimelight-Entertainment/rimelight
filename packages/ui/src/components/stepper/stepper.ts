export interface StepperItem {
  title?: string
  description?: string
  content?: string
  icon?: string
  value?: string | number
  disabled?: boolean
  slot?: string
  class?: any
  ui?: Record<string, any>
  [key: string]: any
}

export interface StepperProps {
  items?: StepperItem[]
  value?: string | number
  defaultValue?: string | number
  modelValue?: string | number
  valueKey?: string
  linear?: boolean
  disabled?: boolean
  orientation?: "horizontal" | "vertical"
  size?: "xs" | "sm" | "md" | "lg" | "xl"
  color?: "primary" | "secondary" | "success" | "info" | "warning" | "error" | "neutral"
  ui?: any
  class?: any
  [key: string]: unknown
}
