import type { AvatarProps } from "../avatar/avatar";
import type { LinkProps } from "../link/link";
import type { ThemeColor } from "../../types";

export interface BreadcrumbItem extends Partial<LinkProps> {
  label?: string | undefined;
  icon?: string | undefined;
  avatar?: AvatarProps | string | undefined;
  slot?: string | undefined;
  class?: any;
  ui?:
    | {
        item?: any;
        link?: any;
        linkLeadingIcon?: any;
        linkLeadingAvatar?: any;
        linkLeadingAvatarSize?: any;
        linkLabel?: any;
        separator?: any;
        separatorIcon?: any;
      }
    | undefined;
  children?: BreadcrumbItem[] | undefined;
  [key: string]: unknown;
}

export interface BreadcrumbProps<T = BreadcrumbItem> {
  /**
   * The element or component this component should render as.
   * @default 'nav'
   */
  as?: any;

  /**
   * Array of breadcrumb items to render.
   */
  items?: T[] | undefined;

  /**
   * The icon to use as a separator.
   * @default 'chevronRight'
   */
  separatorIcon?: any;

  /**
   * Color of the active breadcrumb item.
   * @default 'primary'
   */
  color?:
    | "primary"
    | "secondary"
    | "success"
    | "info"
    | "warning"
    | "error"
    | "neutral"
    | ThemeColor
    | (string & {})
    | undefined;

  /**
   * The key used to get the label from the item.
   * @default 'label'
   */
  labelKey?: string | undefined;

  /**
   * Maximum number of items to show. Middle items beyond this cap are collapsed into an overflow indicator.
   */
  maxVisible?: number | undefined;

  /**
   * Approximate width in pixels of each breadcrumb item (text + separator).
   * @default 120
   */
  estimatedItemWidth?: number | undefined;

  /**
   * Slot-specific CSS class overrides.
   */
  ui?:
    | {
        root?: any;
        list?: any;
        item?: any;
        link?: any;
        linkLeadingIcon?: any;
        linkLeadingAvatar?: any;
        linkLeadingAvatarSize?: any;
        linkLabel?: any;
        separator?: any;
        separatorIcon?: any;
        overflow?: any;
        overflowEllipsis?: any;
        overflowCount?: any;
        [key: string]: any;
      }
    | undefined;

  /**
   * Additional CSS classes to apply to the root element.
   */
  class?: any;

  [key: string]: unknown;
}
