import { describe, it, expect } from "vite-plus/test";
import { renderToString, type JSX } from "@solidjs/web";
import { RLLayoutGrid } from "../src/components/layout-grid/RLLayoutGrid";
import {
  computeGridMetrics,
  toBreakpointScale,
} from "../src/components/layout-grid/layout-grid.helpers";
import type { GridMetricsInput } from "../src/components/layout-grid/layout-grid.types";
import { cleanHtml } from "./utils/normalize";

const base: GridMetricsInput = {
  width: 0,
  fontSize: 16,
  thresholds: [0, 640, 768, 1024, 1280],
  columns: [4, 4, 8, 12, 12],
  gutter: [0.75, 1, 1.5, 2, 2],
  margin: [0.75, 1, 1.5, 2, 2],
  maxWidth: "1440px",
  innerMaxWidth: "768px",
  grid: { color: "red", opacity: 0.1, background: true },
  inner: { color: "green", opacity: 0.1, background: true },
  fullWidth: { color: "blue", opacity: 0.05, background: true },
  showFullWidth: true,
};

const metricsAt = (width: number, overrides: Partial<GridMetricsInput> = {}) =>
  computeGridMetrics({ ...base, width, ...overrides });

function render(fn: () => JSX.Element): string {
  return cleanHtml(renderToString(fn));
}

describe("toBreakpointScale", () => {
  it("repeats a single value for every breakpoint", () => {
    expect(toBreakpointScale(2)).toEqual([2, 2, 2, 2, 2]);
  });

  it("pads short arrays with the last value", () => {
    expect(toBreakpointScale([1, 2])).toEqual([1, 2, 2, 2, 2]);
  });

  it("falls back to 1 for empty arrays", () => {
    expect(toBreakpointScale([])).toEqual([1, 1, 1, 1, 1]);
  });
});

describe("computeGridMetrics", () => {
  it("switches breakpoint exactly at each threshold", () => {
    expect(metricsAt(639).breakpoint).toBe("base");
    expect(metricsAt(640).breakpoint).toBe("sm");
    const md = metricsAt(768);
    expect(md.breakpoint).toBe("md");
    expect(md.threshold).toBe(768);
    expect(md.colCount).toBe(8);
  });

  it("uses the matching breakpoint's gutter and margin in px", () => {
    const md = metricsAt(800);
    expect(md.gutterPx).toBe(24);
    expect(md.marginPx).toBe(24);
  });

  it("creates no outer columns when the viewport fits the max width", () => {
    const metrics = metricsAt(1000);
    expect(metrics.outerColumns).toHaveLength(0);
    expect(metrics.innerColumns).toHaveLength(8);
    expect(metrics.totalCols).toBe(8);
  });

  it("emits full-width columns on both sides beyond the max width", () => {
    const metrics = metricsAt(1920);
    expect(metrics.breakpoint).toBe("xl");
    expect(metrics.colCount).toBe(12);
    expect(metrics.colWidth).toBeCloseTo(1024 / 12);
    expect(metrics.outerColumns).toHaveLength(4);
    expect(metrics.totalCols).toBe(16);
  });

  it("omits full-width columns when showFullWidth is false", () => {
    expect(metricsAt(1920, { showFullWidth: false }).outerColumns).toHaveLength(0);
  });

  it("resolves vw max widths against the viewport", () => {
    expect(metricsAt(1920, { maxWidth: "100vw" }).outerColumns).toHaveLength(0);
  });

  it("paints inner columns with the inner color and others with the grid color", () => {
    const { innerColumns } = metricsAt(1000);
    expect(innerColumns[0]?.["--rl-col-border"]).toBe("1px solid red");
    expect(innerColumns[1]?.["--rl-col-border"]).toBe("1px solid green");
    expect(innerColumns[1]?.["--rl-col-bg"]).toBe("color-mix(in srgb, green 10%, transparent)");
  });

  it("clears the background when background is disabled", () => {
    const { innerColumns } = metricsAt(1000, {
      grid: { color: "red", opacity: 0.1, background: false },
    });
    expect(innerColumns[0]?.["--rl-col-bg"]).toBe("transparent");
  });
});

describe("RLLayoutGrid", () => {
  it("renders the root with its slot", () => {
    const html = render(() => <RLLayoutGrid devOnly={false} />);
    expect(html).toContain('data-slot="root"');
  });

  it("sets data-theme from the theme prop", () => {
    const html = render(() => <RLLayoutGrid devOnly={false} theme="dark" />);
    expect(html).toContain('data-theme="dark"');
  });

  it("renders the root as the as prop element", () => {
    const html = render(() => <RLLayoutGrid devOnly={false} as="section" />);
    expect(html).toContain("<section");
  });

  it("does not mount the overlay before the client has settled", () => {
    const html = render(() => <RLLayoutGrid devOnly={false} />);
    expect(html).not.toContain('data-slot="overlay"');
  });
});
