import type { JSX } from "@solidjs/web";
import type { ClassValue, SlotRenderer } from "../../types";
import type { InferThemeProps } from "../../resolver";
import type { RLSplitterTheme } from "./splitter.theme";

export type SplitterOrientation = "horizontal" | "vertical";
export type SplitterSize = number | `${number}%` | (string & {});
export type SplitterHandleAction = "resize" | "collapse";

export interface DragState {
  i: number;
  startPos: number;
  startA: number;
  startB: number;
  startSizes: number[];
  moved: boolean;
  cross?: boolean;
}

export interface SplitterHandleState {
  /**
   * Whether the adjacent collapsible panel is currently collapsed.
   */
  collapsed: boolean;
  /**
   * Whether this handle is currently being dragged.
   */
  dragging: boolean;
  /**
   * Whether this handle is currently active (focused, hovered, or dragging).
   */
  active: boolean;
  /**
   * Zero-based index of the handle.
   */
  index: number;
  /**
   * Active orientation of the splitter.
   */
  orientation: "horizontal" | "vertical";
}

export interface SplitterPanelState {
  /**
   * Current size of the panel in pixels.
   */
  size: number;
  /**
   * Current size of the panel as a percentage (0 to 100).
   */
  percentage: number;
  /**
   * Whether the panel is currently collapsed.
   */
  collapsed: boolean;
  /**
   * Whether any handle in the splitter is actively resizing.
   */
  resizing: boolean;
  /**
   * Zero-based index of the panel.
   */
  index: number;
}

export interface SplitterTranslations {
  /**
   * Accessible label for a resize handle.
   * @default uiT("splitter.resize")
   */
  resize?: string;
  /**
   * Accessible label for a collapse handle when expanded.
   */
  collapse?: string;
  /**
   * Accessible label for a collapse handle when collapsed.
   */
  expand?: string;
}

export interface SplitterHandleConfig {
  /**
   * Handle interaction mode. Set `"collapse"` so clicking the grip or pressing Enter/Space toggles the nearest collapsible panel.
   * @default "resize"
   */
  action?: SplitterHandleAction;
  /**
   * Whether the handle exposes start and end intersection targets for simultaneous two-axis resizing.
   * @default false
   */
  intersection?: boolean;
  /**
   * Whether this specific handle is disabled.
   * @default false
   */
  disabled?: boolean;
  /**
   * Custom content or render function receiving `{ collapsed, dragging, active, index, orientation }`.
   */
  children?: JSX.Element | ((state: SplitterHandleState) => JSX.Element);
  /**
   * Additional CSS classes for this handle element.
   */
  class?: ClassValue;
  /**
   * Accessible label for this handle (`aria-label`).
   */
  "aria-label"?: string;
}

export interface SplitterPanelItem {
  /**
   * Optional HTML id for the panel element.
   */
  id?: string;
  /**
   * Panel content or render function receiving live panel state.
   */
  children?: JSX.Element | ((state: SplitterPanelState) => JSX.Element);
  /**
   * Initial size for this panel when root `defaultValue` is not provided.
   */
  defaultSize?: SplitterSize;
  /**
   * Minimum size constraint (pixel number like `240` or percentage string like `'20%'`).
   * @default 0
   */
  min?: SplitterSize;
  /**
   * Maximum size constraint (pixel number like `480`, ratio `1`, or percentage string like `'45%'`).
   * @default 1
   */
  max?: SplitterSize;
  /**
   * Whether the panel can collapse to `collapsibleMin`.
   * @default false
   */
  collapsible?: boolean;
  /**
   * Remaining size when the panel is collapsed (pixel number like `56` or percentage string).
   * @default 0
   */
  collapsibleMin?: SplitterSize;
  /**
   * Initial collapsed state for uncontrolled panels.
   * @default false
   */
  defaultCollapsed?: boolean;
  /**
   * Controlled collapsed state for the panel.
   */
  collapsed?: boolean;
  /**
   * Callback fired with the panel's pixel size when the panel collapses.
   */
  onCollapse?: (size: number) => void;
  /**
   * Callback fired with the panel's pixel size when the panel expands.
   */
  onExpand?: (size: number) => void;
  /**
   * Whether the panel is resizable. When `false`, the panel stays locked at its current size.
   * @default true
   */
  resizable?: boolean;
  /**
   * Optional handle configuration for the separator immediately following this panel.
   */
  handle?: SplitterHandleConfig;
  /**
   * Additional CSS classes applied to this panel element.
   */
  class?: ClassValue;
}

export type RLSplitterProps = InferThemeProps<typeof RLSplitterTheme> & {
  /**
   * Declarative panel configurations (constraints, collapse settings, content, and per-panel handle overrides).
   */
  panels?: readonly (SplitterPanelItem | JSX.Element)[];

  /**
   * Controlled panel sizes (pixel numbers like `280` or percentage strings like `'30%'`).
   */
  value?: readonly SplitterSize[];

  /**
   * Initial uncontrolled panel sizes (pixel numbers like `240` or percentage strings like `'30%'`).
   */
  defaultValue?: readonly SplitterSize[];

  /**
   * Step delta applied when resizing a focused handle with arrow keys.
   * @default "10%"
   */
  keyboardDelta?: SplitterSize;

  /**
   * Optional per-handle configurations indexed by separator position.
   */
  handles?: readonly SplitterHandleConfig[];

  /**
   * Default action for all handles unless overridden in `handles` or `panels[i].handle`.
   * @default "resize"
   */
  action?: SplitterHandleAction;

  /**
   * Whether handles expose start/end intersection targets for two-axis corner dragging.
   * @default false
   */
  intersection?: boolean;

  /**
   * Custom handle grip content, or a render function receiving `{ collapsed, dragging, active, index, orientation }`.
   */
  handleSlot?: SlotRenderer<SplitterHandleState>;

  /**
   * Icon name rendered inside the default handle control, or `false` to hide the default icon.
   * @default "grip-vertical" (horizontal) or "grip-horizontal" (vertical)
   */
  handleIcon?: string | false;

  /**
   * Localized strings override for handle accessibility labels.
   */
  translations?: SplitterTranslations;

  /**
   * Callback fired with exact pixel sizes whenever panel sizes change.
   */
  onValueChange?: (sizes: number[]) => void;

  /**
   * Callback fired when pointer dragging starts on a handle.
   */
  onResizeStart?: (index: number, sizes: number[]) => void;

  /**
   * Callback fired when pointer dragging ends on a handle.
   */
  onResizeEnd?: (index: number, sizes: number[]) => void;

  /**
   * Callback fired when a key is pressed on a focused handle.
   */
  onHandleKeyDown?: (event: KeyboardEvent, index: number) => void;
};
