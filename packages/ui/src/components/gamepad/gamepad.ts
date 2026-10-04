export interface HighlightGroup {
  label: string;
  buttons: string[];
  color: string;
}

export interface RLGamepadProps {
  highlightedButtons?: string[];
  groups?: HighlightGroup[];
  highlightColor?: string;
  backgroundColor?: string;
}
