import { createSignal, For } from "solid-js";
import type { JSX } from "@solidjs/web";
import { RLFieldGroup } from "@rimelight/ui/components/field-group/RLFieldGroup.tsx";
import { RLInput } from "@rimelight/ui/components/input/RLInput.tsx";
import type { ComponentAuditDefinition } from "./types";

const SIZES = ["xs", "sm", "md", "lg", "xl"] as const;

export const FieldGroupSandbox = (): JSX.Element => {
  const [size, setSize] = createSignal<(typeof SIZES)[number]>("md");

  return (
    <div class="flex flex-col gap-4">
      <div class="flex flex-wrap gap-2 text-xs">
        <For each={SIZES}>
          {(s) => (
            <button type="button" onClick={() => setSize(s)}>
              size: {s}
            </button>
          )}
        </For>
      </div>
      <RLFieldGroup
        size={size()}
        leadingSlot={<span class="px-2 text-sm">https://</span>}
        trailingSlot={<span class="px-2 text-sm">.com</span>}
      >
        <RLInput placeholder="yoursite" />
      </RLFieldGroup>
    </div>
  );
};

export const fieldGroupAudit: ComponentAuditDefinition = {
  id: "field-group",
  name: "Field Group",
  category: "Form & Input",
  status: "Auditing",
  description:
    "Groups a form control with leading and trailing addons, sharing one border and size scale.",
  importPath: "@rimelight/ui/components/field-group/RLFieldGroup.tsx",
  renderSandbox: () => <FieldGroupSandbox />,
  testScenarios: [
    {
      id: "default-slot",
      title: "Default slot children",
      description: "The default children slot holds the form control.",
      render: () => (
        <RLFieldGroup>
          <RLInput placeholder="Default slot input" />
        </RLFieldGroup>
      ),
    },
    {
      id: "leading-slot",
      title: "leadingSlot slot",
      description: "Passes a leading addon. The default children slot holds the control.",
      render: () => (
        <RLFieldGroup leadingSlot={<span class="px-2 text-sm">$</span>}>
          <RLInput placeholder="Amount" />
        </RLFieldGroup>
      ),
    },
    {
      id: "trailing-slot",
      title: "trailingSlot slot",
      description: "Passes a trailing addon. The default children slot holds the control.",
      render: () => (
        <RLFieldGroup trailingSlot={<span class="px-2 text-sm">USD</span>}>
          <RLInput placeholder="Amount" />
        </RLFieldGroup>
      ),
    },
    {
      id: "sizes",
      title: "Size variants",
      description: "Renders each size variant xs through xl.",
      render: () => (
        <div class="flex flex-col gap-3">
          <For each={SIZES}>
            {(s) => (
              <RLFieldGroup size={s} leadingSlot={<span class="px-2 text-sm">{s}</span>}>
                <RLInput placeholder={`Size ${s}`} />
              </RLFieldGroup>
            )}
          </For>
        </div>
      ),
    },
  ],
};
