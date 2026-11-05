import type { JSX } from "@solidjs/web";
import { RLRating } from "@rimelight/ui/components/rating/RLRating.tsx";
import type { ComponentAuditDefinition } from "./types";

export const RatingSandbox = (): JSX.Element => (
  <div class="flex flex-col gap-6">
    <p class="text-xs text-muted">
      Stub: renders its root and children only. No rating logic is implemented.
    </p>
    <div class="p-8 rounded-xl border border-default bg-elevated/10 flex flex-wrap items-center justify-center gap-6">
      <RLRating>Stub children</RLRating>
    </div>
  </div>
);

export const ratingAudit: ComponentAuditDefinition = {
  id: "rating",
  name: "Rating",
  category: "Form & Input",
  status: "Planned",
  description:
    "Stub. Rating is a placeholder root that renders its children. No star or score behavior is implemented.",
  importPath: "@rimelight/ui/components/rating/RLRating.tsx",
  renderSandbox: () => <RatingSandbox />,
  testScenarios: [
    {
      id: "default-slot",
      title: "Default slot (children)",
      description: "Children are rendered inside the root. This is the only slot the stub exposes.",
      render: () => <RLRating>Stub children</RLRating>,
    },
  ],
};
