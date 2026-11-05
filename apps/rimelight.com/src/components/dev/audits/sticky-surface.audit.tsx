import { createSignal, For } from "solid-js";
import type { JSX } from "@solidjs/web";
import { RLStickySurface } from "@rimelight/ui/components/sticky-surface/RLStickySurface.tsx";
import type { ComponentAuditDefinition } from "./types";

const OFFSETS = [0, 16, 64] as const;
const Z_INDEXES = [10, 50] as const;
const FILLER = Array.from({ length: 24 }, (_, i) => `Scrollable content line ${i + 1}`);

const chipClass = (active: boolean): string =>
  `px-2 py-0.5 rounded text-xs font-mono transition-colors ${
    active
      ? "bg-primary text-inverted font-bold"
      : "bg-elevated text-muted hover:text-highlighted border border-default"
  }`;

export const StickySurfaceSandbox = (): JSX.Element => {
  const [offsetTop, setOffsetTop] = createSignal<(typeof OFFSETS)[number]>(0);
  const [zIndex, setZIndex] = createSignal<(typeof Z_INDEXES)[number]>(10);
  const [stuckShadow, setStuckShadow] = createSignal(true);

  return (
    <div class="flex flex-col gap-6">
      {/* Control Toolbar */}
      <div class="p-4 rounded-xl border border-default bg-elevated/20 flex flex-wrap items-center gap-4 text-xs">
        <div class="flex items-center gap-1.5 flex-wrap">
          <span class="text-muted mr-1">offset-top</span>
          <For each={OFFSETS}>
            {(o) => (
              <button
                type="button"
                onClick={() => setOffsetTop(o)}
                class={chipClass(offsetTop() === o)}
              >
                {o}
              </button>
            )}
          </For>
        </div>

        <div class="flex items-center gap-1.5 flex-wrap">
          <span class="text-muted mr-1">z-index</span>
          <For each={Z_INDEXES}>
            {(z) => (
              <button type="button" onClick={() => setZIndex(z)} class={chipClass(zIndex() === z)}>
                {z}
              </button>
            )}
          </For>
        </div>

        <div class="flex items-center gap-1.5 flex-wrap">
          <span class="text-muted mr-1">stuck-shadow</span>
          <button
            type="button"
            onClick={() => setStuckShadow(true)}
            class={chipClass(stuckShadow())}
          >
            on
          </button>
          <button
            type="button"
            onClick={() => setStuckShadow(false)}
            class={chipClass(!stuckShadow())}
          >
            off
          </button>
        </div>
      </div>

      {/* Preview Area: scroll container so the sticky surface has something to pin against */}
      <div class="h-72 overflow-auto rounded-xl border border-default bg-elevated/10">
        <RLStickySurface offsetTop={offsetTop()} zIndex={zIndex()} stuckShadow={stuckShadow()}>
          <div class="p-3 text-xs font-semibold">Pinned header</div>
        </RLStickySurface>
        <div class="flex flex-col gap-3 p-4 text-xs text-muted">
          <For each={FILLER}>{(line) => <p>{line}</p>}</For>
        </div>
      </div>
    </div>
  );
};

export const stickySurfaceAudit: ComponentAuditDefinition = {
  id: "sticky-surface",
  name: "Sticky Surface",
  category: "Layout",
  status: "Auditing",
  description:
    "A surface that pins to the top of its scroll container. Offset and stacking order are exposed as CSS variables, and an optional shadow appears once the surface is stuck.",
  importPath: "@rimelight/ui/components/sticky-surface/RLStickySurface.tsx",
  renderSandbox: () => <StickySurfaceSandbox />,
  testScenarios: [
    {
      id: "default-children",
      title: "Default children",
      description: "Default props with children in the default slot; shadow on when stuck.",
      render: () => (
        <RLStickySurface>
          <div class="p-3 text-xs font-semibold">Pinned header</div>
        </RLStickySurface>
      ),
    },
    {
      id: "offset-and-z-index",
      title: "Offset and z-index",
      description: "Offset from the top edge and stacking order set explicitly.",
      render: () => (
        <RLStickySurface offsetTop={16} zIndex={50}>
          <div class="p-3 text-xs font-semibold">Offset 16, z-index 50</div>
        </RLStickySurface>
      ),
    },
    {
      id: "without-stuck-shadow",
      title: "Without stuck shadow",
      description: "stuckShadow disabled; no shadow applied when stuck.",
      render: () => (
        <RLStickySurface stuckShadow={false}>
          <div class="p-3 text-xs font-semibold">No shadow</div>
        </RLStickySurface>
      ),
    },
  ],
  checklist: [
    {
      criterion: "Static conformance (slots, data-slot, CSS variables, banned names)",
      status: "pass",
      notes:
        "Offset and z-index passed as CSS variables through the style prop, which is allowed for runtime values. The stuck shadow is a presence variant.",
    },
    {
      criterion: "Stuck shadow variant has no empty false branch",
      status: "pass",
      notes: "Theme keeps only the true branch; the false branch is the absence of the class.",
    },
    {
      criterion: "Behavior tests",
      status: "pending",
      notes: "packages/ui/test/sticky-surface.test.tsx written; not yet run.",
    },
  ],
};
