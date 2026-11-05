import { createSignal, For, Show } from "solid-js";
import type { JSX } from "@solidjs/web";
import { RLSidebar } from "@rimelight/ui/components/sidebar/RLSidebar.tsx";
import type { SidebarItem } from "@rimelight/ui/components/sidebar/sidebar.types.ts";
import { RLButton } from "@rimelight/ui/components/button/RLButton.tsx";
import type { ComponentAuditDefinition } from "./types";

const COLLAPSIBLE = ["none", "icon", "offcanvas"] as const;
const SIDES = ["left", "right"] as const;
const LAYOUTS = ["sidebar", "floating", "inset"] as const;

const NAV: SidebarItem[] = [
  { label: "Overview", href: "#overview", icon: "layers", active: true },
  {
    label: "Guides",
    icon: "lucide:compass",
    badge: "New",
    children: [
      { label: "Install", href: "#install" },
      { label: "Theme", href: "#theme" },
    ],
  },
  {
    label: "Components",
    icon: "lucide:blocks",
    children: [
      { label: "Button", href: "#button", icon: "lucide:square" },
      { label: "Modal", href: "#modal", icon: "lucide:square-stack", badge: "Beta" },
    ],
  },
  { label: "Settings", href: "#settings", icon: "lucide:settings" },
];

export const SidebarSandbox = (): JSX.Element => {
  const [collapsible, setCollapsible] = createSignal<(typeof COLLAPSIBLE)[number]>("none");
  const [side, setSide] = createSignal<(typeof SIDES)[number]>("left");
  const [layout, setLayout] = createSignal<(typeof LAYOUTS)[number]>("sidebar");
  const [withLogo, setWithLogo] = createSignal(true);
  const [withFooter, setWithFooter] = createSignal(true);

  return (
    <div class="flex flex-col gap-6">
      <div class="p-4 rounded-xl border border-default bg-elevated/20 flex flex-wrap items-center gap-4 text-xs">
        <div class="flex items-center gap-1.5 flex-wrap">
          <span class="text-muted mr-1">collapsible</span>
          <For each={COLLAPSIBLE}>
            {(c) => (
              <button
                type="button"
                onClick={() => setCollapsible(c)}
                class={`px-2 py-0.5 rounded text-xs font-mono transition-colors ${
                  collapsible() === c
                    ? "bg-primary text-inverted font-bold"
                    : "bg-elevated text-muted hover:text-highlighted border border-default"
                }`}
              >
                {c}
              </button>
            )}
          </For>
        </div>
        <div class="flex items-center gap-1.5 flex-wrap">
          <span class="text-muted mr-1">side</span>
          <For each={SIDES}>
            {(s) => (
              <button
                type="button"
                onClick={() => setSide(s)}
                class={`px-2 py-0.5 rounded text-xs font-mono transition-colors ${
                  side() === s
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
          <span class="text-muted mr-1">layout</span>
          <For each={LAYOUTS}>
            {(l) => (
              <button
                type="button"
                onClick={() => setLayout(l)}
                class={`px-2 py-0.5 rounded text-xs font-mono transition-colors ${
                  layout() === l
                    ? "bg-primary text-inverted font-bold"
                    : "bg-elevated text-muted hover:text-highlighted border border-default"
                }`}
              >
                {l}
              </button>
            )}
          </For>
        </div>
        <label class="flex items-center gap-1.5 cursor-pointer">
          <input
            type="checkbox"
            checked={withLogo()}
            onChange={(e) => setWithLogo(e.currentTarget.checked)}
            class="rounded border-default"
          />
          <span class="text-muted">logo</span>
        </label>
        <label class="flex items-center gap-1.5 cursor-pointer">
          <input
            type="checkbox"
            checked={withFooter()}
            onChange={(e) => setWithFooter(e.currentTarget.checked)}
            class="rounded border-default"
          />
          <span class="text-muted">footerSlot</span>
        </label>
      </div>

      <div class="relative h-[32rem] overflow-hidden rounded-xl border border-default">
        <RLSidebar
          items={NAV}
          collapsible={collapsible()}
          side={side()}
          layout={layout()}
          logo={withLogo() ? "Rimelight" : undefined}
          footerSlot={
            <Show when={withFooter()}>
              <RLButton variant="outline" size="sm">
                Sign out
              </RLButton>
            </Show>
          }
        />
      </div>
    </div>
  );
};

export const sidebarAudit: ComponentAuditDefinition = {
  id: "sidebar",
  name: "Sidebar",
  category: "Navigation",
  status: "Auditing",
  description:
    "A vertical navigation panel with nested items, active state, badges, icons, a logo, and collapsible modes.",
  importPath: "@rimelight/ui/components/sidebar/RLSidebar.tsx",
  renderSandbox: () => <SidebarSandbox />,
  testScenarios: [
    {
      id: "nested-items",
      title: "Nested items",
      description: "Top-level items with children render as expandable details groups.",
      render: () => <RLSidebar class="h-96 rounded-xl border border-default" items={NAV} />,
    },
    {
      id: "active-state",
      title: "Active state",
      description: "A leaf marked active and a parent containing an active child both show active.",
      render: () => (
        <RLSidebar
          class="h-96 rounded-xl border border-default"
          items={[
            { label: "Overview", href: "#o", active: true },
            {
              label: "Guides",
              children: [
                { label: "Install", href: "#i" },
                { label: "Theme", href: "#t", active: true },
              ],
            },
          ]}
        />
      ),
    },
    {
      id: "badges",
      title: "Badges",
      description: "Badge as a string and as an object with color and variant.",
      render: () => (
        <RLSidebar
          class="h-96 rounded-xl border border-default"
          items={[
            { label: "Inbox", href: "#inbox", badge: "12" },
            {
              label: "Alerts",
              href: "#alerts",
              badge: { label: "Critical", color: "error", variant: "solid" },
            },
            {
              label: "Drafts",
              children: [{ label: "Pending", href: "#p", badge: { label: "3", color: "warning" } }],
            },
          ]}
        />
      ),
    },
    {
      id: "icons",
      title: "Icons",
      description: "Built-in names (Lucide) and set:name icons on top-level and nested items.",
      render: () => (
        <RLSidebar
          class="h-96 rounded-xl border border-default"
          items={[
            { label: "Home", href: "#home", icon: "house" },
            {
              label: "Files",
              icon: "lucide:folder",
              children: [{ label: "Docs", href: "#docs", icon: "lucide:file-text" }],
            },
          ]}
        />
      ),
    },
    {
      id: "logo",
      title: "Logo",
      description: "Header logo text shown when no headerSlot is given.",
      render: () => (
        <RLSidebar class="h-96 rounded-xl border border-default" logo="Rimelight" items={NAV} />
      ),
    },
    {
      id: "header-slot",
      title: "headerSlot",
      description: "Custom header content replaces the logo.",
      render: () => (
        <RLSidebar
          class="h-96 rounded-xl border border-default"
          logo="Ignored"
          headerSlot={<span class="font-semibold text-highlighted">Acme Workspace</span>}
          items={NAV}
        />
      ),
    },
    {
      id: "footer-slot",
      title: "footerSlot",
      description: "Custom footer content rendered beneath the items.",
      render: () => (
        <RLSidebar
          class="h-96 rounded-xl border border-default"
          logo="Rimelight"
          footerSlot={
            <RLButton variant="outline" size="sm">
              Sign out
            </RLButton>
          }
          items={NAV}
        />
      ),
    },
    {
      id: "children-slot",
      title: "children (default slot)",
      description: "Children replace the generated item list in the content area.",
      render: () => (
        <RLSidebar class="h-96 rounded-xl border border-default" logo="Rimelight">
          <nav class="flex flex-col gap-1 text-sm">
            <a href="#custom-a" class="rounded-md px-3 py-2 text-muted hover:text-highlighted">
              Custom link A
            </a>
            <a href="#custom-b" class="rounded-md px-3 py-2 text-muted hover:text-highlighted">
              Custom link B
            </a>
          </nav>
        </RLSidebar>
      ),
    },
    {
      id: "collapsible-none",
      title: "collapsible: none",
      description: "Always expanded; no toggle is rendered.",
      render: () => (
        <RLSidebar class="h-96 rounded-xl border border-default" collapsible="none" items={NAV} />
      ),
    },
    {
      id: "collapsible-icon",
      title: "collapsible: icon",
      description: "Narrow icon rail: labels, badges, and logo are hidden.",
      render: () => (
        <RLSidebar
          class="h-96 rounded-xl border border-default"
          collapsible="icon"
          logo="Rimelight"
          items={NAV}
        />
      ),
    },
    {
      id: "collapsible-offcanvas",
      title: "collapsible: offcanvas",
      description: "Hidden off-screen; the toggle button opens and closes it.",
      render: () => (
        <div class="h-96 relative">
          <RLSidebar class="h-96" collapsible="offcanvas" logo="Rimelight" items={NAV} />
        </div>
      ),
    },
    {
      id: "side-right",
      title: "side: right",
      description: "Attaches to the right edge.",
      render: () => (
        <RLSidebar
          class="h-96 rounded-xl border border-default ml-auto"
          side="right"
          logo="Rimelight"
          items={NAV}
        />
      ),
    },
    {
      id: "layout-floating",
      title: "layout: floating",
      description: "Inset card with rounded corners and a shadow.",
      render: () => <RLSidebar class="h-96" layout="floating" logo="Rimelight" items={NAV} />,
    },
    {
      id: "layout-inset",
      title: "layout: inset",
      description: "Muted inset surface without a border.",
      render: () => (
        <RLSidebar class="h-96 rounded-xl" layout="inset" logo="Rimelight" items={NAV} />
      ),
    },
    {
      id: "empty",
      title: "Empty items",
      description: "No items and no logo renders an empty panel.",
      render: () => <RLSidebar class="h-96 rounded-xl border border-default" />,
    },
  ],
};
