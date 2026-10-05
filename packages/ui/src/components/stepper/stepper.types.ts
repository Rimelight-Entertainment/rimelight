import type { JSX } from "@solidjs/web";

export interface StepperItem {
  title?: string;
  description?: string;
  content?: string;
  icon?: string;
  value?: string | number;
  disabled?: boolean;
  slot?: string;
  class?: any;
  ui?: Record<string, any>;
  [key: string]: any;
}

export interface RLStepperProps {
  items?: StepperItem[];
  value?: string | number;
  defaultValue?: string | number;
  modelValue?: string | number;
  valueKey?: string;
  linear?: boolean;
  disabled?: boolean;
  orientation?: "horizontal" | "vertical";
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  color?: "primary" | "secondary" | "success" | "info" | "warning" | "error" | "neutral";
  ui?: any;
  class?: any;
  children?: JSX.Element;
  indicator?: (ctx: {
    item: StepperItem;
    index: number;
    state: "completed" | "active" | "inactive";
  }) => JSX.Element;
  wrapper?: (ctx: { item: StepperItem; index: number }) => JSX.Element;
  onChange?: (ctx: { index: number; value: string | number }) => void;
  onNext?: (ctx: { index: number; value: string | number }) => void;
  onPrev?: (ctx: { index: number; value: string | number }) => void;
  [key: string]: unknown;
}
