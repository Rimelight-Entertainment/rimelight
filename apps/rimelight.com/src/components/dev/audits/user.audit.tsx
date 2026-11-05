import type { JSX } from "@solidjs/web";
import { RLUser } from "@rimelight/ui/components/user/RLUser.tsx";
import type { ComponentAuditDefinition } from "./types";

export const UserSandbox = (): JSX.Element => (
  <div class="flex flex-col gap-6">
    <p class="text-xs text-muted">
      Stub: renders its root and children only. No user profile data or avatar behavior is
      implemented.
    </p>
    <div class="p-8 rounded-xl border border-default bg-elevated/10 flex flex-wrap items-center justify-center gap-6">
      <RLUser>Stub children</RLUser>
    </div>
  </div>
);

export const userAudit: ComponentAuditDefinition = {
  id: "user",
  name: "User",
  category: "Data Display",
  status: "Planned",
  description:
    "Stub. User is a placeholder root that renders its children. No user profile rendering is implemented.",
  importPath: "@rimelight/ui/components/user/RLUser.tsx",
  renderSandbox: () => <UserSandbox />,
  testScenarios: [
    {
      id: "default-slot",
      title: "Default slot (children)",
      description: "Children are rendered inside the root. This is the only slot the stub exposes.",
      render: () => <RLUser>Stub children</RLUser>,
    },
  ],
};
