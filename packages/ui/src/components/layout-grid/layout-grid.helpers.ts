import type {
  GridBreakpoint,
  GridColumnStyle,
  GridLine,
  GridMetrics,
  GridMetricsInput,
} from "./layout-grid.types";

const BREAKPOINT_NAMES: readonly GridBreakpoint[] = ["base", "sm", "md", "lg", "xl"];

export const toBreakpointScale = (value: number | readonly number[]): number[] => {
  const values = typeof value === "number" ? [value] : value;
  const last = values[values.length - 1] ?? 1;
  return BREAKPOINT_NAMES.map((_, index) => values[index] ?? last);
};

const resolveBreakpointIndex = (width: number, thresholds: readonly number[]): number => {
  for (let index = thresholds.length - 1; index > 0; index--) {
    const threshold = thresholds[index];
    if (threshold !== undefined && width >= threshold) return index;
  }
  return 0;
};

const resolveWidthPx = (value: string, viewportWidth: number): number =>
  value.includes("vw") ? viewportWidth : parseInt(value, 10);

const colorMix = (color: string, opacity: number): string =>
  `color-mix(in srgb, ${color} ${Math.round(opacity * 10000) / 100}%, transparent)`;

const lineStyle = (line: GridLine): GridColumnStyle => ({
  "--rl-col-border": `1px solid ${line.color}`,
  "--rl-col-bg": line.background ? colorMix(line.color, line.opacity) : "transparent",
});

export const computeGridMetrics = (input: GridMetricsInput): GridMetrics => {
  const { width, fontSize } = input;
  const breakpointIndex = resolveBreakpointIndex(width, input.thresholds);
  const colCount = input.columns[breakpointIndex] ?? 1;
  const gutterPx = (input.gutter[breakpointIndex] ?? 1) * fontSize;
  const marginPx = (input.margin[breakpointIndex] ?? 1) * fontSize;

  const maxWidthPx = resolveWidthPx(input.maxWidth, width);
  const innerMaxWidthPx = resolveWidthPx(input.innerMaxWidth, width);

  const activeWidth = width > maxWidthPx ? maxWidthPx : width;
  const colWidth = (activeWidth - 2 * marginPx - (colCount - 1) * gutterPx) / colCount;

  const containerLeft = (width - maxWidthPx) / 2;
  const containerRight = (width + maxWidthPx) / 2;
  const containerStartX = width > maxWidthPx ? containerLeft + marginPx : marginPx;
  const step = colWidth + gutterPx;

  const innerLeft = (width - innerMaxWidthPx) / 2;
  const innerRight = (width + innerMaxWidthPx) / 2;

  const innerColumns: GridColumnStyle[] = [];
  for (let i = 0; i < colCount; i++) {
    const colX = containerStartX + i * step;
    const colRight = colX + colWidth;
    const isInner = colX >= innerLeft - 1 && colRight <= innerRight + 1;
    innerColumns.push(lineStyle(isInner ? input.inner : input.grid));
  }

  const outerLefts: number[] = [];
  if (width > maxWidthPx && input.showFullWidth && step > 0) {
    for (let leftX = marginPx; leftX + colWidth < containerLeft; leftX += step) {
      outerLefts.push(leftX);
    }
    for (let rightX = width - marginPx - colWidth; rightX > containerRight; rightX -= step) {
      outerLefts.push(rightX);
    }
  }
  const outerColumns: GridColumnStyle[] = outerLefts.map((left) => ({
    "--rl-col-left": `${left}px`,
    "--rl-col-width": `${colWidth}px`,
    ...lineStyle(input.fullWidth),
  }));

  return {
    breakpoint: BREAKPOINT_NAMES[breakpointIndex] ?? "base",
    threshold: input.thresholds[breakpointIndex] ?? 0,
    width,
    colCount,
    gutterPx,
    marginPx,
    colWidth,
    maxWidth: input.maxWidth,
    totalCols: colCount + outerColumns.length,
    innerColumns,
    outerColumns,
  };
};
