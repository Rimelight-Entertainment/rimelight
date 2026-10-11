import { createSignal, createMemo, For, Show, type Component } from "solid-js";
import { COMPONENT_AUDITS, getAllAudits, getAuditById } from "./audits/registry";
import type { ComponentCategory, AuditStatus } from "./audits/types";
import { RLThemeSelector } from "@rimelight/ui/components";

interface ComponentAuditShellProps {
  initialComponentId?: string;
}

type TabType = "sandbox" | "scenarios" | "checklist" | "code";

export const ComponentAuditShell: Component<ComponentAuditShellProps> = (props) => {
  const allAudits = getAllAudits();
  const [selectedId, setSelectedId] = createSignal<string>(
    props.initialComponentId && COMPONENT_AUDITS[props.initialComponentId]
      ? props.initialComponentId
      : (allAudits[0]?.id ?? "accordion"),
  );
  const [activeTab, setActiveTab] = createSignal<TabType>("sandbox");

  const activeAudit = createMemo(() => getAuditById(selectedId()) ?? allAudits[0]);

  // Group audits by category
  const categories = createMemo(() => {
    const list = allAudits;
    const map = new Map<ComponentCategory, typeof list>();
    for (const item of list) {
      const existing = map.get(item.category) ?? [];
      existing.push(item);
      map.set(item.category, existing);
    }
    return Array.from(map.entries());
  });

  const getStatusBadge = (status: AuditStatus) => {
    switch (status) {
      case "Auditing":
        return "bg-amber-500/10 text-amber-500 border-amber-500/30";
      case "Passed":
        return "bg-emerald-500/10 text-emerald-500 border-emerald-500/30";
      case "Needs Attention":
        return "bg-rose-500/10 text-rose-500 border-rose-500/30";
      default:
        return "bg-muted/10 text-muted border-default";
    }
  };

  return (
    <div class="flex flex-col lg:flex-row gap-6 items-start w-full">
      {/* Sidebar Navigation */}
      <aside class="w-full lg:w-64 shrink-0 flex flex-col gap-3 rounded-xl border border-default bg-elevated/20 p-3 lg:sticky lg:top-4">
        <div class="flex flex-col gap-3 max-h-[calc(100vh-160px)] overflow-y-auto">
          <For each={categories()}>
            {([categoryName, items]) => (
              <div class="flex flex-col gap-1">
                <span class="text-[10px] font-bold uppercase tracking-wider text-muted px-2">
                  {categoryName}
                </span>
                <div class="flex flex-col gap-0.5">
                  <For each={items}>
                    {(item) => {
                      const isSelected = () => selectedId() === item.id;
                      return (
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedId(item.id);
                            window.history.replaceState(null, "", `?comp=${item.id}`);
                          }}
                          class={`flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-medium text-left transition-all ${
                            isSelected()
                              ? "bg-primary text-inverted font-bold shadow-xs"
                              : "text-toned hover:text-highlighted hover:bg-elevated/60"
                          }`}
                        >
                          <span>{item.name}</span>
                          <span
                            class={`text-[9px] font-mono px-1.5 py-0.2 rounded-full border ${
                              isSelected()
                                ? "bg-white/20 text-white border-white/30"
                                : getStatusBadge(item.status)
                            }`}
                          >
                            {item.status}
                          </span>
                        </button>
                      );
                    }}
                  </For>
                </div>
              </div>
            )}
          </For>
        </div>
      </aside>

      {/* Main Audit Workspace */}
      <section class="flex-1 min-w-0 w-full flex flex-col gap-5">
        <Show when={activeAudit()}>
          {(audit) => (
            <>
              {/* Header Bar */}
              <div class="p-4 rounded-xl border border-default bg-elevated/20 flex flex-col gap-3">
                <div class="flex items-center justify-between gap-3">
                  <div class="flex items-center gap-3">
                    <h1 class="text-xl font-black tracking-tight text-highlighted">
                      {audit().name}
                    </h1>
                    <span
                      class={`text-[11px] font-mono px-2 py-0.5 rounded-full border font-semibold ${getStatusBadge(
                        audit().status,
                      )}`}
                    >
                      {audit().status}
                    </span>
                  </div>
                  <RLThemeSelector size="sm" />
                </div>

                {/* Tabs */}
                <div class="flex items-center gap-1 border-b border-default pt-1 -mb-1">
                  <button
                    type="button"
                    onClick={() => setActiveTab("sandbox")}
                    class={`px-3 py-1.5 text-xs font-bold border-b-2 transition-colors ${
                      activeTab() === "sandbox"
                        ? "border-primary text-primary"
                        : "border-transparent text-muted hover:text-highlighted"
                    }`}
                  >
                    Sandbox
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab("scenarios")}
                    class={`px-3 py-1.5 text-xs font-bold border-b-2 transition-colors ${
                      activeTab() === "scenarios"
                        ? "border-primary text-primary"
                        : "border-transparent text-muted hover:text-highlighted"
                    }`}
                  >
                    Scenarios ({audit().testScenarios.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab("checklist")}
                    class={`px-3 py-1.5 text-xs font-bold border-b-2 transition-colors ${
                      activeTab() === "checklist"
                        ? "border-primary text-primary"
                        : "border-transparent text-muted hover:text-highlighted"
                    }`}
                  >
                    Checklist
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab("code")}
                    class={`px-3 py-1.5 text-xs font-bold border-b-2 transition-colors ${
                      activeTab() === "code"
                        ? "border-primary text-primary"
                        : "border-transparent text-muted hover:text-highlighted"
                    }`}
                  >
                    Specs
                  </button>
                </div>
              </div>

              {/* Tab 1: Interactive Sandbox */}
              <Show when={activeTab() === "sandbox"}>
                <div class="flex flex-col gap-4">{audit().renderSandbox()}</div>
              </Show>

              {/* Tab 2: Test Scenarios */}
              <Show when={activeTab() === "scenarios"}>
                <div class="flex flex-col gap-5">
                  <For each={audit().testScenarios}>
                    {(scenario) => (
                      <div class="flex flex-col gap-3 p-4 rounded-xl border border-default bg-elevated/10">
                        <div>
                          <h2 class="text-xs font-bold text-highlighted">{scenario.title}</h2>
                          <p class="text-[11px] text-muted mt-0.5">{scenario.description}</p>
                        </div>
                        {scenario.render()}
                      </div>
                    )}
                  </For>
                </div>
              </Show>

              {/* Tab 3: Audit Checklist */}
              <Show when={activeTab() === "checklist"}>
                <div class="flex flex-col gap-3 p-4 rounded-xl border border-default bg-elevated/10">
                  <div class="flex flex-col divide-y divide-border">
                    <For each={audit().checklist ?? []}>
                      {(item) => (
                        <div class="py-2.5 flex items-start justify-between gap-4">
                          <div class="flex items-center gap-2">
                            <span
                              class={`size-4 rounded-full flex items-center justify-center text-[10px] ${
                                item.status === "pass"
                                  ? "bg-emerald-500/20 text-emerald-500"
                                  : item.status === "warn"
                                    ? "bg-amber-500/20 text-amber-500"
                                    : "bg-rose-500/20 text-rose-500"
                              }`}
                            >
                              {item.status === "pass" ? "✓" : item.status === "warn" ? "!" : "✕"}
                            </span>
                            <span class="text-xs font-medium text-highlighted">
                              {item.criterion}
                            </span>
                          </div>
                          <Show when={item.notes}>
                            <span class="text-xs text-muted text-right max-w-sm">{item.notes}</span>
                          </Show>
                        </div>
                      )}
                    </For>
                  </div>
                </div>
              </Show>

              {/* Tab 4: Code & Specs */}
              <Show when={activeTab() === "code"}>
                <div class="p-4 rounded-xl border border-default bg-default flex flex-col gap-3 font-mono text-xs">
                  <pre class="p-3 rounded bg-elevated border border-default text-primary overflow-x-auto">
                    {`import ${audit().name} from "${audit().importPath}"`}
                  </pre>
                </div>
              </Show>
            </>
          )}
        </Show>
      </section>
    </div>
  );
};

export default ComponentAuditShell;
