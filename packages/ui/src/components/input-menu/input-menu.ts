export interface RLInputMenuProps {
  items?: (string | { label: string; value: string; [key: string]: any })[];
  value?: string;
  defaultValue?: string;
  placeholder?: string;
  disabled?: boolean;
  name?: string;
  label?: string;
  size?: "sm" | "md" | "lg";
  color?: string;
  ui?: any;
  class?: any;
  onValueChange?: (value: string) => void;
}
