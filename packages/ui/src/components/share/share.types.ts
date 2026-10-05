import type { RLButtonProps } from "../button/button.types";

export interface RLShareProps extends Omit<
  RLButtonProps,
  | "href"
  | "label"
  | "leadingIcon"
  | "trailingIcon"
  | "loading"
  | "loadingAuto"
  | "square"
  | "active"
  | "activeColor"
  | "activeVariant"
> {}
