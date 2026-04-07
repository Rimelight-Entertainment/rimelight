/**
 * Component Preview Renderer
 *
 * A simple registry-based system for rendering component previews with dynamic props. Import this
 * module in your page to register component renderers.
 */

export type RendererFunction = (props: Record<string, any>, container: HTMLElement) => void

const renderers = new Map<string, RendererFunction>()

/**
 * Register a component renderer
 *
 * @param componentName - The component name (e.g., 'hero', 'button')
 * @param renderFn - Function that renders the component with given props
 */
export function registerRenderer(componentName: string, renderFn: RendererFunction) {
  renderers.set(componentName, renderFn)
}

/**
 * Get a registered renderer
 */
export function getRenderer(componentName: string): RendererFunction | undefined {
  return renderers.get(componentName)
}

/**
 * Update a preview container with new props
 */
export function renderPreview(
  container: HTMLElement,
  componentName: string,
  props: Record<string, any>
) {
  const renderer = renderers.get(componentName)
  if (renderer) {
    renderer(props, container)
  }
}

/**
 * Helper to create a simple attribute-based renderer For components that can update via data
 * attributes and CSS
 */
export function createAttributeRenderer(
  attributeMap: Record<string, string>,
  classUpdater?: (props: Record<string, any>, element: HTMLElement) => void
): RendererFunction {
  return (props, container) => {
    // Update data attributes
    Object.entries(props).forEach(([key, value]) => {
      const attrName = attributeMap[key] || key
      if (value === undefined || value === null) {
        container.removeAttribute(`data-${attrName}`)
      } else if (typeof value === "boolean") {
        if (value) {
          container.setAttribute(`data-${attrName}`, "true")
        } else {
          container.removeAttribute(`data-${attrName}`)
        }
      } else {
        container.setAttribute(`data-${attrName}`, String(value))
      }
    })

    // Call custom class updater if provided
    if (classUpdater) {
      classUpdater(props, container)
    }
  }
}
