import { For, type Component } from "solid-js";
import { CMSDashboardLayout } from "../layouts/CMSDashboardLayout";
import { RLButton } from "@rimelight/ui/components/button/RLButton.tsx";
import { RLBadge } from "@rimelight/ui/components/badge/RLBadge.tsx";
import { RLIcon } from "@rimelight/ui/components/icon/RLIcon.tsx";

const contentTypes = [
  {
    id: "page",
    name: "Page",
    slug: "pages",
    icon: "i-lucide-file-text",
    description: "Standard standalone marketing and dynamic landing pages",
    count: 12,
    system: true,
  },
  {
    id: "blog",
    name: "Blog Post",
    slug: "blog",
    icon: "i-lucide-newspaper",
    description: "Articles and editorial news posts with bylines and dates",
    count: 8,
    system: false,
  },
  {
    id: "doc",
    name: "Documentation",
    slug: "docs",
    icon: "i-lucide-book-open",
    description: "Hierarchical product documentation and API references",
    count: 24,
    system: false,
  },
  {
    id: "legal",
    name: "Legal Document",
    slug: "legal",
    icon: "i-lucide-scale",
    description: "Version-controlled Terms of Service, Privacy Policies",
    count: 4,
    system: false,
  },
];

export const ContentTypesPage: Component<{ basePath?: string | undefined }> = (props) => {
  return (
    <CMSDashboardLayout
      title="Content Types"
      description="Define schemas, block rules, and collection models"
      activeSection="content-types"
      basePath={props.basePath ?? "/cms"}
      toolbarRight={
        <RLButton variant="solid" color="success">
          Create Content Type
        </RLButton>
      }
    >
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <For each={contentTypes}>
          {(ct) => (
            <div class="border border-default rounded-lg bg-default p-6 flex flex-col justify-between hover:border-primary/50 transition-colors">
              <div class="flex flex-col gap-3">
                <div class="flex items-center justify-between">
                  <div class="flex items-center gap-3">
                    <div class="size-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                      <RLIcon name={ct.icon} class="size-5 text-primary" />
                    </div>
                    <div>
                      <h3 class="font-semibold text-highlighted text-base">{ct.name}</h3>
                      <span class="font-mono text-xs text-muted">/{ct.slug}</span>
                    </div>
                  </div>
                  <RLBadge variant="soft" color={ct.system ? "neutral" : "primary"} size="xs">
                    {ct.system ? "System" : "Custom"}
                  </RLBadge>
                </div>
                <p class="text-sm text-muted">{ct.description}</p>
              </div>
              <div class="flex items-center justify-between mt-6 pt-4 border-t border-default/50 text-sm">
                <span class="text-xs text-muted">{ct.count} entries</span>
                <div class="flex items-center gap-2">
                  <RLButton variant="ghost" color="primary" size="xs">
                    Edit Schema
                  </RLButton>
                  <RLButton variant="ghost" color="neutral" size="xs">
                    Permissions
                  </RLButton>
                </div>
              </div>
            </div>
          )}
        </For>
      </div>
    </CMSDashboardLayout>
  );
};
