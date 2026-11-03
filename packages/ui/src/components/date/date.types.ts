import type { InferThemeProps } from "../../resolver";
import type { RLDateTheme } from "./date.theme";

export type RLDateProps = InferThemeProps<typeof RLDateTheme> & {
  /**
   * Date to display. Strings and numbers are parsed with the `Date` constructor.
   * @default undefined (required)
   */
  date: Date | string | number;
  /**
   * BCP 47 locale used to format the date.
   * @default "en-US"
   */
  locale?: string;
  /**
   * `Intl.DateTimeFormat` options used to format the date.
   * @default { year: "numeric", month: "short", day: "numeric" }
   */
  options?: Intl.DateTimeFormatOptions;
};
