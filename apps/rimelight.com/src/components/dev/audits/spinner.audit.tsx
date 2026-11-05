import { createSignal, For } from "solid-js";
import type { JSX } from "@solidjs/web";
import { RLSpinner } from "@rimelight/ui/components/spinner/RLSpinner.tsx";
import { AUDIT_COLORS, type ComponentAuditDefinition } from "./types";

const SIZES = ["xs", "sm", "md", "lg", "xl"] as const;

export const SpinnerSandbox = (): JSX.Element => {
  const [size, setSize] = createSignal<(typeof SIZES)[number]>("md");
  const [color, setColor] = createSignal<string>("primary");

  return (
    <div class="flex flex-col gap-6">
      {/* Control Toolbar */}
      <div class="p-4 rounded-xl border border-default bg-elevated/20 flex flex-wrap items-center gap-4 text-xs">
        <div class="flex items-center gap-2">
          <span class="text-muted">Size:</span>
          <For each={SIZES}>
            {(s) => (
              <button
                type="button"
                onClick={() => setSize(s)}
                class={`px-2 py-1 rounded-md transition-colors ${
                  size() === s
                    ? "bg-primary text-inverted"
                    : "bg-elevated text-muted hover:text-default border border-default"
                }`}
              >
                {s}
              </button>
            )}
          </For>
        </div>
        <div class="flex items-center gap-2">
          <span class="text-muted">Color:</span>
          <For each={AUDIT_COLORS}>
            {(c) => (
              <button
                type="button"
                onClick={() => setColor(c)}
                class={`px-2 py-1 rounded-md transition-colors ${
                  color() === c
                    ? "bg-primary text-inverted"
                    : "bg-elevated text-muted hover:text-default border border-default"
                }`}
              >
                {c}
              </button>
            )}
          </For>
        </div>
      </div>

      {/* Preview Area */}
      <div class="p-8 rounded-xl border border-default bg-elevated/10 flex flex-wrap items-center justify-center gap-6">
        <RLSpinner size={size()} color={color()}>
          <span class="sr-only">Loading</span>
        </RLSpinner>
      </div>
    </div>
  );
};

export const spinnerAudit: ComponentAuditDefinition = {
  id: "spinner",
  name: "Spinner",
  category: "Feedback",
  status: "Auditing",
  description:
    "A loading indicator rendered at a fixed size and color. Children render inside the spinner for accessible text.",
  importPath: "@rimelight/ui/components/spinner/RLSpinner.tsx",
  renderSandbox: () => <SpinnerSandbox />,
  testScenarios: [
    {
      id: "default-slot",
      title: "Default slot (sr-only label)",
      description:
        "Children render inside the spinner. The sr-only span gives the loading state a text label. The component itself has no role or aria-label.",
      render: () => (
        <RLSpinner>
          <span class="sr-only">Loading</span>
        </RLSpinner>
      ),
    },
    {
      id: "sizes",
      title: "Sizes",
      description: "Every size value from xs to xl.",
      render: () => (
        <div class="flex flex-wrap items-center gap-6">
          <For each={SIZES}>{(s) => <RLSpinner size={s} />}</For>
        </div>
      ),
    },
    {
      id: "colors",
      title: "Colors",
      description: "Every color from the audit palette.",
      render: () => (
        <div class="flex flex-wrap items-center gap-6">
          <For each={AUDIT_COLORS}>{(c) => <RLSpinner color={c} />}</For>
        </div>
      ),
    },
  ],
};
