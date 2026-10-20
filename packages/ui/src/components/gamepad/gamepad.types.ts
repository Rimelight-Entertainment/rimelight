import type { ValidComponent } from "@solidjs/web";
import type { Theme } from "../../types";

export interface HighlightGroup {
  label: string;
  buttons: string[];
  color: string;
}

export interface RLGamepadProps {
  /**
   * Buttons to highlight directly (in addition to group-based highlights).
   */
  highlightedButtons?: string[];
  /**
   * Highlight groups, each with a label, button ids, and highlight color.
   */
  groups?: HighlightGroup[];
  /**
   * Fallback highlight color for directly highlighted buttons.
   * @default 'var(--rl-primary-500)'
   */
  highlightColor?: string;
  /**
   * Background color rendered behind the gamepad body.
   * @default 'transparent'
   */
  backgroundColor?: string;
  /**
   * The element or component this component should render as.
   * @default 'div'
   */
  as?: ValidComponent;
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
  [key: string]: unknown;
}
