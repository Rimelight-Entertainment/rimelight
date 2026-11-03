import type { JSX, ValidComponent } from "@solidjs/web";
import type { ClassValue, Theme, ThemeColor } from "../../types";

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
  orientation: SplitterOrientation;
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

export interface RLSplitterSlots {
  /**
   * Root container element of the resizable layout.
   */
  root?: ClassValue;
  /**
   * Resizable panel element.
   */
  panel?: ClassValue;
  /**
   * Separator handle element between panels.
   */
  handle?: ClassValue;
  /**
   * Inner grip / control element inside the handle.
   */
  handleControl?: ClassValue;
  /**
   * Start and end intersection targets inside the handle for multi-axis dragging.
   */
  intersection?: ClassValue;
}

export interface RLSplitterTranslations {
  /**
   * Accessible label for a resize handle.
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

export interface RLSplitterHandleConfig {
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
   * Content alias for `children`.
   */
  content?: JSX.Element | ((state: SplitterHandleState) => JSX.Element);
  /**
   * Additional CSS classes for this handle element.
   */
  class?: ClassValue;
  /**
   * Inline styles for this handle element.
   */
  style?: JSX.CSSProperties | string;
  /**
   * Custom ARIA label for this handle.
   */
  ariaLabel?: string;
}

export interface RLSplitterPanelItem {
  /**
   * Optional HTML id for the panel element.
   */
  id?: string;
  /**
   * Panel content or render function receiving live panel state.
   */
  content?: JSX.Element | ((state: SplitterPanelState) => JSX.Element);
  /**
   * Alias for `content`.
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
  handle?: RLSplitterHandleConfig;
  /**
   * Additional CSS classes applied to this panel element.
   */
  class?: ClassValue;
  /**
   * Inline styles applied to this panel element.
   */
  style?: JSX.CSSProperties | string;
}

export interface RLSplitterProps {
  /**
   * The HTML element or component this component should render as.
   * @default "div"
   */
  as?: ValidComponent;

  /**
   * Optional HTML id for the root container.
   */
  id?: string;

  /**
   * Resizing axis orientation.
   * @default "horizontal"
   */
  orientation?: SplitterOrientation;

  /**
   * Alias for `orientation` kept for backwards compatibility.
   * @default "horizontal"
   */
  direction?: SplitterOrientation;

  /**
   * Controlled panel sizes (pixel numbers like `280` or percentage strings like `'30%'`).
   */
  value?: readonly SplitterSize[];

  /**
   * Initial uncontrolled panel sizes (pixel numbers like `240` or percentage strings like `'30%'`).
   */
  defaultValue?: readonly SplitterSize[];

  /**
   * Legacy initial panel sizes array in percentage.
   */
  defaultSizes?: readonly number[];

  /**
   * Whether all resize handles and collapse actions are disabled.
   * @default false
   */
  disabled?: boolean;

  /**
   * Step delta applied when resizing a focused handle with arrow keys.
   * @default "10%"
   */
  keyboardDelta?: SplitterSize;

  /**
   * Declarative panel configurations (constraints, collapse settings, content, and per-panel handle overrides).
   */
  panels?: readonly (RLSplitterPanelItem | JSX.Element)[];

  /**
   * Optional per-handle configurations indexed by separator position.
   */
  handles?: readonly RLSplitterHandleConfig[];

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
  handleSlot?: JSX.Element | ((state: SplitterHandleState) => JSX.Element);

  /**
   * Icon name rendered inside the default handle control, or `false` to hide the default icon.
   */
  handleIcon?: string | boolean;

  /**
   * Localized strings override for handle accessibility labels.
   */
  translations?: RLSplitterTranslations;

  /**
   * Callback fired with exact pixel sizes whenever panel sizes change.
   */
  onValueChange?: (sizes: number[]) => void;

  /**
   * Alias for `onValueChange`.
   */
  onChange?: (sizes: number[]) => void;

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

  /**
   * Theme color accent for active/dragging handle states.
   * @default "auto"
   */
  color?: ThemeColor;

  /**
   * Optional theme mode override (`"light"` or `"dark"`).
   */
  theme?: Theme | (string & {});

  /**
   * Slot-specific CSS class overrides.
   */
  ui?: Partial<RLSplitterSlots>;

  /**
   * Alias for `ui` slot class overrides.
   */
  classes?: Partial<RLSplitterSlots>;

  /**
   * Additional CSS classes applied to the root element.
   */
  class?: ClassValue;

  /**
   * Inline styles applied to the root element.
   */
  style?: JSX.CSSProperties | string;

  /**
   * Per-slot inline style overrides.
   */
  styles?: Partial<Record<keyof RLSplitterSlots, JSX.CSSProperties | string>>;

  /**
   * Child panel elements when `panels` content is provided via JSX children.
   */
  children?: JSX.Element;

  [key: string]: unknown;
}
