import type { JSX, ValidComponent } from "@solidjs/web";
import type { UserConfig } from "unocss";
import type { RimelightIcons } from "./icons";
import type { PALETTES } from "./preset";
import type { WebFontsOptions } from "./fonts";

export type Theme = "light" | "dark";
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

export type SlotOverride = ClassValue | ((base: string) => string);

export type ThemeUI<S extends string = string> = Partial<Record<S, SlotOverride>>;

/** A static slot, or a render function that receives per-slot context. */
export type SlotRenderer<Ctx = void> = JSX.Element | ((ctx: Ctx) => JSX.Element);

export interface ThemeConfig<
  S extends string = string,
  V extends Record<string, any> = Record<string, any>,
> {
  slots?: readonly S[] | S[];
  base?: Partial<Record<S, ClassValue>>;
  variants?: V;
  compoundVariants?: Array<
    Record<string, any> & {
      class?: Partial<Record<S, ClassValue>>;
    }
  >;
  defaultVariants?: Record<string, any>;
}

type InferVariantValue<Group> = Group extends "auto"
  ? ThemeColor
  : Group extends Record<string, any>
    ? [keyof Group] extends ["true" | "false"]
      ? boolean
      : keyof Group & string
    : unknown;

export type InferThemeVariants<V extends Record<string, any>> = {
  [K in keyof V & string]?: InferVariantValue<V[K]> | undefined;
};

export interface BaseThemeProps<S extends string = string> extends Omit<
  JSX.HTMLAttributes<HTMLElement>,
  "class" | "children"
> {
  /**
   * The element or component this component should render as.
   */
  as?: ValidComponent | undefined;
  /**
   * Slot-specific CSS class overrides.
   */
  ui?: ThemeUI<S> | undefined;
  /**
   * Additional CSS classes to apply to the root element.
   */
  class?: ClassValue;
  /**
   * Theme override, rendered as `data-theme` on the root element.
   */
  theme?: Theme | undefined;
  children?: JSX.Element;
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
   * Global icon overrides mapping icon names to bare Lucide names (e.g. `x`) or
   * `i-<set>-<name>` class names for non-Lucide sets (e.g. `i-simple-icons-github`).
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
