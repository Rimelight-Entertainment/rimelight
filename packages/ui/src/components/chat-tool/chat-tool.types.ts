import type { InferThemeProps } from "../../resolver";
import type { RLChatToolTheme } from "./chat-tool.theme";

/**
 * Execution state of a tool call.
 */
export type RLChatToolStatus = "pending" | "running" | "completed" | "error";

/**
 * Props for `RLChatTool`. A collapsible record of one tool call and its output.
 */
export type RLChatToolProps = InferThemeProps<typeof RLChatToolTheme> & {
  /**
   * Name of the tool shown in the summary.
   * @default ""
   */
  toolName?: string | undefined;
  /**
   * Execution state, shown as a localized label in the summary.
   * @default "pending"
   */
  status?: RLChatToolStatus | undefined;
  /**
   * Opens the tool details on first render.
   * @default false
   */
  defaultOpen?: boolean | undefined;
};
