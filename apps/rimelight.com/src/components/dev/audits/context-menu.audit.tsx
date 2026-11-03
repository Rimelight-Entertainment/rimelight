import { createSignal, For } from "solid-js";
import type { JSX } from "@solidjs/web";
import { RLContextMenu } from "@rimelight/ui/components/context-menu/RLContextMenu.tsx";
import { RLIcon } from "@rimelight/ui/components/icon/RLIcon.tsx";
import { RLBadge } from "@rimelight/ui/components/badge/RLBadge.tsx";
import type { ComponentAuditDefinition, TestScenario } from "./types";
import type { ContextMenuItems } from "@rimelight/ui/components/context-menu/context-menu.types.ts";

const SIZES = ["sm", "md", "lg"] as const;
const PLACEMENTS = ["right", "left", "bottom", "top"] as const;
const ALIGNS = ["start", "center", "end"] as const;

export const ContextMenuSandbox = (): JSX.Element => {
  const [size, setSize] = createSignal<(typeof SIZES)[number]>("md");
  const [placement, setPlacement] = createSignal<(typeof PLACEMENTS)[number]>("right");
  const [align, setAlign] = createSignal<(typeof ALIGNS)[number]>("start");
  const [disabled, setDisabled] = createSignal(false);
  const [lastAction, setLastAction] = createSignal<string>("None");
  const [showHidden, setShowHidden] = createSignal(false);
  const [compactMode, setCompactMode] = createSignal(true);
  const [sortBy, setSortBy] = createSignal("name");

  const menuItems = (): ContextMenuItems => [
    {
      label: "Cut",
      icon: "scissors",
      kbds: ["Ctrl", "X"],
      onSelect: () => setLastAction("Cut"),
    },
    {
      label: "Copy",
      icon: "copy",
      kbds: ["Ctrl", "C"],
      onSelect: () => setLastAction("Copy"),
    },
    {
      label: "Paste",
      icon: "clipboard",
      kbds: ["Ctrl", "V"],
      onSelect: () => setLastAction("Paste"),
    },
    { type: "separator" },
    {
      label: "Sort by",
      icon: "arrow-up-down",
      children: [
        {
          type: "radio",
          label: "Name",
          value: "name",
          group: "sort",
          checked: sortBy() === "name",
          onSelect: () => {
            setSortBy("name");
            setLastAction("Sort: Name");
          },
        },
        {
          type: "radio",
          label: "Date modified",
          value: "date",
          group: "sort",
          checked: sortBy() === "date",
          onSelect: () => {
            setSortBy("date");
            setLastAction("Sort: Date");
          },
        },
        {
          type: "radio",
          label: "Size",
          value: "size",
          group: "sort",
          checked: sortBy() === "size",
          onSelect: () => {
            setSortBy("size");
            setLastAction("Sort: Size");
          },
        },
      ],
    },
    { type: "separator" },
    {
      type: "checkbox",
      label: "Show hidden files",
      checked: showHidden(),
      onCheckedChange: (checked) => {
        setShowHidden(checked);
        setLastAction(`Hidden files: ${checked ? "Shown" : "Hidden"}`);
      },
    },
    {
      type: "checkbox",
      label: "Compact view",
      checked: compactMode(),
      onCheckedChange: (checked) => {
        setCompactMode(checked);
        setLastAction(`Compact view: ${checked ? "On" : "Off"}`);
      },
    },
    { type: "separator" },
    {
      label: "Delete",
      icon: "trash",
      color: "error",
      kbds: ["Del"],
      onSelect: () => setLastAction("Delete"),
    },
  ];

  return (
    <div class="flex flex-col gap-6">
      {/* Controls */}
      <div class="p-4 rounded-xl border border-default bg-elevated/20 flex flex-wrap items-center gap-4 text-xs">
        <div class="flex items-center gap-1.5 flex-wrap">
          <span class="text-muted mr-1">Size:</span>
          <For each={SIZES}>
            {(s) => (
              <button
                type="button"
                onClick={() => setSize(s)}
                class={`px-2 py-0.5 rounded text-xs font-mono transition-colors ${
                  size() === s
                    ? "bg-primary text-inverted font-bold"
                    : "bg-elevated text-muted hover:text-highlighted border border-default"
                }`}
              >
                {s}
              </button>
            )}
          </For>
        </div>

        <div class="flex items-center gap-1.5 flex-wrap">
          <span class="text-muted mr-1">Placement:</span>
          <For each={PLACEMENTS}>
            {(p) => (
              <button
                type="button"
                onClick={() => setPlacement(p)}
                class={`px-2 py-0.5 rounded text-xs font-mono transition-colors ${
                  placement() === p
                    ? "bg-primary text-inverted font-bold"
                    : "bg-elevated text-muted hover:text-highlighted border border-default"
                }`}
              >
                {p}
              </button>
            )}
          </For>
        </div>

        <div class="flex items-center gap-1.5 flex-wrap">
          <span class="text-muted mr-1">Align:</span>
          <For each={ALIGNS}>
            {(a) => (
              <button
                type="button"
                onClick={() => setAlign(a)}
                class={`px-2 py-0.5 rounded text-xs font-mono transition-colors ${
                  align() === a
                    ? "bg-primary text-inverted font-bold"
                    : "bg-elevated text-muted hover:text-highlighted border border-default"
                }`}
              >
                {a}
              </button>
            )}
          </For>
        </div>

        <div class="flex items-center gap-3">
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
        </div>

        <div class="ml-auto flex items-center gap-2">
          <span class="text-muted">Last Action:</span>
          <RLBadge variant="subtle" color="primary">
            {lastAction()}
          </RLBadge>
        </div>
      </div>

      {/* Interactive Trigger Surface */}
      <RLContextMenu
        items={menuItems()}
        size={size()}
        placement={placement()}
        align={align()}
        disabled={disabled()}
      >
        <div class="h-64 border-2 border-dashed border-default hover:border-primary/50 transition-colors rounded-2xl flex flex-col items-center justify-center gap-3 select-none bg-surface/50 p-6 text-center">
          <div class="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center">
            <RLIcon name="mouse-pointer-click" class="w-6 h-6" />
          </div>
          <div>
            <p class="font-medium text-highlighted text-sm">
              Right-Click or Long-Press Inside Here
            </p>
            <p class="text-xs text-muted mt-1 max-w-sm">
              Activates the single-component context menu with action items, submenus, checkboxes,
              and keyboard accessibility.
            </p>
          </div>
          <div class="flex items-center gap-2 text-2xs text-muted font-mono mt-1">
            <kbd class="px-1.5 py-0.5 rounded bg-elevated border border-default">Right Click</kbd>
            <span>or</span>
            <kbd class="px-1.5 py-0.5 rounded bg-elevated border border-default">Shift + F10</kbd>
            <span>or</span>
            <kbd class="px-1.5 py-0.5 rounded bg-elevated border border-default">Touch & Hold</kbd>
          </div>
        </div>
      </RLContextMenu>
    </div>
  );
};

const testScenarios: TestScenario[] = [
  {
    id: "file-card-actions",
    title: "File Card Context Actions",
    description: "Attaching context menu to distinct cards with custom actions.",
    render: () => {
      const [status, setStatus] = createSignal<string>("Idle");
      return (
        <div class="flex flex-col gap-3">
          <div class="text-xs text-muted flex items-center gap-2">
            <span>Status:</span>
            <RLBadge variant="outline" color="neutral">
              {status()}
            </RLBadge>
          </div>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <RLContextMenu
              items={[
                {
                  label: "Open in Editor",
                  icon: "code",
                  onSelect: () => setStatus("Opening document.tsx"),
                },
                {
                  label: "Download",
                  icon: "download",
                  onSelect: () => setStatus("Downloading document.tsx"),
                },
                { type: "separator" },
                {
                  label: "Delete File",
                  icon: "trash",
                  color: "error",
                  onSelect: () => setStatus("Deleted document.tsx"),
                },
              ]}
            >
              <div class="p-4 rounded-xl border border-default bg-surface hover:bg-elevated/40 transition-colors cursor-context-menu flex items-center gap-3">
                <RLIcon name="file-code" class="w-8 h-8 text-primary" />
                <div class="flex-1 min-w-0">
                  <div class="font-medium text-sm truncate">document.tsx</div>
                  <div class="text-xs text-muted">2.4 KB &bull; TypeScript</div>
                </div>
              </div>
            </RLContextMenu>

            <RLContextMenu
              items={[
                {
                  label: "Preview Image",
                  icon: "eye",
                  onSelect: () => setStatus("Previewing banner.png"),
                },
                {
                  label: "Copy Image URL",
                  icon: "link",
                  onSelect: () => setStatus("URL copied"),
                },
                { type: "separator" },
                {
                  label: "Move to Trash",
                  icon: "trash",
                  color: "error",
                  onSelect: () => setStatus("Moved banner.png to trash"),
                },
              ]}
            >
              <div class="p-4 rounded-xl border border-default bg-surface hover:bg-elevated/40 transition-colors cursor-context-menu flex items-center gap-3">
                <RLIcon name="image" class="w-8 h-8 text-secondary" />
                <div class="flex-1 min-w-0">
                  <div class="font-medium text-sm truncate">banner.png</div>
                  <div class="text-xs text-muted">380 KB &bull; PNG Image</div>
                </div>
              </div>
            </RLContextMenu>
          </div>
        </div>
      );
    },
  },
  {
    id: "nested-submenus",
    title: "Multi-level Nested Submenus",
    description: "Deep submenu hierarchies with grouped items and shortcuts.",
    render: () => {
      const [selectedTheme, setSelectedTheme] = createSignal("dark");
      return (
        <RLContextMenu
          items={[
            {
              label: "Preferences",
              icon: "settings",
              children: [
                {
                  label: "Appearance",
                  icon: "palette",
                  children: [
                    {
                      type: "radio",
                      label: "Light Theme",
                      value: "light",
                      group: "theme",
                      checked: selectedTheme() === "light",
                      onSelect: () => setSelectedTheme("light"),
                    },
                    {
                      type: "radio",
                      label: "Dark Theme",
                      value: "dark",
                      group: "theme",
                      checked: selectedTheme() === "dark",
                      onSelect: () => setSelectedTheme("dark"),
                    },
                    {
                      type: "radio",
                      label: "System Match",
                      value: "system",
                      group: "theme",
                      checked: selectedTheme() === "system",
                      onSelect: () => setSelectedTheme("system"),
                    },
                  ],
                },
                {
                  label: "Language",
                  icon: "globe",
                  children: [
                    { label: "English", onSelect: () => {} },
                    { label: "Spanish", onSelect: () => {} },
                    { label: "Japanese", onSelect: () => {} },
                  ],
                },
              ],
            },
            { type: "separator" },
            {
              label: "Quick Reload",
              icon: "rotate-cw",
              kbds: ["Ctrl", "R"],
              onSelect: () => {},
            },
          ]}
        >
          <div class="p-6 rounded-xl border border-default bg-elevated/10 text-center cursor-context-menu">
            <span class="text-xs text-muted font-mono">
              Right-click here to test nested submenus (Current Theme: {selectedTheme()})
            </span>
          </div>
        </RLContextMenu>
      );
    },
  },
  {
    id: "custom-slots",
    title: "Top and Bottom Render Slots",
    description:
      "Custom user profile header and quick upgrade footer rendered inside menu content.",
    render: () => (
      <RLContextMenu
        topSlot={({ closeMenu }) => (
          <div class="p-3 border-b border-default bg-elevated/20 flex items-center justify-between gap-3">
            <div class="flex items-center gap-2">
              <div class="w-6 h-6 rounded-full bg-primary text-inverted text-xs font-bold flex items-center justify-center">
                JD
              </div>
              <div class="text-xs font-semibold">Jane Doe</div>
            </div>
            <button
              type="button"
              onClick={closeMenu}
              class="text-muted hover:text-highlighted text-xs"
            >
              &times;
            </button>
          </div>
        )}
        bottomSlot={({ closeMenu }) => (
          <div class="p-2 border-t border-default bg-surface">
            <button
              type="button"
              onClick={closeMenu}
              class="w-full text-center py-1 text-2xs font-semibold text-primary hover:underline"
            >
              Upgrade to Pro &rarr;
            </button>
          </div>
        )}
        items={[
          { label: "Account Settings", icon: "user" },
          { label: "Billing & Plans", icon: "credit-card" },
          { type: "separator" },
          { label: "Log Out", icon: "log-out", color: "error" },
        ]}
      >
        <div class="p-6 rounded-xl border border-default bg-elevated/10 text-center cursor-context-menu">
          <span class="text-xs text-muted font-mono">
            Right-click for contextual menu with top and bottom custom slots
          </span>
        </div>
      </RLContextMenu>
    ),
  },
];

export const contextMenuAudit: ComponentAuditDefinition = {
  id: "context-menu",
  name: "RLContextMenu",
  category: "Overlay & Dialog",
  status: "Passed",
  description:
    "Right-click and long-press context menu supporting grouped items, nested submenus, checkboxes, radios, keyboard navigation, and custom header/footer slots.",
  importPath: "@rimelight/ui/components/context-menu/RLContextMenu.tsx",
  renderSandbox: () => <ContextMenuSandbox />,
  testScenarios,
  checklist: [
    {
      criterion: "Single component API (no compound dot-components)",
      status: "pass",
      notes: "Clean <RLContextMenu items={...}>{trigger}</RLContextMenu> structure.",
    },
    {
      criterion: "Keyboard accessibility & arrow navigation",
      status: "pass",
      notes: "Full ArrowUp, ArrowDown, ArrowRight (submenus), ArrowLeft, Enter, Space, Escape.",
    },
    {
      criterion: "Mouse & touch gestures",
      status: "pass",
      notes: "Native contextmenu event + touch long-press (configurable delay).",
    },
    {
      criterion: "Submenu nesting & radio/checkbox states",
      status: "pass",
      notes: "Supports recursive menus, controlled & uncontrolled selection.",
    },
    {
      criterion: "WAI-ARIA roles & states",
      status: "pass",
      notes: "Compliant menu, menuitem, menuitemcheckbox, menuitemradio, and aria-expanded.",
    },
  ],
};
