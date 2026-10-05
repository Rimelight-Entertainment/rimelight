export interface RLSurroundItem {
  label: string;
  href: string;
}

export interface RLSurroundProps {
  prev?: RLSurroundItem | null;
  next?: RLSurroundItem | null;
  class?: string;
}
