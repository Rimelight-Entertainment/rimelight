import type { JSX } from "@solidjs/web";

export interface RLThemeSelectorProps {
  mode?: "select" | "icon";
  size?: "3xs" | "2xs" | "xs" | "sm" | "md" | "lg" | "xl" | "2xl" | "3xl";
  theme?: string;
  ui?: any;
  class?: any;
  children?: JSX.Element;
  onChange?: (theme: string) => void;
  [key: string]: unknown;
}
