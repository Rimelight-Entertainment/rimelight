import { describe, it, expect } from "vite-plus/test";

import { RLChart } from "../src/components/chart/RLChart";
import { renderToString, type JSX } from "@solidjs/web";
import { cleanHtml } from "./utils/normalize";
import { CHART_PALETTE } from "../src/constants/chart";

function render(fn: () => JSX.Element): string {
  return cleanHtml(renderToString(fn));
}

const sales = [
  { label: "Jan", value: 10 },
  { label: "Feb", value: 20 },
  { label: "Mar", value: 30 },
];

describe("RLChart", () => {
  describe("Structure", () => {
    it("renders a div root with data-slot and data-theme", () => {
      const html = render(() => <RLChart data={sales} theme="dark" />);
      expect(html).toMatch(/^<div[^>]*data-slot="root"[^>]*data-theme="dark"/);
    });

    it("renders the custom tag when as is set", () => {
      const html = render(() => <RLChart as="section" data={sales} />);
      expect(html).toMatch(/^<section[^>]*data-slot="root"/);
    });

    it("renders the title when provided", () => {
      const html = render(() => <RLChart title="Revenue" data={sales} />);
      expect(html).toMatch(/data-slot="title"[^>]*>Revenue</);
    });

    it("omits the title when not provided", () => {
      const html = render(() => <RLChart data={sales} />);
      expect(html).not.toContain('data-slot="title"');
    });

    it("renders children after the chart", () => {
      const html = render(() => (
        <RLChart data={sales}>
          <p>Footnote</p>
        </RLChart>
      ));
      expect(html).toContain("<p>Footnote</p>");
    });
  });

  describe("Height", () => {
    it("defaults the chart height to 280px", () => {
      const html = render(() => <RLChart data={sales} />);
      expect(html).toMatch(/--rl-chart-height:\s*280px/);
    });

    it("uses the height prop", () => {
      const html = render(() => <RLChart data={sales} height={320} />);
      expect(html).toMatch(/--rl-chart-height:\s*320px/);
    });
  });

  describe("Bar", () => {
    it("renders one bar per data point", () => {
      const html = render(() => <RLChart data={sales} />);
      expect(html.match(/data-slot="bar-item"/g)?.length).toBe(3);
    });

    it("renders bars by default", () => {
      const html = render(() => <RLChart data={sales} />);
      expect(html).toContain('data-slot="container"');
      expect(html).not.toContain('data-slot="line-wrap"');
      expect(html).not.toContain('data-slot="pie-wrap"');
    });

    it("uses the explicit color of a data point", () => {
      const html = render(() => <RLChart data={[{ label: "A", value: 5, color: "#123456" }]} />);
      expect(html).toContain('fill="#123456"');
    });

    it("falls back to the palette color by index", () => {
      const html = render(() => <RLChart data={sales} />);
      expect(html).toContain(`fill="${CHART_PALETTE[0]}"`);
      expect(html).toContain(`fill="${CHART_PALETTE[1]}"`);
    });

    it("renders a legend for the data points", () => {
      const html = render(() => <RLChart data={sales} />);
      expect(html.match(/data-slot="legend-item"/g)?.length).toBe(3);
    });

    it("renders no bars and no legend for empty data", () => {
      const html = render(() => <RLChart data={[]} />);
      expect(html).not.toContain('data-slot="bar-item"');
      expect(html).not.toContain('data-slot="legend"');
    });
  });

  describe("Line and area", () => {
    it("renders a line wrapper for line charts", () => {
      const html = render(() => <RLChart type="line" data={sales} />);
      expect(html).toContain('data-slot="line-wrap"');
      expect(html).not.toContain('data-slot="container"');
    });

    it("uses the title as the accessible name of line charts", () => {
      const html = render(() => <RLChart type="line" title="Revenue" data={sales} />);
      expect(html).toContain('aria-label="Revenue"');
    });

    it("renders an area fill only for area charts", () => {
      const area = render(() => <RLChart type="area" data={sales} />);
      const line = render(() => <RLChart type="line" data={sales} />);
      expect(area).toMatch(/<path[^>]*fill-opacity="0\.15"/);
      expect(line).not.toMatch(/<path[^>]*fill-opacity="0\.15"/);
    });

    it("renders one point marker per data point", () => {
      const html = render(() => <RLChart type="line" data={sales} />);
      expect(html.match(/<circle[^>]*\sr="4"/g)?.length).toBe(3);
    });
  });

  describe("Pie and donut", () => {
    it("renders one slice per data point", () => {
      const html = render(() => <RLChart type="pie" data={sales} />);
      expect(html.match(/data-slot="slice"/g)?.length).toBe(3);
    });

    it("renders the pie legend with values", () => {
      const html = render(() => <RLChart type="pie" data={sales} />);
      expect(html.match(/data-slot="pie-legend-item"/g)?.length).toBe(3);
      expect(html).toMatch(/data-slot="pie-legend-value"[^>]*>20</);
    });

    it("renders a center hole only for donut charts", () => {
      const donut = render(() => <RLChart type="donut" data={sales} />);
      const pie = render(() => <RLChart type="pie" data={sales} />);
      expect(donut).toContain('r="45"');
      expect(pie).not.toContain('r="45"');
    });

    it("does not render the bottom legend for pie charts", () => {
      const html = render(() => <RLChart type="pie" data={sales} />);
      expect(html).not.toContain('data-slot="legend"');
    });
  });
});
