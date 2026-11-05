import { createSignal, For } from "solid-js";
import type { JSX } from "@solidjs/web";
import { RLGrid } from "@rimelight/ui/components/grid/RLGrid.tsx";
import { RLButton } from "@rimelight/ui/components/button/RLButton.tsx";
import type { ComponentAuditDefinition } from "./types";

const COLS = [1, 2, 3, 4, 5, 6] as const;
const GAPS = ["none", "xs", "sm", "md", "lg", "xl"] as const;
const CARDS = [1, 2, 3, 4, 5, 6] as const;

const renderCards = (): JSX.Element => (
  <For each={CARDS}>
    {(n) => <div class="p-4 rounded-lg border border-default bg-elevated text-sm">Card {n}</div>}
  </For>
);

export const GridSandbox = (): JSX.Element => {
  const [cols, setCols] = createSignal<(typeof COLS)[number]>(2);
  const [gap, setGap] = createSignal<(typeof GAPS)[number]>("md");
  const [stagger, setStagger] = createSignal(false);

  return (
    <div class="flex flex-col gap-6">
      {/* Control Toolbar */}
      <div class="p-4 rounded-xl border border-default bg-elevated/20 flex flex-wrap items-center gap-4 text-xs">
        <div class="flex items-center gap-1.5 flex-wrap">
          <span class="text-muted mr-1">Cols</span>
          <For each={COLS}>
            {(c) => (
              <RLButton
                size="xs"
                color="neutral"
                variant={cols() === c ? "solid" : "outline"}
                onClick={() => setCols(c)}
              >
                {String(c)}
              </RLButton>
            )}
          </For>
        </div>

        <div class="flex items-center gap-1.5 flex-wrap">
          <span class="text-muted mr-1">Gap</span>
          <For each={GAPS}>
            {(g) => (
              <RLButton
                size="xs"
                color="neutral"
                variant={gap() === g ? "solid" : "outline"}
                onClick={() => setGap(g)}
              >
                {g}
              </RLButton>
            )}
          </For>
        </div>

        <div class="flex items-center gap-1.5 flex-wrap">
          <span class="text-muted mr-1">Stagger</span>
          <RLButton
            size="xs"
            color="neutral"
            variant={stagger() ? "solid" : "outline"}
            onClick={() => setStagger((v) => !v)}
          >
            stagger
          </RLButton>
        </div>
      </div>

      {/* Preview Area */}
      <div class="p-8 rounded-xl border border-default bg-elevated/10">
        <RLGrid cols={cols()} gap={gap()} stagger={stagger()}>
          {renderCards()}
        </RLGrid>
      </div>
    </div>
  );
};

export const gridAudit: ComponentAuditDefinition = {
  id: "grid",
  name: "Grid",
  category: "Layout",
  status: "Auditing",
  description: "Responsive CSS grid container with configurable column count, gap, and stagger.",
  importPath: "@rimelight/ui/components/grid/RLGrid.tsx",
  renderSandbox: () => <GridSandbox />,
  testScenarios: [
    {
      id: "children-root",
      title: "Children in root",
      description: "Text and a nested element passed as children render inside the grid root.",
      render: () => (
        <RLGrid>
          Loose text child
          <div class="p-4 rounded-lg border border-default bg-elevated text-sm">
            Nested element child
          </div>
        </RLGrid>
      ),
    },
    {
      id: "cols-1",
      title: "Single column",
      description: "cols=1 stacks every item in a single column at all breakpoints.",
      render: () => <RLGrid cols={1}>{renderCards()}</RLGrid>,
    },
    {
      id: "cols-3",
      title: "Three columns",
      description: "cols=3 steps from one column to three across breakpoints.",
      render: () => <RLGrid cols={3}>{renderCards()}</RLGrid>,
    },
    {
      id: "cols-6",
      title: "Six columns",
      description:
        "cols=6 is the widest configuration, reaching six columns at the large breakpoint.",
      render: () => <RLGrid cols={6}>{renderCards()}</RLGrid>,
    },
    {
      id: "gap-none-and-xl",
      title: "Gap none and xl",
      description: "Compares the zero gap against the largest responsive gap.",
      render: () => (
        <div class="flex flex-col gap-6">
          <RLGrid cols={3} gap="none">
            {renderCards()}
          </RLGrid>
          <RLGrid cols={3} gap="xl">
            {renderCards()}
          </RLGrid>
        </div>
      ),
    },
    {
      id: "stagger-enabled",
      title: "Stagger enabled",
      description: "stagger=true offsets every even child downward for a staggered layout.",
      render: () => (
        <RLGrid cols={3} stagger>
          {renderCards()}
        </RLGrid>
      ),
    },
    {
      id: "as-polymorphic",
      title: "Polymorphic as",
      description: 'as="ul" renders the grid root as a list with li children.',
      render: () => (
        <RLGrid as="ul" cols={3}>
          <li class="p-4 rounded-lg border border-default bg-elevated text-sm">Item one</li>
          <li class="p-4 rounded-lg border border-default bg-elevated text-sm">Item two</li>
          <li class="p-4 rounded-lg border border-default bg-elevated text-sm">Item three</li>
        </RLGrid>
      ),
    },
    {
      id: "class-passthrough",
      title: "Class passthrough",
      description: "A consumer class is merged onto the grid root.",
      render: () => (
        <RLGrid cols={3} class="p-2 rounded-lg border border-dashed border-default">
          {renderCards()}
        </RLGrid>
      ),
    },
    {
      id: "ui-root-override",
      title: "UI root override",
      description: "The ui.root slot override is applied to the grid root.",
      render: () => (
        <RLGrid cols={3} ui={{ root: "p-4 rounded-xl bg-elevated/30" }}>
          {renderCards()}
        </RLGrid>
      ),
    },
  ],
  checklist: [
    {
      criterion: "Functional implementation",
      status: "pass",
      notes: "Renders a responsive CSS grid with cols, gap, and stagger variants.",
    },
    {
      criterion: "Responsive breakpoints via theme classes",
      status: "pass",
      notes: "Column counts and gaps step through sm/md/lg breakpoints defined in grid.theme.ts.",
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
      notes: "All styling comes from grid.theme.ts classes; no style attribute is set.",
    },
    {
      criterion: "Children rendered in root",
      status: "pass",
      notes: "children() is rendered directly inside the root element.",
    },
    {
      criterion: "No hydration-unsafe globals",
      status: "pass",
      notes: "Pure props-driven rendering with no window or document access.",
    },
  ],
};
