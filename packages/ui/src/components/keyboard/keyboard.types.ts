import type { Theme } from "../../types";

export interface HighlightGroup {
  keys: string[];
  color?: string;
  label?: string;
}

export interface RLKeyboardProps {
  highlightedKeys?: string[];
  groups?: HighlightGroup[];
  keyGap?: number;
  sectionGap?: number;
  keySize?: number;
  variant?: "full" | "60";
  os?: "windows" | "mac";
  highlightColor?: string;
  backgroundColor?: string;
  /**
   * Theme mode override — pins colors to flat, light, or dark mode.
   */
  theme?: Theme | undefined;
  /**
   * Slot-specific CSS class overrides.
   */
  ui?: any;
  /**
   * Additional CSS classes to apply to the root element.
   */
  class?: any;
}
