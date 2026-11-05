import type { RLLayoutGridProps } from "./layout-grid.types";
import { RLLayoutGridTheme } from "./layout-grid.theme";
import { computeGridMetrics, toBreakpointScale } from "./layout-grid.helpers";
import {
  LAYOUT_GRID_BREAKPOINTS,
  LAYOUT_GRID_COLORS,
  LAYOUT_GRID_COLS,
  LAYOUT_GRID_INNER_MAX_WIDTH,
  LAYOUT_GRID_MAX_WIDTH,
  LAYOUT_GRID_OPACITIES,
  LAYOUT_GRID_ROOT_FONT_SIZE,
  LAYOUT_GRID_SHORTCUT,
  LAYOUT_GRID_SPACING,
  LAYOUT_GRID_STORAGE_KEY,
  LAYOUT_GRID_Z_INDEX,
} from "../../constants/layout-grid";
import {
  createEffect,
  createMemo,
  createSignal,
  For,
  Show,
  onSettled,
  type Component,
} from "solid-js";
import { defineShortcuts } from "../../shortcuts";
import { uiT } from "../../locale";

const isDev = (import.meta as ImportMeta & { env?: { DEV?: boolean } }).env?.DEV === true;

const OMIT_KEYS = [
  "cols",
  "smCols",
  "mdCols",
  "lgCols",
  "xlCols",
  "smBreakpoint",
  "mdBreakpoint",
  "lgBreakpoint",
  "xlBreakpoint",
  "gutter",
  "margin",
  "gridColor",
  "gridOpacity",
  "maxWidth",
  "innerMaxWidth",
  "innerGridColor",
  "innerGridOpacity",
  "showInnerBackground",
  "showBackground",
  "showFullWidth",
  "fullWidthGridColor",
  "fullWidthGridOpacity",
  "showFullWidthBackground",
  "zIndex",
  "shortcut",
  "devOnly",
] as const;

export const RLLayoutGrid: Component<RLLayoutGridProps> = (props) => {
  const { Tag, classes, rest, theme } = RLLayoutGridTheme.setup(props, { omit: OMIT_KEYS });

  const shouldRender = (): boolean => !(props.devOnly ?? true) || isDev;

  let hostRef: HTMLElement | undefined;

  const [visible, setVisible] = createSignal(false);
  const [viewportWidth, setViewportWidth] = createSignal(0);
  const [rootFontSize, setRootFontSize] = createSignal<number>(LAYOUT_GRID_ROOT_FONT_SIZE);

  const metrics = createMemo(() =>
    computeGridMetrics({
      width: viewportWidth(),
      fontSize: rootFontSize(),
      thresholds: [
        0,
        props.smBreakpoint ?? LAYOUT_GRID_BREAKPOINTS.sm,
        props.mdBreakpoint ?? LAYOUT_GRID_BREAKPOINTS.md,
        props.lgBreakpoint ?? LAYOUT_GRID_BREAKPOINTS.lg,
        props.xlBreakpoint ?? LAYOUT_GRID_BREAKPOINTS.xl,
      ],
      columns: [
        props.cols ?? LAYOUT_GRID_COLS.base,
        props.smCols ?? LAYOUT_GRID_COLS.sm,
        props.mdCols ?? LAYOUT_GRID_COLS.md,
        props.lgCols ?? LAYOUT_GRID_COLS.lg,
        props.xlCols ?? LAYOUT_GRID_COLS.xl,
      ],
      gutter: toBreakpointScale(props.gutter ?? LAYOUT_GRID_SPACING),
      margin: toBreakpointScale(props.margin ?? LAYOUT_GRID_SPACING),
      maxWidth: props.maxWidth ?? LAYOUT_GRID_MAX_WIDTH,
      innerMaxWidth: props.innerMaxWidth ?? LAYOUT_GRID_INNER_MAX_WIDTH,
      grid: {
        color: props.gridColor ?? LAYOUT_GRID_COLORS.grid,
        opacity: props.gridOpacity ?? LAYOUT_GRID_OPACITIES.grid,
        background: props.showBackground ?? true,
      },
      inner: {
        color: props.innerGridColor ?? LAYOUT_GRID_COLORS.inner,
        opacity: props.innerGridOpacity ?? LAYOUT_GRID_OPACITIES.inner,
        background: props.showInnerBackground ?? true,
      },
      fullWidth: {
        color: props.fullWidthGridColor ?? LAYOUT_GRID_COLORS.fullWidth,
        opacity: props.fullWidthGridOpacity ?? LAYOUT_GRID_OPACITIES.fullWidth,
        background: props.showFullWidthBackground ?? true,
      },
      showFullWidth: props.showFullWidth ?? true,
    }),
  );

  const toggleGrid = (): void => {
    const next = !visible();
    setVisible(next);
    localStorage.setItem(LAYOUT_GRID_STORAGE_KEY, String(next));
  };

  onSettled(() => {
    setVisible(localStorage.getItem(LAYOUT_GRID_STORAGE_KEY) === "true");

    const updateViewport = () => {
      setViewportWidth(document.documentElement.clientWidth);
      const fontSize = parseFloat(getComputedStyle(document.documentElement).fontSize);
      setRootFontSize(fontSize || LAYOUT_GRID_ROOT_FONT_SIZE);
    };
    updateViewport();

    const resizeObserver = new ResizeObserver(updateViewport);
    resizeObserver.observe(document.documentElement);

    const cleanupShortcuts = defineShortcuts({
      [props.shortcut ?? LAYOUT_GRID_SHORTCUT]: {
        handler: (e) => {
          e.preventDefault();
          toggleGrid();
        },
        label: uiT("layout-grid.shortcut.label"),
        description: uiT("layout-grid.shortcut.description"),
        category: uiT("layout-grid.shortcut.category"),
      },
    });

    return () => {
      resizeObserver.disconnect();
      cleanupShortcuts();
    };
  });

  createEffect(
    () => (visible() ? metrics() : undefined),
    (current) => {
      if (current === undefined) return;
      const { colCount, gutterPx, marginPx, colWidth, maxWidth } = current;
      const cols = colCount.toString();
      const gap = `${gutterPx}px`;
      const margin = `${marginPx}px`;

      hostRef?.style.setProperty("--rl-grid-cols", cols);
      hostRef?.style.setProperty("--rl-grid-gap", gap);
      hostRef?.style.setProperty("--rl-grid-margin", margin);
      hostRef?.style.setProperty("--rl-grid-max-width", maxWidth);

      const rootStyle = document.documentElement.style;
      rootStyle.setProperty("--rl-grid-cols", cols);
      rootStyle.setProperty("--rl-grid-gap", gap);
      rootStyle.setProperty("--rl-grid-gutter", gap);
      rootStyle.setProperty("--rl-grid-col-width", `${colWidth}px`);
      rootStyle.setProperty("--rl-grid-margin", margin);
      rootStyle.setProperty("--rl-grid-max-width", maxWidth);
    },
  );

  return (
    <Show when={shouldRender()}>
      <Tag
        ref={(el: HTMLElement) => (hostRef = el)}
        data-slot="root"
        data-theme={theme()}
        class={classes().root}
        {...rest}
      >
        <Show when={visible()}>
          <aside
            class={classes().overlay}
            data-slot="overlay"
            style={{ "--rl-grid-z-index": String(props.zIndex ?? LAYOUT_GRID_Z_INDEX) }}
          >
            <div class={classes().container} data-slot="container">
              <div class={classes().columns}>
                <For each={metrics().innerColumns}>
                  {(col) => (
                    <div
                      class={classes().column}
                      style={{
                        "--rl-col-border": col["--rl-col-border"],
                        "--rl-col-bg": col["--rl-col-bg"],
                      }}
                    />
                  )}
                </For>
              </div>
              <For each={metrics().outerColumns}>
                {(col) => (
                  <div
                    class={classes().outerColumn}
                    style={{
                      "--rl-col-left": col["--rl-col-left"],
                      "--rl-col-width": col["--rl-col-width"],
                      "--rl-col-border": col["--rl-col-border"],
                      "--rl-col-bg": col["--rl-col-bg"],
                    }}
                  />
                )}
              </For>
            </div>
            <div class={classes().indicator} data-slot="indicator">
              <span class={classes().indicatorBreakpoint}>
                {`${metrics().breakpoint.toUpperCase()} (${metrics().threshold}px)`}
              </span>
              <span class={classes().indicatorDivider}>|</span>
              <span>{`${metrics().width}px`}</span>
              <span class={classes().indicatorDivider}>|</span>
              <span class={classes().indicatorColumns}>{`${metrics().totalCols} Cols`}</span>
            </div>
          </aside>
        </Show>
      </Tag>
    </Show>
  );
};
