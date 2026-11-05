import { createSignal, For } from "solid-js";
import type { JSX } from "@solidjs/web";
import { RLNavigationMenu } from "@rimelight/ui/components/navigation-menu/RLNavigationMenu.tsx";
import type { NavigationMenuItem } from "@rimelight/ui/components/navigation-menu/navigation-menu.types.ts";
import { AUDIT_COLORS, type ComponentAuditDefinition, type TestScenario } from "./types";

const ITEMS: NavigationMenuItem[] = [
  { label: "Home", href: "/", icon: "house" },
  {
    label: "Products",
    children: [
      { label: "Overview", href: "/products", description: "All products at a glance" },
      { label: "Pricing", href: "/pricing", description: "Plans and billing" },
    ],
  },
  { label: "Docs", href: "/docs", active: true },
];

const GROUPED_ITEMS: NavigationMenuItem[] = [
  {
    label: "Resources",
    children: [
      {
        label: "Learn",
        children: [
          { label: "Guides", href: "/guides", icon: "i-lucide-book-open" },
          { label: "Tutorials", href: "/tutorials" },
        ],
      },
      { label: "Community", href: "/community" },
    ],
  },
];

const PANEL_ITEMS: NavigationMenuItem[] = [
  { label: "Mega", panel: "mega" },
  { label: "Plain", href: "/plain" },
];

const NavigationMenuSandbox = (): JSX.Element => {
  const [orientation, setOrientation] = createSignal<"horizontal" | "vertical">("horizontal");
  const [color, setColor] = createSignal<string>("primary");

  return (
    <div class="flex flex-col gap-6">
      <div class="flex flex-wrap gap-2">
        <button type="button" onClick={() => setOrientation("horizontal")}>
          orientation: horizontal
        </button>
        <button type="button" onClick={() => setOrientation("vertical")}>
          orientation: vertical
        </button>
        <For each={AUDIT_COLORS}>
          {(c) => (
            <button type="button" onClick={() => setColor(c)}>
              color: {c}
            </button>
          )}
        </For>
      </div>
      <RLNavigationMenu items={ITEMS} orientation={orientation()} color={color()} />
    </div>
  );
};

const testScenarios: TestScenario[] = [
  {
    id: "default-slot",
    title: "Default slot (children)",
    description: "Children render alongside the menu items inside the nav root.",
    render: () => (
      <RLNavigationMenu items={[{ label: "Home", href: "/" }]}>
        <span>Extra content</span>
      </RLNavigationMenu>
    ),
  },
  {
    id: "items-links-and-dropdowns",
    title: "items (links, dropdowns, active)",
    description: "Plain links, items with child links (dropdown), and an explicit active flag.",
    render: () => <RLNavigationMenu items={ITEMS} />,
  },
  {
    id: "item-fields",
    title: "Item fields (icon, description, to, localize)",
    description: "icon, description, the to alias for href, and localize on an item.",
    render: () => (
      <RLNavigationMenu
        items={[
          { label: "Alias", to: "/alias", icon: "star", description: "Uses the to alias" },
          { label: "Localized", href: "/about", localize: false },
        ]}
      />
    ),
  },
  {
    id: "grouped-children",
    title: "Grouped children",
    description: "A child with its own children renders as a titled group in the dropdown.",
    render: () => <RLNavigationMenu items={GROUPED_ITEMS} />,
  },
  {
    id: "panels",
    title: "panels (keyed custom panel)",
    description: "An item with panel: a key matching panels renders that renderer as its panel.",
    render: () => (
      <RLNavigationMenu
        items={PANEL_ITEMS}
        panels={{
          mega: () => <div class="p-4">Custom mega panel</div>,
        }}
      />
    ),
  },
  {
    id: "panel-slot",
    title: "panelSlot",
    description: "Fallback panel renderer for items with no matching panels entry.",
    render: () => (
      <RLNavigationMenu
        items={[{ label: "Fallback", children: [{ label: "Child", href: "/child" }] }]}
        panelSlot={({ item }) => <div class="p-4">Panel for {item.label}</div>}
      />
    ),
  },
  {
    id: "item-slot",
    title: "itemSlot",
    description: "Replaces the link or trigger of each item. Receives item, index, and active.",
    render: () => (
      <RLNavigationMenu
        items={ITEMS}
        itemSlot={({ item, active }) => (
          <span data-active={active ? "true" : "false"}>Custom: {item.label}</span>
        )}
      />
    ),
  },
  {
    id: "orientation",
    title: "Every orientation",
    description: "horizontal (default) and vertical.",
    render: () => (
      <div class="flex flex-col gap-6">
        <RLNavigationMenu items={ITEMS} orientation="horizontal" />
        <RLNavigationMenu items={ITEMS} orientation="vertical" />
      </div>
    ),
  },
  {
    id: "colors",
    title: "Color (auto palette)",
    description: "Color is a palette key; default is primary.",
    render: () => (
      <div class="flex flex-col gap-3">
        <For each={AUDIT_COLORS}>{(c) => <RLNavigationMenu items={ITEMS} color={c} />}</For>
      </div>
    ),
  },
];

export const navigationMenuAudit: ComponentAuditDefinition = {
  id: "navigation-menu",
  name: "Navigation Menu",
  category: "Navigation",
  status: "Auditing",
  description:
    "Site navigation with link items, dropdown panels, and custom item and panel renderers.",
  importPath: "@rimelight/ui/components/navigation-menu/RLNavigationMenu.tsx",
  renderSandbox: () => <NavigationMenuSandbox />,
  testScenarios,
};
