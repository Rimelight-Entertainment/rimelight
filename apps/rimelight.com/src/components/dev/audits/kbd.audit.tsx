import { createSignal, For } from "solid-js";
import type { JSX } from "@solidjs/web";
import { RLKbd } from "@rimelight/ui/components/kbd/RLKbd.tsx";
import { AUDIT_COLORS, type ComponentAuditDefinition, type TestScenario } from "./types";

const VARIANTS = ["solid", "outline", "soft", "subtle"] as const;
const SIZES = ["xs", "sm", "md", "lg", "xl"] as const;

const KbdSandbox = (): JSX.Element => {
  const [variant, setVariant] = createSignal<(typeof VARIANTS)[number]>("outline");
  const [size, setSize] = createSignal<(typeof SIZES)[number]>("md");
  const [color, setColor] = createSignal<string>("primary");

  return (
    <div class="flex flex-col gap-6">
      <div class="flex flex-wrap gap-2">
        <For each={VARIANTS}>
          {(v) => (
            <button type="button" onClick={() => setVariant(v)}>
              variant: {v}
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
        <For each={AUDIT_COLORS}>
          {(c) => (
            <button type="button" onClick={() => setColor(c)}>
              color: {c}
            </button>
          )}
        </For>
      </div>
      <div class="flex items-center gap-3 p-4 rounded-xl border border-default">
        <RLKbd variant={variant()} size={size()} color={color()}>
          Ctrl
        </RLKbd>
        <RLKbd variant={variant()} size={size()} color={color()}>
          K
        </RLKbd>
      </div>
    </div>
  );
};

const testScenarios: TestScenario[] = [
  {
    id: "default-slot",
    title: "Default slot (children)",
    description: "Key label passed as children renders inside the kbd element.",
    render: () => <RLKbd>Enter</RLKbd>,
  },
  {
    id: "variants",
    title: "Every variant",
    description: "solid, outline (default), soft, and subtle.",
    render: () => (
      <div class="flex flex-wrap gap-3">
        <For each={VARIANTS}>{(v) => <RLKbd variant={v}>{v}</RLKbd>}</For>
      </div>
    ),
  },
  {
    id: "sizes",
    title: "Every size",
    description: "xs, sm, md (default), lg, and xl.",
    render: () => (
      <div class="flex flex-wrap items-center gap-3">
        <For each={SIZES}>{(s) => <RLKbd size={s}>{s}</RLKbd>}</For>
      </div>
    ),
  },
  {
    id: "colors",
    title: "Color (auto palette)",
    description: "Color is a palette key; default is primary.",
    render: () => (
      <div class="flex flex-wrap gap-3">
        <For each={AUDIT_COLORS}>{(c) => <RLKbd color={c}>{c}</RLKbd>}</For>
      </div>
    ),
  },
];

export const kbdAudit: ComponentAuditDefinition = {
  id: "kbd",
  name: "Kbd",
  category: "Data Display",
  status: "Auditing",
  description: "Inline keyboard key indicator rendered as a kbd element.",
  importPath: "@rimelight/ui/components/kbd/RLKbd.tsx",
  renderSandbox: () => <KbdSandbox />,
  testScenarios,
};
