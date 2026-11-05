import { createSignal, For } from "solid-js";
import type { JSX } from "@solidjs/web";
import { RLScrollArea } from "@rimelight/ui/components/scroll-area/RLScrollArea.tsx";
import type { ComponentAuditDefinition } from "./types";

const ITEMS = Array.from({ length: 30 }, (_, i) => `Row ${i + 1}`);

export const ScrollAreaSandbox = (): JSX.Element => {
  const [orientation, setOrientation] = createSignal<"vertical" | "horizontal" | "both">(
    "vertical",
  );
  const [height, setHeight] = createSignal(240);

  return (
    <div class="flex flex-col gap-6">
      <div class="p-4 rounded-xl border border-default bg-elevated/20 flex flex-wrap items-center gap-4 text-xs">
        <label class="flex items-center gap-2">
          Orientation
          <select
            class="rounded border border-default bg-default px-2 py-1"
            value={orientation()}
            onChange={(e) =>
              setOrientation(
                e.currentTarget.value as typeof orientation extends () => infer T ? T : never,
              )
            }
          >
            <option value="vertical">vertical</option>
            <option value="horizontal">horizontal</option>
            <option value="both">both</option>
          </select>
        </label>
        <label class="flex items-center gap-2">
          Height
          <input
            type="range"
            min={80}
            max={400}
            value={height()}
            onInput={(e) => setHeight(Number(e.currentTarget.value))}
          />
        </label>
      </div>
      <div class="p-8 rounded-xl border border-default bg-elevated/10">
        <RLScrollArea
          orientation={orientation()}
          height={height()}
          class="rounded-lg border border-default p-3"
        >
          <For each={ITEMS}>{(item) => <p class="py-1 text-sm">{item}</p>}</For>
        </RLScrollArea>
      </div>
    </div>
  );
};

export const scrollAreaAudit: ComponentAuditDefinition = {
  id: "scroll-area",
  name: "Scroll Area",
  category: "Layout",
  status: "Auditing",
  description:
    "A scrollable region with custom vertical and horizontal scrollbars that auto-hide after inactivity and a fixed or fluid height.",
  importPath: "@rimelight/ui/components/scroll-area/RLScrollArea.tsx",
  renderSandbox: () => <ScrollAreaSandbox />,
  testScenarios: [
    {
      id: "default-slot",
      title: "Default slot",
      description: "Children rendered inside the scrollable viewport.",
      render: () => (
        <RLScrollArea height={200} class="rounded-lg border border-default p-3">
          <For each={ITEMS}>{(item) => <p class="py-1 text-sm">{item}</p>}</For>
        </RLScrollArea>
      ),
    },
    {
      id: "vertical",
      title: "Vertical scrolling",
      description: "Vertical scrollbar only, with the thumb shown while scrolling.",
      render: () => (
        <RLScrollArea
          orientation="vertical"
          height={160}
          class="rounded-lg border border-default p-3"
        >
          <For each={ITEMS}>{(item) => <p class="py-1 text-sm">{item}</p>}</For>
        </RLScrollArea>
      ),
    },
    {
      id: "horizontal",
      title: "Horizontal scrolling",
      description: "Horizontal scrollbar only, for wide content.",
      render: () => (
        <RLScrollArea orientation="horizontal" class="rounded-lg border border-default p-3">
          <div class="flex gap-4 w-max">
            <For each={ITEMS}>
              {(item) => <span class="text-sm whitespace-nowrap">{item}</span>}
            </For>
          </div>
        </RLScrollArea>
      ),
    },
    {
      id: "both",
      title: "Both axes",
      description: "Both scrollbars for content that overflows in each direction.",
      render: () => (
        <RLScrollArea orientation="both" height={200} class="rounded-lg border border-default p-3">
          <div class="grid w-max grid-cols-12 gap-2">
            <For each={ITEMS}>
              {(item) => <span class="text-sm whitespace-nowrap">{item}</span>}
            </For>
          </div>
        </RLScrollArea>
      ),
    },
  ],
  checklist: [
    { criterion: "Default slot renders children inside the viewport", status: "pending" },
    { criterion: "Bars auto-hide after scrollHideDelay", status: "pending" },
    { criterion: "Fixed height via CSS variable", status: "pending" },
  ],
};
