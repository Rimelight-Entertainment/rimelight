export interface EmptyProps {
  /**
   * Element or tag to render as (default: "div")
   */
  as?: string;
  /**
   * Icon displayed above the title.
   */
  icon?: string;
  /**
   * Avatar properties object
   */
  avatar?: Record<string, any>;
  /**
   * When true, the loading icon will be displayed.
   */
  loading?: boolean;
  /**
   * The icon when the loading prop is true (default: "i-lucide-loader-circle")
   */
  loadingIcon?: string;
  /**
   * Title text
   */
  title?: string;
  /**
   * Description text
   */
  description?: string;
  /**
   * Display a list of Button actions in the body.
   */
  actions?: Array<{
    label: string;
    icon?: string;
    color?: string;
    variant?: string;
    href?: string;
    class?: string;
    [key: string]: any;
  }>;
  /**
   * Variant styling: outline (default), solid, soft, subtle, naked
   */
  variant?: "outline" | "solid" | "soft" | "subtle" | "naked";
  /**
   * Size variant: md (default), xs, sm, lg, xl
   */
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  /**
   * Slot-specific CSS class overrides
   */
  ui?: {
    root?: string;
    header?: string;
    avatar?: string;
    title?: string;
    description?: string;
    body?: string;
    actions?: string;
    footer?: string;
  };
  /**
   * Additional CSS classes to apply to the root element.
   */
  class?: any;
  [key: string]: unknown;
}
