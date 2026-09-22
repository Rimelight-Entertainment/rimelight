import type { HeadProps } from "./types.js"

export interface AstroHeadProps extends HeadProps {
  /**
   * Optional toggle for Astro's <ClientRouter> (View Transitions).
   */
  transitions?: boolean
}
