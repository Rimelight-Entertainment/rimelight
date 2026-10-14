export interface RLInputRatingProps {
  id?: string;
  readonly?: boolean;
  icon?: string;
  emptyIcon?: string;
  color?: string;
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  orientation?: "horizontal" | "vertical";
  step?: number;
  disabled?: boolean;
  required?: boolean;
  name?: string;
  defaultValue?: number;
  value?: number;
  length?: number;
  clearable?: boolean;
  hoverable?: boolean;
  ui?: any;
  class?: any;
  onValueChange?: (value: number) => void;
}
