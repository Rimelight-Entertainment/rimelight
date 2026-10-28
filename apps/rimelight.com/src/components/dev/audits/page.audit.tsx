import { createSignal } from "solid-js";
import type { JSX } from "@solidjs/web";
import { RLPage } from "@rimelight/ui/components/page/RLPage.tsx";
import type { ComponentAuditDefinition } from "./types";

const SLOT_PLACEHOLDER_CLASS =
  "flex min-h-32 w-full items-center justify-center rounded-xl border border-default bg-gradient-to-br from-primary/30 to-secondary/30 p-6";

const Placeholder = (props: { label: string }): JSX.Element => (
  <div class={SLOT_PLACEHOLDER_CLASS}>
    <span class="text-xs font-mono font-bold text-highlighted">{props.label}</span>
  </div>
);

export const PageSandbox = (): JSX.Element => {
  const [hasLeft, setHasLeft] = createSignal(true);
  const [hasRight, setHasRight] = createSignal(true);

  return (
    <div class="flex flex-col gap-6">
      {/* Control Toolbar */}
      <div class="p-4 rounded-xl border border-default bg-elevated/20 flex flex-wrap items-center gap-4 text-xs">
        <div class="flex items-center gap-3 flex-wrap">
          <label class="flex items-center gap-1.5 cursor-pointer">
            <input
              type="checkbox"
              checked={hasLeft()}
              onInput={(e) => setHasLeft(e.currentTarget.checked)}
              onChange={(e) => setHasLeft(e.currentTarget.checked)}
              class="rounded border-default"
            />
            <span class="text-muted">Left slot</span>
          </label>
          <label class="flex items-center gap-1.5 cursor-pointer">
            <input
              type="checkbox"
              checked={hasRight()}
              onInput={(e) => setHasRight(e.currentTarget.checked)}
              onChange={(e) => setHasRight(e.currentTarget.checked)}
              class="rounded border-default"
            />
            <span class="text-muted">Right slot</span>
          </label>
        </div>
      </div>

      <RLPage
        left={hasLeft() ? <Placeholder label="left" /> : undefined}
        right={hasRight() ? <Placeholder label="right" /> : undefined}
      >
        <Placeholder label="default (center)" />
      </RLPage>
    </div>
  );
};

export const pageAudit: ComponentAuditDefinition = {
  id: "page",
  name: "Page",
  category: "Layout",
  status: "Auditing",
  description:
    "A grid layout for pages with optional left and right columns and a centered main column. Renders as a single centered column when no side slots are provided.",
  importPath: "@rimelight/ui/components/page/RLPage.tsx",
  renderSandbox: () => <PageSandbox />,
  testScenarios: [
    {
      id: "default-slot",
      title: "Default slot only (single centered column)",
      description:
        "With no left or right slot the default slot spans the full grid (lg:col-span-10).",
      render: () => (
        <RLPage>
          <Placeholder label="default slot" />
        </RLPage>
      ),
    },
    {
      id: "left-slot",
      title: "Left slot",
      description:
        "The left slot renders in its own column and the default slot spans lg:col-span-8.",
      render: () => (
        <RLPage left={<Placeholder label="left slot" />}>
          <Placeholder label="default slot" />
        </RLPage>
      ),
    },
    {
      id: "right-slot",
      title: "Right slot",
      description:
        "The right slot renders in its own column, ordered first on mobile and last on large screens.",
      render: () => (
        <RLPage right={<Placeholder label="right slot" />}>
          <Placeholder label="default slot" />
        </RLPage>
      ),
    },
    {
      id: "both-slots",
      title: "Left and right slots together",
      description: "The default slot narrows to lg:col-span-6 when both side columns are present.",
      render: () => (
        <RLPage left={<Placeholder label="left slot" />} right={<Placeholder label="right slot" />}>
          <Placeholder label="default slot" />
        </RLPage>
      ),
    },
  ],
  checklist: [
    {
      criterion: "Named exports and no default export",
      status: "pending",
      notes: "Component exported as RLPage with types in page.types.ts.",
    },
    {
      criterion: "Theme classes resolved via createMemo and no inline classes in JSX",
      status: "pending",
    },
    {
      criterion: "Native Solid control flow (Show) for slots",
      status: "pending",
    },
    {
      criterion: "Props passthrough uses omit and does not leak to DOM",
      status: "pending",
    },
    {
      criterion: "Polymorphic as prop via theme tag helper",
      status: "pending",
    },
    {
      criterion: "Every slot exercised by a scenario (default, left, right)",
      status: "pending",
    },
    {
      criterion: "No hydration mismatches",
      status: "pending",
      notes: "Requires manual verification in the browser.",
    },
  ],
};
