import { createMemo, createSignal, For } from "solid-js";
import type { JSX } from "@solidjs/web";
import { RLAspectRatio } from "@rimelight/ui/components/aspect-ratio/RLAspectRatio.tsx";
import type { ComponentAuditDefinition } from "./types";

const RATIOS: Array<{ label: string; value: number }> = [
  { label: "16 / 9", value: 16 / 9 },
  { label: "4 / 3", value: 4 / 3 },
  { label: "1 / 1", value: 1 },
  { label: "9 / 16", value: 9 / 16 },
];

const Placeholder = (props: { label: string }): JSX.Element => (
  <div class="flex h-full w-full items-center justify-center bg-gradient-to-br from-primary/40 to-secondary/40">
    <span class="text-xs font-mono font-bold text-inverted">{props.label}</span>
  </div>
);

export const AspectRatioSandbox = (): JSX.Element => {
  const [ratioIndex, setRatioIndex] = createSignal(0);

  const ratio = createMemo(() => RATIOS[ratioIndex()]!.value);
  const label = createMemo(() => RATIOS[ratioIndex()]!.label);

  return (
    <>
      {/* Control Toolbar */}
      <div class="p-4 rounded-xl border border-default bg-elevated/20 flex flex-wrap items-center gap-2 text-xs">
        <span class="text-muted mr-2">Ratio:</span>
        <For each={RATIOS}>
          {(entry, index) => (
            <button
              type="button"
              onClick={() => setRatioIndex(index())}
              class={`px-2 py-0.5 rounded text-xs font-mono transition-colors ${
                ratioIndex() === index()
                  ? "bg-primary text-inverted font-bold"
                  : "bg-elevated text-muted hover:text-highlighted border border-default"
              }`}
            >
              {entry.label}
            </button>
          )}
        </For>
      </div>

      <RLAspectRatio ratio={ratio()}>
        <Placeholder label={label()} />
      </RLAspectRatio>
    </>
  );
};

export const aspectRatioAudit: ComponentAuditDefinition = {
  id: "aspect-ratio",
  name: "AspectRatio",
  category: "Layout",
  status: "Passed",
  description:
    "Constrains content to a fixed width/height ratio via an SVG spacer (CSP-safe, no inline styles) with an absolutely positioned content slot.",
  importPath: "@rimelight/ui/components/aspect-ratio/RLAspectRatio.tsx",
  renderSandbox: () => <AspectRatioSandbox />,
  testScenarios: [
    {
      id: "widescreen",
      title: "Widescreen 16 / 9 (Radix-style)",
      description: "Standard video ratio; content fills the box.",
      render: () => (
        <RLAspectRatio ratio={16 / 9}>
          <Placeholder label="16 / 9" />
        </RLAspectRatio>
      ),
    },
    {
      id: "default-ratio",
      title: "Omitted Ratio Falls Back to Square",
      description: "No ratio prop renders 1:1, mirroring the Radix default of 1.",
      render: () => (
        <RLAspectRatio>
          <Placeholder label="default 1 / 1" />
        </RLAspectRatio>
      ),
    },
    {
      id: "portrait",
      title: "Portrait 9 / 16",
      description: "Height-dominant ratio keeps its box without layout shift.",
      render: () => (
        <RLAspectRatio ratio={9 / 16}>
          <Placeholder label="9 / 16" />
        </RLAspectRatio>
      ),
    },
    {
      id: "invalid-ratio",
      title: "Invalid Ratio Guards to Square",
      description:
        "ratio={0} (and NaN/negative/Infinity) would collapse the spacer math; the component falls back to 1:1. Box below must render square.",
      render: () => (
        <RLAspectRatio ratio={0}>
          <Placeholder label="0 → 1 / 1" />
        </RLAspectRatio>
      ),
    },
    {
      id: "as-prop",
      title: "Polymorphic as Prop",
      description: "Root renders a section element; inspect the DOM for section[data-slot=root].",
      render: () => (
        <RLAspectRatio as="section" ratio={4 / 3}>
          <Placeholder label="section 4 / 3" />
        </RLAspectRatio>
      ),
    },
    {
      id: "ui-override",
      title: "Root ui Override",
      description: "Rounded corners + border via ui without touching the component.",
      render: () => (
        <RLAspectRatio ratio={16 / 9} ui={{ root: "rounded-2xl border-2 border-primary" }}>
          <Placeholder label="ui rounded" />
        </RLAspectRatio>
      ),
    },
  ],
  checklist: [
    {
      criterion: "Ratio prop with square default (Radix: ratio, default 1)",
      status: "pass",
      notes: "ratio?: number, defaults to 1 when omitted. data-ratio reflects the guarded value.",
    },
    {
      criterion: "Nuxt UI v4 API parity",
      status: "warn",
      notes:
        "No v4 docs page exists (ui.nuxt.com/docs/components/aspect-ratio 404s); audited against the underlying Radix primitive instead. Provide a reference if one is canonical.",
    },
    {
      criterion: "Invalid ratio guard (0, negative, NaN, Infinity)",
      status: "pass",
      notes:
        "safeRatio() falls back to 1; spacer viewBox can never be invalid. See invalid-ratio scenario.",
    },
    {
      criterion: "Polymorphic as prop",
      status: "pass",
      notes:
        "Renders via dynamic() (<Dynamic> is deprecated); plain div default. See as-prop scenario.",
    },
    {
      criterion: "No innerHTML / dangerouslySetInnerHTML",
      status: "pass",
      notes: "Children render as Solid nodes; spacer is a static SVG element.",
    },
    {
      criterion: "No inline styles (CSP-safe, UnoCSS only)",
      status: "pass",
      notes:
        "Ratio sizing via SVG viewBox, not style bindings; all visuals in aspect-ratio.theme.ts.",
    },
    {
      criterion: "No Uno/CSS class strings inside the component file",
      status: "pass",
      notes: "Spacer classes moved to a theme spacer slot; component references only theme output.",
    },
    {
      criterion: "No hydration mismatch",
      status: "pass",
      notes:
        "viewBox derives deterministically from props; no ids, memos only at top level, no effects.",
    },
    {
      criterion: "Solid 2 strict-mode clean (no STRICT_READ_UNTRACKED)",
      status: "pass",
      notes: "Sandbox ratio derivation in createMemo; reads only in JSX/memos.",
    },
    {
      criterion: "Spacer hidden from assistive tech",
      status: "pass",
      notes: "Spacer SVG carries aria-hidden; content keeps its own semantics.",
    },
    {
      criterion: "Audited component renders bare (no harness wrappers)",
      status: "pass",
      notes: "Scenario renders return <RLAspectRatio/> directly.",
    },
  ],
};
