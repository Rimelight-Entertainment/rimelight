import { createSignal, For, Show, type Component } from "solid-js";
import { RLCard } from "@rimelight/ui/components/card/RLCard.tsx";
import { RLBadge } from "@rimelight/ui/components/badge/RLBadge.tsx";
import { RLIcon } from "@rimelight/ui/components/icon/RLIcon.tsx";
import { PAGE_MAP } from "../../core/page-definitions";

export interface RimelightPageTypeTemplatesProps {
  apiBase?: string;
}

export const RimelightPageTypeTemplates: Component<RimelightPageTypeTemplatesProps> = (_props) => {
  const templatesList = Object.entries(PAGE_MAP).map(([type, def]) => ({
    type,
    def,
  }));

  const [selectedType, setSelectedType] = createSignal<string>(
    templatesList[0]?.type || "Character",
  );

  const activeTemplate = () => {
    return PAGE_MAP[selectedType()] || null;
  };

  const initialBlocks = () => {
    const tmpl = activeTemplate();
    if (!tmpl || typeof tmpl.initialBlocks !== "function") return [];
    try {
      return tmpl.initialBlocks();
    } catch {
      return [];
    }
  };

  return (
    <div class="space-y-6">
      {/* Header */}
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 class="text-xl font-bold text-highlighted">Page Type Templates</h2>
          <p class="text-sm text-muted mt-1">
            Blueprints for page types (e.g. Character, Weapon, BlogPost). Each page type defines
            typed schema properties and non-removable, partially editable template blocks.
          </p>
        </div>
      </div>

      {/* Grid Layout: Left sidebar selector, Right detail viewer */}
      <div class="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Left List */}
        <div class="md:col-span-4 space-y-2">
          <div class="text-xs font-semibold uppercase tracking-wider text-muted px-2 mb-2">
            Configured Page Types ({templatesList.length})
          </div>
          <div class="flex flex-col gap-1.5 max-h-[750px] overflow-y-auto pr-1">
            <For each={templatesList}>
              {(item) => {
                const isSelected = () => selectedType() === item.type;
                const propCount = Object.keys(item.def.properties || {}).length;
                const hasBlocks = typeof item.def.initialBlocks === "function";

                return (
                  <button
                    type="button"
                    onClick={() => setSelectedType(item.type)}
                    class={`w-full text-left p-3.5 rounded-xl border transition-all flex items-center justify-between cursor-pointer ${
                      isSelected()
                        ? "bg-primary-50/20 border-primary-500 shadow-sm"
                        : "bg-surface border-default hover:bg-neutral-50/50 hover:border-neutral-300"
                    }`}
                  >
                    <div>
                      <div class="font-semibold text-sm text-highlighted flex items-center gap-2">
                        {item.type}
                        <Show when={hasBlocks}>
                          <span class="inline-flex items-center text-[10px] px-1.5 py-0.5 rounded bg-neutral-100 text-neutral-600 border border-neutral-200">
                            🔒 Templated
                          </span>
                        </Show>
                      </div>
                      <div class="text-xs text-muted mt-0.5">
                        {propCount} property {propCount === 1 ? "group" : "groups"}
                      </div>
                    </div>
                    <RLIcon
                      name="chevronRight"
                      size="xs"
                      class={isSelected() ? "text-primary-500" : "text-muted"}
                    />
                  </button>
                );
              }}
            </For>
          </div>
        </div>

        {/* Right Details Panel */}
        <div class="md:col-span-8">
          <Show
            when={activeTemplate()}
            fallback={<div class="p-8 text-center text-muted">Select a template</div>}
          >
            {(def) => {
              const blocks = () => initialBlocks();
              const propGroups = () => Object.entries(def().properties || {});

              return (
                <div class="space-y-6">
                  {/* Template Meta Card */}
                  <RLCard variant="outline" class="p-6 bg-surface">
                    <div class="flex items-start justify-between">
                      <div>
                        <div class="flex items-center gap-3">
                          <h3 class="text-lg font-bold text-highlighted">
                            {selectedType()} Template
                          </h3>
                          <RLBadge variant="subtle" color="primary" class="font-mono text-xs">
                            {def().typeLabelKey}
                          </RLBadge>
                        </div>
                        <p class="text-xs text-muted mt-1">
                          All pages created with type{" "}
                          <code class="font-bold text-highlighted">{selectedType()}</code> inherit
                          these typed property groups and core templated section blocks.
                        </p>
                      </div>
                    </div>
                  </RLCard>

                  {/* 1. Mandatory Templated Blocks Skeleton */}
                  <RLCard variant="outline" class="p-6 bg-surface">
                    <div class="flex items-center justify-between mb-4">
                      <div>
                        <h4 class="text-sm font-bold text-highlighted flex items-center gap-2">
                          <RLIcon name="lock" size="xs" class="text-warning-500" />
                          Mandatory Template Blocks (Skeleton)
                        </h4>
                        <p class="text-xs text-muted mt-0.5">
                          Enforced by server guards: editors cannot delete or reorder these blocks.
                        </p>
                      </div>
                      <RLBadge variant="subtle" color="neutral" class="text-xs">
                        {blocks().length} {blocks().length === 1 ? "block" : "blocks"}
                      </RLBadge>
                    </div>

                    <Show
                      when={blocks().length > 0}
                      fallback={
                        <div class="p-6 rounded-xl border border-dashed border-default text-center text-xs text-muted">
                          No mandatory blocks predefined for this page type. Editors can add any
                          blocks freely.
                        </div>
                      }
                    >
                      <div class="space-y-2.5">
                        <For each={blocks()}>
                          {(b, idx) => (
                            <div class="p-3.5 rounded-xl border border-default bg-neutral-50/40 flex items-center justify-between">
                              <div class="flex items-center gap-3">
                                <span class="text-xs font-mono text-muted w-4">{idx() + 1}.</span>
                                <div>
                                  <div class="text-xs font-bold text-highlighted flex items-center gap-2">
                                    <span>{b.type}</span>
                                    <Show when={b.isTemplated}>
                                      <RLBadge variant="subtle" color="warning" class="text-[10px]">
                                        Non-removable
                                      </RLBadge>
                                    </Show>
                                  </div>
                                  <div class="text-[11px] text-muted font-mono mt-0.5">
                                    {b.props?.["title"]
                                      ? `Title: "${b.props["title"]}"`
                                      : JSON.stringify(b.props || {})}
                                  </div>
                                </div>
                              </div>
                              <div class="text-[11px] text-neutral-500 flex items-center gap-1 font-mono">
                                <span>🔒 Locked structure</span>
                              </div>
                            </div>
                          )}
                        </For>
                      </div>
                    </Show>
                  </RLCard>

                  {/* 2. Defined Property Groups & Fields */}
                  <RLCard variant="outline" class="p-6 bg-surface">
                    <div class="flex items-center justify-between mb-4">
                      <div>
                        <h4 class="text-sm font-bold text-highlighted flex items-center gap-2">
                          <RLIcon name="sliders" size="xs" class="text-primary-500" />
                          Schema Properties & Fields
                        </h4>
                        <p class="text-xs text-muted mt-0.5">
                          Structured data fields rendered in the page's sidebar properties panel.
                        </p>
                      </div>
                      <RLBadge variant="subtle" color="neutral" class="text-xs">
                        {propGroups().length} {propGroups().length === 1 ? "group" : "groups"}
                      </RLBadge>
                    </div>

                    <Show
                      when={propGroups().length > 0}
                      fallback={
                        <div class="p-6 rounded-xl border border-dashed border-default text-center text-xs text-muted">
                          No custom structured properties defined. Uses standard document metadata.
                        </div>
                      }
                    >
                      <div class="space-y-4">
                        <For each={propGroups()}>
                          {([groupKey, group]) => {
                            const fields = Object.entries(group.fields || {});

                            return (
                              <div class="border border-default rounded-xl p-4 bg-surface">
                                <div class="flex items-center justify-between mb-3 border-b border-default pb-2">
                                  <div class="font-semibold text-xs text-highlighted uppercase tracking-wide">
                                    {group.label?.en || groupKey}
                                  </div>
                                  <span class="text-[11px] text-muted font-mono">
                                    group: {groupKey}
                                  </span>
                                </div>
                                <div class="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                                  <For each={fields}>
                                    {([fieldKey, field]) => (
                                      <div class="p-2.5 rounded-lg bg-neutral-50/50 border border-default/60 flex items-center justify-between text-xs">
                                        <div>
                                          <div class="font-medium text-highlighted">
                                            {field.label?.en || fieldKey}
                                          </div>
                                          <div class="text-[10px] text-muted font-mono mt-0.5">
                                            {fieldKey}
                                          </div>
                                        </div>
                                        <RLBadge
                                          variant="subtle"
                                          color="neutral"
                                          class="font-mono text-[10px]"
                                        >
                                          {field.type}
                                        </RLBadge>
                                      </div>
                                    )}
                                  </For>
                                </div>
                              </div>
                            );
                          }}
                        </For>
                      </div>
                    </Show>
                  </RLCard>
                </div>
              );
            }}
          </Show>
        </div>
      </div>
    </div>
  );
};
