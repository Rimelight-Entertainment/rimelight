import type { JSX } from "@solidjs/web";

export interface TagItem {
  label: string;
  value?: string;
}

export interface RLInputTagsProps {
  items?: (string | TagItem)[];
  displayLimit?: number;
  estimatedTagWidth?: number;
  showInput?: boolean;
  name?: string;
  placeholder?: string;
  ui?: any;
  class?: any;
  children?: JSX.Element;
  onAddTag?: (tag: string) => void;
  onRemoveTag?: (tag: TagItem) => void;
}
