import type { InferThemeProps } from "../../resolver";
import type { RLKeyboardTheme } from "./keyboard.theme";

export interface HighlightGroup {
  keys: string[];
  color?: string;
  label?: string;
}

/**
 * Renders an interactive keyboard diagram with highlighted keys.
 */
export type RLKeyboardProps = InferThemeProps<typeof RLKeyboardTheme> & {
  /**
   * Key codes or labels to highlight.
   * @default []
   */
  highlightedKeys?: string[] | undefined;

  /**
   * Groups of keys highlighted with their own color and legend label.
   * @default []
   */
  groups?: HighlightGroup[] | undefined;

  /**
   * Gap between keys in pixels.
   * @default 8
   */
  keyGap?: number | undefined;

  /**
   * Gap between key sections in pixels.
   * @default 40
   */
  sectionGap?: number | undefined;

  /**
   * Size of a single key in pixels.
   * @default 40
   */
  keySize?: number | undefined;

  /**
   * Keyboard layout: full-size or 60% (no function row or numpad).
   * @default "full"
   */
  layout?: "full" | "60" | undefined;

  /**
   * Operating system whose key labels are shown.
   * @default "windows"
   */
  os?: "windows" | "mac" | undefined;

  /**
   * Fill color applied to highlighted keys.
   * @default "var(--rl-primary-500)"
   */
  highlightColor?: string | undefined;

  /**
   * Fill color of the diagram background. `transparent` hides it.
   * @default "transparent"
   */
  backgroundColor?: string | undefined;
};
