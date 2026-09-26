export interface AccordionItem {
  label?: string
  /**
   * Unique value identifying the item. Used for controlled state (`value` / `defaultValue`) and
   * `onChange`. Falls back to the item index as a string.
   */
  value?: string
  icon?: string
  trailingIcon?: string
  content?: string
  disabled?: boolean
  /**
   * Named slot key. Rendered via the root `slots` record (`slots[item.slot]`, or `slots[item.slot +
   * "-body"]` for the body variant), mirroring Nuxt's `#{{ item.slot }}` / `#{{ item.slot }}-body`
   * templates.
   */
  slot?: string
  class?: any
  ui?: {
    item?: any
    trigger?: any
    leadingIcon?: any
    label?: any
    trailingIcon?: any
    content?: any
    body?: any
  }
  [key: string]: unknown
}

export interface AccordionProps {
  /**
   * The element or component the items root should render as (items mode). The single-summary root
   * always renders `<details>` (or `as` when provided).
   */
  as?: any
  /**
   * An array of accordion items to render.
   */
  items?: AccordionItem[]
  /**
   * The summary text displayed when the accordion is collapsed (for single-item usage).
   *
   * Rimelight extra: not in Nuxt UI.
   */
  summary?: string
  /**
   * Determines whether a "single" or "multiple" items can be open at a time.
   *
   * @default "single"
   */
  type?: "single" | "multiple"
  /**
   * Determines whether multiple items can be open at the same time. Alias of `type="multiple"`.
   * When `type` is set it takes precedence.
   *
   * Rimelight extra: not in Nuxt UI (which only has `type`).
   */
  multiple?: boolean
  /**
   * When `type` is `"single"`, allows closing content when clicking the trigger for an open item.
   * When `type` is `"multiple"`, this prop has no effect.
   *
   * @default true
   */
  collapsible?: boolean
  /**
   * The default open value of the item(s). Use when you do not need to control the state. A string
   * for `type="single"`, an array for `type="multiple"`.
   */
  defaultValue?: string | string[]
  /**
   * The controlled open value of the item(s). Pair with `onChange` to control the state. A string
   * for `type="single"`, an array for `type="multiple"`.
   *
   * Maps to Nuxt's `modelValue` / `v-model`.
   */
  value?: string | string[] | undefined
  /**
   * The icon displayed on the right side of the trigger. Resolved via RLIcon (configurable default
   * `"chevronDown"`).
   */
  trailingIcon?: string
  /**
   * When `true`, prevents the user from interacting with the accordion and all its items.
   */
  disabled?: boolean
  /**
   * When `true`, collapsed content is unmounted from the DOM. When `false`, content stays mounted
   * and is hidden natively by the closed `<details>`.
   *
   * @default true
   */
  unmountOnHide?: boolean
  /**
   * The key used to get the value from the item. Supports dot paths.
   *
   * @default "value"
   */
  valueKey?: string
  /**
   * The key used to get the label from the item. Supports dot paths.
   *
   * @default "label"
   */
  labelKey?: string
  /**
   * Slot-specific CSS class overrides.
   */
  ui?: {
    root?: any
    item?: any
    trigger?: any
    leadingIcon?: any
    label?: any
    trailingIcon?: any
    content?: any
    body?: any
  }
  /**
   * Additional CSS classes to apply to the root element.
   */
  class?: any
  /**
   * Explicit native group name for the `<details>` items. When omitted no `name` renders:
   * single-open exclusivity is enforced by component state, and independent accordions can never
   * merge into one native group. Pass it to opt into native exclusive grouping (e.g. no-JS
   * contexts).
   *
   * Rimelight extra: not in Nuxt UI.
   */
  name?: string
  [key: string]: unknown
}
