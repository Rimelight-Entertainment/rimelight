import type { UserConfig } from "unocss";
import type { RimelightIcons } from "./icons";
import type { PALETTES } from "./preset";
import type { WebFontsOptions } from "./fonts";

export type Theme = "light" | "dark" | "flat";
export type BuiltinThemeColor = keyof typeof PALETTES;
export type ThemeColor = BuiltinThemeColor | (string & {});

export type ClassValue =
  | string
  | number
  | boolean
  | undefined
  | null
  | { [key: string]: any }
  | ClassValue[];

export interface ThemeConfig<S extends string = string> {
  slots?: readonly S[] | S[];
  base?: Partial<Record<S, ClassValue>>;
  variants?: Record<string, any>;
  compoundVariants?: Array<
    Record<string, any> & {
      classNames?: Partial<Record<S, ClassValue>>;
      class?: Partial<Record<S, ClassValue>>;
    }
  >;
  defaultVariants?: Record<string, any>;
}

export type ColorModeInput =
  | [chroma: number, hue: number]
  | readonly [chroma: number, hue: number]
  | Record<string, string>
  | { light?: Record<string, string>; dark?: Record<string, string> };

export interface PresetOptions {
  /**
   * Custom colors.
   */
  colors?: Record<string, ColorModeInput>;
  /**
   * Global icon overrides mapping icon names to Lucide icon names (e.g. `x`) or
   * UnoCSS/Iconify class names (e.g. `i-lucide-x`).
   */
  icons?: RimelightIcons;
  /**
   * Web fonts configuration using UnoCSS Web Fonts preset. Fonts are always downloaded and served
   * locally (dev + build); pass `false` to disable. See `WebFontsOptions` in `./fonts`.
   */
  fonts?: WebFontsOptions | boolean;
  /**
   * Configure which built-in UnoCSS presets are enabled/disabled.
   */
  presets?: { wind?: boolean; typography?: boolean; icons?: boolean; fonts?: boolean };
}

export interface UIConfig extends PresetOptions {
  /**
   * Whether to strip default theme classes from all components.
   */
  unstyled?: boolean;
  /**
   * Configuration for keyboard shortcuts.
   */
  shortcuts?: { categories?: Record<string, { label: string }> };
  /**
   * Configuration for the Logo component variants.
   */
  logos?: Record<string, string | Record<string, string | undefined>>;
  /**
   * Global component configuration overrides.
   */
  components?: {
    themes?: Record<string, ThemeConfig<string>>;
  };
  /**
   * Custom UnoCSS configuration overrides.
   */
  unocss?: UserConfig;
}
