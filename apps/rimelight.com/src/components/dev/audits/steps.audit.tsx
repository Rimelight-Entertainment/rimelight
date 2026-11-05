import { createSignal, For } from "solid-js";
import type { JSX } from "@solidjs/web";
import { RLSteps } from "@rimelight/ui/components/steps/RLSteps.tsx";
import { AUDIT_COLORS, type ComponentAuditDefinition } from "./types";

const SIZES = ["xs", "sm", "md", "lg", "xl"] as const;
const COLORS = AUDIT_COLORS;

const chipClass = (active: boolean): string =>
  `px-2 py-0.5 rounded text-xs font-mono transition-colors ${
    active
      ? "bg-primary text-inverted font-bold"
      : "bg-elevated text-muted hover:text-highlighted border border-default"
  }`;

export const StepsSandbox = (): JSX.Element => {
  const [size, setSize] = createSignal<(typeof SIZES)[number]>("md");
  const [color, setColor] = createSignal<string>("primary");

  return (
    <div class="flex flex-col gap-6">
      {/* Control Toolbar */}
      <div class="p-4 rounded-xl border border-default bg-elevated/20 flex flex-wrap items-center gap-4 text-xs">
        <div class="flex items-center gap-1.5 flex-wrap">
          <span class="text-muted mr-1">size</span>
          <For each={SIZES}>
            {(s) => (
              <button type="button" onClick={() => setSize(s)} class={chipClass(size() === s)}>
                {s}
              </button>
            )}
          </For>
        </div>

        <div class="flex items-center gap-1.5 flex-wrap">
          <span class="text-muted mr-1">color</span>
          <For each={COLORS}>
            {(c) => (
              <button type="button" onClick={() => setColor(c)} class={chipClass(color() === c)}>
                {c}
              </button>
            )}
          </For>
        </div>
      </div>

      {/* Preview Area */}
      <div class="p-8 rounded-xl border border-default bg-elevated/10">
        <RLSteps size={size()} color={color()}>
          <li>Create an account</li>
          <li>Verify your email</li>
          <li>Start building</li>
        </RLSteps>
      </div>
    </div>
  );
};

export const stepsAudit: ComponentAuditDefinition = {
  id: "steps",
  name: "Steps",
  category: "Navigation",
  status: "Auditing",
  description:
    "An ordered list wrapper for a sequence of steps. Consumers pass list items as children; the root carries the size and color variants and the list receives the default children slot.",
  importPath: "@rimelight/ui/components/steps/RLSteps.tsx",
  renderSandbox: () => <StepsSandbox />,
  testScenarios: [
    {
      id: "default-children",
      title: "Children in the list slot",
      description: "Step items passed as children render inside the ordered list.",
      render: () => (
        <RLSteps>
          <li>Create an account</li>
          <li>Verify your email</li>
          <li>Start building</li>
        </RLSteps>
      ),
    },
    {
      id: "sizes",
      title: "All sizes",
      description: "Each size variant (xs through xl) on the root.",
      render: () => (
        <div class="flex flex-col gap-6">
          <For each={SIZES}>
            {(s) => (
              <RLSteps size={s}>
                <li>{s} step one</li>
                <li>{s} step two</li>
              </RLSteps>
            )}
          </For>
        </div>
      ),
    },
    {
      id: "colors",
      title: "Color variants",
      description: "Auto color default and explicit palette colors.",
      render: () => (
        <div class="flex flex-col gap-6">
          <For each={COLORS}>
            {(c) => (
              <RLSteps color={c}>
                <li>{c} step one</li>
                <li>{c} step two</li>
              </RLSteps>
            )}
          </For>
        </div>
      ),
    },
  ],
  checklist: [
    {
      criterion: "Static conformance (slots, data-slot, variant canonical sets)",
      status: "pass",
      notes:
        "Root has data-slot root and data-theme; the list slot is data-slot list. Size is exposed as data-size; color is auto by default.",
    },
    {
      criterion: "Behavior tests",
      status: "pending",
      notes: "packages/ui/test/steps.test.tsx written; not yet run.",
    },
  ],
};
