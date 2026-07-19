/// <reference types="astro/client" />

declare module "virtual:rimelight-ui" {
  import type { ComponentTheme } from "./types/component"
  import type { RimelightIcons } from "./icons/defaults"

  export interface VirtualUIConfig {
    /** Component theme overrides keyed by camelCase component name */
    [componentName: string]: ComponentTheme | undefined
    /** All active color names (built-in + user-defined) */
    colors: string[]
    /** Logo variant map passed to ui() */
    logos: Record<string, string | { light?: string; dark?: string; color?: string; white?: string; black?: string; [key: string]: string | undefined }>
    /** Keyboard shortcut category config */
    shortcuts: Record<string, any>
    /** Icon overrides */
    icons: RimelightIcons
    /** When true, strip all default theme classes from components */
    unstyled?: boolean
  }

  export function getUIConfig(): VirtualUIConfig
}
