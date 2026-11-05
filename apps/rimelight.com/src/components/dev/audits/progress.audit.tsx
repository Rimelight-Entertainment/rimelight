import { createSignal, For } from "solid-js";
import type { JSX } from "@solidjs/web";
import { RLProgress } from "@rimelight/ui/components/progress/RLProgress.tsx";
import { AUDIT_COLORS, type ComponentAuditDefinition, type TestScenario } from "./types";

const SIZES = ["xs", "sm", "md", "lg", "xl"] as const;

const ProgressSandbox = (): JSX.Element => {
  const [value, setValue] = createSignal(40);
  const [max, setMax] = createSignal(100);
  const [size, setSize] = createSignal<(typeof SIZES)[number]>("md");
  const [color, setColor] = createSignal<string>("primary");

  return (
    <div class="flex flex-col gap-6">
      <div class="flex flex-wrap gap-2">
        <button type="button" onClick={() => setValue((v) => Math.max(0, v - 10))}>
          value -10
        </button>
        <button type="button" onClick={() => setValue((v) => v + 10)}>
          value +10
        </button>
        <button type="button" onClick={() => setMax(200)}>
          max 200
        </button>
        <button type="button" onClick={() => setMax(100)}>
          max 100
        </button>
        <For each={SIZES}>
          {(s) => (
            <button type="button" onClick={() => setSize(s)}>
              size: {s}
            </button>
          )}
        </For>
        <For each={AUDIT_COLORS}>
          {(c) => (
            <button type="button" onClick={() => setColor(c)}>
              color: {c}
            </button>
          )}
        </For>
      </div>
      <div class="p-4 rounded-xl border border-default">
        <RLProgress value={value()} max={max()} size={size()} color={color()} />
      </div>
    </div>
  );
};

const testScenarios: TestScenario[] = [
  {
    id: "default-slot",
    title: "Default slot (children)",
    description: "Children render inside the progressbar root, after the indicator.",
    render: () => (
      <RLProgress value={50}>
        <span class="sr-only">Half complete</span>
      </RLProgress>
    ),
  },
  {
    id: "value-range",
    title: "Value and max",
    description:
      "Values clamp to [0, max]. Non-positive or non-finite max falls back to 100. Missing or NaN value reads as 0.",
    render: () => (
      <div class="flex flex-col gap-3">
        <RLProgress value={0} />
        <RLProgress value={25} max={50} />
        <RLProgress value={120} />
        <RLProgress value={-5} />
        <RLProgress value={30} max={0} />
        <RLProgress />
      </div>
    ),
  },
  {
    id: "sizes",
    title: "Every size",
    description: "xs, sm, md (default), lg, and xl.",
    render: () => (
      <div class="flex flex-col gap-3">
        <For each={SIZES}>{(s) => <RLProgress value={60} size={s} />}</For>
      </div>
    ),
  },
  {
    id: "colors",
    title: "Color (auto palette)",
    description: "Color is a palette key; default is primary.",
    render: () => (
      <div class="flex flex-col gap-3">
        <For each={AUDIT_COLORS}>{(c) => <RLProgress value={60} color={c} />}</For>
      </div>
    ),
  },
];

export const progressAudit: ComponentAuditDefinition = {
  id: "progress",
  name: "Progress",
  category: "Feedback",
  status: "Auditing",
  description: "Determinate progress bar with role progressbar and clamped value and max.",
  importPath: "@rimelight/ui/components/progress/RLProgress.tsx",
  renderSandbox: () => <ProgressSandbox />,
  testScenarios,
};
