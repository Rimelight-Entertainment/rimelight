import type { ValidComponent } from "@solidjs/web";
import type { JSX } from "@solidjs/web";
import type { ThemeColor } from "../../types";

export interface AvatarItemData {
  /**
   * Image URL.
   */
  src?: string;
  /**
   * Alt text for the image.
   */
  alt?: string;
  /**
   * Fallback icon name or element.
   */
  icon?: any;
  /**
   * Fallback text.
   */
  text?: string;
  /**
   * Fallback text (initials or short label).
   */
  fallback?: string;
  /**
   * Alias for fallback — two-letter initials.
   */
  initials?: string;
  /**
   * Color variant passed to the inner Avatar.
   */
  color?:
    | "error"
    | "primary"
    | "secondary"
    | "success"
    | "info"
    | "warning"
    | "neutral"
    | ThemeColor
    | undefined;
  chip?: any;
  loading?: "lazy" | "eager";
  [key: string]: unknown;
}

export interface RLAvatarGroupProps {
  /**
   * The element or component this component should render as.
   *
   * @default "div"
   */
  as?: ValidComponent;
  /**
   * Array of avatar data to render automatically. When omitted, renders default children.
   */
  items?: AvatarItemData[];
  /**
   * The maximum number of avatars to display. The rest is displayed as a `+X` avatar.
   */
  max?: string | number | undefined;
  /**
   * Alias for `max`.
   *
   * @default 5
   */
  displayLimit?: number;
  /**
   * Avatar size — forwarded to each inner RLAvatar.
   *
   * @default "md"
   */
  size?:
    | "3xs"
    | "2xs"
    | "xs"
    | "sm"
    | "md"
    | "lg"
    | "xl"
    | "2xl"
    | "3xl"
    | (string & {})
    | undefined;
  /**
   * Color variant — forwarded to each inner RLAvatar.
   *
   * @default "neutral"
   */
  color?:
    | "error"
    | "primary"
    | "secondary"
    | "success"
    | "info"
    | "warning"
    | "neutral"
    | ThemeColor
    | undefined;
  /**
   * Slot-specific CSS class overrides.
   */
  ui?: {
    root?: any;
    base?: any;
    more?: any;
  };
  /**
   * Additional CSS classes to apply to the root element.
   */
  class?: any;
  children?: JSX.Element;
  [key: string]: unknown;
}
