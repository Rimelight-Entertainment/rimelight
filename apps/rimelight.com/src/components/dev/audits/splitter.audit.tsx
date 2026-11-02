import { createSignal, For } from "solid-js";
import type { JSX } from "@solidjs/web";
import { RLSplitter } from "@rimelight/ui/components/splitter/RLSplitter.tsx";
import { RLIcon } from "@rimelight/ui/components/icon/RLIcon.tsx";
import { RLButton } from "@rimelight/ui/components/button/RLButton.tsx";
import { RLBadge } from "@rimelight/ui/components/badge/RLBadge.tsx";
import type { ComponentAuditDefinition } from "./types";
import { AUDIT_COLORS } from "./types";

const ORIENTATIONS = ["horizontal", "vertical"] as const;

export const SplitterSandbox = (): JSX.Element => {
  const [orientation, setOrientation] = createSignal<(typeof ORIENTATIONS)[number]>("horizontal");
  const [disabled, setDisabled] = createSignal(false);
  const [intersection, setIntersection] = createSignal(false);
  const [keyboardDelta, setKeyboardDelta] = createSignal("10%");
  const [color, setColor] = createSignal("primary");
  const [sizes, setSizes] = createSignal<number[]>([]);

  return (
    <div class="flex flex-col gap-6">
      {/* Controls Toolbar */}
      <div class="p-4 rounded-xl border border-default bg-elevated/20 flex flex-wrap items-center gap-4 text-xs">
        <div class="flex items-center gap-1.5 flex-wrap">
          <span class="text-muted mr-1">Orientation:</span>
          <For each={ORIENTATIONS}>
            {(o) => (
              <button
                type="button"
                onClick={() => setOrientation(o)}
                class={`px-2 py-0.5 rounded text-xs font-mono transition-colors ${
                  orientation() === o
                    ? "bg-primary text-inverted font-bold"
                    : "bg-elevated text-muted hover:text-highlighted border border-default"
                }`}
              >
                {o}
              </button>
            )}
          </For>
        </div>

        <div class="flex items-center gap-3 flex-wrap">
          <label class="flex items-center gap-1.5 cursor-pointer">
            <input
              type="checkbox"
              checked={disabled()}
              onInput={(e) => setDisabled(e.currentTarget.checked)}
              onChange={(e) => setDisabled(e.currentTarget.checked)}
              class="rounded border-default"
            />
            <span class="text-muted">Disabled</span>
          </label>

          <label class="flex items-center gap-1.5 cursor-pointer">
            <input
              type="checkbox"
              checked={intersection()}
              onInput={(e) => setIntersection(e.currentTarget.checked)}
              onChange={(e) => setIntersection(e.currentTarget.checked)}
              class="rounded border-default"
            />
            <span class="text-muted">Intersection Targets</span>
          </label>
        </div>

        <div class="flex items-center gap-1.5 flex-wrap">
          <span class="text-muted mr-1">Color:</span>
          <For each={AUDIT_COLORS.slice(0, 6)}>
            {(c) => (
              <button
                type="button"
                onClick={() => setColor(c)}
                class={`px-2 py-0.5 rounded text-xs font-mono transition-colors ${
                  color() === c
                    ? "bg-primary text-inverted font-bold"
                    : "bg-elevated text-muted hover:text-highlighted border border-default"
                }`}
              >
                {c}
              </button>
            )}
          </For>
        </div>

        <div class="flex items-center gap-2">
          <span class="text-muted">Keyboard Delta:</span>
          <button
            type="button"
            onClick={() => setKeyboardDelta(keyboardDelta() === "10%" ? "5%" : "10%")}
            class="px-2 py-0.5 rounded text-xs font-mono bg-elevated text-muted border border-default"
          >
            {keyboardDelta()}
          </button>
        </div>

        {sizes().length > 0 && (
          <div class="flex items-center gap-2 ml-auto text-muted font-mono">
            <span>Sizes:</span>
            <span>{sizes().join("px | ")}px</span>
          </div>
        )}
      </div>

      {/* Component Sandbox Canvas */}
      <div class="h-80 w-full border border-default/60 rounded-xl overflow-hidden bg-card/30">
        <RLSplitter
          orientation={orientation()}
          disabled={disabled()}
          intersection={intersection()}
          keyboardDelta={keyboardDelta()}
          color={color()}
          defaultValue={["30%", "70%"]}
          onValueChange={setSizes}
          panels={[
            {
              min: "20%",
              collapsible: true,
              collapsibleMin: 56,
              handle: { action: "collapse" },
              content: (state) => (
                <div class="h-full p-4 flex flex-col justify-between bg-muted/20">
                  <div class="flex flex-col gap-1">
                    <span class="text-xs font-semibold text-highlighted uppercase tracking-wider">
                      {state.collapsed ? "Rail" : "Navigation Rail"}
                    </span>
                    <span class="text-xs text-muted">
                      {state.collapsed ? `${state.size}px` : "min 20%, collapsible"}
                    </span>
                  </div>
                  <div class="text-[10px] font-mono text-muted">
                    {Math.round(state.percentage)}%
                  </div>
                </div>
              ),
            },
            {
              min: "30%",
              content: (state) => (
                <div class="h-full p-4 flex flex-col justify-between bg-background/50">
                  <div class="flex flex-col gap-1">
                    <span class="text-xs font-semibold text-highlighted uppercase tracking-wider">
                      Workspace Viewport
                    </span>
                    <span class="text-xs text-muted">
                      Expands dynamically as adjacent handle moves (min 30%)
                    </span>
                  </div>
                  <div class="flex items-center justify-between text-xs text-muted font-mono">
                    <span>{state.size}px</span>
                    <span>{Math.round(state.percentage)}%</span>
                  </div>
                </div>
              ),
            },
          ]}
        />
      </div>
    </div>
  );
};

export const splitterAudit: ComponentAuditDefinition = {
  id: "splitter",
  name: "Splitter",
  category: "Layout",
  status: "Auditing",
  description:
    "Arrange panels with draggable and keyboard-operated size boundaries, min/max constraints, collapsible rails, multi-axis intersections, and full ARIA separator semantics.",
  importPath: "@rimelight/ui/components/splitter/RLSplitter.tsx",
  renderSandbox: () => <SplitterSandbox />,
  testScenarios: [
    {
      id: "basic-usage",
      title: "Basic Resizable Split",
      description:
        "Default horizontal two-pane split with minimum bounds (20% sidebar, 30% content).",
      render: () => (
        <div class="h-64 w-full border border-default/60 rounded-xl overflow-hidden bg-card/30">
          <RLSplitter
            defaultValue={["30%", "70%"]}
            panels={[
              {
                min: "20%",
                content: (
                  <div class="h-full p-4 bg-muted/20 flex flex-col gap-2">
                    <span class="font-semibold text-sm">Sidebar</span>
                    <p class="text-xs text-muted">Constrained to minimum 20% width.</p>
                  </div>
                ),
              },
              {
                min: "30%",
                content: (
                  <div class="h-full p-4 bg-background/50 flex flex-col gap-2">
                    <span class="font-semibold text-sm">Content</span>
                    <p class="text-xs text-muted">Adapts smoothly to remaining area.</p>
                  </div>
                ),
              },
            ]}
          />
        </div>
      ),
    },
    {
      id: "panel-constraints",
      title: "Panel Bounds & Limits",
      description:
        "Constrain an inspector panel beside a viewport with min 25% and max 45% limits.",
      render: () => (
        <div class="h-64 w-full border border-default/60 rounded-xl overflow-hidden bg-card/30">
          <RLSplitter
            defaultValue={["32%", "68%"]}
            panels={[
              {
                min: "25%",
                max: "45%",
                content: (
                  <div class="h-full p-4 bg-elevated/40 flex flex-col gap-2">
                    <span class="text-xs font-mono font-semibold uppercase text-primary">
                      Inspector (25% - 45%)
                    </span>
                    <div class="text-xs text-muted flex flex-col gap-1">
                      <span>Grid: 8px Fluid</span>
                      <span>Color: Display P3</span>
                    </div>
                  </div>
                ),
              },
              {
                min: "35%",
                content: (
                  <div class="h-full p-4 bg-background/40 flex flex-col gap-2">
                    <span class="text-xs font-mono font-semibold uppercase text-highlighted">
                      Viewport (min 35%)
                    </span>
                    <p class="text-xs text-muted">
                      Dragging handle stops strictly when inspector hits 25% or 45%.
                    </p>
                  </div>
                ),
              },
            ]}
          />
        </div>
      ),
    },
    {
      id: "collapsible-sidebar",
      title: "Collapsible Sidebar to Icon Rail",
      description:
        "Collapses to a 56px icon rail when dragged below limit or when handle is clicked/toggled.",
      render: () => {
        const [collapsed, setCollapsed] = createSignal(false);
        return (
          <div class="h-64 w-full border border-default/60 rounded-xl overflow-hidden bg-card/30">
            <RLSplitter
              defaultValue={["220px", "780px"]}
              panels={[
                {
                  collapsible: true,
                  collapsibleMin: 56,
                  onCollapse: () => setCollapsed(true),
                  onExpand: () => setCollapsed(false),
                  handle: {
                    action: "collapse",
                    children: (state) => (
                      <span class="size-4 flex items-center justify-center text-xs">
                        <RLIcon
                          name={state.collapsed ? "chevron-right" : "chevron-left"}
                          class="size-3 text-muted"
                        />
                      </span>
                    ),
                  },
                  content: (state) => (
                    <div class="h-full p-3 bg-elevated/30 flex flex-col justify-between">
                      <div class="flex flex-col gap-2">
                        <div class="flex items-center gap-2">
                          <span class="size-6 rounded bg-primary/20 text-primary flex items-center justify-center text-xs font-bold">
                            M
                          </span>
                          {!state.collapsed && (
                            <span class="text-xs font-semibold">moraine-app</span>
                          )}
                        </div>
                        {!state.collapsed && (
                          <div class="flex flex-col gap-1 text-xs text-muted mt-2">
                            <span>Repositories</span>
                            <span>Deployments</span>
                            <span>Settings</span>
                          </div>
                        )}
                      </div>
                      <span class="text-[10px] font-mono text-muted">
                        {state.collapsed ? "56px" : `${state.size}px`}
                      </span>
                    </div>
                  ),
                },
                {
                  min: "40%",
                  content: (
                    <div class="h-full p-4 bg-background/50 flex flex-col gap-2">
                      <div class="flex items-center gap-2">
                        <span class="text-xs font-semibold">Project Overview</span>
                        <RLBadge
                          label={collapsed() ? "Collapsed (56px)" : "Expanded"}
                          color={collapsed() ? "warning" : "success"}
                          size="xs"
                        />
                      </div>
                      <p class="text-xs text-muted">
                        Click the separator handle grip or press Enter/Space while focused to toggle
                        collapse.
                      </p>
                    </div>
                  ),
                },
              ]}
            />
          </div>
        );
      },
    },
    {
      id: "multi-column-email",
      title: "Multi-Column Layout",
      description:
        "Three panes coordinated (folder list, message thread, reading pane) with independent constraints.",
      render: () => (
        <div class="h-72 w-full border border-default/60 rounded-xl overflow-hidden bg-card/30">
          <RLSplitter
            defaultValue={["18%", "32%", "50%"]}
            panels={[
              {
                min: "15%",
                max: "25%",
                content: (
                  <div class="h-full p-3 bg-muted/30 flex flex-col gap-1 text-xs">
                    <span class="font-bold text-highlighted mb-1">Mailboxes</span>
                    <span class="text-primary font-medium">Inbox (12)</span>
                    <span class="text-muted">Sent</span>
                    <span class="text-muted">Starred (4)</span>
                    <span class="text-muted">Archive</span>
                  </div>
                ),
              },
              {
                min: "25%",
                max: "45%",
                content: (
                  <div class="h-full p-3 bg-elevated/20 flex flex-col gap-2 text-xs">
                    <span class="font-bold text-highlighted">Messages</span>
                    <div class="p-2 rounded bg-elevated/60 border border-default/40 flex flex-col gap-0.5">
                      <span class="font-medium text-highlighted">Sarah Lin</span>
                      <span class="text-muted text-[11px] truncate">Release candidate audit</span>
                    </div>
                    <div class="p-2 rounded bg-background/40 flex flex-col gap-0.5">
                      <span class="font-medium text-highlighted">GitHub</span>
                      <span class="text-muted text-[11px] truncate">PR #142 merged</span>
                    </div>
                  </div>
                ),
              },
              {
                min: "35%",
                content: (
                  <div class="h-full p-4 bg-background/60 flex flex-col gap-2">
                    <span class="font-semibold text-sm text-highlighted">
                      Moraine 0.5.0 Release Candidate
                    </span>
                    <span class="text-xs text-muted">From: Sarah Lin</span>
                    <p class="text-xs text-muted leading-relaxed mt-2">
                      All test suites and hydration verification checks passed with zero warnings
                      across presets.
                    </p>
                  </div>
                ),
              },
            ]}
          />
        </div>
      ),
    },
    {
      id: "vertical-query-workbench",
      title: "Vertical Query Workbench",
      description:
        "Stack an editor vertically over a query result table with independent vertical dragging.",
      render: () => (
        <div class="h-80 w-full border border-default/60 rounded-xl overflow-hidden bg-card/30">
          <RLSplitter
            orientation="vertical"
            defaultValue={["40%", "60%"]}
            panels={[
              {
                min: "25%",
                content: (
                  <div class="h-full p-3 bg-elevated/40 font-mono text-xs flex flex-col gap-1">
                    <span class="text-primary font-semibold">-- SQL Query Editor</span>
                    <span class="text-muted">SELECT id, name, role FROM team_members;</span>
                  </div>
                ),
              },
              {
                min: "30%",
                content: (
                  <div class="h-full p-3 bg-background/50 flex flex-col gap-2">
                    <span class="text-xs font-semibold text-highlighted">
                      Results (3 rows returned)
                    </span>
                    <div class="text-[11px] font-mono grid grid-cols-3 gap-2 p-2 bg-muted/20 rounded">
                      <span class="text-muted">usr_01</span>
                      <span class="text-highlighted">Alice Chen</span>
                      <span class="text-muted">Maintainer</span>
                    </div>
                  </div>
                ),
              },
            ]}
          />
        </div>
      ),
    },
    {
      id: "nested-ide-workspace",
      title: "Nested Workspace Junction",
      description:
        "Horizontal layout combined with vertical split and corner intersection handle for multi-axis resizing.",
      render: () => (
        <div class="h-72 w-full border border-default/60 rounded-xl overflow-hidden bg-card/30">
          <RLSplitter
            orientation="horizontal"
            defaultValue={["25%", "75%"]}
            intersection={true}
            panels={[
              {
                min: "20%",
                content: (
                  <div class="h-full p-3 bg-muted/30 flex flex-col gap-1 text-xs font-mono">
                    <span class="font-bold text-highlighted mb-1">Explorer</span>
                    <span class="text-primary">src/app.tsx</span>
                    <span class="text-muted">src/theme.ts</span>
                    <span class="text-muted">package.json</span>
                  </div>
                ),
              },
              {
                min: "40%",
                content: (
                  <RLSplitter
                    orientation="vertical"
                    defaultValue={["65%", "35%"]}
                    intersection={true}
                    panels={[
                      {
                        min: "30%",
                        content: (
                          <div class="h-full p-3 bg-background/60 font-mono text-xs">
                            <span class="text-muted">// Code Editor</span>
                            <div class="text-highlighted mt-1">
                              export function Workspace() &#123; ... &#125;
                            </div>
                          </div>
                        ),
                      },
                      {
                        min: "20%",
                        content: (
                          <div class="h-full p-3 bg-slate-950 text-slate-100 font-mono text-[11px]">
                            <span class="text-emerald-400">➜ Local: http://localhost:5173/</span>
                          </div>
                        ),
                      },
                    ]}
                  />
                ),
              },
            ]}
          />
        </div>
      ),
    },
    {
      id: "controlled-state-presets",
      title: "Controlled State & Presets",
      description: "Coordinate layout presets externally using controlled value and onValueChange.",
      render: () => {
        const [split, setSplit] = createSignal<number[]>([280, 520]);
        return (
          <div class="flex flex-col gap-3">
            <div class="flex items-center gap-2">
              <RLButton
                label="Preset 35% / 65%"
                size="xs"
                variant="subtle"
                onClick={() => setSplit([280, 520])}
              />
              <RLButton
                label="Preset 50% / 50%"
                size="xs"
                variant="subtle"
                onClick={() => setSplit([400, 400])}
              />
              <RLButton
                label="Preset 70% / 30%"
                size="xs"
                variant="subtle"
                onClick={() => setSplit([560, 240])}
              />
              <span class="text-xs font-mono text-muted ml-auto">
                Value: [
                {split()
                  .map((s) => `${s}px`)
                  .join(", ")}
                ]
              </span>
            </div>
            <div class="h-60 w-full border border-default/60 rounded-xl overflow-hidden bg-card/30">
              <RLSplitter
                value={split()}
                onValueChange={setSplit}
                panels={[
                  {
                    min: 150,
                    content: (state) => (
                      <div class="h-full p-4 bg-muted/20 flex flex-col justify-between">
                        <span class="text-xs font-semibold">Worker Logs</span>
                        <span class="text-xs font-mono text-muted">{state.size}px</span>
                      </div>
                    ),
                  },
                  {
                    min: 150,
                    content: (state) => (
                      <div class="h-full p-4 bg-background/50 flex flex-col justify-between">
                        <span class="text-xs font-semibold">Telemetry Output</span>
                        <span class="text-xs font-mono text-muted">{state.size}px</span>
                      </div>
                    ),
                  },
                ]}
              />
            </div>
          </div>
        );
      },
    },
  ],
  checklist: [
    { criterion: "Horizontal & vertical orientation splits", status: "pass" },
    { criterion: "Min & max constraint boundary clamping", status: "pass" },
    { criterion: "Collapsible panel to rail with action='collapse'", status: "pass" },
    { criterion: "Controlled value & uncontrolled defaultValue", status: "pass" },
    { criterion: "ARIA separator attributes (role, valuenow, valuemin, valuemax)", status: "pass" },
    { criterion: "Keyboard navigation (Arrow keys, Home, End, Shift+Arrow)", status: "pass" },
    { criterion: "Multi-axis intersection targets", status: "pass" },
    { criterion: "Disabled state & non-resizable panels", status: "pass" },
  ],
};
