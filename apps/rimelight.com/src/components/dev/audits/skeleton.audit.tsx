import { createSignal, For } from "solid-js";
import type { JSX } from "@solidjs/web";
import { RLSkeleton } from "@rimelight/ui/components/skeleton/RLSkeleton.tsx";
import type { ComponentAuditDefinition } from "./types";

const SHAPES = ["circle", "rectangle", "rounded"] as const;
const RADII = [undefined, 0, 12] as const;

const chipClass = (active: boolean): string =>
  `px-2 py-0.5 rounded text-xs font-mono transition-colors ${
    active
      ? "bg-primary text-inverted font-bold"
      : "bg-elevated text-muted hover:text-highlighted border border-default"
  }`;

const ProfileCard = (): JSX.Element => (
  <div class="flex flex-col gap-2 p-4 w-80 rounded-xl border border-default bg-elevated/20">
    <h4 class="text-sm font-semibold">Profile title</h4>
    <p class="text-xs text-muted">A short description that wraps across the card body.</p>
    <div class="h-24 rounded-md border border-default" />
  </div>
);

export const SkeletonSandbox = (): JSX.Element => {
  const [loading, setLoading] = createSignal(true);
  const [shape, setShape] = createSignal<(typeof SHAPES)[number]>("rounded");
  const [radius, setRadius] = createSignal<(typeof RADII)[number]>(undefined);

  return (
    <div class="flex flex-col gap-6">
      {/* Control Toolbar */}
      <div class="p-4 rounded-xl border border-default bg-elevated/20 flex flex-wrap items-center gap-4 text-xs">
        <div class="flex items-center gap-1.5 flex-wrap">
          <span class="text-muted mr-1">loading</span>
          <button type="button" onClick={() => setLoading(true)} class={chipClass(loading())}>
            on
          </button>
          <button type="button" onClick={() => setLoading(false)} class={chipClass(!loading())}>
            off
          </button>
        </div>

        <div class="flex items-center gap-1.5 flex-wrap">
          <span class="text-muted mr-1">shape</span>
          <For each={SHAPES}>
            {(s) => (
              <button type="button" onClick={() => setShape(s)} class={chipClass(shape() === s)}>
                {s}
              </button>
            )}
          </For>
        </div>

        <div class="flex items-center gap-1.5 flex-wrap">
          <span class="text-muted mr-1">fallback-radius</span>
          <button
            type="button"
            onClick={() => setRadius(undefined)}
            class={chipClass(radius() === undefined)}
          >
            none
          </button>
          <button type="button" onClick={() => setRadius(0)} class={chipClass(radius() === 0)}>
            0
          </button>
          <button type="button" onClick={() => setRadius(12)} class={chipClass(radius() === 12)}>
            12
          </button>
        </div>
      </div>

      {/* Preview Area */}
      <div class="p-8 rounded-xl border border-default bg-elevated/10 flex flex-wrap items-center justify-center gap-6">
        <RLSkeleton loading={loading()} shape={shape()} fallbackBorderRadius={radius()}>
          <ProfileCard />
        </RLSkeleton>
      </div>
    </div>
  );
};

export const skeletonAudit: ComponentAuditDefinition = {
  id: "skeleton",
  name: "Skeleton",
  category: "Feedback",
  status: "Auditing",
  description:
    "A loading placeholder. With children it measures their leaf geometry and paints shimmering blocks over them while loading; without children it renders a standalone shimmering block. Shape and fallback radius control the corners of the placeholder.",
  importPath: "@rimelight/ui/components/skeleton/RLSkeleton.tsx",
  renderSandbox: () => <SkeletonSandbox />,
  testScenarios: [
    {
      id: "standalone",
      title: "Standalone block",
      description: "No children; renders a shimmering block sized by its class.",
      render: () => <RLSkeleton class="h-24 w-80" />,
    },
    {
      id: "shapes",
      title: "Shapes",
      description: "circle, rectangle, and rounded shapes.",
      render: () => (
        <div class="flex flex-wrap items-center gap-6">
          <RLSkeleton class="size-16" shape="circle" />
          <RLSkeleton class="h-16 w-40" shape="rectangle" />
          <RLSkeleton class="h-16 w-40" shape="rounded" />
        </div>
      ),
    },
    {
      id: "children-loading",
      title: "Children while loading",
      description: "Children in the default slot are measured and masked by shimmer blocks.",
      render: () => (
        <RLSkeleton loading>
          <ProfileCard />
        </RLSkeleton>
      ),
    },
    {
      id: "children-resolved",
      title: "Children resolved",
      description: "loading disabled; children render unchanged.",
      render: () => (
        <RLSkeleton loading={false}>
          <ProfileCard />
        </RLSkeleton>
      ),
    },
    {
      id: "fallback-radius",
      title: "Fallback border radius",
      description: "fallbackBorderRadius applied to measured children that have no radius.",
      render: () => (
        <RLSkeleton loading fallbackBorderRadius={12}>
          <ProfileCard />
        </RLSkeleton>
      ),
    },
  ],
  checklist: [
    {
      criterion: "Static conformance (slots, data-slot, shape variant, banned names)",
      status: "pass",
      notes:
        "Shape variant covers circle, rectangle, and rounded. Highlight uses the inverted intent. Measurement helpers live in skeleton.helpers.ts.",
    },
    {
      criterion: "Loading state swaps placeholder and children",
      status: "pending",
      notes: "Covered by packages/ui/test/skeleton.test.tsx; not yet run.",
    },
  ],
};
