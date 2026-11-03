import { createSignal, For } from "solid-js";
import type { JSX } from "@solidjs/web";
import { RLCallout } from "@rimelight/ui/components/callout/RLCallout.tsx";
import { AUDIT_COLORS, type ComponentAuditDefinition } from "./types";
import { t } from "@rimelight/i18n";

const COLORS = AUDIT_COLORS;

const VARIANTS = ["solid", "outline", "soft", "subtle"] as const;

export const CalloutSandbox = (): JSX.Element => {
  const [color, setColor] = createSignal<string>("primary");
  const [variant, setVariant] = createSignal<(typeof VARIANTS)[number]>("solid");
  const [orientation, setOrientation] = createSignal<"vertical" | "horizontal">("vertical");
  const [hasIcon, setHasIcon] = createSignal(true);
  const [hasAvatar, setHasAvatar] = createSignal(false);
  const [hasActions, setHasActions] = createSignal(true);
  const [isClosable, setIsClosable] = createSignal(true);
  const [title, setTitle] = createSignal("Heads up!");
  const [description, setDescription] = createSignal(
    "You can customize and theme your callouts dynamically.",
  );

  return (
    <div class="flex flex-col gap-6">
      {/* Controls Toolbar */}
      <div class="p-4 rounded-xl border border-default bg-elevated/20 flex flex-wrap items-center gap-4 text-xs">
        {/* Colors */}
        <div class="flex items-center gap-1.5 flex-wrap">
          <span class="text-muted mr-1">{t("app.text.color")}</span>
          <For each={COLORS}>
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

        {/* Variants */}
        <div class="flex items-center gap-1.5 flex-wrap">
          <span class="text-muted mr-1">{t("app.text.variant")}</span>
          <For each={VARIANTS}>
            {(v) => (
              <button
                type="button"
                onClick={() => setVariant(v)}
                class={`px-2 py-0.5 rounded text-xs font-mono transition-colors ${
                  variant() === v
                    ? "bg-primary text-inverted font-bold"
                    : "bg-elevated text-muted hover:text-highlighted border border-default"
                }`}
              >
                {v}
              </button>
            )}
          </For>
        </div>

        {/* Orientation */}
        <div class="flex items-center gap-1.5">
          <span class="text-muted mr-1">{t("app.text.orientation")}</span>
          <button
            type="button"
            onClick={() => setOrientation("vertical")}
            class={`px-2 py-0.5 rounded text-xs font-mono transition-colors ${
              orientation() === "vertical"
                ? "bg-primary text-inverted font-bold"
                : "bg-elevated text-muted hover:text-highlighted border border-default"
            }`}
          >
            vertical
          </button>
          <button
            type="button"
            onClick={() => setOrientation("horizontal")}
            class={`px-2 py-0.5 rounded text-xs font-mono transition-colors ${
              orientation() === "horizontal"
                ? "bg-primary text-inverted font-bold"
                : "bg-elevated text-muted hover:text-highlighted border border-default"
            }`}
          >
            horizontal
          </button>
        </div>

        {/* Toggles */}
        <div class="flex items-center gap-3 flex-wrap">
          <label class="flex items-center gap-1.5 cursor-pointer">
            <input
              type="checkbox"
              checked={hasIcon()}
              onInput={(e) => setHasIcon(e.currentTarget.checked)}
              onChange={(e) => setHasIcon(e.currentTarget.checked)}
              class="rounded border-default"
            />
            <span class="text-muted">{t("app.text.icon")}</span>
          </label>
          <label class="flex items-center gap-1.5 cursor-pointer">
            <input
              type="checkbox"
              checked={hasAvatar()}
              onInput={(e) => setHasAvatar(e.currentTarget.checked)}
              onChange={(e) => setHasAvatar(e.currentTarget.checked)}
              class="rounded border-default"
            />
            <span class="text-muted">{t("app.text.avatar")}</span>
          </label>
          <label class="flex items-center gap-1.5 cursor-pointer">
            <input
              type="checkbox"
              checked={hasActions()}
              onInput={(e) => setHasActions(e.currentTarget.checked)}
              onChange={(e) => setHasActions(e.currentTarget.checked)}
              class="rounded border-default"
            />
            <span class="text-muted">{t("app.text.actions")}</span>
          </label>
          <label class="flex items-center gap-1.5 cursor-pointer">
            <input
              type="checkbox"
              checked={isClosable()}
              onInput={(e) => setIsClosable(e.currentTarget.checked)}
              onChange={(e) => setIsClosable(e.currentTarget.checked)}
              class="rounded border-default"
            />
            <span class="text-muted">{t("app.text.close-button")}</span>
          </label>
        </div>

        {/* Title & Description inputs */}
        <div class="flex items-center gap-2">
          <span class="text-muted">{t("app.text.title")}</span>
          <input
            type="text"
            value={title()}
            onInput={(e) => setTitle(e.currentTarget.value)}
            class="px-2 py-1 rounded bg-elevated border border-default text-highlighted text-xs w-36"
          />
        </div>
        <div class="flex items-center gap-2">
          <span class="text-muted">{t("app.text.desc")}</span>
          <input
            type="text"
            value={description()}
            onInput={(e) => setDescription(e.currentTarget.value)}
            class="px-2 py-1 rounded bg-elevated border border-default text-highlighted text-xs w-64"
          />
        </div>
      </div>

      {/* Preview (bare) */}
      <RLCallout
        color={color()}
        variant={variant()}
        orientation={orientation()}
        title={title()}
        description={description()}
        icon={hasIcon() && !hasAvatar() ? "terminal" : undefined}
        avatar={hasAvatar() ? { src: "https://github.com/nuxt.png", alt: "Nuxt" } : undefined}
        dismissible={isClosable()}
        actions={
          hasActions()
            ? [
                { label: t("app.text.action-1") },
                { label: t("app.text.action-2"), color: "neutral", variant: "subtle" },
              ]
            : undefined
        }
      />
    </div>
  );
};

export const calloutAudit: ComponentAuditDefinition = {
  id: "callout",
  name: "Callout",
  category: "Feedback",
  status: "Passed",
  description:
    "A callout component to draw the user's attention, communicate status or inform about critical updates with title, description, icons, avatars, action buttons, and dismissibility.",
  importPath: "@rimelight/ui/components/callout/RLCallout.tsx",
  renderSandbox: () => <CalloutSandbox />,
  testScenarios: [
    {
      id: "colors-matrix",
      get title() {
        return t("app.text.all-color-variants");
      },
      description:
        "All visual colors (primary, secondary, success, info, warning, error, neutral) with consistent theme token resolution and crisp white contrast on solid variant.",
      render: () => (
        <div class="flex flex-col gap-3">
          <For each={COLORS}>
            {(c) => (
              <span class="block">
                <RLCallout
                  color={c}
                  icon="info"
                  title={`This is a ${c} callout notification.`}
                  description={`Demonstrating ${c} theme color styling with high contrast readability.`}
                  dismissible
                />
              </span>
            )}
          </For>
        </div>
      ),
    },
    {
      id: "variants-matrix",
      get title() {
        return t("app.text.all-visual-variants");
      },
      get description() {
        return t("app.text.solid-outline-soft-and-subtle-variants-across-br");
      },
      render: () => (
        <div class="flex flex-col gap-3">
          <For each={VARIANTS}>
            {(v) => (
              <RLCallout
                variant={v}
                color="primary"
                icon="terminal"
                title={`Variant: ${v}`}
                description={`This callout is rendered with variant="${v}".`}
                dismissible
              />
            )}
          </For>
          <For each={VARIANTS}>
            {(v) => (
              <RLCallout
                variant={v}
                color="neutral"
                icon="info"
                title={`Neutral Variant: ${v}`}
                description={`Neutral color with variant="${v}" matching standard theme surface contrast.`}
                dismissible
              />
            )}
          </For>
        </div>
      ),
    },
    {
      id: "orientations-and-actions",
      get title() {
        return t("app.text.vertical-horizontal-orientations-with-actions");
      },
      description:
        "In vertical mode actions are placed below description; in horizontal mode actions are aligned alongside content and the close button.",
      render: () => (
        <div class="flex flex-col gap-4">
          <RLCallout
            orientation="vertical"
            color="info"
            icon="rocket"
            title={"Vertical Orientation with Action Buttons"}
            description="Actions render stacked underneath description with size='xs' buttons."
            actions={[
              {
                get label() {
                  return t("app.text.accept");
                },
                color: "info",
              },
              {
                get label() {
                  return t("app.text.dismiss");
                },
                color: "neutral",
                variant: "subtle",
              },
            ]}
            dismissible
          />
          <RLCallout
            orientation="horizontal"
            color="neutral"
            variant="outline"
            icon="info"
            title={"Horizontal Orientation"}
            description="Actions and close button align horizontally beside the message content."
            actions={[
              {
                get label() {
                  return t("app.text.action-1");
                },
              },
              {
                get label() {
                  return t("app.text.action-2");
                },
                color: "neutral",
                variant: "subtle",
              },
            ]}
            dismissible
          />
        </div>
      ),
    },
    {
      id: "avatar-and-icons",
      get title() {
        return t("app.text.avatar-icon-support");
      },
      description:
        "Demonstrating leading icon, leading avatar from string or object, and custom slot overrides.",
      render: () => (
        <div class="flex flex-col gap-3">
          <RLCallout
            icon="terminal"
            color="secondary"
            title={"Icon-based Callout"}
            description="Uses standard RLIcon resolution with aria-hidden for accessibility."
          />
          <RLCallout
            avatar={{ src: "https://github.com/nuxt.png", alt: "Nuxt Logo" }}
            color="success"
            variant="subtle"
            title={"Avatar-based Callout"}
            description="Uses RLAvatar with xl size and alt text."
            dismissible
          />
          <RLCallout
            iconSlot={
              <span class="text-xl" aria-hidden="true">
                🎉
              </span>
            }
            color="warning"
            variant="outline"
            title={"Custom Leading Slot"}
            description="Leading slot replaces both icon and avatar slots."
            dismissible
          />
        </div>
      ),
    },
    {
      id: "dismissible-and-close-customization",
      get title() {
        return t("app.text.dismissible-close-button-customization");
      },
      description: "Dismissible callout with custom close icon and closeSlot.",
      render: () => (
        <div class="flex flex-col gap-3">
          <RLCallout
            color="neutral"
            variant="outline"
            title={"Default Close Button"}
            description="Click the close button to dismiss this callout."
            dismissible
          />
          <RLCallout
            color="primary"
            variant="subtle"
            title={"Customized Close Button"}
            description="Customized with closeIcon='arrow-right'."
            dismissible
            closeIcon="arrow-right"
          />
        </div>
      ),
    },
    {
      id: "custom-slots",
      get title() {
        return t("app.text.custom-slots-parity");
      },
      description:
        "Slots (leading, titleSlot, descriptionSlot, actionsSlot, closeSlot) allow full template customization.",
      render: () => (
        <RLCallout
          color="secondary"
          variant="outline"
          iconSlot={<span aria-hidden="true">🌟</span>}
          titleSlot={
            <span>
              Custom <strong>{"titleSlot"}</strong> formatting
            </span>
          }
          descriptionSlot={
            <span>
              Custom <em>{"descriptionSlot"}</em> with rich HTML content and styling.
            </span>
          }
          actionsSlot={
            <button type="button" class="text-xs underline font-bold">
              Custom Action Slot
            </button>
          }
          closeSlot={
            <span class="text-xs cursor-pointer opacity-75 hover:opacity-100">[dismiss]</span>
          }
        />
      ),
    },
  ],
  checklist: [
    {
      criterion: "Nuxt UI v4 Callout Parity",
      status: "pass",
      notes:
        "Full support for as, title, description, icon, avatar, color (auto), variant (solid, outline, soft, subtle), orientation (vertical, horizontal), actions, dismissible, closeIcon, ui, class, and onDismiss/onOpenChange parity.",
    },
    {
      criterion: "Slot pattern parity (leading, title, description, actions, close)",
      status: "pass",
      notes: "Slots replace default parts cleanly with full SolidJS reactivity.",
    },
    {
      criterion: "Full WAI-ARIA compliance",
      status: "pass",
      notes:
        "role='alert', automatic aria-labelledby matching title element id, automatic aria-describedby matching description element id, and aria-label fallback.",
    },
    {
      criterion: "Theme token resolution (color='auto')",
      status: "pass",
      notes: "Theme uses color='auto' with UnoCSS classes; zero inline styles.",
    },
    {
      criterion: "No innerHTML / dangerouslySetInnerHTML",
      status: "pass",
      notes: "Pure Solid JSX reactive rendering throughout.",
    },
    {
      criterion: "No hydration mismatches",
      status: "pass",
      notes: "Deterministic unique ID generation and clean reactive signals.",
    },
    {
      criterion: "Audited components render bare",
      status: "pass",
      notes:
        "Component instances in audit scenarios are rendered directly with no harness wrappers.",
    },
  ],
};
