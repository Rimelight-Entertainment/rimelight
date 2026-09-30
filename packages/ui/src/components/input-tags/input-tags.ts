export interface TagItem {
  /**
   * Visible label.
   */
  label: string;
  /**
   * Optional value (used as key; falls back to label).
   */
  value?: string;
  /**
   * Color variant for the tag chip.
   */
  color?: string;
}

export interface InputTagsProps {
  /**
   * Array of tag data to render automatically. Enables the CSS responsive item counter. When
   * omitted, falls back to `<slot />`.
   */
  items?: Array<string | TagItem>;
  /**
   * Maximum number of tags to show at full container width. Additional tags are pre-hidden
   * server-side and counted. Container queries will responsively hide more as width shrinks.
   *
   * @default 4
   */
  displayLimit?: number;
  /**
   * Estimated width (px) of each tag chip — used to compute container-query breakpoints. Increase
   * for longer labels, decrease for shorter ones.
   *
   * @default 80
   */
  estimatedTagWidth?: number;
  /**
   * When true, renders a text input after the tags for entering new values. Tag addition/removal is
   * handled natively via form submission; for client-side interactivity use the Solid variant or a
   * custom slot.
   *
   * @default false
   */
  showInput?: boolean;
  /**
   * `name` attribute forwarded to the hidden inputs and text input.
   */
  name?: string;
  /**
   * Placeholder for the optional text input.
   */
  placeholder?: string;
  /**
   * Slot-specific CSS class overrides.
   */
  ui?: any;
  /**
   * Additional CSS classes to apply to the root element.
   */
  class?: any;
  [key: string]: unknown;
}
