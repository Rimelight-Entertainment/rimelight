import type { InferThemeProps } from "../../resolver";
import type { RLDockTheme } from "./dock.theme";

/**
 * Dock container for pinned actions.
 * @status stub
 * @default as "div"
 */
export type RLDockProps = InferThemeProps<typeof RLDockTheme>;
