import { createSignal, For } from "solid-js";
import type { JSX } from "@solidjs/web";
import { RLEmpty } from "@rimelight/ui/components/empty/RLEmpty.tsx";
import type { ComponentAuditDefinition } from "./types";

const SIZES = ["xs", "sm", "md", "lg", "xl"] as const;
const VARIANTS = ["solid", "outline", "soft", "subtle", "ghost"] as const;

const sampleActions = [
  { label: "Create item", icon: "i-lucide-plus", variant: "solid" as const },
  { label: "Read docs", href: "/docs" },
];

export const EmptySandbox = (): JSX.Element => {
  const [size, setSize] = createSignal<(typeof SIZES)[number]>("md");
  const [variant, setVariant] = createSignal<(typeof VARIANTS)[number]>("outline");
  const [loading, setLoading] = createSignal(false);

  return (
    <div class="flex flex-col gap-4">
      <div class="flex flex-wrap gap-2 text-xs">
        <For each={SIZES}>
          {(s) => (
            <button type="button" onClick={() => setSize(s)}>
              size: {s}
            </button>
          )}
        </For>
        <For each={VARIANTS}>
          {(v) => (
            <button type="button" onClick={() => setVariant(v)}>
              variant: {v}
            </button>
          )}
        </For>
        <button type="button" onClick={() => setLoading((v) => !v)}>
          loading: {String(loading())}
        </button>
      </div>
      <RLEmpty
        icon="inbox"
        title="No items yet"
        description="Items you create will show up here."
        actions={sampleActions}
        size={size()}
        variant={variant()}
        loading={loading()}
      />
    </div>
  );
};

export const emptyAudit: ComponentAuditDefinition = {
  id: "empty",
  name: "Empty",
  category: "Feedback",
  status: "Auditing",
  description:
    "Empty-state panel with icon or avatar, title, description, actions, a loading state, and named slots for each region.",
  importPath: "@rimelight/ui/components/empty/RLEmpty.tsx",
  renderSandbox: () => <EmptySandbox />,
  testScenarios: [
    {
      id: "header-slot",
      title: "headerSlot slot",
      description: "Passes a custom element into the header region.",
      render: () => (
        <RLEmpty headerSlot={<span class="text-xs uppercase">Inbox</span>} title="Nothing here" />
      ),
    },
    {
      id: "leading-slot",
      title: "leadingSlot slot",
      description: "Passes a custom leading element. Overrides icon and avatar.",
      render: () => <RLEmpty leadingSlot={<span class="text-3xl">📭</span>} title="Nothing here" />,
    },
    {
      id: "title-slot",
      title: "titleSlot slot",
      description: "Passes a custom title element in place of the title prop.",
      render: () => (
        <RLEmpty titleSlot={<strong>Custom title node</strong>} description="Description text" />
      ),
    },
    {
      id: "description-slot",
      title: "descriptionSlot slot",
      description: "Passes a custom description element in place of the description prop.",
      render: () => (
        <RLEmpty
          title="No results"
          descriptionSlot={
            <span>
              Try a <em>different</em> search.
            </span>
          }
        />
      ),
    },
    {
      id: "body-slot",
      title: "bodySlot slot",
      description: "Passes content into the body region.",
      render: () => (
        <RLEmpty
          title="Body slot"
          bodySlot={<p class="text-sm">Extra body content below the description.</p>}
        />
      ),
    },
    {
      id: "actions-slot",
      title: "actionsSlot slot",
      description: "Replaces the actions prop with custom action content.",
      render: () => (
        <RLEmpty
          title="Actions slot"
          actionsSlot={
            <button type="button" class="underline">
              Custom action
            </button>
          }
        />
      ),
    },
    {
      id: "footer-slot",
      title: "footerSlot slot",
      description: "Passes content into the footer region.",
      render: () => (
        <RLEmpty title="Footer slot" footerSlot={<span class="text-xs">Footer note</span>} />
      ),
    },
    {
      id: "default-slot",
      title: "Default slot children (body)",
      description: "Children render in the body region.",
      render: () => (
        <RLEmpty title="Children slot">
          <p class="text-sm">Default children passed into the body.</p>
        </RLEmpty>
      ),
    },
    {
      id: "actions-prop",
      title: "actions prop with icon, href, and variant",
      description: "Actions array covering label, icon, href, and a variant override.",
      render: () => <RLEmpty title="Actions" description="Two actions" actions={sampleActions} />,
    },
    {
      id: "variants-and-sizes",
      title: "Variant and size variants",
      description: "Renders each variant value and each size value.",
      render: () => (
        <div class="flex flex-col gap-3">
          <For each={VARIANTS}>
            {(v) => <RLEmpty variant={v} title={`Variant ${v}`} icon="inbox" />}
          </For>
          <For each={SIZES}>{(s) => <RLEmpty size={s} title={`Size ${s}`} icon="inbox" />}</For>
        </div>
      ),
    },
    {
      id: "loading",
      title: "Loading state",
      description: "The loading variant with loadingIcon overriding the default icon.",
      render: () => <RLEmpty title="Loading" loading={true} loadingIcon="i-lucide-loader" />,
    },
  ],
};
