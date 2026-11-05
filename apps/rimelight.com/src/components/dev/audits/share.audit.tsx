import { createSignal, For } from "solid-js";
import type { JSX } from "@solidjs/web";
import { RLShare } from "@rimelight/ui/components/share/RLShare.tsx";
import { AUDIT_COLORS, type ComponentAuditDefinition } from "./types";

const SIZES = ["xs", "sm", "md", "lg", "xl"] as const;
const VARIANTS = ["solid", "outline", "soft", "subtle", "ghost", "link"] as const;

export const ShareSandbox = (): JSX.Element => {
  const [size, setSize] = createSignal<(typeof SIZES)[number]>("sm");
  const [variant, setVariant] = createSignal<(typeof VARIANTS)[number]>("outline");
  const [color, setColor] = createSignal<string>("neutral");
  const [disabled, setDisabled] = createSignal(false);

  return (
    <div class="flex flex-col gap-6">
      {/* Control Toolbar */}
      <div class="p-4 rounded-xl border border-default bg-elevated/20 flex flex-wrap items-center gap-4 text-xs">
        <div class="flex items-center gap-2">
          <span class="text-muted">Size:</span>
          <For each={SIZES}>
            {(s) => (
              <button
                type="button"
                onClick={() => setSize(s)}
                class={`px-2 py-1 rounded-md transition-colors ${
                  size() === s
                    ? "bg-primary text-inverted"
                    : "bg-elevated text-muted hover:text-default border border-default"
                }`}
              >
                {s}
              </button>
            )}
          </For>
        </div>
        <div class="flex items-center gap-2">
          <span class="text-muted">Variant:</span>
          <For each={VARIANTS}>
            {(v) => (
              <button
                type="button"
                onClick={() => setVariant(v)}
                class={`px-2 py-1 rounded-md transition-colors ${
                  variant() === v
                    ? "bg-primary text-inverted"
                    : "bg-elevated text-muted hover:text-default border border-default"
                }`}
              >
                {v}
              </button>
            )}
          </For>
        </div>
        <div class="flex items-center gap-2">
          <span class="text-muted">Color:</span>
          <For each={AUDIT_COLORS}>
            {(c) => (
              <button
                type="button"
                onClick={() => setColor(c)}
                class={`px-2 py-1 rounded-md transition-colors ${
                  color() === c
                    ? "bg-primary text-inverted"
                    : "bg-elevated text-muted hover:text-default border border-default"
                }`}
              >
                {c}
              </button>
            )}
          </For>
        </div>
        <button
          type="button"
          onClick={() => setDisabled((v) => !v)}
          class={`px-2 py-1 rounded-md transition-colors ${
            disabled()
              ? "bg-primary text-inverted"
              : "bg-elevated text-muted hover:text-default border border-default"
          }`}
        >
          disabled
        </button>
      </div>

      {/* Preview Area */}
      <div class="p-8 rounded-xl border border-default bg-elevated/10 flex flex-wrap items-center justify-center gap-6">
        <RLShare size={size()} variant={variant()} color={color()} disabled={disabled()} />
      </div>
    </div>
  );
};

export const shareAudit: ComponentAuditDefinition = {
  id: "share",
  name: "Share",
  category: "Utility",
  status: "Auditing",
  description:
    "A button that shares the current page through the native share sheet, or copies the link to the clipboard as a fallback, then briefly shows a copied state.",
  importPath: "@rimelight/ui/components/share/RLShare.tsx",
  renderSandbox: () => <ShareSandbox />,
  testScenarios: [
    {
      id: "default-label",
      title: "Default label",
      description:
        "Default neutral outline small button with the share icon and the localized label.",
      render: () => <RLShare />,
    },
    {
      id: "default-slot",
      title: "Default slot (children)",
      description: "Children are forwarded to the underlying button in place of the default label.",
      render: () => <RLShare>Share this page</RLShare>,
    },
    {
      id: "color-and-variant",
      title: "Color and variant overrides",
      description: "Overrides the default neutral outline through the forwarded button props.",
      render: () => (
        <div class="flex flex-wrap gap-4 items-center">
          <RLShare color="primary" variant="solid" />
          <RLShare color="primary" variant="soft" />
          <RLShare color="error" variant="ghost" />
        </div>
      ),
    },
    {
      id: "sizes",
      title: "Sizes",
      description: "Every size value from xs to xl.",
      render: () => (
        <div class="flex flex-wrap gap-4 items-center">
          <For each={SIZES}>{(s) => <RLShare size={s} />}</For>
        </div>
      ),
    },
    {
      id: "disabled",
      title: "Disabled",
      description: "Disabled button. Clicking does nothing.",
      render: () => <RLShare disabled />,
    },
  ],
};
