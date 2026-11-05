import { createSignal, For } from "solid-js";
import type { JSX } from "@solidjs/web";
import { RLPopover } from "@rimelight/ui/components/popover/RLPopover.tsx";
import { RLButton } from "@rimelight/ui/components/button/RLButton.tsx";
import type { ComponentAuditDefinition, TestScenario } from "./types";

const MODES = ["click", "hover", "both"] as const;
const PLACEMENTS = [
  "top",
  "top-start",
  "top-end",
  "bottom",
  "bottom-start",
  "bottom-end",
  "left",
  "right",
] as const;
const SIZES = ["xs", "sm", "md", "lg", "xl"] as const;

const PopoverSandbox = (): JSX.Element => {
  const [mode, setMode] = createSignal<(typeof MODES)[number]>("both");
  const [placement, setPlacement] = createSignal<(typeof PLACEMENTS)[number]>("bottom");
  const [size, setSize] = createSignal<(typeof SIZES)[number]>("md");

  return (
    <div class="flex flex-col gap-6">
      <div class="flex flex-wrap gap-2">
        <For each={MODES}>
          {(m) => (
            <button type="button" onClick={() => setMode(m)}>
              mode: {m}
            </button>
          )}
        </For>
        <For each={PLACEMENTS}>
          {(p) => (
            <button type="button" onClick={() => setPlacement(p)}>
              placement: {p}
            </button>
          )}
        </For>
        <For each={SIZES}>
          {(s) => (
            <button type="button" onClick={() => setSize(s)}>
              size: {s}
            </button>
          )}
        </For>
      </div>
      <div class="flex items-center justify-center p-24">
        <RLPopover mode={mode()} placement={placement()} size={size()} triggerLabel="Open popover">
          <p>Popover content</p>
        </RLPopover>
      </div>
    </div>
  );
};

const testScenarios: TestScenario[] = [
  {
    id: "default-slot",
    title: "Default slot (children)",
    description: "Children render inside the content panel when the popover is open.",
    render: () => (
      <RLPopover defaultOpen triggerLabel="Trigger">
        <p>Body content passed as children.</p>
      </RLPopover>
    ),
  },
  {
    id: "trigger-slot",
    title: "triggerSlot",
    description: "triggerSlot replaces the default trigger button built from triggerLabel.",
    render: () => (
      <RLPopover triggerSlot={<RLButton label="Custom trigger" />}>
        <p>Opened by the custom trigger.</p>
      </RLPopover>
    ),
  },
  {
    id: "trigger-label",
    title: "triggerLabel (default trigger)",
    description: "When triggerSlot is not set, a default RLButton uses triggerLabel.",
    render: () => (
      <RLPopover triggerLabel="Default trigger">
        <p>Opened by the default trigger.</p>
      </RLPopover>
    ),
  },
  {
    id: "modes",
    title: "Every mode",
    description: "click, hover, and both (default). Each shows its own trigger.",
    render: () => (
      <div class="flex flex-wrap gap-6">
        <For each={MODES}>
          {(m) => (
            <RLPopover mode={m} triggerLabel={`mode: ${m}`}>
              <p>Opens on {m}.</p>
            </RLPopover>
          )}
        </For>
      </div>
    ),
  },
  {
    id: "placements",
    title: "Every placement",
    description:
      "top, top-start, top-end, bottom (default), bottom-start, bottom-end, left, right.",
    render: () => (
      <div class="flex flex-wrap gap-6 p-24">
        <For each={PLACEMENTS}>
          {(p) => (
            <RLPopover placement={p} defaultOpen triggerLabel={p}>
              <p>{p}</p>
            </RLPopover>
          )}
        </For>
      </div>
    ),
  },
  {
    id: "sizes",
    title: "Every size",
    description: "xs, sm, md (default), lg, and xl.",
    render: () => (
      <div class="flex flex-wrap gap-6 p-24">
        <For each={SIZES}>
          {(s) => (
            <RLPopover size={s} defaultOpen triggerLabel={s}>
              <p>Size {s}</p>
            </RLPopover>
          )}
        </For>
      </div>
    ),
  },
  {
    id: "controlled",
    title: "Controlled open state",
    description:
      "open and onOpenChange drive the open state. Clicks and outside clicks report changes.",
    render: () => {
      const [open, setOpen] = createSignal(false);
      return (
        <div class="flex flex-col gap-2">
          <span>open: {String(open())}</span>
          <RLPopover mode="click" open={open()} onOpenChange={setOpen} triggerLabel="Controlled">
            <p>Controlled content.</p>
          </RLPopover>
        </div>
      );
    },
  },
];

export const popoverAudit: ComponentAuditDefinition = {
  id: "popover",
  name: "Popover",
  category: "Overlay & Dialog",
  status: "Auditing",
  description: "Floating content panel anchored to a trigger, opened on click, hover, or both.",
  importPath: "@rimelight/ui/components/popover/RLPopover.tsx",
  renderSandbox: () => <PopoverSandbox />,
  testScenarios,
};
