import { createSignal, For, Show } from "solid-js";
import type { JSX } from "@solidjs/web";
import {
  RLNavigationProgress,
  RLNavigationProgressTheme,
  type RLNavigationProgressSize,
} from "@rimelight/ui";
import { AUDIT_COLORS, type ComponentAuditDefinition } from "./types";

const SIZES: RLNavigationProgressSize[] = ["xs", "sm", "md", "lg"];
const COLORS = AUDIT_COLORS;

export const NavigationProgressSandbox = (): JSX.Element => {
  const [selectedColor, setSelectedColor] = createSignal<string>("primary");
  const [selectedSize, setSelectedSize] = createSignal<RLNavigationProgressSize>("sm");
  const [isSimulatedRouting, setIsSimulatedRouting] = createSignal(true);

  const previewSlots = () =>
    RLNavigationProgressTheme({
      color: selectedColor(),
      size: selectedSize(),
    });

  return (
    <div class="flex flex-col gap-6">
      {/* Control Toolbar */}
      <div class="p-4 rounded-xl border border-default bg-elevated/20 flex flex-col gap-4 text-xs">
        {/* Colors */}
        <div class="flex items-center gap-2 flex-wrap">
          <span class="text-muted font-medium mr-1">Color:</span>
          <For each={COLORS}>
            {(c) => (
              <button
                type="button"
                onClick={() => setSelectedColor(c)}
                class={`px-2.5 py-1 rounded text-xs font-mono transition-colors ${
                  selectedColor() === c
                    ? "bg-primary text-neutral-50 font-bold"
                    : "bg-elevated text-muted hover:text-foreground border border-default"
                }`}
              >
                {c}
              </button>
            )}
          </For>
        </div>

        {/* Semantic Sizes */}
        <div class="flex items-center gap-2 flex-wrap">
          <span class="text-muted font-medium mr-1">Semantic Size:</span>
          <For each={SIZES}>
            {(s) => (
              <button
                type="button"
                onClick={() => setSelectedSize(s)}
                class={`px-2.5 py-1 rounded text-xs font-mono transition-colors ${
                  selectedSize() === s
                    ? "bg-primary text-neutral-50 font-bold"
                    : "bg-elevated text-muted hover:text-foreground border border-default"
                }`}
              >
                {s} ({s === "xs" ? "h-0.5" : s === "sm" ? "h-1" : s === "md" ? "h-1.5" : "h-2"})
              </button>
            )}
          </For>
        </div>

        {/* State Toggle */}
        <div class="flex items-center gap-3">
          <span class="text-muted font-medium">Simulated Routing:</span>
          <button
            type="button"
            onClick={() => setIsSimulatedRouting((prev) => !prev)}
            class={`px-3 py-1 rounded text-xs font-mono font-medium transition-colors border ${
              isSimulatedRouting()
                ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/40"
                : "bg-rose-500/20 text-rose-400 border-rose-500/40"
            }`}
          >
            {isSimulatedRouting()
              ? "Routing State: ACTIVE (Visible)"
              : "Routing State: IDLE (Unmounted)"}
          </button>
        </div>
      </div>

      {/* Visual Mock Container */}
      <div class="p-6 rounded-xl border border-default bg-neutral-900/40 flex flex-col gap-4">
        <div class="flex items-center justify-between">
          <span class="text-xs font-mono uppercase tracking-wider text-muted">
            Viewport Bar Simulation Preview
          </span>
          <span class="text-[10px] font-mono px-2 py-0.5 rounded bg-primary/10 text-primary border border-primary/30">
            role="progressbar" aria-valuemin="0" aria-valuemax="100"
          </span>
        </div>

        <div class="relative w-full h-24 rounded-lg border border-default bg-elevated/20 overflow-hidden flex flex-col">
          {/* Simulated Top Progress Bar */}
          <Show when={isSimulatedRouting()}>
            <div
              role="progressbar"
              aria-label="Simulated loading"
              class={`w-full overflow-hidden ${previewSlots().root.replace("fixed top-0 inset-x-0 z-50", "relative")}`}
            >
              <div class={previewSlots().bar} />
            </div>
          </Show>

          <div class="flex-1 flex items-center justify-center p-4 text-center">
            <span class="text-xs text-muted font-mono">
              {isSimulatedRouting()
                ? "Simulating active async page routing..."
                : "Page routing completed. Progress bar unmounted."}
            </span>
          </div>
        </div>
      </div>

      {/* Real layout component instance */}
      <RLNavigationProgress color={selectedColor()} size={selectedSize()} />
    </div>
  );
};

export const navigationProgressAudit: ComponentAuditDefinition = {
  id: "navigation-progress",
  name: "Navigation Progress",
  category: "Navigation",
  status: "Passed",
  description:
    "A top-level visual progress indicator driven by Solid Router's navigation signals during async page transitions.",
  importPath: "@rimelight/ui",
  renderSandbox: () => <NavigationProgressSandbox />,
  testScenarios: [
    {
      id: "sizes-comparison",
      title: "Semantic Sizes Hierarchy",
      description:
        "Comparison of discrete height sizing classes (xs, sm, md, lg) with zero inline styles.",
      render: () => (
        <div class="flex flex-col gap-4 p-4 rounded border border-default bg-elevated/20 text-xs">
          <div class="flex flex-col gap-1">
            <span class="text-muted font-mono">Size: xs (h-0.5)</span>
            <div class="h-0.5 w-full bg-primary animate-pulse" />
          </div>
          <div class="flex flex-col gap-1">
            <span class="text-muted font-mono">Size: sm (h-1 - Default)</span>
            <div class="h-1 w-full bg-primary animate-pulse" />
          </div>
          <div class="flex flex-col gap-1">
            <span class="text-muted font-mono">Size: md (h-1.5)</span>
            <div class="h-1.5 w-full bg-primary animate-pulse" />
          </div>
          <div class="flex flex-col gap-1">
            <span class="text-muted font-mono">Size: lg (h-2)</span>
            <div class="h-2 w-full bg-primary animate-pulse" />
          </div>
        </div>
      ),
    },
    {
      id: "color-variants",
      title: "Theme Color Options",
      description: "Supports all standard Rimelight design system color variants.",
      render: () => (
        <div class="grid grid-cols-2 md:grid-cols-4 gap-3 p-4 rounded border border-default bg-elevated/20 text-xs">
          <div class="flex flex-col gap-1 p-2 rounded bg-elevated/40">
            <span class="text-muted font-mono">Primary</span>
            <div class="h-1 w-full bg-primary animate-pulse" />
          </div>
          <div class="flex flex-col gap-1 p-2 rounded bg-elevated/40">
            <span class="text-muted font-mono">Secondary</span>
            <div class="h-1 w-full bg-secondary animate-pulse" />
          </div>
          <div class="flex flex-col gap-1 p-2 rounded bg-elevated/40">
            <span class="text-muted font-mono">Success</span>
            <div class="h-1 w-full bg-emerald-500 animate-pulse" />
          </div>
          <div class="flex flex-col gap-1 p-2 rounded bg-elevated/40">
            <span class="text-muted font-mono">Warning</span>
            <div class="h-1 w-full bg-amber-500 animate-pulse" />
          </div>
        </div>
      ),
    },
  ],
  checklist: [
    {
      criterion: "API parity with RFC",
      status: "pass",
      notes: "color and semantic size props, ui overrides, class passthrough.",
    },
    {
      criterion: "WAI-ARIA progressbar compliance",
      status: "pass",
      notes: "role='progressbar', aria-label='Page loading', aria-valuemin=0, aria-valuemax=100.",
    },
    {
      criterion: "100% CSP Safe (Zero Inline Styles)",
      status: "pass",
      notes:
        "All dimensions handled via UnoCSS height classes (h-0.5, h-1, h-1.5, h-2) avoiding style={{}} attributes entirely.",
    },
    {
      criterion: "DOM Cleanup when Idle",
      status: "pass",
      notes:
        "Uses Solid Show conditional rendering to completely unmount DOM nodes when not actively routing.",
    },
  ],
};
