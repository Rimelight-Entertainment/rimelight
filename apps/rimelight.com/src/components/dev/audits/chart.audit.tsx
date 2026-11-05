import { createSignal, For } from "solid-js";
import type { JSX } from "@solidjs/web";
import { RLChart } from "@rimelight/ui/components/chart/RLChart.tsx";
import type { ComponentAuditDefinition } from "./types";

const TYPES = ["bar", "line", "pie", "area", "donut"] as const;
const DATA = [
  { label: "Jan", value: 40 },
  { label: "Feb", value: 72 },
  { label: "Mar", value: 55 },
  { label: "Apr", value: 91 },
];

export const ChartSandbox = (): JSX.Element => {
  const [type, setType] = createSignal<(typeof TYPES)[number]>("bar");

  return (
    <div class="flex flex-col gap-6">
      <div class="p-4 rounded-xl border border-default bg-elevated/20 flex flex-wrap items-center gap-2 text-xs">
        <span class="text-muted mr-1">type</span>
        <For each={TYPES}>
          {(t) => (
            <button
              type="button"
              onClick={() => setType(t)}
              class={`px-2 py-0.5 rounded text-xs font-mono ${
                type() === t
                  ? "bg-primary text-inverted"
                  : "bg-elevated text-muted border border-default"
              }`}
            >
              {t}
            </button>
          )}
        </For>
      </div>
      <RLChart type={type()} data={DATA} title="Monthly signups" />
    </div>
  );
};

export const chartAudit: ComponentAuditDefinition = {
  id: "chart",
  name: "Chart",
  category: "Data Display",
  status: "Auditing",
  description:
    "Renders bar, line, pie, area, or donut charts from a data array, with an optional title, height, and children in the default slot.",
  importPath: "@rimelight/ui/components/chart/RLChart.tsx",
  renderSandbox: () => <ChartSandbox />,
  testScenarios: [
    {
      id: "default-slot-children",
      title: "Default slot (children)",
      description: "Children render inside the chart body alongside the data.",
      render: () => (
        <RLChart data={DATA} title="With children">
          <p class="text-xs text-muted">Custom note rendered in the chart body.</p>
        </RLChart>
      ),
    },
    {
      id: "type-bar",
      title: "Type: bar",
      description: "Bar chart (default type).",
      render: () => <RLChart type="bar" data={DATA} title="Bar" />,
    },
    {
      id: "type-line",
      title: "Type: line",
      description: "Line chart.",
      render: () => <RLChart type="line" data={DATA} title="Line" />,
    },
    {
      id: "type-pie",
      title: "Type: pie",
      description: "Pie chart.",
      render: () => <RLChart type="pie" data={DATA} title="Pie" />,
    },
    {
      id: "type-area",
      title: "Type: area",
      description: "Area chart.",
      render: () => <RLChart type="area" data={DATA} title="Area" />,
    },
    {
      id: "type-donut",
      title: "Type: donut",
      description: "Donut chart.",
      render: () => <RLChart type="donut" data={DATA} title="Donut" />,
    },
    {
      id: "custom-color-and-height",
      title: "Custom point color and height",
      description: "Per-point color override and a custom height.",
      render: () => (
        <RLChart
          type="bar"
          height={180}
          title="Custom"
          data={[
            { label: "A", value: 10, color: "#3b82f6" },
            { label: "B", value: 30, color: "#22c55e" },
            { label: "C", value: 20, color: "#f59e0b" },
          ]}
        />
      ),
    },
    {
      id: "empty",
      title: "Empty data",
      description: "Renders with no data points.",
      render: () => <RLChart data={[]} title="Empty" />,
    },
  ],
};
