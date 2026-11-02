import type { JSX } from "@solidjs/web";
import type { ThemeColor } from "../../types";

export interface RLThemeSelectorProps {
  mode?: "select" | "icon";
  size?: "3xs" | "2xs" | "xs" | "sm" | "md" | "lg" | "xl" | "2xl" | "3xl";
  color?: ThemeColor;
  theme?: string;
  ui?: any;
  class?: any;
  children?: JSX.Element;
  onChange?: (theme: string) => void;
  [key: string]: unknown;
}
