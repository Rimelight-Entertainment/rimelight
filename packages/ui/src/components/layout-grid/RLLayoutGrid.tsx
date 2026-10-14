import type { RLLayoutGridProps } from "./layout-grid.types";
import { RLLayoutGridTheme } from "./layout-grid.theme";
import {
  createMemo,
  createSignal,
  createEffect,
  omit,
  Show,
  onSettled,
  type Component,
} from "solid-js";
import { dynamic } from "@solidjs/web";
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

export const RLLayoutGrid: Component<RLLayoutGridProps> = (allProps) => {
  const props = allProps;
  const rest = omit(
    allProps,
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

  const resolvedClasses = createMemo(() => RLLayoutGridTheme({ ui: props.ui, class: props.class }));

  const gutterArray = createMemo(() => normalizeArray(props.gutter ?? [0.75, 1, 1.5, 2, 2], 1));
  const marginArray = createMemo(() => normalizeArray(props.margin ?? [0.75, 1, 1.5, 2, 2], 1));

  const shouldRender = () => !(props.devOnly ?? true) || isDev;

  let hostRef: HTMLElement | undefined;
  let overlayRef: HTMLElement | undefined;
  let columnsRef: HTMLElement | undefined;
  let indicatorRef: HTMLElement | undefined;

  const [visible, setVisible] = createSignal(false);
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

  const updateGrid = (
    bp: "base" | "sm" | "md" | "lg" | "xl",
    gutters: number[],
    margins: number[],
    isVisible: boolean,
  ) => {
    const columnsContainer = columnsRef;
    const indicatorElement = indicatorRef;
    if (!columnsContainer || !isVisible) return;

    const width = document.documentElement.clientWidth;
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

    const rootFontSize = parseFloat(getComputedStyle(document.documentElement).fontSize) || 16;
    const marginPx = marginValue * rootFontSize;
    const gutterPx = gutterValue * rootFontSize;

    const maxWidthVal = props.maxWidth ?? "1440px";
    let maxWidthPx = width;
    if (!maxWidthVal.includes("vw")) {
      maxWidthPx = parseInt(maxWidthVal);
    }

    const innerMaxWidthVal = props.innerMaxWidth ?? "768px";
    let innerMaxWidthPx = width;
    if (!innerMaxWidthVal.includes("vw")) {
      innerMaxWidthPx = parseInt(innerMaxWidthVal);
    }

    const innerGridColor = props.innerGridColor ?? "#10b981";
    const innerGridOpacity = props.innerGridOpacity ?? 0.1;
    const showInnerBackground = props.showInnerBackground ?? true;

    const activeWidth = width > maxWidthPx ? maxWidthPx : width;
    const innerWidth = activeWidth - 2 * marginPx;
    const colWidth = (innerWidth - (colCount - 1) * gutterPx) / colCount;

    const containerLeft = (width - maxWidthPx) / 2;
    const containerRight = (width + maxWidthPx) / 2;

    columnsContainer.replaceChildren();

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

    const containerStartX = width > maxWidthPx ? containerLeft + marginPx : marginPx;
    const step = colWidth + gutterPx;

    let totalCols = colCount;
    if (width > maxWidthPx && showFullWidth) {
      let leftX = marginPx;
      while (leftX + colWidth < containerLeft) {
        totalCols++;
        leftX += step;
      }
      let rightX = width - marginPx - colWidth;
      while (rightX > containerRight) {
        totalCols++;
        rightX -= step;
      }
    }

    if (indicatorElement) {
      const { indicatorBreakpoint, indicatorDivider, indicatorWidth, indicatorColumns } =
        resolvedClasses();

      const breakpointSpan = document.createElement("span");
      breakpointSpan.className = indicatorBreakpoint;
      breakpointSpan.textContent = `${bp.toUpperCase()} (${breakpointThreshold}px)`;

      const firstDivider = document.createElement("span");
      firstDivider.className = indicatorDivider;
      firstDivider.textContent = "|";

      const widthSpan = document.createElement("span");
      widthSpan.className = indicatorWidth;
      widthSpan.textContent = `${width}px`;

      const secondDivider = document.createElement("span");
      secondDivider.className = indicatorDivider;
      secondDivider.textContent = "|";

      const columnsSpan = document.createElement("span");
      columnsSpan.className = indicatorColumns;
      columnsSpan.textContent = `${totalCols} Cols`;

      indicatorElement.replaceChildren(
        breakpointSpan,
        firstDivider,
        widthSpan,
        secondDivider,
        columnsSpan,
      );
    }

    const gridWrapper = document.createElement("div");
    gridWrapper.className = resolvedClasses().columns;

    const innerLeft = (width - innerMaxWidthPx) / 2;
    const innerRight = (width + innerMaxWidthPx) / 2;

    for (let i = 0; i < colCount; i++) {
      const colX = containerStartX + i * step;
      const colRight = colX + colWidth;
      const isInner = colX >= innerLeft - 1 && colRight <= innerRight + 1;

      const col = document.createElement("div");
      col.className = resolvedClasses().column;
      const color = isInner ? innerGridColor : gridColor;
      const opacity = isInner ? innerGridOpacity : gridOpacity;
      const bg = isInner ? showInnerBackground : showBackground;
      col.style.borderInline = `1px solid ${color}`;
      col.style.backgroundColor = bg ? hexToRgba(color, opacity) : "transparent";
      gridWrapper.appendChild(col);
    }

    columnsContainer.appendChild(gridWrapper);

    if (width > maxWidthPx && showFullWidth) {
      const drawOuterColumn = (x: number) => {
        const col = document.createElement("div");
        col.className = resolvedClasses().outerColumn;
        col.style.left = `${x}px`;
        col.style.width = `${colWidth}px`;
        col.style.borderInline = `1px solid ${fullWidthColor}`;
        col.style.backgroundColor = showFullWidthBackground
          ? hexToRgba(fullWidthColor, fullWidthOpacity)
          : "transparent";
        columnsContainer.appendChild(col);
      };

      let leftX = marginPx;
      while (leftX + colWidth < containerLeft) {
        drawOuterColumn(leftX);
        leftX += step;
      }

      let rightX = width - marginPx - colWidth;
      while (rightX > containerRight) {
        drawOuterColumn(rightX);
        rightX -= step;
      }
    }
  };

  // Visibility + z-index are applied via classList / CSSOM (no SSR style
  // attributes, keeping strict `style-src 'self'` CSP clean). All reactive
  // deps are read inside the tracking scope.
  createEffect(
    () => {
      const isVisible = visible();
      const bp = currentBreakpoint();
      const gutters = gutterArray();
      const margins = marginArray();
      return { isVisible, bp, gutters, margins };
    },
    ({ isVisible, bp, gutters, margins }) => {
      if (overlayRef) {
        overlayRef.classList.toggle("hidden", !isVisible);
      }
      updateGrid(bp, gutters, margins, isVisible);
    },
  );

  // Custom z-index via CSSOM only (never SSR-rendered as a style attribute).
  createEffect(
    () => props.zIndex,
    (zIndex) => {
      if (overlayRef) overlayRef.style.zIndex = String(zIndex ?? 1000);
    },
  );

  const Root = dynamic(() => "rl-layout-grid");

  return (
    <Show when={shouldRender()}>
      <Root
        ref={(el: Element) => (hostRef = el as HTMLElement | undefined)}
        class={resolvedClasses().root}
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
        <aside
          ref={(el) => (overlayRef = el as HTMLElement | undefined)}
          class={resolvedClasses().overlay}
          data-slot="overlay"
          id="rl-layout-grid-overlay"
        >
          <div
            ref={(el) => (columnsRef = el as HTMLElement | undefined)}
            class={resolvedClasses().container}
            data-slot="columns-container"
          />
          <div
            ref={(el) => (indicatorRef = el as HTMLElement | undefined)}
            data-slot="indicator"
            class={resolvedClasses().indicator}
          />
        </aside>
      </Root>
    </Show>
  );
};
