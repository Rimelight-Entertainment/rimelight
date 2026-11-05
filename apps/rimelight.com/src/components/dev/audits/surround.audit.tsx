import { createSignal } from "solid-js";
import type { JSX } from "@solidjs/web";
import { RLSurround } from "@rimelight/ui/components/surround/RLSurround.tsx";
import type { ComponentAuditDefinition } from "./types";

const PREV = { label: "Introduction", href: "/docs/introduction" };
const NEXT = { label: "Installation", href: "/docs/installation" };

const chipClass = (active: boolean): string =>
  `px-2 py-0.5 rounded text-xs font-mono transition-colors ${
    active
      ? "bg-primary text-inverted font-bold"
      : "bg-elevated text-muted hover:text-highlighted border border-default"
  }`;

export const SurroundSandbox = (): JSX.Element => {
  const [hasPrev, setHasPrev] = createSignal(true);
  const [hasNext, setHasNext] = createSignal(true);

  return (
    <div class="flex flex-col gap-6">
      {/* Control Toolbar */}
      <div class="p-4 rounded-xl border border-default bg-elevated/20 flex flex-wrap items-center gap-4 text-xs">
        <div class="flex items-center gap-1.5 flex-wrap">
          <span class="text-muted mr-1">prev</span>
          <button type="button" onClick={() => setHasPrev(true)} class={chipClass(hasPrev())}>
            on
          </button>
          <button type="button" onClick={() => setHasPrev(false)} class={chipClass(!hasPrev())}>
            off
          </button>
        </div>

        <div class="flex items-center gap-1.5 flex-wrap">
          <span class="text-muted mr-1">next</span>
          <button type="button" onClick={() => setHasNext(true)} class={chipClass(hasNext())}>
            on
          </button>
          <button type="button" onClick={() => setHasNext(false)} class={chipClass(!hasNext())}>
            off
          </button>
        </div>
      </div>

      {/* Preview Area */}
      <div class="p-8 rounded-xl border border-default bg-elevated/10 flex flex-wrap items-center justify-center gap-6">
        <div class="w-full max-w-xl">
          <RLSurround prev={hasPrev() ? PREV : undefined} next={hasNext() ? NEXT : undefined} />
        </div>
      </div>
    </div>
  );
};

export const surroundAudit: ComponentAuditDefinition = {
  id: "surround",
  name: "Surround",
  category: "Navigation",
  status: "Auditing",
  description:
    "Previous and next page links for documentation pages. Each side renders an RLLink with the page label, and the root is hidden when neither neighbor exists.",
  importPath: "@rimelight/ui/components/surround/RLSurround.tsx",
  renderSandbox: () => <SurroundSandbox />,
  testScenarios: [
    {
      id: "both-neighbors",
      title: "Previous and next",
      description: "Both neighbors present; each side links to its page.",
      render: () => <RLSurround prev={PREV} next={NEXT} />,
    },
    {
      id: "previous-only",
      title: "Previous only",
      description: "First page in a sequence; only the previous side renders a link.",
      render: () => <RLSurround prev={PREV} />,
    },
    {
      id: "next-only",
      title: "Next only",
      description: "Last page in a sequence is not reached; only the next side renders a link.",
      render: () => <RLSurround next={NEXT} />,
    },
    {
      id: "no-neighbors",
      title: "No neighbors",
      description: "Neither side is provided; the root is hidden.",
      render: () => <RLSurround />,
    },
  ],
  checklist: [
    {
      criterion: "Static conformance (slots, data-slot, RL primitives, banned names)",
      status: "pass",
      notes:
        "Anchors replaced by RLLink. Theme slots label, icon, title, link are all used; side variant drives label alignment.",
    },
    {
      criterion: "Hidden root when no neighbors",
      status: "pass",
      notes: "Root carries the hidden attribute when neither prev nor next is provided.",
    },
    {
      criterion: "Behavior tests",
      status: "pending",
      notes: "packages/ui/test/surround.test.tsx written; not yet run.",
    },
  ],
};
