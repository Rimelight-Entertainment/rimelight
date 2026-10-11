import { createSignal, For } from "solid-js";
import type { JSX } from "@solidjs/web";
import { RLCollapsible } from "@rimelight/ui/components/collapsible/RLCollapsible.tsx";
import { RLButton } from "@rimelight/ui/components/button/RLButton.tsx";
import { RLIcon } from "@rimelight/ui/components/icon/RLIcon.tsx";
import type { ComponentAuditDefinition } from "./types";

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
          <span class="text-muted">State:</span>
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
            <span class="text-muted">Disabled</span>
          </label>

          <label class="flex items-center gap-1.5 cursor-pointer">
            <input
              type="checkbox"
              checked={unmountOnHide()}
              onInput={(e) => setUnmountOnHide(e.currentTarget.checked)}
              onChange={(e) => setUnmountOnHide(e.currentTarget.checked)}
              class="rounded border-default"
            />
            <span class="text-muted">Unmount On Hide</span>
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
          content={
            <div class="p-4 rounded-lg bg-elevated/50 border border-default text-sm text-muted">
              <p class="font-medium text-highlighted mb-1">Collapsible Content</p>
              <p>This content toggles smoothly according to the open state.</p>
            </div>
          }
        >
          {({ open }: { open: boolean }) => (
            <RLButton
              label={open ? "Hide Details" : "Show Details"}
              variant="subtle"
              color="neutral"
              disabled={isDisabled()}
              trailingIcon={open ? "chevronUp" : "chevronDown"}
              block
            />
          )}
        </RLCollapsible>
      </div>
    </div>
  );
};

export const collapsibleAudit: ComponentAuditDefinition = {
  id: "collapsible",
  name: "Collapsible",
  category: "Layout",
  status: "Auditing",
  description: "A collapsible element to toggle visibility of its content.",
  importPath: "@rimelight/ui/components/collapsible/RLCollapsible.tsx",
  renderSandbox: () => <CollapsibleSandbox />,
  testScenarios: [
    {
      id: "basic",
      title: "Basic Collapsible",
      description: "Default collapsible with button trigger and content slot.",
      render: () => (
        <RLCollapsible
          class="flex flex-col gap-2 w-72"
          content={
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
      title: "Persistent Content (unmountOnHide: false)",
      description:
        "Content stays mounted in the DOM with hidden attribute when collapsed instead of unmounting.",
      render: () => (
        <RLCollapsible
          unmountOnHide={false}
          class="flex flex-col gap-2 w-72"
          content={
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
      title: "Controlled Open State & defaultOpen",
      description: "Controls the open state programmatically with defaultOpen={true}.",
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
              content={
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
      title: "Disabled Collapsible",
      description: "Disabled collapsible prevents user interaction and applies disabled state.",
      render: () => (
        <RLCollapsible
          disabled
          class="flex flex-col gap-2 w-72"
          content={<div class="p-4 rounded-lg bg-elevated/50 border border-default">Hidden</div>}
        >
          <RLButton label="Disabled Collapsible" color="neutral" variant="subtle" disabled block />
        </RLCollapsible>
      ),
    },
    {
      id: "rotating-icon",
      title: "Rotating Indicator Icon",
      description: "Collapsible trigger utilizing reactive open state to animate an icon.",
      render: () => (
        <RLCollapsible
          class="flex flex-col gap-2 w-72"
          content={
            <div class="p-4 rounded-lg bg-elevated/50 border border-default text-sm text-muted">
              Smooth collapsible accordion panel.
            </div>
          }
        >
          {({ open }: { open: boolean }) => (
            <div class="flex items-center justify-between p-3 rounded-lg border border-default bg-elevated/50 cursor-pointer select-none">
              <span class="text-sm font-medium text-highlighted">Expand Details</span>
              <RLIcon
                name="chevronDown"
                size="sm"
                class={`transition-transform duration-200 ${open ? "rotate-180" : ""}`}
              />
            </div>
          )}
        </RLCollapsible>
      ),
    },
    {
      id: "custom-ui",
      title: "Custom UI Slot Styling",
      description: "Overriding styles for root, trigger, and content slots.",
      render: () => (
        <RLCollapsible
          ui={{
            root: "w-80 rounded-xl border border-primary/30 p-2 bg-primary/5",
            trigger: "font-semibold text-primary",
            content: "mt-2 p-3 rounded-lg bg-elevated border border-primary/20 text-xs",
          }}
          content={<div>Custom styled slot content</div>}
        >
          <RLButton label="Custom Styled Collapsible" color="primary" variant="soft" block />
        </RLCollapsible>
      ),
    },
    {
      id: "polymorphic",
      title: "Polymorphic Tag (as='section')",
      description: "Renders root container as a semantic HTML section element.",
      render: () => (
        <RLCollapsible
          as="section"
          class="flex flex-col gap-2 w-72"
          ariaLabel="Semantic Collapsible Section"
          content={
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
        "Full support for as, open, defaultOpen, disabled, unmountOnHide, ui, class, children/trigger, and content/contentSlot.",
    },
    {
      criterion: "Full WAI-ARIA compliance",
      status: "pass",
      notes:
        "Trigger has aria-expanded and aria-controls linked with content ID; data-state and data-disabled attributes applied.",
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
