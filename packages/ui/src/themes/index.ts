import { buttonTheme } from "./button.theme"

/**
 * Default UI configuration for all components. This is the baseline that gets merged with
 * user-provided overrides via the Astro integration options.
 */
export const defaultUIConfig = {
  button: buttonTheme
} as const

export type DefaultUIConfig = typeof defaultUIConfig
