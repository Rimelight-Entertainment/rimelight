import type { JSX } from "@solidjs/web";

export interface ChartDataPoint {
  label: string;
  value: number;
  color?: string;
}

export interface RLChartProps {
  type?: "bar" | "line" | "pie" | "area" | "donut";
  data?: ChartDataPoint[];
  title?: string;
  height?: number;
  color?: (string & {}) | undefined;
  ui?: any;
  class?: any;
  children?: JSX.Element;
  [key: string]: unknown;
}
