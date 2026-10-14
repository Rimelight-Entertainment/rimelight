import type { ValidComponent } from "@solidjs/web";
import type { JSX } from "@solidjs/web";

export interface RLLogoProps {
  as?: ValidComponent;
  variant?: string;
  mode?: string;
  theme?: string;
  href?: string;
  src?: string | undefined;
  alt?: string | undefined;
  icon?: any;
  text?: string | undefined;
  fallback?: string | undefined;
  initials?: string | undefined;
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
    | "4xl"
    | "5xl"
    | "6xl"
    | "7xl"
    | "8xl"
    | "9xl"
    | "10xl"
    | "11xl"
    | "12xl"
    | (string & {})
    | undefined;
  color?:
    | "error"
    | "primary"
    | "secondary"
    | "success"
    | "info"
    | "warning"
    | "neutral"
    | (string & {})
    | undefined;
  chip?: boolean | (string & {}) | undefined;
  badge?: boolean | string | number | undefined;
  badgeColor?: string | undefined;
  badgePosition?: "top-right" | "bottom-right" | "top-left" | "bottom-left" | undefined;
  loading?: "lazy" | "eager" | undefined;
  referrerpolicy?:
    | ""
    | "no-referrer"
    | "no-referrer-when-downgrade"
    | "origin"
    | "origin-when-cross-origin"
    | "same-origin"
    | "strict-origin"
    | "strict-origin-when-cross-origin"
    | "unsafe-url"
    | undefined;
  crossorigin?: "" | "anonymous" | "use-credentials" | undefined;
  decoding?: "async" | "auto" | "sync" | undefined;
  height?: string | number | undefined;
  width?: string | number | undefined;
  sizes?: string | undefined;
  srcset?: string | undefined;
  usemap?: string | undefined;
  title?: string | undefined;
  subtitle?: string | undefined;
  label?: string;
  ui?:
    | {
        root?: any;
        image?: any;
        fallback?: any;
        icon?: any;
        badge?: any;
        wrapper?: any;
        title?: any;
        subtitle?: any;
      }
    | undefined;
  class?: any;
  children?: JSX.Element;
  [key: string]: unknown;
}
