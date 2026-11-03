import type { InferThemeProps } from "../../resolver";
import type { RLChartTheme } from "./chart.theme";

export interface ChartDataPoint {
  label: string;
  value: number;
  color?: string;
}

export type RLChartProps = InferThemeProps<typeof RLChartTheme> & {
  /**
   * Chart type to render.
   *
   * @default "bar"
   */
  type?: "bar" | "line" | "pie" | "area" | "donut";
  /**
   * Data points to plot.
   *
   * @default []
   */
  data?: ChartDataPoint[];
  /**
   * Title rendered above the chart. Also used as the accessible name of line and area charts.
   */
  title?: string;
  /**
   * Height of the chart area in pixels.
   *
   * @default 280
   */
  height?: number;
};
