import type { JSX } from "@solidjs/web";

export interface RLGridProps {
  cols?: 1 | 2 | 3 | 4 | 5 | 6;
  stagger?: boolean;
  gap?: "none" | "xs" | "sm" | "md" | "lg" | "xl";
  ui?: any;
  class?: any;
  children?: JSX.Element;
  [key: string]: unknown;
}
