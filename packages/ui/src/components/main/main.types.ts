import type { InferThemeProps } from "../../resolver";
import type { RLMainTheme } from "./main.theme";

export type RLMainProps = InferThemeProps<typeof RLMainTheme>;
