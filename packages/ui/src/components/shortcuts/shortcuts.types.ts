import type { InferThemeProps } from "../../resolver";
import type { RegisteredShortcut } from "../../shortcuts";
import type { RLShortcutsTheme } from "./shortcuts.theme";

export interface CategorySection {
  key: string;
  label: string;
  items: RegisteredShortcut[];
}

export type ShortcutsBackdropEvent = MouseEvent & { currentTarget: Element; target: Element };

/**
 * Modal cheat sheet listing the active keyboard shortcuts.
 */
export type RLShortcutsProps = InferThemeProps<typeof RLShortcutsTheme> & {
  /**
   * Category labels keyed by category id. Merged over the configured categories.
   * @default {}
   */
  categories?: Record<string, string> | undefined;

  /**
   * Controlled open state. When set, the global shortcuts modal store is ignored.
   * @default undefined
   */
  open?: boolean | undefined;

  /**
   * Initial open state when uncontrolled.
   * @default false
   */
  defaultOpen?: boolean | undefined;

  /**
   * Called with the next open state whenever it changes.
   * @default undefined
   */
  onOpenChange?: ((open: boolean) => void) | undefined;

  /**
   * Render in a portal attached to `document.body` or the given element.
   * Set to false to render inline.
   * @default true
   */
  portal?: boolean | HTMLElement | undefined;
};
