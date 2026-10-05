import type { JSX } from "@solidjs/web";
import type { RLAvatarProps } from "../avatar/avatar.types";
import type { Theme, ThemeColor } from "../../types";

export interface BreadcrumbItem {
  label?: string | undefined;
  icon?: string | undefined;
  avatar?: RLAvatarProps | string | undefined;
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
  leadingIcon?: string | undefined;
  trailingIcon?: string | undefined;
  href?: string | undefined;
  to?: string | undefined;
  external?: boolean | undefined;
  externalIcon?: string | undefined;
  noExternalIcon?: boolean | undefined;
  target?: string | undefined;
  rel?: string | null | undefined;
  prefetch?: boolean | "hover" | "tap" | "load" | "viewport" | undefined;
  active?: boolean | undefined;
  disabled?: boolean | undefined;
  raw?: boolean | undefined;
  ariaLabel?: string | undefined;
  ariaCurrentValue?:
    | "page"
    | "step"
    | "location"
    | "date"
    | "time"
    | "true"
    | "false"
    | boolean
    | undefined;
  theme?: Theme | undefined;
  children?: BreadcrumbItem[] | undefined;
  [key: string]: unknown;
}

export interface RLBreadcrumbProps<T = BreadcrumbItem> {
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

  children?: JSX.Element;
  separator?: JSX.Element;
  itemSlot?: (props: { item: T; index: number; active: boolean }) => JSX.Element;
  itemLeadingSlot?: (props: { item: T; index: number; active: boolean }) => JSX.Element;
  itemLabelSlot?: (props: { item: T; index: number; active: boolean }) => JSX.Element;
  itemTrailingSlot?: (props: { item: T; index: number; active: boolean }) => JSX.Element;
  separatorSlot?: (props: { item?: T | undefined; index?: number | undefined }) => JSX.Element;
  slots?:
    | Record<string, (props: { item: T; index: number; active: boolean }) => JSX.Element>
    | undefined;

  [key: string]: unknown;
}
