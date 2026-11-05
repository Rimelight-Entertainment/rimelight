import { createSignal } from "solid-js";
import type { JSX } from "@solidjs/web";
import { RLFooter } from "@rimelight/ui/components/footer/RLFooter.tsx";
import type { ComponentAuditDefinition } from "./types";

export const FooterSandbox = (): JSX.Element => {
  const [contain, setContain] = createSignal(false);

  return (
    <div class="flex flex-col gap-6">
      <div class="p-4 rounded-xl border border-default bg-elevated/20 flex flex-wrap items-center gap-4 text-xs">
        <label class="flex items-center gap-2">
          <input
            type="checkbox"
            checked={contain()}
            onChange={(e) => setContain(e.currentTarget.checked)}
          />
          Contain
        </label>
      </div>
      <div class="rounded-xl border border-default bg-elevated/10">
        <RLFooter
          contain={contain()}
          leadingSlot={<span class="text-sm">Leading</span>}
          trailingSlot={<span class="text-sm">Trailing</span>}
        >
          <span class="text-sm">Center content</span>
        </RLFooter>
      </div>
    </div>
  );
};

export const footerAudit: ComponentAuditDefinition = {
  id: "footer",
  name: "Footer",
  category: "Layout",
  status: "Auditing",
  description:
    "Page footer with leading, center, and trailing regions. The center falls back to children, and the content can be contained to a max width.",
  importPath: "@rimelight/ui/components/footer/RLFooter.tsx",
  renderSandbox: () => <FooterSandbox />,
  testScenarios: [
    {
      id: "default-slot",
      title: "Default slot",
      description: "Children render in the center region when centerSlot is omitted.",
      render: () => (
        <RLFooter>
          <span class="text-sm">Center from children</span>
        </RLFooter>
      ),
    },
    {
      id: "leading-slot",
      title: "Leading slot",
      description: "Content rendered in the leading region.",
      render: () => (
        <RLFooter leadingSlot={<span class="text-sm">Leading content</span>}>
          <span class="text-sm">Center</span>
        </RLFooter>
      ),
    },
    {
      id: "center-slot",
      title: "Center slot",
      description: "centerSlot replaces children in the center region.",
      render: () => (
        <RLFooter centerSlot={<span class="text-sm">Center slot content</span>}>
          <span class="text-sm">Ignored children</span>
        </RLFooter>
      ),
    },
    {
      id: "trailing-slot",
      title: "Trailing slot",
      description: "Content rendered in the trailing region.",
      render: () => (
        <RLFooter trailingSlot={<span class="text-sm">Trailing content</span>}>
          <span class="text-sm">Center</span>
        </RLFooter>
      ),
    },
    {
      id: "contained",
      title: "Contained",
      description: "Content constrained to the max container width.",
      render: () => (
        <RLFooter contain>
          <span class="text-sm">Contained center</span>
        </RLFooter>
      ),
    },
  ],
  checklist: [
    { criterion: "Center slot overrides children", status: "pending" },
    { criterion: "Contain variant constrains width", status: "pending" },
  ],
};
