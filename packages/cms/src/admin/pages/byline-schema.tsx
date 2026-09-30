import { For, Show, type Component } from "solid-js";
import { CMSDashboardLayout } from "../layouts/CMSDashboardLayout.tsx";
import { RLButton } from "@rimelight/ui/components/button/RLButton.tsx";
import { RLBadge } from "@rimelight/ui/components/badge/RLBadge.tsx";
import { RLIcon } from "@rimelight/ui/components/icon/RLIcon.tsx";

const schemaFields = [
  {
    key: "displayName",
    label: "Display Name",
    type: "string",
    required: true,
    description: "Primary author attribution name",
  },
  {
    key: "avatarUrl",
    label: "Avatar Image",
    type: "image",
    required: false,
    description: "Author headshot or logo URL",
  },
  {
    key: "role",
    label: "Role / Job Title",
    type: "string",
    required: false,
    description: "e.g. Lead Designer, Staff Writer",
  },
  {
    key: "bio",
    label: "Biography",
    type: "rich_text",
    required: false,
    description: "Short author profile description",
  },
  {
    key: "socialLinks",
    label: "Social Links",
    type: "array",
    required: false,
    description: "Twitter, GitHub, LinkedIn, Website URLs",
  },
  {
    key: "organization",
    label: "Organization",
    type: "relation",
    required: false,
    description: "Associated company or team entity",
  },
];

export const BylineSchemaPage: Component<{ basePath?: string | undefined }> = (props) => {
  return (
    <CMSDashboardLayout
      title="Byline Schema"
      description="Configure author attribution fields and metadata requirements"
      activeSection="byline-schema"
      basePath={props.basePath ?? "/cms"}
      toolbarRight={
        <RLButton variant="solid" color="primary">
          Save Schema
        </RLButton>
      }
    >
      <div class="border border-default rounded-lg bg-default divide-y divide-default">
        <div class="p-6 flex items-center justify-between">
          <div>
            <h3 class="font-semibold text-highlighted text-base">Attribution Fields</h3>
            <p class="text-sm text-muted">Fields available across all author byline entities</p>
          </div>
          <RLButton variant="outline" color="neutral" size="sm">
            Add Custom Field
          </RLButton>
        </div>
        <For each={schemaFields}>
          {(field) => (
            <div class="p-4 sm:p-6 flex items-center justify-between gap-4 hover:bg-muted/10 transition-colors">
              <div class="flex items-center gap-4 min-w-0">
                <RLIcon name="i-lucide-grip-vertical" class="size-4 text-muted shrink-0" />
                <div class="flex flex-col truncate">
                  <div class="flex items-center gap-2">
                    <span class="font-medium text-highlighted text-sm">{field.label}</span>
                    <span class="font-mono text-xs text-muted">({field.key})</span>
                    <Show when={field.required}>
                      <RLBadge variant="soft" color="error" size="xs">
                        Required
                      </RLBadge>
                    </Show>
                  </div>
                  <span class="text-xs text-muted truncate mt-0.5">{field.description}</span>
                </div>
              </div>
              <div class="flex items-center gap-3 shrink-0">
                <RLBadge variant="soft" color="neutral" size="xs" class="font-mono">
                  {field.type}
                </RLBadge>
                <RLButton variant="ghost" color="neutral" size="xs" aria-label="Configure field">
                  Configure
                </RLButton>
              </div>
            </div>
          )}
        </For>
      </div>
    </CMSDashboardLayout>
  );
};

export default BylineSchemaPage;
