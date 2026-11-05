import { createSignal } from "solid-js";
import type { JSX } from "@solidjs/web";
import { RLTableOfContents } from "@rimelight/ui/components/table-of-contents/RLTableOfContents.tsx";
import type { TableOfContentsHeading } from "@rimelight/ui/components/table-of-contents/table-of-contents.types.ts";
import type { ComponentAuditDefinition } from "./types";

const HEADINGS: TableOfContentsHeading[] = [
  { depth: 1, slug: "introduction", text: "Introduction" },
  { depth: 2, slug: "installation", text: "Installation" },
  { depth: 3, slug: "requirements", text: "Requirements" },
  { depth: 3, slug: "configuration", text: "Configuration" },
  { depth: 2, slug: "usage", text: "Usage" },
  { depth: 4, slug: "advanced-options", text: "Advanced options" },
];

const TableOfContentsSandbox = (): JSX.Element => {
  const [collapsible, setCollapsible] = createSignal(false);
  const [minLevel, setMinLevel] = createSignal(2);
  const [maxLevel, setMaxLevel] = createSignal(3);

  return (
    <div class="flex flex-col gap-6">
      {/* Control Toolbar */}
      <div class="p-4 rounded-xl border border-default bg-elevated/20 flex flex-wrap items-center gap-4 text-xs">
        <button
          type="button"
          class="px-2 py-1 rounded border border-default text-muted"
          onClick={() => setCollapsible(!collapsible())}
        >
          {collapsible() ? "collapsible: on" : "collapsible: off"}
        </button>
        <button
          type="button"
          class="px-2 py-1 rounded border border-default text-muted"
          onClick={() => setMinLevel(minLevel() === 2 ? 1 : 2)}
        >
          min level: {minLevel()}
        </button>
        <button
          type="button"
          class="px-2 py-1 rounded border border-default text-muted"
          onClick={() => setMaxLevel(maxLevel() === 3 ? 4 : 3)}
        >
          max level: {maxLevel()}
        </button>
      </div>

      {/* Preview Area */}
      <div class="p-8 rounded-xl border border-default bg-elevated/10">
        <RLTableOfContents
          headings={HEADINGS}
          collapsible={collapsible()}
          tableOfContents={{ minHeadingLevel: minLevel(), maxHeadingLevel: maxLevel() }}
        />
      </div>
    </div>
  );
};

export const tableOfContentsAudit: ComponentAuditDefinition = {
  id: "table-of-contents",
  name: "Table of Contents",
  category: "Navigation",
  status: "Auditing",
  description:
    "Heading outline for a page with bounded heading levels, active-section highlighting on scroll, and a collapsible dropdown variant for small screens.",
  importPath: "@rimelight/ui/components/table-of-contents/RLTableOfContents.tsx",
  renderSandbox: () => <TableOfContentsSandbox />,
  testScenarios: [
    {
      id: "default-levels",
      title: "Default heading levels",
      description: "Shows h2 and h3 headings when no tableOfContents config is given.",
      render: () => <RLTableOfContents headings={HEADINGS} />,
    },
    {
      id: "custom-levels",
      title: "Custom heading level bounds",
      description: "tableOfContents bounds the listed levels to h1 through h4.",
      render: () => (
        <RLTableOfContents
          headings={HEADINGS}
          tableOfContents={{ minHeadingLevel: 1, maxHeadingLevel: 4 }}
        />
      ),
    },
    {
      id: "disabled",
      title: "tableOfContents false",
      description: "Renders nothing when tableOfContents is false.",
      render: () => (
        <div class="text-sm text-muted">
          <RLTableOfContents headings={HEADINGS} tableOfContents={false} />
          <span>No outline rendered above.</span>
        </div>
      ),
    },
    {
      id: "no-matching-headings",
      title: "No headings inside bounds",
      description: "The root is hidden when no heading falls inside the configured levels.",
      render: () => (
        <RLTableOfContents
          headings={[{ depth: 1, slug: "title", text: "Title" }]}
          tableOfContents={{ minHeadingLevel: 2, maxHeadingLevel: 3 }}
        />
      ),
    },
    {
      id: "collapsible",
      title: "Collapsible dropdown",
      description: "Renders a details/summary dropdown for small screens.",
      render: () => <RLTableOfContents headings={HEADINGS} collapsible />,
    },
  ],
};
