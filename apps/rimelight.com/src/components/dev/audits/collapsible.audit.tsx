import { createSignal, For } from "solid-js";
import type { JSX } from "@solidjs/web";
import { RLCollapsible } from "@rimelight/ui/components/collapsible/RLCollapsible.tsx";
import { RLButton } from "@rimelight/ui/components/button/RLButton.tsx";
import { RLIcon } from "@rimelight/ui/components/icon/RLIcon.tsx";
import type { ComponentAuditDefinition } from "./types";
import { t } from "@rimelight/i18n";

export const CollapsibleSandbox = (): JSX.Element => {
  const [isOpen, setIsOpen] = createSignal(false);
  const [isDisabled, setIsDisabled] = createSignal(false);
  const [unmountOnHide, setUnmountOnHide] = createSignal(true);
  const [asTag, setAsTag] = createSignal<string>("div");

  const TAGS = ["div", "section", "article"] as const;

  return (
    <div class="flex flex-col gap-6">
      {/* Controls Toolbar */}
      <div class="p-4 rounded-xl border border-default bg-elevated/20 flex flex-wrap items-center gap-4 text-xs">
        <div class="flex items-center gap-2">
          <span class="text-muted">{t("app.text.state")}</span>
          <button
            type="button"
            onClick={() => setIsOpen(!isOpen())}
            class={`px-2.5 py-1 rounded text-xs font-mono transition-colors ${
              isOpen()
                ? "bg-primary text-inverted font-bold"
                : "bg-elevated text-muted hover:text-highlighted border border-default"
            }`}
          >
            {isOpen() ? "open: true" : "open: false"}
          </button>
        </div>

        <div class="flex items-center gap-3 flex-wrap">
          <label class="flex items-center gap-1.5 cursor-pointer">
            <input
              type="checkbox"
              checked={isDisabled()}
              onInput={(e) => setIsDisabled(e.currentTarget.checked)}
              onChange={(e) => setIsDisabled(e.currentTarget.checked)}
              class="rounded border-default"
            />
            <span class="text-muted">{t("app.text.disabled")}</span>
          </label>

          <label class="flex items-center gap-1.5 cursor-pointer">
            <input
              type="checkbox"
              checked={unmountOnHide()}
              onInput={(e) => setUnmountOnHide(e.currentTarget.checked)}
              onChange={(e) => setUnmountOnHide(e.currentTarget.checked)}
              class="rounded border-default"
            />
            <span class="text-muted">{t("app.text.unmount-on-hide")}</span>
          </label>
        </div>

        <div class="flex items-center gap-1.5 flex-wrap">
          <span class="text-muted mr-1">as:</span>
          <For each={TAGS}>
            {(t) => (
              <button
                type="button"
                onClick={() => setAsTag(t)}
                class={`px-2 py-0.5 rounded text-xs font-mono transition-colors ${
                  asTag() === t
                    ? "bg-primary text-inverted font-bold"
                    : "bg-elevated text-muted hover:text-highlighted border border-default"
                }`}
              >
                {t}
              </button>
            )}
          </For>
        </div>
      </div>

      {/* Component Under Test */}
      <div class="p-6 rounded-2xl border border-default bg-default flex flex-col items-start gap-4">
        <RLCollapsible
          as={asTag()}
          open={isOpen()}
          onOpenChange={setIsOpen}
          disabled={isDisabled()}
          unmountOnHide={unmountOnHide()}
          class="flex flex-col gap-2 w-72"
          bodySlot={
            <div class="p-4 rounded-lg bg-elevated/50 border border-default text-sm text-muted">
              <p class="font-medium text-highlighted mb-1">{t("app.text.collapsible-content")}</p>
              <p>{t("app.text.this-content-toggles-smoothly-according-to-the-o")}</p>
            </div>
          }
          triggerSlot={({ open }: { open: boolean }) => (
            <RLButton
              label={open ? "Hide Details" : "Show Details"}
              variant="subtle"
              color="neutral"
              disabled={isDisabled()}
              trailingIcon={open ? "lucide:chevron-up" : "chevron-down"}
              block
            />
          )}
        />
      </div>
    </div>
  );
};

export const collapsibleAudit: ComponentAuditDefinition = {
  id: "collapsible",
  name: "Collapsible",
  category: "Layout",
  status: "Auditing",
  get description() {
    return t("app.text.a-collapsible-element-to-toggle-visibility-of-it");
  },
  importPath: "@rimelight/ui/components/collapsible/RLCollapsible.tsx",
  renderSandbox: () => <CollapsibleSandbox />,
  testScenarios: [
    {
      id: "basic",
      get title() {
        return t("app.text.basic-collapsible");
      },
      get description() {
        return t("app.text.default-collapsible-with-button-trigger-and-cont");
      },
      render: () => (
        <RLCollapsible
          class="flex flex-col gap-2 w-72"
          bodySlot={
            <div class="p-4 rounded-lg bg-elevated/50 border border-default text-sm text-muted">
              Collapsible content revealed on click.
            </div>
          }
        >
          <RLButton label="Toggle Content" color="neutral" variant="subtle" block />
        </RLCollapsible>
      ),
    },
    {
      id: "unmount-on-hide",
      get title() {
        return t("app.text.persistent-content-unmountonhide-false");
      },
      description:
        "Content stays mounted in the DOM with hidden attribute when collapsed instead of unmounting.",
      render: () => (
        <RLCollapsible
          unmountOnHide={false}
          class="flex flex-col gap-2 w-72"
          bodySlot={
            <div class="p-4 rounded-lg bg-elevated/50 border border-default text-sm text-muted">
              This DOM node remains in the document even when closed.
            </div>
          }
        >
          <RLButton label="Toggle (DOM Retained)" color="neutral" variant="subtle" block />
        </RLCollapsible>
      ),
    },
    {
      id: "controlled-open",
      get title() {
        return t("app.text.controlled-open-state-defaultopen");
      },
      get description() {
        return t("app.text.controls-the-open-state-programmatically-with-de");
      },
      render: () => {
        const [open, setOpen] = createSignal(true);
        return (
          <div class="flex flex-col gap-3 w-72">
            <div class="flex items-center justify-between text-xs text-muted">
              <span>External state: {open() ? "Open" : "Closed"}</span>
              <button
                type="button"
                onClick={() => setOpen(!open())}
                class="text-primary underline cursor-pointer"
              >
                Toggle externally
              </button>
            </div>
            <RLCollapsible
              open={open()}
              onOpenChange={setOpen}
              class="flex flex-col gap-2"
              bodySlot={
                <div class="p-4 rounded-lg bg-elevated/50 border border-default text-sm text-muted">
                  Controlled collapsible content.
                </div>
              }
            >
              <RLButton label={open() ? "Close" : "Open"} color="neutral" variant="subtle" block />
            </RLCollapsible>
          </div>
        );
      },
    },
    {
      id: "disabled",
      get title() {
        return t("app.text.disabled-collapsible");
      },
      get description() {
        return t("app.text.disabled-collapsible-prevents-user-interaction-a");
      },
      render: () => (
        <RLCollapsible
          disabled
          class="flex flex-col gap-2 w-72"
          bodySlot={
            <div class="p-4 rounded-lg bg-elevated/50 border border-default">{"Hidden"}</div>
          }
        >
          <RLButton label="Disabled Collapsible" color="neutral" variant="subtle" disabled block />
        </RLCollapsible>
      ),
    },
    {
      id: "rotating-icon",
      get title() {
        return t("app.text.rotating-indicator-icon");
      },
      get description() {
        return t("app.text.collapsible-trigger-utilizing-reactive-open-stat");
      },
      render: () => (
        <RLCollapsible
          class="flex flex-col gap-2 w-72"
          bodySlot={
            <div class="p-4 rounded-lg bg-elevated/50 border border-default text-sm text-muted">
              Smooth collapsible accordion panel.
            </div>
          }
          triggerSlot={({ open }: { open: boolean }) => (
            <div class="flex items-center justify-between p-3 rounded-lg border border-default bg-elevated/50 cursor-pointer select-none">
              <span class="text-sm font-medium text-highlighted">{"Expand Details"}</span>
              <RLIcon
                name="chevron-down"
                size="sm"
                class={`transition-transform duration-200 ${open ? "rotate-180" : ""}`}
              />
            </div>
          )}
        />
      ),
    },
    {
      id: "custom-ui",
      get title() {
        return t("app.text.custom-ui-slot-styling");
      },
      get description() {
        return t("app.text.overriding-styles-for-root-trigger-and-content-s");
      },
      render: () => (
        <RLCollapsible
          ui={{
            root: "w-80 rounded-xl border border-primary/30 p-2 bg-primary/5",
            trigger: "font-semibold text-primary",
            body: "mt-2 p-3 rounded-lg bg-elevated border border-primary/20 text-xs",
          }}
          bodySlot={<div>{"Custom styled slot content"}</div>}
        >
          <RLButton label="Custom Styled Collapsible" color="primary" variant="soft" block />
        </RLCollapsible>
      ),
    },
    {
      id: "polymorphic",
      get title() {
        return t("app.text.polymorphic-tag-as-section");
      },
      get description() {
        return t("app.text.renders-root-container-as-a-semantic-html-sectio");
      },
      render: () => (
        <RLCollapsible
          as="section"
          class="flex flex-col gap-2 w-72"
          aria-label="Semantic Collapsible Section"
          bodySlot={
            <div class="p-4 rounded-lg bg-elevated/50 border border-default text-sm text-muted">
              Rendered inside a semantic &lt;section&gt; element.
            </div>
          }
        >
          <RLButton label="Semantic Section" color="neutral" variant="subtle" block />
        </RLCollapsible>
      ),
    },
  ],
  checklist: [
    {
      criterion: "API and slot pattern parity",
      status: "pass",
      notes:
        "Full support for as, open, defaultOpen, disabled, unmountOnHide, ui, class, children/triggerSlot, and bodySlot.",
    },
    {
      criterion: "Full WAI-ARIA compliance",
      status: "pass",
      notes:
        "Trigger has aria-expanded and aria-controls linked with body ID; data-state and data-disabled attributes applied.",
    },
    {
      criterion: "Theme token resolution",
      status: "pass",
      notes: "Theme classes live solely in collapsible.theme.ts; zero inline styles.",
    },
    {
      criterion: "No innerHTML / dangerouslySetInnerHTML",
      status: "pass",
      notes: "Pure Solid JSX reactive rendering.",
    },
    {
      criterion: "No hydration mismatches",
      status: "pass",
      notes: "Deterministic unique ID generation and clean SSR output.",
    },
    {
      criterion: "Audited components render bare",
      status: "pass",
      notes:
        "Component instances in audit scenarios are rendered directly with no harness wrappers.",
    },
  ],
};
