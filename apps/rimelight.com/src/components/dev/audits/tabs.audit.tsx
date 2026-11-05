import { createSignal, For } from "solid-js";
import type { JSX } from "@solidjs/web";
import { RLTabs } from "@rimelight/ui/components/tabs/RLTabs.tsx";
import type { ComponentAuditDefinition } from "./types";

const VARIANTS = ["solid", "link"] as const;
const ORIENTATIONS = ["horizontal", "vertical"] as const;
const SIZES = ["xs", "sm", "md", "lg", "xl"] as const;

const ITEMS = [
  { label: "Overview", value: "overview", content: "Overview panel content." },
  {
    label: "Settings",
    value: "settings",
    icon: "i-lucide-settings",
    content: "Settings panel content.",
  },
  { label: "Inbox", value: "inbox", badge: 12, content: "Inbox panel content." },
  { label: "Archived", value: "archived", disabled: true, content: "Archived panel content." },
];

const MANY_ITEMS = Array.from({ length: 8 }, (_, i) => ({
  label: `Tab ${i + 1}`,
  value: `tab-${i + 1}`,
  content: `Panel ${i + 1}`,
}));

const TabsSandbox = (): JSX.Element => {
  const [variant, setVariant] = createSignal<(typeof VARIANTS)[number]>("solid");
  const [orientation, setOrientation] = createSignal<(typeof ORIENTATIONS)[number]>("horizontal");
  const [size, setSize] = createSignal<(typeof SIZES)[number]>("md");
  const [value, setValue] = createSignal("overview");
  const [showContent, setShowContent] = createSignal(true);

  return (
    <div class="flex flex-col gap-6">
      {/* Control Toolbar */}
      <div class="p-4 rounded-xl border border-default bg-elevated/20 flex flex-wrap items-center gap-4 text-xs">
        <div class="flex items-center gap-2">
          <span class="text-muted font-medium">Variant:</span>
          <For each={VARIANTS}>
            {(v) => (
              <button
                type="button"
                class={`px-2 py-1 rounded border ${variant() === v ? "border-primary bg-primary/10 text-primary" : "border-default text-muted"}`}
                onClick={() => setVariant(v)}
              >
                {v}
              </button>
            )}
          </For>
        </div>
        <div class="flex items-center gap-2">
          <span class="text-muted font-medium">Orientation:</span>
          <For each={ORIENTATIONS}>
            {(o) => (
              <button
                type="button"
                class={`px-2 py-1 rounded border ${orientation() === o ? "border-primary bg-primary/10 text-primary" : "border-default text-muted"}`}
                onClick={() => setOrientation(o)}
              >
                {o}
              </button>
            )}
          </For>
        </div>
        <div class="flex items-center gap-2">
          <span class="text-muted font-medium">Size:</span>
          <For each={SIZES}>
            {(s) => (
              <button
                type="button"
                class={`px-2 py-1 rounded border ${size() === s ? "border-primary bg-primary/10 text-primary" : "border-default text-muted"}`}
                onClick={() => setSize(s)}
              >
                {s}
              </button>
            )}
          </For>
        </div>
        <div class="flex items-center gap-2">
          <button
            type="button"
            class="px-2 py-1 rounded border border-default text-muted"
            onClick={() => setShowContent(!showContent())}
          >
            {showContent() ? "content: on" : "content: off"}
          </button>
        </div>
      </div>

      {/* Preview Area */}
      <div class="p-8 rounded-xl border border-default bg-elevated/10">
        <RLTabs
          variant={variant()}
          orientation={orientation()}
          size={size()}
          items={ITEMS}
          value={value()}
          onValueChange={setValue}
          body={showContent()}
        />
      </div>
    </div>
  );
};

export const tabsAudit: ComponentAuditDefinition = {
  id: "tabs",
  name: "Tabs",
  category: "Navigation",
  status: "Auditing",
  description:
    "Accessible tab list with solid and link variants, horizontal and vertical orientation, a sliding active indicator, icons, badges, disabled tabs, an overflow menu via maxTabs, and optional panel rendering.",
  importPath: "@rimelight/ui/components/tabs/RLTabs.tsx",
  renderSandbox: () => <TabsSandbox />,
  testScenarios: [
    {
      id: "variants",
      title: "Variants",
      description: "Solid and link variants side by side.",
      render: () => (
        <div class="flex flex-col gap-8">
          <RLTabs variant="solid" items={ITEMS} body={false} />
          <RLTabs variant="link" items={ITEMS} body={false} />
        </div>
      ),
    },
    {
      id: "sizes",
      title: "Sizes",
      description: "Every size from xs to xl.",
      render: () => (
        <div class="flex flex-col gap-6">
          <For each={SIZES}>{(s) => <RLTabs size={s} items={ITEMS} body={false} />}</For>
        </div>
      ),
    },
    {
      id: "orientation",
      title: "Vertical orientation",
      description: "Tabs laid out along a vertical axis with their panels beside them.",
      render: () => <RLTabs orientation="vertical" items={ITEMS.slice(0, 3)} />,
    },
    {
      id: "icons-badges-disabled",
      title: "Icons, badges, and disabled tabs",
      description: "Leading icons, trailing badges, and a disabled tab that cannot be selected.",
      render: () => <RLTabs items={ITEMS} />,
    },
    {
      id: "max-tabs-overflow",
      title: "maxTabs overflow",
      description:
        "Only the first two tabs render in the list; the rest open from a '+N more' button.",
      render: () => <RLTabs items={MANY_ITEMS} maxTabs={2} />,
    },
    {
      id: "tab-bar-only",
      title: "Tab bar without panels",
      description: "content={false} renders the tab list alone.",
      render: () => <RLTabs items={ITEMS} body={false} />,
    },
    {
      id: "keep-panels-mounted",
      title: "Inactive panels kept mounted",
      description: "unmountOnHide={false} keeps inactive panels in the DOM, hidden.",
      render: () => <RLTabs items={ITEMS.slice(0, 2)} unmountOnHide={false} />,
    },
    {
      id: "children-body",
      title: "Children replace the item panels",
      description: "Children passed to RLTabs render in place of the per-item content panels.",
      render: () => (
        <RLTabs items={ITEMS.slice(0, 2)}>
          <div class="p-4 text-sm text-muted">Custom body supplied as children.</div>
        </RLTabs>
      ),
    },
  ],
};
