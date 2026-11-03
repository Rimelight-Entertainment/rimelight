import type { InferThemeProps } from "../../resolver";
import type { RLSurroundTheme } from "./surround.theme";

export interface RLSurroundItem {
  label: string;
  href: string;
}

export type RLSurroundProps = Omit<InferThemeProps<typeof RLSurroundTheme>, "side"> & {
  /**
   * The previous item. Omit or pass `null` to hide the previous link.
   *
   * @default undefined
   */
  prev?: RLSurroundItem | null;
  /**
   * The next item. Omit or pass `null` to hide the next link.
   *
   * @default undefined
   */
  next?: RLSurroundItem | null;
};
