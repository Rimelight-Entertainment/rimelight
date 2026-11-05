import { createSignal, For } from "solid-js";
import type { JSX } from "@solidjs/web";
import { RLTooltip } from "@rimelight/ui/components/tooltip/RLTooltip.tsx";
import { RLButton } from "@rimelight/ui/components/button/RLButton.tsx";
import { type ComponentAuditDefinition } from "./types";

const PLACEMENTS = ["top", "bottom", "left", "right"] as const;

export const TooltipSandbox = (): JSX.Element => {
  const [placement, setPlacement] = createSignal<(typeof PLACEMENTS)[number]>("top");
  const [open, setOpen] = createSignal(false);

  return (
    <div class="flex flex-col gap-6">
      {/* Control Toolbar */}
      <div class="p-4 rounded-xl border border-default bg-elevated/20 flex flex-wrap items-center gap-4 text-xs">
        <div class="flex items-center gap-2">
          <span class="text-muted">Placement:</span>
          <For each={PLACEMENTS}>
            {(p) => (
              <button
                type="button"
                onClick={() => setPlacement(p)}
                class={`px-2 py-1 rounded-md transition-colors ${
                  placement() === p
                    ? "bg-primary text-inverted"
                    : "bg-elevated text-muted hover:text-default border border-default"
                }`}
              >
                {p}
              </button>
            )}
          </For>
        </div>
        <div class="flex items-center gap-2">
          <span class="text-muted">Controlled open:</span>
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            class={`px-2 py-1 rounded-md transition-colors ${
              open()
                ? "bg-primary text-inverted"
                : "bg-elevated text-muted hover:text-default border border-default"
            }`}
          >
            {open() ? "open" : "closed"}
          </button>
        </div>
      </div>

      {/* Preview Area */}
      <div class="p-8 rounded-xl border border-default bg-elevated/10 flex flex-wrap items-center justify-center gap-6">
        <RLTooltip
          body="Tooltip content"
          placement={placement()}
          open={open()}
          onOpenChange={setOpen}
        >
          <RLButton variant="outline">Hover or focus me</RLButton>
        </RLTooltip>
      </div>
    </div>
  );
};

export const tooltipAudit: ComponentAuditDefinition = {
  id: "tooltip",
  name: "Tooltip",
  category: "Overlay & Dialog",
  status: "Auditing",
  description:
    "A small popup that shows contextual text next to a trigger on hover or focus. Supports placement and controlled open state.",
  importPath: "@rimelight/ui/components/tooltip/RLTooltip.tsx",
  renderSandbox: () => <TooltipSandbox />,
  testScenarios: [
    {
      id: "default-slot",
      title: "Default slot (trigger children)",
      description: "The children are the trigger. Hover or focus the button to open the tooltip.",
      render: () => (
        <RLTooltip body="Tooltip content">
          <RLButton variant="outline">Trigger</RLButton>
        </RLTooltip>
      ),
    },
    {
      id: "content-prop",
      title: "content prop",
      description: "Plain string content rendered inside the tooltip body.",
      render: () => (
        <RLTooltip body="Plain string content">
          <RLButton variant="outline">Trigger</RLButton>
        </RLTooltip>
      ),
    },
    {
      id: "body-slot",
      title: "bodySlot (takes precedence over content)",
      description: "bodySlot renders instead of the content string.",
      render: () => (
        <RLTooltip
          body="Ignored when bodySlot is set"
          bodySlot={() => <span class="font-semibold">Rich body slot</span>}
        >
          <RLButton variant="outline">Trigger</RLButton>
        </RLTooltip>
      ),
    },
    {
      id: "placements",
      title: "Placements",
      description: "Each placement value rendered in its own tooltip.",
      render: () => (
        <div class="flex flex-wrap gap-6 items-center">
          <For each={PLACEMENTS}>
            {(p) => (
              <RLTooltip body={`Placement ${p}`} placement={p} defaultOpen>
                <RLButton variant="outline">{p}</RLButton>
              </RLTooltip>
            )}
          </For>
        </div>
      ),
    },
    {
      id: "default-open",
      title: "defaultOpen",
      description: "Tooltip starts open and stays open until the trigger state changes.",
      render: () => (
        <RLTooltip body="Starts open" defaultOpen>
          <RLButton variant="outline">Trigger</RLButton>
        </RLTooltip>
      ),
    },
  ],
};
