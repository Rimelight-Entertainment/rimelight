import { type Component, createSignal, For, Show } from "solid-js";
import DevLayout from "#layouts/DevLayout";
import ColorTestingMatrix from "#components/dev/ColorTestingMatrix.tsx";
import { RLButton } from "@rimelight/ui/components/button/RLButton.tsx";
import { RLBadge } from "@rimelight/ui/components/badge/RLBadge.tsx";
import { RLCard } from "@rimelight/ui/components/card/RLCard.tsx";
import { RLGrid } from "@rimelight/ui/components/grid/RLGrid.tsx";

const COLOR_SHADES = [
  "50",
  "100",
  "200",
  "300",
  "400",
  "500",
  "600",
  "700",
  "800",
  "900",
  "950",
] as const;

const PALETTE_NAMES = [
  "neutral",
  "primary",
  "secondary",
  "info",
  "success",
  "warning",
  "error",
  "commentary",
  "ideation",
  "source",
] as const;

export const DevDesignSystemPage: Component = () => {
  const [viewMode, setViewMode] = createSignal<"interactive" | "overview">("interactive");

  return (
    <DevLayout
      actions={
        <div class="flex items-center gap-1 bg-muted p-1 rounded-lg">
          <button
            type="button"
            onClick={() => setViewMode("interactive")}
            class={`px-3 py-1 rounded-md text-xs font-semibold transition-all ${
              viewMode() === "interactive"
                ? "bg-default text-highlighted shadow-xs"
                : "text-muted hover:text-highlighted"
            }`}
          >
            Color & Intent Matrix
          </button>
          <button
            type="button"
            onClick={() => setViewMode("overview")}
            class={`px-3 py-1 rounded-md text-xs font-semibold transition-all ${
              viewMode() === "overview"
                ? "bg-default text-highlighted shadow-xs"
                : "text-muted hover:text-highlighted"
            }`}
          >
            Components & Scales
          </button>
        </div>
      }
    >
      <Show when={viewMode() === "interactive"}>
        <ColorTestingMatrix />
      </Show>

      <Show when={viewMode() === "overview"}>
        <div class="flex flex-col gap-10">
          <div class="border-b border-default pb-6">
            <h1 class="text-3xl font-bold tracking-tight text-highlighted">
              Rimelight UI Design System Showcase
            </h1>
            <p class="text-sm text-muted mt-2">
              Live verification of the Hybrid Seed-Matrix Palette, Component Theming, and Semantic
              Intent Utilities.
            </p>
          </div>

          {/* 1. Color Palette Scales */}
          <section class="flex flex-col gap-4 border border-default p-6 rounded-2xl bg-elevated/20">
            <h2 class="text-xl font-bold text-highlighted">Active Hybrid Palette Scales</h2>

            <div class="flex flex-col gap-4">
              <For each={PALETTE_NAMES}>
                {(name) => (
                  <div class="flex flex-col sm:flex-row sm:items-center gap-2">
                    <span class="w-28 text-xs font-mono font-bold capitalize text-highlighted">
                      {name}
                    </span>
                    <div class="grid grid-cols-11 gap-1 flex-1">
                      <For each={COLOR_SHADES}>
                        {(shade) => (
                          <div class="flex flex-col items-center gap-1">
                            <div
                              class="w-full h-10 rounded shadow-xs border border-default"
                              style={{ background: `var(--rl-${name}-${shade})` }}
                              title={`${name}-${shade}`}
                            />
                            <span class="text-[9px] font-mono text-muted">{shade}</span>
                          </div>
                        )}
                      </For>
                    </div>
                  </div>
                )}
              </For>
            </div>
          </section>

          {/* 2. Component Scoped Color Theming (rl-color-*) */}
          <section class="flex flex-col gap-4 border border-default p-6 rounded-2xl bg-elevated/20">
            <h2 class="text-xl font-bold text-highlighted">Component Variants & Theming</h2>

            <div class="flex flex-wrap items-center gap-3">
              <RLButton label="Primary Solid" color="primary" variant="solid" />
              <RLButton label="Secondary Soft" color="secondary" variant="soft" />
              <RLButton label="Success Outline" color="success" variant="outline" />
              <RLButton label="Warning Subtle" color="warning" variant="subtle" />
              <RLButton label="Error Ghost" color="error" variant="ghost" />
              <RLButton label="Info Link" color="info" variant="link" />
            </div>

            <div class="flex flex-wrap items-center gap-2">
              <RLBadge label="Neutral" color="neutral" />
              <RLBadge label="Primary" color="primary" />
              <RLBadge label="Secondary" color="secondary" />
              <RLBadge label="Success" color="success" />
              <RLBadge label="Warning" color="warning" />
              <RLBadge label="Error" color="error" />
              <RLBadge label="Info" color="info" />
              <RLBadge label="Commentary" color="commentary" />
              <RLBadge label="Ideation" color="ideation" />
              <RLBadge label="Source" color="source" />
            </div>
          </section>

          {/* 3. Semantic Intent Utility Tokens */}
          <section class="flex flex-col gap-4 border border-default p-6 rounded-2xl bg-elevated/20">
            <h2 class="text-xl font-bold text-highlighted">Semantic Intent Utility Matrix</h2>

            <div class="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div class="p-4 rounded-xl bg-default text-default border border-default shadow-xs">
                <span class="text-xs font-mono block mb-1">bg-default / text-default</span>
                Default surface
              </div>
              <div class="p-4 rounded-xl bg-muted text-muted border border-muted shadow-xs">
                <span class="text-xs font-mono block mb-1">bg-muted / text-muted</span>
                Muted surface
              </div>
              <div class="p-4 rounded-xl bg-elevated text-toned border border-elevated shadow-xs">
                <span class="text-xs font-mono block mb-1">bg-elevated / text-toned</span>
                Elevated surface
              </div>
              <div class="p-4 rounded-xl bg-accented text-accented border border-accented shadow-xs">
                <span class="text-xs font-mono block mb-1">bg-accented / text-accented</span>
                Accented surface
              </div>
            </div>

            <div class="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div class="p-4 rounded-xl bg-dimmed text-dimmed border border-dimmed">
                <span class="text-xs font-mono block mb-1">bg-dimmed / text-dimmed</span>
                Dimmed
              </div>
              <div class="p-4 rounded-xl bg-toned text-highlighted border border-toned">
                <span class="text-xs font-mono block mb-1">bg-toned / text-highlighted</span>
                Toned
              </div>
              <div class="p-4 rounded-xl bg-highlighted text-inverted border border-highlighted">
                <span class="text-xs font-mono block mb-1">bg-highlighted / text-inverted</span>
                Highlighted
              </div>
              <div class="p-4 rounded-xl bg-inverted text-inverted border border-inverted">
                <span class="text-xs font-mono block mb-1">bg-inverted / text-inverted</span>
                Inverted
              </div>
            </div>
          </section>

          {/* 4. Grid Layout Showcase */}
          <section class="flex flex-col gap-4 border border-default p-6 rounded-2xl bg-elevated/20">
            <h2 class="text-xl font-bold text-highlighted">Layout Grid Showcase</h2>

            <RLGrid cols={3}>
              <RLCard
                title="Hybrid Seed Matrix"
                description="Generates lightweight OKLCH scales without 200+ hardcoded number strings."
              />
              <RLCard
                title="Component Scoping"
                description="Single-class rl-color-* resolver drives all button, badge, and input variants."
              />
              <RLCard
                title="Lean Architecture"
                description="Unified tokens, zero intermediate preflight variables, and fast compilation."
              />
            </RLGrid>
          </section>

          {/* 5. UI Slot Overrides */}
          <section class="flex flex-col gap-4 border border-default p-6 rounded-2xl bg-elevated/20">
            <h2 class="text-xl font-bold text-highlighted">
              Slot UI Overrides & Theme Customization
            </h2>
            <p class="text-xs text-muted">
              Testing slot class extension strings and function-based replacements via the{" "}
              <code class="font-mono text-primary">ui</code> prop.
            </p>

            <div class="flex flex-wrap items-center gap-4">
              <RLButton
                label="String Override (Border + Shadow)"
                color="primary"
                variant="outline"
                ui={{
                  root: "border-2 shadow-lg hover:scale-105 transition-transform",
                  label: "tracking-widest uppercase font-mono font-bold",
                }}
              />

              <RLButton
                label="Function Override (Custom Badge Style)"
                color="secondary"
                ui={{
                  root: (def: string) => `${def} ring-2 ring-secondary-400 rounded-full px-6`,
                  label: () => "text-xs italic font-semibold",
                }}
              />

              <RLBadge
                label="Custom Slot Badge"
                color="warning"
                ui={{
                  root: "shadow-md ring-2 ring-warning-500/40",
                  label: "font-mono font-bold uppercase",
                }}
              />
            </div>

            <RLCard
              title="Card Slot Customization"
              description="Testing card slot overrides for header, title, description, and body containers."
              ui={{
                root: "border-2 border-primary-500/30 bg-primary-50/50 dark:bg-primary-950/20 shadow-xl",
                title: "text-primary-600 font-extrabold text-lg",
                description: "italic text-muted",
              }}
            >
              <p class="text-xs text-muted">Body content within styled container slot.</p>
            </RLCard>
          </section>
        </div>
      </Show>
    </DevLayout>
  );
};

export default DevDesignSystemPage;
