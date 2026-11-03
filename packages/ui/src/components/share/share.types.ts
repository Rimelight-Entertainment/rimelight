import type { InferThemeProps } from "../../resolver";
import type { RLButtonProps } from "../button/button.types";
import type { RLShareTheme } from "./share.theme";

/**
 * Share button props. Wraps `RLButton`; `label`, `leadingIcon`, `onClick` and
 * the active/loading/square props are owned by the component. `@status stable`.
 */
export type RLShareProps = Omit<
  InferThemeProps<typeof RLShareTheme> & RLButtonProps,
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
  | "onClick"
>;
