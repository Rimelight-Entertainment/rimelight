/**
 * Dynamic Component Renderer for Showcase
 *
 * This module handles runtime prop updates for Astro components in the showcase. It works by
 * re-rendering the component with updated props using Astro's client:only components.
 */

export interface PropState {
  value: any
  omitted: boolean
}

export interface PropDefinition {
  name: string
  type: string
  default?: any
  description?: string
  kind: "string" | "number" | "boolean" | "enum" | "array" | "object" | "function"
  enumValues?: string[]
}

function makePropDefinition(
  name: string,
  type: string,
  kind: PropDefinition["kind"],
  defaultValue: any,
  description: string | undefined,
  enumValues: string[] | undefined
): PropDefinition {
  const result: PropDefinition = {
    name,
    type,
    kind
  }
  if (defaultValue !== undefined) result.default = defaultValue
  if (description !== undefined) result.description = description
  if (enumValues !== undefined) result.enumValues = enumValues
  return result
}

function assertPropInfo(
  obj: unknown
): asserts obj is { type?: string; default?: unknown; description?: string } {
  if (!obj || typeof obj !== "object") throw new Error("Expected prop info")
}

/**
 * Parse a component's props from its exported interface or default export This is a helper to
 * extract prop metadata at build time
 */
export function parseComponentProps(_componentModule: any): PropDefinition[] {
  const props: PropDefinition[] = []

  // Try to get props from component's default export or metadata
  if (_componentModule?.metadata?.props) {
    const metadataProps = _componentModule.metadata.props
    for (const [name, info] of Object.entries(metadataProps)) {
      assertPropInfo(info)
      const propInfo = info
      props.push(
        makePropDefinition(
          name,
          propInfo.type || "unknown",
          inferPropKind(propInfo.type || "unknown"),
          propInfo.default,
          propInfo.description,
          extractEnumValues(propInfo.type || "")
        )
      )
    }
  }

  return props
}

/**
 * Infer the prop kind from TypeScript type string
 */
function inferPropKind(typeString: string): PropDefinition["kind"] {
  if (!typeString) return "string"

  const type = typeString.toLowerCase()

  if (type === "boolean") return "boolean"
  if (type === "number") return "number"
  if (type === "string") return "string"
  if (type.includes("[]") || type === "array") return "array"
  if (type.includes("|") && !type.includes("=>")) {
    // Union type - likely an enum
    return "enum"
  }
  if (type.includes("=>")) return "function"
  if (type.startsWith("{") || type === "object" || type === "record") return "object"

  return "string"
}

/**
 * Extract enum values from a union type string
 */
function extractEnumValues(typeString: string): string[] | undefined {
  if (!typeString || !typeString.includes("|")) return undefined

  // Parse union types like: "'default' | 'primary' | 'secondary'"
  const matches = typeString.match(/'([^']+)'|"([^"]+)"/g)
  if (matches) {
    return matches.map((m) => m.replace(/['"]/g, ""))
  }

  return undefined
}

/**
 * Generate default prop definitions for common component patterns
 */
export function generatePropDefinitions(
  _componentName: string,
  options: {
    stringProps?: string[]
    booleanProps?: string[]
    enumProps?: Record<string, string[]>
    defaultProps?: Record<string, any>
    descriptions?: Record<string, string>
  } = {}
): PropDefinition[] {
  const props: PropDefinition[] = []

  // Add string props
  options.stringProps?.forEach((name) => {
    props.push(
      makePropDefinition(
        name,
        "string",
        "string",
        options.defaultProps?.[name],
        options.descriptions?.[name],
        undefined
      )
    )
  })

  // Add boolean props
  options.booleanProps?.forEach((name) => {
    props.push(
      makePropDefinition(
        name,
        "boolean",
        "boolean",
        options.defaultProps?.[name],
        options.descriptions?.[name],
        undefined
      )
    )
  })

  // Add enum props
  if (options.enumProps) {
    Object.entries(options.enumProps).forEach(([name, values]) => {
      props.push(
        makePropDefinition(
          name,
          values.map((v) => `'${v}'`).join(" | "),
          "enum",
          options.defaultProps?.[name],
          options.descriptions?.[name],
          values
        )
      )
    })
  }

  return props
}

/**
 * Create a render function for a component This returns HTML string that can be injected into the
 * preview container
 */
export function createRenderer(_componentModule: any) {
  return function render(_props: Record<string, any>): string {
    // For Astro components, we need to use their rendering mechanism
    // This is a placeholder - actual implementation depends on how components are structured
    return `<div data-component-render="true" data-props="${encodeURIComponent(JSON.stringify(_props))}"></div>`
  }
}

/**
 * Helper to build common prop configurations
 */
export const PropConfigs = {
  /**
   * Standard variant/size props for UI components
   */
  ui: {
    variant: {
      values: ["default", "primary", "secondary", "outline", "ghost"] as string[],
      default: "default"
    },
    size: {
      values: ["sm", "md", "lg"] as string[],
      default: "md"
    }
  },

  /**
   * Layout props
   */
  layout: {
    orientation: {
      values: ["vertical", "horizontal"] as string[],
      default: "vertical"
    },
    alignment: {
      values: ["left", "center", "right"] as string[],
      default: "center"
    }
  }
}
