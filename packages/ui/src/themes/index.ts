import headerTheme from "./header.theme"
import footerTheme from "./footer.theme"
import scrollToTopTheme from "./scroll-to-top.theme"
import buttonTheme from "./button.theme"
import logoTheme from "./logo.theme"
import iconTheme from "./icon.theme"
import placeholderTheme from "./placeholder.theme"
import sectionTheme from "./section.theme"

/**
 * Default UI configuration for all components. This is the baseline that gets merged with
 * user-provided overrides via the Astro integration options.
 */
export const defaultUIConfig = {
  "header": headerTheme,
  "footer": footerTheme,
  "logo": logoTheme,
  "scroll-to-top": scrollToTopTheme,
  "button": buttonTheme,
  "icon": iconTheme,
  "placeholder": placeholderTheme,
  "section": sectionTheme
} as const

export type DefaultUIConfig = typeof defaultUIConfig
