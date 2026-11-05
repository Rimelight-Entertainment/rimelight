import type { JSX } from "@solidjs/web";
import { RLSpoiler } from "@rimelight/ui/components/spoiler/RLSpoiler.tsx";
import type { ComponentAuditDefinition } from "./types";

export const SpoilerSandbox = (): JSX.Element => (
  <div class="flex flex-col gap-6">
    <p class="text-xs text-muted">
      Stub: renders its root and children only. No hide, reveal, or blur behavior is implemented.
    </p>
    <div class="p-8 rounded-xl border border-default bg-elevated/10 flex flex-wrap items-center justify-center gap-6">
      <RLSpoiler>Stub children</RLSpoiler>
    </div>
  </div>
);

export const spoilerAudit: ComponentAuditDefinition = {
  id: "spoiler",
  name: "Spoiler",
  category: "Data Display",
  status: "Planned",
  description:
    "Stub. Spoiler is a placeholder root that renders its children. Content is not hidden or revealed.",
  importPath: "@rimelight/ui/components/spoiler/RLSpoiler.tsx",
  renderSandbox: () => <SpoilerSandbox />,
  testScenarios: [
    {
      id: "default-slot",
      title: "Default slot (children)",
      description: "Children are rendered inside the root. This is the only slot the stub exposes.",
      render: () => <RLSpoiler>Stub children</RLSpoiler>,
    },
  ],
};
