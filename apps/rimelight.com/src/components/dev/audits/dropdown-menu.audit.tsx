import { createSignal, Show } from "solid-js";
import type { JSX } from "@solidjs/web";
import { RLDropdownMenu } from "@rimelight/ui/components/dropdown-menu/RLDropdownMenu.tsx";
import type { ComponentAuditDefinition } from "./types";

const SIZES = ["xs", "sm", "md", "lg", "xl"] as const;
const ALIGNS = ["start", "center", "end"] as const;
const SIDES = ["top", "right", "bottom", "left"] as const;

const groupedItems = [
  [
    { label: "Profile", icon: "user", shortcut: "⌘P", onSelect: () => {} },
    { label: "Settings", icon: "lucide:settings", kbds: ["⌘", ","], onSelect: () => {} },
  ],
  [
    { type: "label" as const, label: "Workspace" },
    { type: "checkbox" as const, label: "Show hidden", checked: true, onCheckedChange: () => {} },
    { type: "separator" as const },
    { type: "link" as const, label: "Documentation", href: "/docs", target: "_blank" },
    { label: "Delete", color: "error", disabled: false, onSelect: () => {} },
  ],
];

const avatarItems = [
  {
    label: "Ada Lovelace",
    avatar: { src: "https://i.pravatar.cc/64", alt: "Ada" },
    onSelect: () => {},
  },
  { label: "Disabled item", disabled: true, onSelect: () => {} },
];

export const DropdownMenuSandbox = (): JSX.Element => {
  const [size, setSize] = createSignal<(typeof SIZES)[number]>("md");
  const [align, setAlign] = createSignal<(typeof ALIGNS)[number]>("start");
  const [side, setSide] = createSignal<(typeof SIDES)[number]>("bottom");
  const [disabled, setDisabled] = createSignal(false);
  const [lastOpen, setLastOpen] = createSignal("closed");

  return (
    <div class="flex flex-col gap-4">
      <div class="flex flex-wrap gap-2 text-xs">
        {SIZES.map((s) => (
          <button type="button" onClick={() => setSize(s)}>
            size: {s}
          </button>
        ))}
        {ALIGNS.map((a) => (
          <button type="button" onClick={() => setAlign(a)}>
            align: {a}
          </button>
        ))}
        {SIDES.map((s) => (
          <button type="button" onClick={() => setSide(s)}>
            side: {s}
          </button>
        ))}
        <button type="button" onClick={() => setDisabled((v) => !v)}>
          disabled: {String(disabled())}
        </button>
        <span>last change: {lastOpen()}</span>
      </div>
      <RLDropdownMenu
        label="Actions"
        items={groupedItems}
        size={size()}
        disabled={disabled()}
        body={{ align: align(), side: side(), sideOffset: 8 }}
        aria-label="Actions menu"
        onOpenChange={(open) => setLastOpen(open ? "open" : "closed")}
      />
    </div>
  );
};

export const dropdownMenuAudit: ComponentAuditDefinition = {
  id: "dropdown-menu",
  name: "Dropdown Menu",
  category: "Overlay & Dialog",
  status: "Auditing",
  description:
    "A menu of actions opened from a trigger, with grouped items, labels, separators, checkboxes, links, avatars, shortcuts, and a configurable position.",
  importPath: "@rimelight/ui/components/dropdown-menu/RLDropdownMenu.tsx",
  renderSandbox: () => <DropdownMenuSandbox />,
  testScenarios: [
    {
      id: "trigger-slot",
      title: "triggerSlot slot",
      description:
        "triggerSlot takes precedence over children as the trigger content. Passes a custom trigger element.",
      render: () => (
        <RLDropdownMenu
          items={groupedItems}
          aria-label="Custom trigger menu"
          triggerSlot={
            <span class="rounded-md border border-default px-3 py-1">Open with slot</span>
          }
        />
      ),
    },
    {
      id: "default-slot",
      title: "Default slot children (trigger)",
      description:
        "The default children slot is the trigger content when triggerSlot is not set. Passes plain text.",
      render: () => (
        <RLDropdownMenu items={groupedItems} aria-label="Children trigger menu">
          Open with children
        </RLDropdownMenu>
      ),
    },
    {
      id: "label-trigger",
      title: "Label prop trigger",
      description: "Uses the label prop with an icon on the trigger.",
      render: () => (
        <RLDropdownMenu
          label="Options"
          icon="lucide:ellipsis"
          hasArrow
          items={groupedItems}
          aria-label="Options"
        />
      ),
    },
    {
      id: "icon-only",
      title: "Icon-only trigger",
      description:
        "No label, no children, and no triggerSlot: the trigger renders as an icon button.",
      render: () => (
        <RLDropdownMenu icon="lucide:ellipsis" items={groupedItems} aria-label="More actions" />
      ),
    },
    {
      id: "item-types",
      title: "Item types and groups",
      description:
        "Grouped items covering item, label, checkbox, separator, link, color, and shortcut/kbds rendering.",
      render: () => (
        <RLDropdownMenu label="Groups" items={groupedItems} aria-label="Grouped menu" />
      ),
    },
    {
      id: "avatar-items",
      title: "Avatar and disabled items",
      description: "An item with an avatar and an item disabled.",
      render: () => <RLDropdownMenu label="People" items={avatarItems} aria-label="People menu" />,
    },
    {
      id: "sizes",
      title: "Size variants",
      description: "Renders the trigger at each size variant xs through xl.",
      render: () => (
        <div class="flex flex-wrap items-center gap-2">
          {SIZES.map((s) => (
            <RLDropdownMenu label={s} size={s} items={groupedItems} aria-label={`Size ${s}`} />
          ))}
        </div>
      ),
    },
    {
      id: "open-controlled",
      title: "Controlled open state",
      description: "Open prop set to true with an onOpenChange handler.",
      render: () => (
        <Show when={true}>
          <RLDropdownMenu
            label="Controlled"
            open={true}
            items={groupedItems}
            aria-label="Controlled menu"
            onOpenChange={() => {}}
          />
        </Show>
      ),
    },
  ],
};
