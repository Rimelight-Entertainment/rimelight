import type { InferThemeProps } from "../../resolver";
import type { RLSpeedDialTheme } from "./speed-dial.theme";

/**
 * Speed dial: a floating button that expands into a set of related actions.
 * @status stub
 * @default as "div"
 */
export type RLSpeedDialProps = InferThemeProps<typeof RLSpeedDialTheme>;
