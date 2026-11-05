import { createSignal, For } from "solid-js";
import type { JSX } from "@solidjs/web";
import { RLSeparator } from "@rimelight/ui/components/separator/RLSeparator.tsx";
import type { ComponentAuditDefinition } from "./types";

const SIZES = ["xs", "sm", "md", "lg", "xl"] as const;
const POSITIONS = ["start", "center", "end"] as const;
const TYPES = ["solid", "dashed", "dotted"] as const;
const ORIENTATIONS = ["horizontal", "vertical"] as const;

export const SeparatorSandbox = (): JSX.Element => {
  const [orientation, setOrientation] = createSignal<(typeof ORIENTATIONS)[number]>("horizontal");
  const [size, setSize] = createSignal<(typeof SIZES)[number]>("md");
  const [position, setPosition] = createSignal<(typeof POSITIONS)[number]>("center");
  const [type, setType] = createSignal<(typeof TYPES)[number]>("solid");
  const [decorative, setDecorative] = createSignal(true);
  const [label, setLabel] = createSignal("Or");

  return (
    <div class="flex flex-col gap-6">
      {/* Control Toolbar */}
      <div class="p-4 rounded-xl border border-default bg-elevated/20 flex flex-wrap items-center gap-4 text-xs">
        <div class="flex items-center gap-2">
          <span class="font-semibold text-muted">Orientation</span>
          <For each={ORIENTATIONS}>
            {(option) => (
              <button
                type="button"
                class={`px-2 py-1 rounded border border-default ${orientation() === option ? "bg-elevated" : ""}`}
                onClick={() => setOrientation(option)}
              >
                {option}
              </button>
            )}
          </For>
        </div>
        <div class="flex items-center gap-2">
          <span class="font-semibold text-muted">Size</span>
          <For each={SIZES}>
            {(option) => (
              <button
                type="button"
                class={`px-2 py-1 rounded border border-default ${size() === option ? "bg-elevated" : ""}`}
                onClick={() => setSize(option)}
              >
                {option}
              </button>
            )}
          </For>
        </div>
        <div class="flex items-center gap-2">
          <span class="font-semibold text-muted">Position</span>
          <For each={POSITIONS}>
            {(option) => (
              <button
                type="button"
                class={`px-2 py-1 rounded border border-default ${position() === option ? "bg-elevated" : ""}`}
                onClick={() => setPosition(option)}
              >
                {option}
              </button>
            )}
          </For>
        </div>
        <div class="flex items-center gap-2">
          <span class="font-semibold text-muted">Type</span>
          <For each={TYPES}>
            {(option) => (
              <button
                type="button"
                class={`px-2 py-1 rounded border border-default ${type() === option ? "bg-elevated" : ""}`}
                onClick={() => setType(option)}
              >
                {option}
              </button>
            )}
          </For>
        </div>
        <label class="flex items-center gap-1">
          <input
            type="checkbox"
            checked={decorative()}
            onChange={(event) => setDecorative(event.currentTarget.checked)}
          />
          decorative
        </label>
        <label class="flex items-center gap-1">
          label
          <input
            type="text"
            class="px-2 py-1 rounded border border-default bg-default"
            value={label()}
            onInput={(event) => setLabel(event.currentTarget.value)}
          />
        </label>
      </div>

      {/* Preview Area */}
      <div class="p-8 rounded-xl border border-default bg-elevated/10 w-full max-w-md">
        <RLSeparator
          orientation={orientation()}
          size={size()}
          position={position()}
          type={type()}
          decorative={decorative()}
          label={label()}
        />
      </div>
    </div>
  );
};

export const separatorAudit: ComponentAuditDefinition = {
  id: "separator",
  name: "Separator",
  category: "Layout",
  status: "Auditing",
  description:
    "A horizontal or vertical divider with an optional label, icon, avatar, and children, positioned along the line and styled by size, color, and type.",
  importPath: "@rimelight/ui/components/separator/RLSeparator.tsx",
  renderSandbox: () => <SeparatorSandbox />,
  testScenarios: [
    {
      id: "horizontal",
      title: "Horizontal divider",
      description: "Default decorative divider with no content.",
      render: () => <RLSeparator />,
    },
    {
      id: "vertical",
      title: "Vertical divider",
      description: "Vertical divider inside a fixed-height row.",
      render: () => (
        <div class="flex h-24 items-stretch gap-4">
          <span>Left</span>
          <RLSeparator orientation="vertical" />
          <span>Right</span>
        </div>
      ),
    },
    {
      id: "label",
      title: "Label",
      description: "Label rendered on the line.",
      render: () => <RLSeparator label="Or" />,
    },
    {
      id: "children",
      title: "Children (default slot)",
      description: "Children render inside the divider in place of the label.",
      render: () => <RLSeparator>Section</RLSeparator>,
    },
    {
      id: "positions",
      title: "Position variants",
      description: "Label anchored to the start, center, and end of the line.",
      render: () => (
        <div class="flex flex-col gap-4 w-full max-w-md">
          <For each={POSITIONS}>
            {(option) => <RLSeparator position={option} label={`Position ${option}`} />}
          </For>
        </div>
      ),
    },
    {
      id: "sizes",
      title: "Size variants",
      description: "All size variants from xs to xl with a label.",
      render: () => (
        <div class="flex flex-col gap-4 w-full max-w-md">
          <For each={SIZES}>
            {(option) => <RLSeparator size={option} label={`Size ${option}`} />}
          </For>
        </div>
      ),
    },
    {
      id: "types",
      title: "Line types",
      description: "Solid, dashed, and dotted lines.",
      render: () => (
        <div class="flex flex-col gap-4 w-full max-w-md">
          <For each={TYPES}>{(option) => <RLSeparator type={option} label={option} />}</For>
        </div>
      ),
    },
    {
      id: "icon",
      title: "Icon",
      description: "Icon rendered alongside the label.",
      render: () => <RLSeparator icon="star" label="Featured" />,
    },
    {
      id: "avatar",
      title: "Avatar from image URL",
      description: "Avatar rendered from a string source.",
      render: () => (
        <RLSeparator avatar="https://github.com/benjamincanac.png" label="Benjamin Canac" />
      ),
    },
    {
      id: "avatar-slot",
      title: "Avatar slot",
      description: "Custom render-function content replaces the avatar prop.",
      render: () => (
        <RLSeparator avatarSlot={<span class="font-semibold">AB</span>} label="Custom avatar" />
      ),
    },
    {
      id: "icon-slot",
      title: "Icon slot",
      description: "Custom render-function content replaces the icon prop.",
      render: () => (
        <RLSeparator iconSlot={<span class="font-semibold">*</span>} label="Custom icon" />
      ),
    },
    {
      id: "non-decorative",
      title: "Non-decorative separator",
      description: "Exposed as a separator to assistive technology with its orientation.",
      render: () => <RLSeparator decorative={false} label="Section" />,
    },
  ],
};
