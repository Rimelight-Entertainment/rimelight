export interface HighlightGroup {
  keys: string[];
  color?: string;
  label?: string;
}

export interface RLKeyboardProps {
  highlightedKeys?: string[];
  groups?: HighlightGroup[];
  keyGap?: number;
  sectionGap?: number;
  keySize?: number;
  variant?: "full" | "60";
  os?: "windows" | "mac";
  highlightColor?: string;
  backgroundColor?: string;
}
