import { map } from "nanostores"

export interface HeaderLayerInfo {
  order: number
  isVisible: boolean
  height: number
}

/**
 * Global store tracking all registered header layers. This allows child components to subscribe to
 * header layer changes even across Vue/Astro boundaries, since nanostores is framework-agnostic.
 */
export const headerLayersStore = map<Record<string, HeaderLayerInfo>>({})
