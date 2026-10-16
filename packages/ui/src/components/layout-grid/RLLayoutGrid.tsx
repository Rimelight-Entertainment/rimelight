import type { RLLayoutGridProps } from "./layout-grid.types";
import { RLLayoutGridTheme } from "./layout-grid.theme";
import {
  createMemo,
  createSignal,
  createEffect,
  For,
  omit,
  Show,
  onSettled,
  type Component,
} from "solid-js";
import { defineShortcuts } from "../../shortcuts";

const isDev = (import.meta as ImportMeta & { env?: { DEV?: boolean } }).env?.DEV === true;

const normalizeArray = (val: number | number[] | undefined, defaultValue: number): number[] => {
  if (val === undefined)
    return [defaultValue, defaultValue, defaultValue, defaultValue, defaultValue];
  if (!Array.isArray(val)) return [val, val, val, val, val];
  const arr = [...val];
  while (arr.length < 5) {
    const lastVal = arr[arr.length - 1];
    arr.push(lastVal !== undefined ? lastVal : defaultValue);
  }
  return arr;
};

const hexToRgba = (hex: string, alpha: number): string => {
  const cleanHex = hex.replace("#", "");
  const num = parseInt(cleanHex, 16);
  const r = (num >> 16) & 255;
  const g = (num >> 8) & 255;
  const b = num & 255;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

export const RLLayoutGrid: Component<RLLayoutGridProps> = (props) => {
  const rest = omit(
    props,
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
    "ui",
    "class",
  );

  const classes = createMemo(() => RLLayoutGridTheme({ ui: props.ui, class: props.class }));

  const gutterArray = createMemo(() => normalizeArray(props.gutter ?? [0.75, 1, 1.5, 2, 2], 1));
  const marginArray = createMemo(() => normalizeArray(props.margin ?? [0.75, 1, 1.5, 2, 2], 1));

  const shouldRender = () => !(props.devOnly ?? true) || isDev;

  let hostRef: HTMLElement | undefined;
  let overlayRef: HTMLElement | undefined;

  const [visible, setVisible] = createSignal(false);
  const [viewportWidth, setViewportWidth] = createSignal(0);
  const [rootFontSize, setRootFontSize] = createSignal(16);
  const [currentBreakpoint, setCurrentBreakpoint] = createSignal<
    "base" | "sm" | "md" | "lg" | "xl"
  >("base");

  const toggleGrid = () => {
    setVisible((wasVisible) => {
      const next = !wasVisible;
      if (typeof localStorage !== "undefined") {
        localStorage.setItem("rl-grid-visible", next ? "true" : "false");
      }
      return next;
    });
  };

  onSettled(() => {
    if (typeof localStorage !== "undefined") {
      setVisible(localStorage.getItem("rl-grid-visible") === "true");
    }

    const updateBreakpoint = () => {
      const width = document.documentElement.clientWidth;
      const fontSize = parseFloat(getComputedStyle(document.documentElement).fontSize) || 16;
      setViewportWidth(width);
      setRootFontSize(fontSize);

      const sm = props.smBreakpoint ?? 640;
      const md = props.mdBreakpoint ?? 768;
      const lg = props.lgBreakpoint ?? 1024;
      const xl = props.xlBreakpoint ?? 1280;
      let next: "base" | "sm" | "md" | "lg" | "xl" = "base";
      if (width >= xl) next = "xl";
      else if (width >= lg) next = "lg";
      else if (width >= md) next = "md";
      else if (width >= sm) next = "sm";
      setCurrentBreakpoint(next);
    };
    updateBreakpoint();

    const resizeObserver = new ResizeObserver(updateBreakpoint);
    resizeObserver.observe(document.documentElement);

    const cleanupShortcuts = defineShortcuts({
      [props.shortcut ?? "meta_shift_g"]: {
        handler: (e) => {
          e.preventDefault();
          toggleGrid();
        },
        label: "Toggle Layout Grid",
        description: "Show or hide the development layout grid guide overlay",
        category: "development",
      },
    });

    return () => {
      resizeObserver.disconnect();
      cleanupShortcuts();
    };
  });

  const gridMetrics = createMemo(() => {
    const bp = currentBreakpoint();
    const gutters = gutterArray();
    const margins = marginArray();
    const width = viewportWidth();
    const fontSize = rootFontSize();

    const smBreakpoint = props.smBreakpoint ?? 640;
    const mdBreakpoint = props.mdBreakpoint ?? 768;
    const lgBreakpoint = props.lgBreakpoint ?? 1024;
    const xlBreakpoint = props.xlBreakpoint ?? 1280;

    let breakpointIndex = 0;
    let colCount = props.cols ?? 4;
    let breakpointThreshold = 0;

    switch (bp) {
      case "xl":
        breakpointIndex = 4;
        colCount = props.xlCols ?? 12;
        breakpointThreshold = xlBreakpoint;
        break;
      case "lg":
        breakpointIndex = 3;
        colCount = props.lgCols ?? 12;
        breakpointThreshold = lgBreakpoint;
        break;
      case "md":
        breakpointIndex = 2;
        colCount = props.mdCols ?? 8;
        breakpointThreshold = mdBreakpoint;
        break;
      case "sm":
        breakpointIndex = 1;
        colCount = props.smCols ?? 4;
        breakpointThreshold = smBreakpoint;
        break;
      default:
        breakpointIndex = 0;
        colCount = props.cols ?? 4;
        breakpointThreshold = 0;
        break;
    }

    const gutterValue = gutters[breakpointIndex] ?? gutters[gutters.length - 1] ?? 1;
    const marginValue = margins[breakpointIndex] ?? margins[margins.length - 1] ?? 1;

    const gridColor = props.gridColor ?? "#ff0000";
    const gridOpacity = props.gridOpacity ?? 0.1;
    const showBackground = props.showBackground ?? true;
    const showFullWidth = props.showFullWidth ?? true;
    const fullWidthColor = props.fullWidthGridColor ?? "#3b82f6";
    const fullWidthOpacity = props.fullWidthGridOpacity ?? 0.05;
    const showFullWidthBackground = props.showFullWidthBackground ?? true;

    const marginPx = marginValue * fontSize;
    const gutterPx = gutterValue * fontSize;

    const maxWidthVal = props.maxWidth ?? "1440px";
    const maxWidthPx = maxWidthVal.includes("vw") ? width : parseInt(maxWidthVal);

    const innerMaxWidthVal = props.innerMaxWidth ?? "768px";
    const innerMaxWidthPx = innerMaxWidthVal.includes("vw") ? width : parseInt(innerMaxWidthVal);

    const innerGridColor = props.innerGridColor ?? "#10b981";
    const innerGridOpacity = props.innerGridOpacity ?? 0.1;
    const showInnerBackground = props.showInnerBackground ?? true;

    const activeWidth = width > maxWidthPx ? maxWidthPx : width;
    const innerWidth = activeWidth - 2 * marginPx;
    const colWidth = (innerWidth - (colCount - 1) * gutterPx) / colCount;

    const containerLeft = (width - maxWidthPx) / 2;
    const containerRight = (width + maxWidthPx) / 2;
    const containerStartX = width > maxWidthPx ? containerLeft + marginPx : marginPx;
    const step = colWidth + gutterPx;

    const innerLeft = (width - innerMaxWidthPx) / 2;
    const innerRight = (width + innerMaxWidthPx) / 2;

    const innerColumns = [];
    for (let i = 0; i < colCount; i++) {
      const colX = containerStartX + i * step;
      const colRight = colX + colWidth;
      const isInner = colX >= innerLeft - 1 && colRight <= innerRight + 1;
      const color = isInner ? innerGridColor : gridColor;
      const opacity = isInner ? innerGridOpacity : gridOpacity;
      const bg = isInner ? showInnerBackground : showBackground;
      innerColumns.push({
        "border-inline": `1px solid ${color}`,
        "background-color": bg ? hexToRgba(color, opacity) : "transparent",
      });
    }

    const outerColumns = [];
    if (width > maxWidthPx && showFullWidth && step > 0) {
      const outerBg = showFullWidthBackground
        ? hexToRgba(fullWidthColor, fullWidthOpacity)
        : "transparent";
      const outerBorder = `1px solid ${fullWidthColor}`;

      let leftX = marginPx;
      while (leftX + colWidth < containerLeft) {
        outerColumns.push({
          left: `${leftX}px`,
          width: `${colWidth}px`,
          "border-inline": outerBorder,
          "background-color": outerBg,
        });
        leftX += step;
      }

      let rightX = width - marginPx - colWidth;
      while (rightX > containerRight) {
        outerColumns.push({
          left: `${rightX}px`,
          width: `${colWidth}px`,
          "border-inline": outerBorder,
          "background-color": outerBg,
        });
        rightX -= step;
      }
    }

    return {
      bp,
      width,
      colCount,
      breakpointThreshold,
      gutterPx,
      marginPx,
      colWidth,
      maxWidthVal,
      totalCols: colCount + outerColumns.length,
      innerColumns,
      outerColumns,
    };
  });

  createEffect(
    () => ({ isVisible: visible(), metrics: gridMetrics() }),
    ({ isVisible, metrics }) => {
      if (overlayRef) {
        overlayRef.classList.toggle("hidden", !isVisible);
      }
      if (!isVisible) return;

      const { colCount, gutterPx, marginPx, colWidth, maxWidthVal } = metrics;

      hostRef?.style.setProperty("--rl-grid-cols", colCount.toString());
      hostRef?.style.setProperty("--rl-grid-gap", `${gutterPx}px`);
      hostRef?.style.setProperty("--rl-grid-margin", `${marginPx}px`);
      hostRef?.style.setProperty("--rl-grid-max-width", maxWidthVal);

      const rootStyle = document.documentElement.style;
      rootStyle.setProperty("--rl-grid-cols", colCount.toString());
      rootStyle.setProperty("--rl-grid-gap", `${gutterPx}px`);
      rootStyle.setProperty("--rl-grid-gutter", `${gutterPx}px`);
      rootStyle.setProperty("--rl-grid-col-width", `${colWidth}px`);
      rootStyle.setProperty("--rl-grid-margin", `${marginPx}px`);
      rootStyle.setProperty("--rl-grid-max-width", maxWidthVal);
    },
  );

  // Custom z-index via CSSOM only (never SSR-rendered as a style attribute).
  createEffect(
    () => props.zIndex,
    (zIndex) => {
      if (overlayRef) overlayRef.style.zIndex = String(zIndex ?? 1000);
    },
  );

  return (
    <Show when={shouldRender()}>
      <div
        ref={(el) => (hostRef = el)}
        data-slot="root"
        class={classes().root}
        data-cols={props.cols ?? 4}
        data-sm-cols={props.smCols ?? 4}
        data-md-cols={props.mdCols ?? 8}
        data-lg-cols={props.lgCols ?? 12}
        data-xl-cols={props.xlCols ?? 12}
        data-sm-breakpoint={props.smBreakpoint ?? 640}
        data-md-breakpoint={props.mdBreakpoint ?? 768}
        data-lg-breakpoint={props.lgBreakpoint ?? 1024}
        data-xl-breakpoint={props.xlBreakpoint ?? 1280}
        data-gutter={JSON.stringify(gutterArray())}
        data-margin={JSON.stringify(marginArray())}
        data-grid-color={props.gridColor ?? "#ff0000"}
        data-grid-opacity={props.gridOpacity ?? 0.1}
        data-show-background={(props.showBackground ?? true) ? "true" : "false"}
        data-max-width={props.maxWidth ?? "1440px"}
        data-inner-max-width={props.innerMaxWidth ?? "768px"}
        data-inner-color={props.innerGridColor ?? "#10b981"}
        data-inner-opacity={props.innerGridOpacity ?? 0.1}
        data-show-inner-background={(props.showInnerBackground ?? true) ? "true" : "false"}
        data-show-full-width={(props.showFullWidth ?? true) ? "true" : "false"}
        data-full-width-color={props.fullWidthGridColor ?? "#3b82f6"}
        data-full-width-opacity={props.fullWidthGridOpacity ?? 0.05}
        data-show-full-width-background={(props.showFullWidthBackground ?? true) ? "true" : "false"}
        data-shortcut={props.shortcut ?? "meta_shift_g"}
        {...rest}
      >
        <aside ref={(el) => (overlayRef = el)} class={classes().overlay} data-slot="overlay">
          <div class={classes().container} data-slot="columns-container">
            <Show when={visible()}>
              <div class={classes().columns}>
                <For each={gridMetrics().innerColumns}>
                  {(col) => <div class={classes().column} style={col} />}
                </For>
              </div>
              <For each={gridMetrics().outerColumns}>
                {(col) => <div class={classes().outerColumn} style={col} />}
              </For>
            </Show>
          </div>
          <div data-slot="indicator" class={classes().indicator}>
            <Show when={visible()}>
              <span class={classes().indicatorBreakpoint}>
                {`${gridMetrics().bp.toUpperCase()} (${gridMetrics().breakpointThreshold}px)`}
              </span>
              <span class={classes().indicatorDivider}>|</span>
              <span class={classes().indicatorWidth}>{`${gridMetrics().width}px`}</span>
              <span class={classes().indicatorDivider}>|</span>
              <span class={classes().indicatorColumns}>{`${gridMetrics().totalCols} Cols`}</span>
            </Show>
          </div>
        </aside>
      </div>
    </Show>
  );
};
