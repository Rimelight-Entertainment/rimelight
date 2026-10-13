export interface RLIconProps {
  /**
   * The name of the icon to display — a Lucide icon name (e.g. `check`, `chevron-down`)
   * or a full UnoCSS/Iconify class name (e.g. `i-lucide-check`).
   */
  name: string;
  /**
   * The size scale of the icon.
   */
  size?: "xs" | "sm" | "md" | "lg" | "xl" | "none" | undefined;
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
