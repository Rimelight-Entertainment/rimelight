import { For, type Component } from "solid-js";
import { CMSDashboardLayout } from "../layouts/CMSDashboardLayout.tsx";
import { RLButton } from "@rimelight/ui/components/button/RLButton.tsx";
import { RLBadge } from "@rimelight/ui/components/badge/RLBadge.tsx";

const users = [
  {
    id: "1",
    name: "Idan T.",
    email: "admin@rimelight.com",
    role: "owner",
    status: "active",
    lastActive: "2 min ago"
  },
  {
    id: "2",
    name: "Sarah Connor",
    email: "sarah@rimelight.com",
    role: "admin",
    status: "active",
    lastActive: "1 hr ago"
  },
  {
    id: "3",
    name: "Alex Rivers",
    email: "alex@rimelight.com",
    role: "editor",
    status: "active",
    lastActive: "3 hrs ago"
  },
  {
    id: "4",
    name: "Elena Vance",
    email: "elena@rimelight.com",
    role: "viewer",
    status: "invited",
    lastActive: "never"
  }
];

export const UsersPage: Component<{ basePath?: string | undefined }> = (props) => {
  return (
    <CMSDashboardLayout
      title="Users"
      description="Manage CMS members, roles and invitations"
      activeSection="users"
      basePath={props.basePath ?? "/cms"}
      toolbarRight={
        <RLButton variant="solid" color="primary" size="sm">
          Invite Member
        </RLButton>
      }
    >
      <div class="border border-default rounded-lg bg-default divide-y divide-default">
        <For each={users}>
          {(user) => (
            <div class="p-4 flex items-center justify-between gap-4">
              <div class="min-w-0">
                <p class="text-sm font-medium text-highlighted">{user.name}</p>
                <p class="text-xs text-muted">{user.email}</p>
              </div>
              <div class="flex items-center gap-2 shrink-0">
                <RLBadge variant="soft" color="neutral" size="xs">
                  {user.role}
                </RLBadge>
                <RLBadge
                  variant="soft"
                  color={user.status === "active" ? "success" : "neutral"}
                  size="xs"
                >
                  {user.status}
                </RLBadge>
                <span class="text-xs text-muted hidden sm:inline">{user.lastActive}</span>
              </div>
            </div>
          )}
        </For>
      </div>
    </CMSDashboardLayout>
  );
};

export default UsersPage;
