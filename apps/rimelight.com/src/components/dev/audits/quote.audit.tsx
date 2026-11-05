import { createSignal } from "solid-js";
import type { JSX } from "@solidjs/web";
import { RLQuote } from "@rimelight/ui/components/quote/RLQuote.tsx";
import type { ComponentAuditDefinition, TestScenario } from "./types";

const QuoteSandbox = (): JSX.Element => {
  const [withCaption, setWithCaption] = createSignal(true);

  return (
    <div class="flex flex-col gap-6">
      <div class="flex flex-wrap gap-2">
        <button type="button" onClick={() => setWithCaption((v) => !v)}>
          caption: {withCaption() ? "on" : "off"}
        </button>
      </div>
      <div class="p-4 rounded-xl border border-default">
        <RLQuote captionSlot={withCaption() ? <span>Ada Lovelace</span> : undefined}>
          The Analytical Engine weaves algebraical patterns just as the Jacquard loom weaves flowers
          and leaves.
        </RLQuote>
      </div>
    </div>
  );
};

const testScenarios: TestScenario[] = [
  {
    id: "default-slot",
    title: "Default slot (children)",
    description: "Children are the quoted text and render inside the blockquote.",
    render: () => <RLQuote>Simplicity is the ultimate sophistication.</RLQuote>,
  },
  {
    id: "quote-slot",
    title: "quoteSlot",
    description: "quoteSlot replaces children as the quoted text.",
    render: () => (
      <RLQuote quoteSlot={<span>Quoted through quoteSlot, children are not rendered.</span>}>
        Ignored children
      </RLQuote>
    ),
  },
  {
    id: "caption-slot",
    title: "captionSlot",
    description: "captionSlot renders an attribution as a figcaption. Omitted, no figcaption.",
    render: () => (
      <div class="flex flex-col gap-6">
        <RLQuote captionSlot={<span>Attribution, with caption</span>}>
          A quote with a caption.
        </RLQuote>
        <RLQuote>A quote without a caption.</RLQuote>
      </div>
    ),
  },
  {
    id: "all-slots",
    title: "Children, quoteSlot and captionSlot together",
    description: "Every slot passed content: quoteSlot takes precedence over children.",
    render: () => (
      <RLQuote
        quoteSlot={<span>Quote from quoteSlot.</span>}
        captionSlot={<span>Caption from captionSlot.</span>}
      >
        Children, not rendered while quoteSlot is set.
      </RLQuote>
    ),
  },
];

export const quoteAudit: ComponentAuditDefinition = {
  id: "quote",
  name: "Quote",
  category: "Data Display",
  status: "Auditing",
  description: "Block quotation rendered as a figure with a blockquote and optional caption.",
  importPath: "@rimelight/ui/components/quote/RLQuote.tsx",
  renderSandbox: () => <QuoteSandbox />,
  testScenarios,
};
