import type { InferThemeProps } from "../../resolver";
import type { RLInputTagsTheme } from "./input-tags.theme";

export interface TagItem {
  label: string;
  value?: string;
}

export type RLInputTagsProps = InferThemeProps<typeof RLInputTagsTheme> & {
  /**
   * Tags to display. A string is used as both label and value.
   * @default []
   */
  items?: (string | TagItem)[];
  /**
   * Maximum number of tags rendered before the "+N more" counter.
   * @default 4
   */
  displayLimit?: number;
  /**
   * Renders a text input for adding tags.
   * @default false
   */
  showInput?: boolean;
  /**
   * Form field name. Each tag is submitted as a hidden input with this name.
   * @default undefined
   */
  name?: string;
  /**
   * Placeholder of the add-tag input.
   * @default undefined (falls back to the localized "Add tag…")
   */
  placeholder?: string;
  /**
   * Called with the trimmed text when Enter is pressed in the add-tag input.
   * @default undefined
   */
  onAddTag?: (tag: string) => void;
};
