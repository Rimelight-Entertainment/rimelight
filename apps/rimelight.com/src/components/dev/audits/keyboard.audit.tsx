import { createSignal, For } from "solid-js";
import type { JSX } from "@solidjs/web";
import { RLKeyboard } from "@rimelight/ui/components/keyboard/RLKeyboard.tsx";
import { RLButton } from "@rimelight/ui/components/button/RLButton.tsx";
import type { ComponentAuditDefinition } from "./types";

const LAYOUTS = ["full", "60"] as const;
const OSES = ["windows", "mac"] as const;
const PRESETS: { label: string; keys: string[] }[] = [
  { label: "Ctrl+C", keys: ["Ctrl", "C"] },
  { label: "Ctrl+V", keys: ["Ctrl", "V"] },
  { label: "Alt+Tab", keys: ["Alt", "Tab"] },
  { label: "Enter", keys: ["Enter"] },
  { label: "Esc", keys: ["Esc"] },
];

export const KeyboardSandbox = (): JSX.Element => {
  const [layout, setLayout] = createSignal<(typeof LAYOUTS)[number]>("full");
  const [os, setOs] = createSignal<(typeof OSES)[number]>("windows");
  const [highlighted, setHighlighted] = createSignal<string[]>(["Ctrl", "C"]);

  return (
    <div class="flex flex-col gap-6">
      {/* Control Toolbar */}
      <div class="p-4 rounded-xl border border-default bg-elevated/20 flex flex-wrap items-center gap-4 text-xs">
        <div class="flex items-center gap-1.5 flex-wrap">
          <span class="text-muted mr-1">Layout</span>
          <For each={LAYOUTS}>
            {(l) => (
              <RLButton
                size="xs"
                color="neutral"
                variant={layout() === l ? "solid" : "outline"}
                onClick={() => setLayout(l)}
              >
                {l}
              </RLButton>
            )}
          </For>
        </div>

        <div class="flex items-center gap-1.5 flex-wrap">
          <span class="text-muted mr-1">OS</span>
          <For each={OSES}>
            {(o) => (
              <RLButton
                size="xs"
                color="neutral"
                variant={os() === o ? "solid" : "outline"}
                onClick={() => setOs(o)}
              >
                {o}
              </RLButton>
            )}
          </For>
        </div>

        <div class="flex items-center gap-1.5 flex-wrap">
          <span class="text-muted mr-1">Highlight</span>
          <For each={PRESETS}>
            {(p) => (
              <RLButton
                size="xs"
                color="neutral"
                variant="outline"
                onClick={() => setHighlighted(p.keys)}
              >
                {p.label}
              </RLButton>
            )}
          </For>
          <RLButton size="xs" color="neutral" variant="ghost" onClick={() => setHighlighted([])}>
            clear
          </RLButton>
        </div>
      </div>

      {/* Preview Area */}
      <div class="p-8 rounded-xl border border-default bg-elevated/10">
        <RLKeyboard layout={layout()} os={os()} highlightedKeys={highlighted()} />
      </div>
    </div>
  );
};

export const keyboardAudit: ComponentAuditDefinition = {
  id: "keyboard",
  name: "Keyboard",
  category: "Data Display",
  status: "Auditing",
  description:
    "Interactive keyboard diagram with highlighted keys, highlight groups with legend labels, and 60% or full layouts.",
  importPath: "@rimelight/ui/components/keyboard/RLKeyboard.tsx",
  renderSandbox: () => <KeyboardSandbox />,
  testScenarios: [
    {
      id: "children-root",
      title: "Children in root",
      description:
        "Text and a nested element passed as children. RLKeyboard does not render children, so they are not visible (see checklist).",
      render: () => (
        <RLKeyboard>
          Loose text child
          <span class="text-xs text-muted">Nested element child</span>
        </RLKeyboard>
      ),
    },
    {
      id: "layout-60",
      title: "60% layout",
      description: 'layout="60" omits the function row and numpad.',
      render: () => <RLKeyboard layout="60" />,
    },
    {
      id: "layout-full-mac",
      title: "Full layout, macOS labels",
      description: 'layout="full" with os="mac" shows macOS modifier labels.',
      render: () => <RLKeyboard layout="full" os="mac" />,
    },
    {
      id: "highlighted-keys",
      title: "Highlighted keys",
      description: "highlightedKeys marks matching keys with data-highlighted and the active fill.",
      render: () => <RLKeyboard highlightedKeys={["Ctrl", "Alt", "Enter"]} />,
    },
    {
      id: "groups-with-legend",
      title: "Groups with legend",
      description:
        "groups highlight each key set with its own color and render a legend for labeled groups.",
      render: () => (
        <RLKeyboard
          groups={[
            { keys: ["W", "A", "S", "D"], color: "dodgerblue", label: "Movement" },
            { keys: ["Ctrl"], color: "tomato", label: "Modifier" },
            { keys: ["Enter"] },
          ]}
        />
      ),
    },
    {
      id: "highlight-color-and-background",
      title: "Highlight color and background",
      description:
        "highlightColor fills highlighted keys and backgroundColor fills the diagram backdrop.",
      render: () => (
        <RLKeyboard
          highlightedKeys={["Ctrl", "C"]}
          highlightColor="gold"
          backgroundColor="aliceblue"
        />
      ),
    },
    {
      id: "key-size",
      title: "Key size",
      description: "keySize sets the pixel size of a single key.",
      render: () => <RLKeyboard keySize={24} />,
    },
    {
      id: "key-gap",
      title: "Key gap",
      description: "keyGap sets the pixel gap between keys.",
      render: () => <RLKeyboard keyGap={2} />,
    },
    {
      id: "section-gap",
      title: "Section gap",
      description:
        "sectionGap sets the pixel gap between the main block and the function row and numpad.",
      render: () => <RLKeyboard layout="full" sectionGap={80} />,
    },
    {
      id: "as-polymorphic",
      title: "Polymorphic as",
      description: 'as="section" renders the root as a section element.',
      render: () => <RLKeyboard as="section" />,
    },
    {
      id: "class-passthrough",
      title: "Class passthrough",
      description: "A consumer class is merged onto the keyboard root.",
      render: () => <RLKeyboard class="border border-dashed border-default" />,
    },
    {
      id: "ui-root-override",
      title: "UI root override",
      description: "The ui.root slot override is applied to the keyboard root.",
      render: () => <RLKeyboard ui={{ root: "bg-elevated/30" }} />,
    },
  ],
  checklist: [
    {
      criterion: "SVG diagram renders keys from layout and os",
      status: "pass",
      notes: "Keys are computed from full and 60 layouts and mac or windows labels into an svg.",
    },
    {
      criterion: "Groups legend uses Show",
      status: "pass",
      notes: "The legend renders only when at least one group has a label, via <Show>.",
    },
    {
      criterion: "Highlight state via data-highlighted presence",
      status: "pass",
      notes:
        "Highlighted key groups set data-highlighted; non-highlighted keys omit the attribute.",
    },
    {
      criterion: 'Accessible labelling of the svg (role="img", aria-label)',
      status: "warn",
      notes:
        'No role or aria-label is set on the svg. Suggest role="img" and an aria-label describing the highlighted keys; not implemented.',
    },
    {
      criterion: "Children rendered in root",
      status: "fail",
      notes: "RLKeyboard does not render children(); children passed to root are dropped.",
    },
    {
      criterion: "Polymorphic as",
      status: "pass",
      notes: "Root element is resolved from the setup Tag, so as is honored.",
    },
    {
      criterion: "Class and ui passthrough",
      status: "pass",
      notes:
        "class and ui are stripped from rest and merged into classes().root by the theme setup.",
    },
    {
      criterion: "data-slot and data-theme on root",
      status: "pass",
      notes: 'Root sets data-slot="root" and data-theme from the theme.',
    },
    {
      criterion: "No inline styles (CSP-safe, UnoCSS only)",
      status: "pass",
      notes:
        "Colors are passed as svg fill attributes and styling comes from keyboard.theme.ts; no style attribute is set.",
    },
    {
      criterion: "No hydration-unsafe globals",
      status: "pass",
      notes: "Pure props-driven rendering with no window or document access.",
    },
  ],
};
