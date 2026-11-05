import { createSignal, For } from "solid-js";
import type { JSX } from "@solidjs/web";
import { RLLayoutGrid } from "@rimelight/ui/components/layout-grid/RLLayoutGrid.tsx";
import type { ComponentAuditDefinition, TestScenario } from "./types";

const COLS = [4, 8, 12] as const;

const LayoutGridSandbox = (): JSX.Element => {
  const [cols, setCols] = createSignal<(typeof COLS)[number]>(12);
  const [gutter, setGutter] = createSignal(16);
  const [gridOpacity, setGridOpacity] = createSignal(0.15);

  return (
    <div class="flex flex-col gap-6">
      <div class="flex flex-wrap gap-2">
        <For each={COLS}>
          {(c) => (
            <button type="button" onClick={() => setCols(c)}>
              cols: {c}
            </button>
          )}
        </For>
        <button type="button" onClick={() => setGutter((g) => (g === 16 ? 32 : 16))}>
          gutter: {gutter()}
        </button>
        <button type="button" onClick={() => setGridOpacity((o) => (o === 0.15 ? 0.4 : 0.15))}>
          gridOpacity: {gridOpacity()}
        </button>
      </div>
      <p>
        This overlay renders only in development builds and is hidden until toggled. Press
        meta+shift+g (default shortcut) to show it. The visibility state is stored in localStorage.
      </p>
      <RLLayoutGrid cols={cols()} gutter={gutter()} gridOpacity={gridOpacity()} />
    </div>
  );
};

const testScenarios: TestScenario[] = [
  {
    id: "no-children",
    title: "Children (not supported)",
    description:
      "The component has no children or consumer slots. It renders no children, so no children scenario is applicable. Passing children is a known gap.",
    render: () => <RLLayoutGrid />,
  },
  {
    id: "responsive-columns",
    title: "Responsive column counts",
    description: "cols and per-breakpoint counts: smCols, mdCols, lgCols, xlCols.",
    render: () => <RLLayoutGrid cols={4} smCols={6} mdCols={8} lgCols={12} xlCols={12} />,
  },
  {
    id: "gutter-margin",
    title: "gutter and margin",
    description: "gutter sets the gap; margin is a number or [x, y] array.",
    render: () => <RLLayoutGrid cols={12} gutter={24} margin={[16, 32]} />,
  },
  {
    id: "colors-opacity",
    title: "gridColor and gridOpacity",
    description: "Column color and opacity. Inner and full-width variants use their own props.",
    render: () => (
      <RLLayoutGrid
        gridColor="#f97316"
        gridOpacity={0.3}
        innerGridColor="#3b82f6"
        innerGridOpacity={0.2}
      />
    ),
  },
  {
    id: "widths",
    title: "maxWidth and innerMaxWidth",
    description: "Constrains the grid container and the inner grid.",
    render: () => <RLLayoutGrid maxWidth="1024px" innerMaxWidth="768px" />,
  },
  {
    id: "full-width",
    title: "Full-width grid",
    description:
      "showFullWidth and fullWidthGridColor/fullWidthGridOpacity control the full-width overlay.",
    render: () => (
      <RLLayoutGrid showFullWidth fullWidthGridColor="#22c55e" fullWidthGridOpacity={0.2} />
    ),
  },
  {
    id: "backgrounds",
    title: "Backgrounds",
    description: "showBackground, showInnerBackground, and showFullWidthBackground.",
    render: () => <RLLayoutGrid showBackground showInnerBackground showFullWidthBackground />,
  },
  {
    id: "shortcut-z-index",
    title: "shortcut and zIndex",
    description: "shortcut sets the toggle key combo. zIndex sets the overlay stacking order.",
    render: () => <RLLayoutGrid shortcut="meta_shift_g" zIndex={9999} />,
  },
  {
    id: "dev-only",
    title: "devOnly",
    description:
      "devOnly defaults to true. Set it to false to allow the overlay outside development builds.",
    render: () => <RLLayoutGrid devOnly={false} />,
  },
];

export const layoutGridAudit: ComponentAuditDefinition = {
  id: "layout-grid",
  name: "Layout Grid",
  category: "Layout",
  status: "Auditing",
  description:
    "Development-only column overlay with responsive column counts and a keyboard shortcut toggle.",
  importPath: "@rimelight/ui/components/layout-grid/RLLayoutGrid.tsx",
  renderSandbox: () => <LayoutGridSandbox />,
  testScenarios,
};
