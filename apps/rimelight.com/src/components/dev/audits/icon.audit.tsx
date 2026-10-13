import { createSignal, For } from "solid-js";
import type { JSX } from "@solidjs/web";
import { RLIcon } from "@rimelight/ui/components/icon/RLIcon.tsx";
import { DEFAULT_ICON_NAMES } from "@rimelight/ui";
import { AUDIT_COLORS, type ComponentAuditDefinition } from "./types";

const SIZES = ["xs", "sm", "md", "lg", "xl", "none"] as const;
const COLORS = AUDIT_COLORS;

const FEATURED = [
  "star",
  "rocket",
  "sparkles",
  "image",
  "download",
  "external-link",
  "search",
  "settings",
  "user",
  "lock",
  "eye",
  "bell",
  "check",
  "info",
  "moon",
  "sun",
  "play",
  "quote",
  "share",
  "layers",
] as const;

const ALL_ICONS: readonly string[] = DEFAULT_ICON_NAMES;

export const IconSandbox = (): JSX.Element => {
  const [size, setSize] = createSignal<(typeof SIZES)[number]>("md");
  const [color, setColor] = createSignal<string>("primary");

  return (
    <div class="flex flex-col gap-6">
      {/* Control Toolbar */}
      <div class="p-4 rounded-xl border border-default bg-elevated/20 flex flex-wrap items-center gap-4 text-xs">
        <div class="flex items-center gap-1.5 flex-wrap">
          <span class="text-muted mr-1">Size:</span>
          <For each={SIZES}>
            {(s) => (
              <button
                type="button"
                onClick={() => setSize(s)}
                class={`px-2 py-0.5 rounded text-xs font-mono transition-colors ${
                  size() === s
                    ? "bg-primary text-inverted font-bold"
                    : "bg-elevated text-muted hover:text-highlighted border border-default"
                }`}
              >
                {s}
              </button>
            )}
          </For>
        </div>

        <div class="flex items-center gap-1.5 flex-wrap">
          <span class="text-muted mr-1">Color:</span>
          <For each={COLORS}>
            {(c) => (
              <button
                type="button"
                onClick={() => setColor(c)}
                class={`px-2 py-0.5 rounded text-xs font-mono transition-colors ${
                  color() === c
                    ? "bg-primary text-inverted font-bold"
                    : "bg-elevated text-muted hover:text-highlighted border border-default"
                }`}
              >
                {c}
              </button>
            )}
          </For>
        </div>
      </div>

      {/* Preview Area */}
      <div class="p-8 rounded-xl border border-default bg-elevated/10 flex flex-col gap-6">
        <div class="flex items-center justify-center gap-8">
          <For each={FEATURED}>
            {(name) => <RLIcon name={name} size={size()} class={`text-${color()}`} />}
          </For>
        </div>
        <div class="text-center text-xs text-muted font-mono">
          size="{size()}" class="text-{color()}"
        </div>
      </div>
    </div>
  );
};

export const iconAudit: ComponentAuditDefinition = {
  id: "icon",
  name: "Icon",
  category: "Media & Visuals",
  status: "Passed",
  description:
    "A polymorphic icon primitive resolving Lucide icon names, UnoCSS/Iconify class names, and per-instance overrides through the UI resolver, with scale tokens and full currentColor inheritance via CSS mask icons.",
  importPath: "@rimelight/ui/components/icon/RLIcon.tsx",
  renderSandbox: () => <IconSandbox />,
  testScenarios: [
    {
      id: "size-scale",
      title: "All Size Variants (xs to xl + none)",
      description:
        "Scale tokens from xs (12px) through xl (32px), plus an unstyled option that inherits the parent font size.",
      render: () => (
        <div class="flex items-center gap-6 flex-wrap">
          <For each={SIZES}>
            {(s) => (
              <div class="flex flex-col items-center gap-2">
                <RLIcon name="star" size={s} class="text-highlighted" />
                <span class="text-[10px] font-mono text-muted">{s}</span>
              </div>
            )}
          </For>
        </div>
      ),
    },
    {
      id: "color-inheritance",
      title: "Color Inheritance via currentColor",
      description:
        "Icons inherit text color from any utility class, enabling full palette theming with no color prop.",
      render: () => (
        <div class="flex items-center gap-4 flex-wrap">
          <For each={COLORS}>
            {(c) => (
              <div class="flex flex-col items-center gap-2">
                <RLIcon name="rocket" size="lg" class={`text-${c}`} />
                <span class="text-[10px] font-mono text-muted">{c}</span>
              </div>
            )}
          </For>
        </div>
      ),
    },
    {
      id: "default-collection",
      title: `Default Icons (${ALL_ICONS.length} Lucide icons)`,
      description:
        "Every safelisted default icon from the bundled Lucide collection, resolved synchronously to i-lucide-* classes at render time.",
      render: () => (
        <div class="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2">
          <For each={ALL_ICONS}>
            {(name) => (
              <div class="flex flex-col items-center justify-center gap-1 p-2 rounded-lg border border-default bg-elevated/20">
                <RLIcon name={name} class="text-highlighted" />
                <span class="w-full truncate text-center text-[9px] font-mono text-muted">
                  {name}
                </span>
              </div>
            )}
          </For>
        </div>
      ),
    },
    {
      id: "custom-class",
      title: "Custom Class Name",
      description:
        "Passing a full UnoCSS/Iconify class name through the custom prop passes it through verbatim.",
      render: () => (
        <div class="flex items-center gap-6">
          <RLIcon name="customSvg" size="xl" class="text-primary" custom="i-lucide-circle-gauge" />
          <RLIcon name="customNodes" size="xl" class="text-secondary" custom="i-lucide-compass" />
        </div>
      ),
    },
    {
      id: "inline-inline-flow",
      title: "Inline Flow with Text & Badges",
      description:
        "Icons align seamlessly inline within text runs and controls thanks to inline-flex leading-none sizing.",
      render: () => (
        <div class="flex flex-col gap-3 text-sm text-highlighted">
          <p class="flex items-center gap-2">
            <RLIcon name="info" class="text-info" />
            <span>Deployments are synced automatically.</span>
          </p>
          <p class="flex items-center gap-2">
            <RLIcon name="circle-check" class="text-success" />
            <span>All checks passed with no warnings.</span>
          </p>
          <p class="flex items-center gap-2">
            <RLIcon name="triangle-alert" class="text-warning" />
            <span>Rate limit approaching — 82% consumed.</span>
          </p>
          <p class="flex items-center gap-2">
            <RLIcon name="circle-x" class="text-error" />
            <span>Build failed at step 4 of 9.</span>
          </p>
        </div>
      ),
    },
    {
      id: "missing-icon",
      title: "Missing / Empty Icon Resolution",
      description:
        "Unresolvable names render an empty, accessible span without throwing or emitting stray markup.",
      render: () => (
        <div class="flex items-center gap-6 p-4 rounded-lg border border-dashed border-default bg-elevated/10">
          <RLIcon name="does-not-exist" size="lg" class="text-muted" />
          <RLIcon name="" size="lg" class="text-muted" />
          <span class="text-xs text-muted">Empty spans, no crash.</span>
        </div>
      ),
    },
  ],
  checklist: [
    {
      criterion: "Nuxt UI v4 API parity (Icon)",
      status: "pass",
      notes: "Matches name, size, class, ui and custom overrides with the lucide-backed resolver.",
    },
    {
      criterion: "Multi-source icon resolution cascade",
      status: "pass",
      notes:
        "Resolves custom class -> config overrides -> i- prefixed class names -> i-lucide-<name> for bare lucide names -> empty.",
    },
    {
      criterion: "Deterministic SSR-safe class rendering",
      status: "pass",
      notes:
        "Icons render as CSS mask classes via UnoCSS presetIcons — no DOM nodes, no hydration mismatch.",
    },
    {
      criterion: "Full currentColor inheritance",
      status: "pass",
      notes:
        "Mask icons use background-color: currentColor so any text-* utility drives the icon color.",
    },
    {
      criterion: "Accessible decorative default",
      status: "pass",
      notes: "Root span carries aria-hidden='true' for decorative use.",
    },
    {
      criterion: "No inline styles (CSP-safe, UnoCSS only)",
      status: "pass",
      notes: "All sizing lives in the icon theme slots, no style attributes emitted.",
    },
    {
      criterion: "No innerHTML / dangerouslySetInnerHTML",
      status: "pass",
      notes: "Icons are pure CSS classes — no injected markup.",
    },
    {
      criterion: "Audited components render bare (no harness wrappers)",
      status: "pass",
      notes: "All scenario renders return bare RLIcon components directly.",
    },
  ],
};
