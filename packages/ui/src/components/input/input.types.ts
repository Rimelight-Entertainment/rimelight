import type { SlotRenderer } from "../../types";
import type { InferThemeProps } from "../../resolver";
import type { RLInputTheme } from "./input.theme";

export type RLInputProps = Omit<
  InferThemeProps<typeof RLInputTheme>,
  "onInput" | "onChange" | "onBlur" | "onFocus" | "onKeyDown" | "ref" | "hasLeading" | "hasTrailing"
> & {
  /**
   * Native `autocomplete` hint forwarded to the input element.
   */
  autocomplete?: string | undefined;
  /**
   * Native input type.
   * @default "text"
   */
  type?:
    | "text"
    | "password"
    | "email"
    | "number"
    | "date"
    | "datetime-local"
    | "search"
    | "tel"
    | "url";
  /**
   * The input value.
   * @default ""
   */
  value?: string | number;
  /**
   * Placeholder text.
   * @default undefined
   */
  placeholder?: string;
  /**
   * Disabled state.
   * @default false
   */
  disabled?: boolean;
  /**
   * Readonly state.
   * @default false
   */
  readonly?: boolean;
  /**
   * Name for forms.
   * @default undefined
   */
  name?: string;
  /**
   * Required field state.
   * @default false
   */
  required?: boolean;
  /**
   * Invalid state. Renders the error ring.
   * @default false
   */
  invalid?: boolean;
  /**
   * Icon name rendered before the input (string icon). Use `leadingSlot` for custom content.
   * @default undefined
   */
  leadingIcon?: string;
  /**
   * Icon name rendered after the input (string icon). Use `trailingSlot` for custom content.
   * @default undefined
   */
  trailingIcon?: string;
  /**
   * Content rendered before the input. Replaces `leadingIcon` when present.
   * @default undefined
   */
  leadingSlot?: SlotRenderer;
  /**
   * Content rendered after the input. Replaces `trailingIcon` when present.
   * @default undefined
   */
  trailingSlot?: SlotRenderer;
  /**
   * Native input event handlers and ref.
   */
  onInput?: (e: InputEvent & { currentTarget: HTMLInputElement }) => void;
  onChange?: (e: Event & { currentTarget: HTMLInputElement }) => void;
  onBlur?: (e: FocusEvent & { currentTarget: HTMLInputElement }) => void;
  onFocus?: (e: FocusEvent & { currentTarget: HTMLInputElement }) => void;
  onKeyDown?: (e: KeyboardEvent & { currentTarget: HTMLInputElement }) => void;
  ref?: HTMLInputElement | ((el: HTMLInputElement) => void);
};
