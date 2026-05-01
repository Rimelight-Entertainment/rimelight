import { buttonTheme } from "./button.theme"
import { headerTheme } from "./header.theme"
import { scrollToTopTheme } from "./scroll-to-top.theme"

/**
 * Default UI configuration for all components. This is the baseline that gets merged with
 * user-provided overrides via the Astro integration options.
 */
export const defaultUIConfig = {
  "button": buttonTheme,
  "header": headerTheme,
  "scroll-to-top": scrollToTopTheme
} as const

export type DefaultUIConfig = typeof defaultUIConfig
