import { createSignal, For } from "solid-js";
import type { JSX } from "@solidjs/web";
import { RLModal } from "@rimelight/ui/components/modal/RLModal.tsx";
import { RLButton } from "@rimelight/ui/components/button/RLButton.tsx";
import type { ComponentAuditDefinition } from "./types";
import { t } from "@rimelight/i18n";

const SIZES = ["xs", "sm", "md", "lg", "xl"] as const;

export const ModalSandbox = (): JSX.Element => {
  const [open, setOpen] = createSignal(false);
  const [size, setSize] = createSignal<(typeof SIZES)[number]>("md");
  const [scrollable, setScrollable] = createSignal(false);
  const [fullscreen, setFullscreen] = createSignal(false);
  const [backdrop, setBackdrop] = createSignal(true);
  const [isModal, setIsModal] = createSignal(true);
  const [dismissible, setDismissible] = createSignal(true);
  const [hasHeader, setHasHeader] = createSignal(true);
  const [hasFooter, setHasFooter] = createSignal(true);
  const [title, setTitle] = createSignal("Edit User Profile");
  const [description, setDescription] = createSignal("Update account credentials and preferences.");

  return (
    <div class="flex flex-col gap-6">
      {/* Controls Toolbar */}
      <div class="p-4 rounded-xl border border-default bg-elevated/20 flex flex-wrap items-center gap-4 text-xs">
        {/* Size Selection */}
        <div class="flex items-center gap-1.5 flex-wrap">
          <span class="text-muted mr-1">{t("app.text.size")}</span>
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

        {/* Feature Toggles */}
        <div class="flex items-center gap-3 flex-wrap">
          <label class="flex items-center gap-1.5 cursor-pointer">
            <input
              type="checkbox"
              checked={scrollable()}
              onInput={(e) => setScrollable(e.currentTarget.checked)}
              onChange={(e) => setScrollable(e.currentTarget.checked)}
              class="rounded border-default"
            />
            <span class="text-muted">{t("app.text.scrollable")}</span>
          </label>
          <label class="flex items-center gap-1.5 cursor-pointer">
            <input
              type="checkbox"
              checked={fullscreen()}
              onInput={(e) => setFullscreen(e.currentTarget.checked)}
              onChange={(e) => setFullscreen(e.currentTarget.checked)}
              class="rounded border-default"
            />
            <span class="text-muted">{t("app.text.fullscreen")}</span>
          </label>
          <label class="flex items-center gap-1.5 cursor-pointer">
            <input
              type="checkbox"
              checked={backdrop()}
              onInput={(e) => setBackdrop(e.currentTarget.checked)}
              onChange={(e) => setBackdrop(e.currentTarget.checked)}
              class="rounded border-default"
            />
            <span class="text-muted">{t("app.text.overlay")}</span>
          </label>
          <label class="flex items-center gap-1.5 cursor-pointer">
            <input
              type="checkbox"
              checked={isModal()}
              onInput={(e) => setIsModal(e.currentTarget.checked)}
              onChange={(e) => setIsModal(e.currentTarget.checked)}
              class="rounded border-default"
            />
            <span class="text-muted">Modal (Blocks Outside)</span>
          </label>
          <label class="flex items-center gap-1.5 cursor-pointer">
            <input
              type="checkbox"
              checked={dismissible()}
              onInput={(e) => setDismissible(e.currentTarget.checked)}
              onChange={(e) => setDismissible(e.currentTarget.checked)}
              class="rounded border-default"
            />
            <span class="text-muted">{t("app.text.dismissible")}</span>
          </label>
          <label class="flex items-center gap-1.5 cursor-pointer">
            <input
              type="checkbox"
              checked={hasHeader()}
              onInput={(e) => setHasHeader(e.currentTarget.checked)}
              onChange={(e) => setHasHeader(e.currentTarget.checked)}
              class="rounded border-default"
            />
            <span class="text-muted">{t("app.text.header")}</span>
          </label>
          <label class="flex items-center gap-1.5 cursor-pointer">
            <input
              type="checkbox"
              checked={hasFooter()}
              onInput={(e) => setHasFooter(e.currentTarget.checked)}
              onChange={(e) => setHasFooter(e.currentTarget.checked)}
              class="rounded border-default"
            />
            <span class="text-muted">{t("app.text.footer")}</span>
          </label>
        </div>

        {/* Text Inputs */}
        <div class="flex items-center gap-2">
          <span class="text-muted">{t("app.text.title")}</span>
          <input
            type="text"
            value={title()}
            onInput={(e) => setTitle(e.currentTarget.value)}
            class="px-2 py-1 rounded bg-elevated border border-default text-highlighted text-xs w-40"
          />
        </div>
        <div class="flex items-center gap-2">
          <span class="text-muted">{t("app.text.desc")}</span>
          <input
            type="text"
            value={description()}
            onInput={(e) => setDescription(e.currentTarget.value)}
            class="px-2 py-1 rounded bg-elevated border border-default text-highlighted text-xs w-56"
          />
        </div>
      </div>

      {/* Trigger & Preview */}
      <div>
        <RLModal
          open={open()}
          onOpenChange={setOpen}
          size={size()}
          scrollable={scrollable()}
          fullscreen={fullscreen()}
          backdrop={backdrop()}
          modal={isModal()}
          dismissible={dismissible()}
          title={hasHeader() ? title() : undefined}
          description={hasHeader() ? description() : undefined}
          triggerSlot={
            <RLButton color="primary" onClick={() => setOpen(true)}>
              Open Configured Modal
            </RLButton>
          }
          footerSlot={() =>
            hasFooter() ? (
              <div class="flex items-center justify-end gap-2 w-full">
                <RLButton variant="outline" color="neutral" onClick={() => setOpen(false)}>
                  Cancel
                </RLButton>
                <RLButton color="primary" onClick={() => setOpen(false)}>
                  Save Changes
                </RLButton>
              </div>
            ) : undefined
          }
        >
          <div class="space-y-4 py-2">
            <p class="text-sm text-muted">
              Modals display content in an overlay dialog, interrupting user workflow to capture
              attention or gather required user input.
            </p>
            <div class="p-3 bg-elevated/40 rounded-lg border border-default text-xs space-y-1 font-mono">
              <div>State: {open() ? "Open" : "Closed"}</div>
              <div>Size: {size()}</div>
              <div>Scrollable: {String(scrollable())}</div>
              <div>Dismissible: {String(dismissible())}</div>
            </div>
          </div>
        </RLModal>
      </div>
    </div>
  );
};

export const modalAudit: ComponentAuditDefinition = {
  id: "modal",
  name: "Modal",
  category: "Overlay & Dialog",
  status: "Auditing",
  description:
    "A dialog window that displays focused messages, forms, or interactive workflows with full WAI-ARIA compliance.",
  importPath: "@rimelight/ui/components/modal/RLModal.tsx",
  renderSandbox: () => <ModalSandbox />,
  testScenarios: [
    {
      id: "sizes-matrix",
      get title() {
        return t("app.text.all-size-variants");
      },
      description: "xs, sm, md, lg, xl modal sizes.",
      render: () => {
        const [activeSize, setActiveSize] = createSignal<string | null>(null);
        return (
          <div class="flex flex-wrap gap-3 items-center">
            <For each={SIZES}>
              {(s) => (
                <div class="inline-flex">
                  <RLButton variant="outline" size="sm" onClick={() => setActiveSize(s)}>
                    Open {s.toUpperCase()}
                  </RLButton>
                  <RLModal
                    open={activeSize() === s}
                    onOpenChange={(v) => !v && setActiveSize(null)}
                    size={s}
                    title={`Modal Size: ${s.toUpperCase()}`}
                    description={`This dialog demonstrates size="${s}".`}
                    footerSlot={() => (
                      <div class="flex justify-end w-full">
                        <RLButton size="sm" onClick={() => setActiveSize(null)}>
                          Close
                        </RLButton>
                      </div>
                    )}
                  >
                    <p class="text-sm text-muted">
                      Modal layout adapts dynamically to the specified size preset while maintaining
                      responsive boundaries.
                    </p>
                  </RLModal>
                </div>
              )}
            </For>
          </div>
        );
      },
    },
    {
      id: "scrollable-content",
      get title() {
        return t("app.text.scrollable-overlay-mode");
      },
      description:
        "Long form content scrolling smoothly within the overlay container (scrollable=true).",
      render: () => {
        const [open, setOpen] = createSignal(false);
        return (
          <div>
            <RLButton variant="subtle" onClick={() => setOpen(true)}>
              Open Scrollable Modal
            </RLButton>
            <RLModal
              open={open()}
              onOpenChange={setOpen}
              scrollable
              title={"Terms of Service & Privacy Policy"}
              description="Please review all sections carefully."
              footerSlot={() => (
                <div class="flex justify-end gap-2 w-full">
                  <RLButton variant="outline" onClick={() => setOpen(false)}>
                    Decline
                  </RLButton>
                  <RLButton color="primary" onClick={() => setOpen(false)}>
                    Accept Terms
                  </RLButton>
                </div>
              )}
            >
              <div class="space-y-4 py-2 text-sm text-muted">
                <For each={Array.from({ length: 12 }, (_, i) => i + 1)}>
                  {(idx) => (
                    <div class="p-3 bg-elevated/30 rounded border border-default">
                      <h4 class="font-semibold text-highlighted mb-1">
                        Section {idx}: Legal Terms
                      </h4>
                      <p class="text-xs">
                        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod
                        tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam,
                        quis nostrud exercitation ullamco laboris.
                      </p>
                    </div>
                  )}
                </For>
              </div>
            </RLModal>
          </div>
        );
      },
    },
    {
      id: "nested-and-slots",
      get title() {
        return t("app.text.slots-header-actions-nested-modals");
      },
      description:
        "Demonstrating titleSlot, descriptionSlot, actions, footerSlot, and nested modal workflows.",
      render: () => {
        const [firstOpen, setFirstOpen] = createSignal(false);
        const [secondOpen, setSecondOpen] = createSignal(false);
        return (
          <div>
            <RLButton onClick={() => setFirstOpen(true)}>{"Launch Multi-Step Modal"}</RLButton>

            <RLModal
              open={firstOpen()}
              onOpenChange={setFirstOpen}
              titleSlot={() => (
                <span class="text-primary font-bold">{"Step 1: Configuration"}</span>
              )}
              descriptionSlot={() => (
                <span class="text-xs italic text-muted">{"Primary settings stage"}</span>
              )}
              actionsSlot={() => (
                <span class="text-xs px-2 py-0.5 rounded bg-primary/10 text-primary font-mono">
                  Step 1 of 2
                </span>
              )}
              footerSlot={() => (
                <div class="flex justify-between items-center w-full">
                  <RLButton variant="ghost" size="sm" onClick={() => setFirstOpen(false)}>
                    Cancel
                  </RLButton>
                  <RLButton color="primary" size="sm" onClick={() => setSecondOpen(true)}>
                    Proceed to Step 2 &rarr;
                  </RLButton>
                </div>
              )}
            >
              <div class="py-3 text-sm text-muted">
                Configure basic project parameters here before proceeding to confirmation.
              </div>

              <RLModal
                open={secondOpen()}
                onOpenChange={setSecondOpen}
                title={"Step 2: Confirmation"}
                description="Review summary before final deployment."
                footerSlot={() => (
                  <div class="flex justify-end gap-2 w-full">
                    <RLButton variant="outline" size="sm" onClick={() => setSecondOpen(false)}>
                      Back
                    </RLButton>
                    <RLButton
                      color="primary"
                      size="sm"
                      onClick={() => {
                        setSecondOpen(false);
                        setFirstOpen(false);
                      }}
                    >
                      Confirm & Deploy
                    </RLButton>
                  </div>
                )}
              >
                <div class="py-3 text-sm text-muted">
                  Nested modals work seamlessly without interfering with the parent backdrop or
                  focus traps.
                </div>
              </RLModal>
            </RLModal>
          </div>
        );
      },
    },
    {
      id: "custom-styling-ui",
      get title() {
        return t("app.text.custom-ui-slot-overrides");
      },
      get description() {
        return t("app.text.custom-borders-blur-levels-and-layout-overrides");
      },
      render: () => {
        const [open, setOpen] = createSignal(false);
        return (
          <div>
            <RLButton variant="outline" onClick={() => setOpen(true)}>
              Open Custom Styled Modal
            </RLButton>
            <RLModal
              open={open()}
              onOpenChange={setOpen}
              title={"Custom Styled Modal"}
              description="Enhanced styling overrides on all dialog slots."
              ui={{
                overlay: "bg-scrim/80 backdrop-blur-md",
                content: "border-2 border-primary/40 rounded-2xl shadow-2xl bg-default p-2",
                header: "p-6 bg-primary/5 rounded-t-xl",
                title: "text-xl font-black text-primary",
                body: "p-6",
                footer: "p-6 bg-elevated/40 rounded-b-xl border-t border-default",
              }}
              footerSlot={() => (
                <div class="flex justify-end w-full">
                  <RLButton color="primary" onClick={() => setOpen(false)}>
                    Acknowledge
                  </RLButton>
                </div>
              )}
            >
              <p class="text-sm text-muted">
                Every element of the modal (overlay, content, header, title, description, body,
                footer, close) can be customized via the `ui` prop.
              </p>
            </RLModal>
          </div>
        );
      },
    },
    {
      id: "slot-overrides",
      title: "Header, trigger, close, and body slots",
      description: "headerSlot, triggerSlot, closeSlot, and bodySlot replace the default markup.",
      render: () => {
        const [open, setOpen] = createSignal(false);
        return (
          <RLModal
            open={open()}
            onOpenChange={setOpen}
            triggerSlot={
              <RLButton variant="subtle" onClick={() => setOpen(true)}>
                Open Slot Modal
              </RLButton>
            }
            headerSlot={
              <div class="flex flex-col gap-1 p-4 w-full">
                <span class="text-xs font-mono text-muted">headerSlot</span>
                <span class="font-semibold text-highlighted">Custom header</span>
              </div>
            }
            closeSlot={
              <RLButton variant="outline" size="sm" onClick={() => setOpen(false)}>
                Done
              </RLButton>
            }
            bodySlot={<p class="text-sm text-muted">bodySlot replaces the children below.</p>}
          >
            <p class="text-sm text-muted">Children are ignored when bodySlot is set.</p>
          </RLModal>
        );
      },
    },
  ],
  checklist: [
    {
      criterion: "API and slot pattern parity",
      status: "pass",
      notes:
        "Full support for title, description, open (controlled via onOpenChange), defaultOpen, size, backdrop, scrollable, transition, fullscreen, modal, portal, dismissible, unmountOnHide, triggerSlot, headerSlot, titleSlot, descriptionSlot, actionsSlot, closeSlot, bodySlot, footerSlot, and children.",
    },
    {
      criterion: "Full WAI-ARIA compliance",
      status: "pass",
      notes:
        "Renders role='dialog', aria-modal='true', automatic deterministic aria-labelledby and aria-describedby linking title/description IDs.",
    },
    {
      criterion: "Keyboard & Outside Click Dismissal",
      status: "pass",
      notes: "Handles Escape key, the close control, and overlay clicks with dismissible support.",
    },
    {
      criterion: "Theme token resolution",
      status: "pass",
      notes: "Classes live exclusively in modal.theme.ts; zero inline styles.",
    },
    {
      criterion: "No innerHTML / dangerouslySetInnerHTML",
      status: "pass",
      notes: "Pure Solid JSX reactive rendering.",
    },
    {
      criterion: "No hydration mismatches",
      status: "pass",
      notes: "Deterministic unique ID generation and portal mount management.",
    },
    {
      criterion: "Audited components render bare",
      status: "pass",
      notes:
        "Component instances in audit scenarios are rendered directly with no harness wrappers.",
    },
  ],
};
