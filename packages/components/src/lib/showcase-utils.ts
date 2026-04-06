/**
 * Showcase Utilities
 *
 * Helper functions for defining component prop configurations
 */

export interface PropDef {
  name: string
  type: string
  default?: any
  description?: string
}

function makePropDef(
  name: string,
  type: string,
  defaultValue: any,
  description: string | undefined
): PropDef {
  const result: PropDef = {
    name,
    type
  }
  if (defaultValue !== undefined) result.default = defaultValue
  if (description !== undefined) result.description = description
  return result
}

/**
 * Create prop definitions for string props
 */
export function stringProp(
  name: string,
  options: {
    default?: string
    description?: string
  } = {}
): PropDef {
  return makePropDef(name, "string", options.default, options.description)
}

/**
 * Create prop definitions for boolean props
 */
export function booleanProp(
  name: string,
  options: {
    default?: boolean
    description?: string
  } = {}
): PropDef {
  return makePropDef(name, "boolean", options.default, options.description)
}

/**
 * Create prop definitions for number props
 */
export function numberProp(
  name: string,
  options: {
    default?: number
    description?: string
  } = {}
): PropDef {
  return makePropDef(name, "number", options.default, options.description)
}

/**
 * Create prop definitions for enum (union type) props
 */
export function enumProp(
  name: string,
  values: string[],
  options: {
    default?: string
    description?: string
  } = {}
): PropDef {
  return makePropDef(
    name,
    values.map((v) => `'${v}'`).join(" | "),
    options.default,
    options.description
  )
}

/**
 * Create prop definitions for array props
 */
export function arrayProp(
  name: string,
  options: {
    default?: any[]
    description?: string
  } = {}
): PropDef {
  return makePropDef(name, "array", options.default, options.description)
}

/**
 * Create prop definitions for object props
 */
export function objectProp(
  name: string,
  options: {
    default?: Record<string, any>
    description?: string
  } = {}
): PropDef {
  return makePropDef(name, "object", options.default, options.description)
}

/**
 * Build common UI component props (variant, size)
 */
export function uiProps(
  options: {
    variantValues?: string[]
    sizeValues?: string[]
    defaultVariant?: string
    defaultSize?: string
  } = {}
): PropDef[] {
  const props: PropDef[] = []

  if (options.variantValues) {
    props.push(
      enumProp("variant", options.variantValues, {
        default: options.defaultVariant ?? "default",
        description: "The visual style variant of the component."
      })
    )
  }

  if (options.sizeValues) {
    props.push(
      enumProp("size", options.sizeValues, {
        default: options.defaultSize ?? "md",
        description: "The size of the component."
      })
    )
  }

  return props
}

/**
 * Build common layout props (orientation, alignment, inverted)
 */
export function layoutProps(
  options: {
    orientationValues?: string[]
    alignmentValues?: string[]
    defaultOrientation?: string
    defaultAlignment?: string
    includeInverted?: boolean
  } = {}
): PropDef[] {
  const props: PropDef[] = []

  if (options.orientationValues) {
    props.push(
      enumProp("orientation", options.orientationValues, {
        default: options.defaultOrientation ?? "vertical",
        description: "The layout orientation of the component."
      })
    )
  }

  if (options.alignmentValues) {
    props.push(
      enumProp("alignment", options.alignmentValues, {
        default: options.defaultAlignment ?? "center",
        description: "The content alignment."
      })
    )
  }

  if (options.includeInverted) {
    props.push(
      booleanProp("inverted", {
        default: false,
        description: "Inverts the order of content."
      })
    )
  }

  return props
}
