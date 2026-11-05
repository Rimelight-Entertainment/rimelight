import { createSignal, For } from "solid-js";
import type { JSX } from "@solidjs/web";
import { RLConfirm } from "@rimelight/ui/components/confirm/RLConfirm.tsx";
import { RLButton } from "@rimelight/ui/components/button/RLButton.tsx";
import type { ComponentAuditDefinition } from "./types";
import { t } from "@rimelight/i18n";

const VARIANTS = ["default", "destructive"] as const;

export const ConfirmSandbox = (): JSX.Element => {
  const [open, setOpen] = createSignal(false);
  const [variant, setVariant] = createSignal<(typeof VARIANTS)[number]>("default");
  const [title, setTitle] = createSignal("Are you absolutely sure?");
  const [description, setDescription] = createSignal(
    "This action cannot be undone. This will permanently delete your account and remove your data from our servers.",
  );
  const [actionLabel, setActionLabel] = createSignal("Confirm");
  const [cancelLabel, setCancelLabel] = createSignal("Cancel");
  const [lastAction, setLastAction] = createSignal<string>("None");

  return (
    <div class="flex flex-col gap-6">
      {/* Controls Toolbar */}
      <div class="p-4 rounded-xl border border-default bg-elevated/20 flex flex-wrap items-center gap-4 text-xs">
        {/* Variant Selection */}
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

        {/* Text Inputs */}
        <div class="flex items-center gap-2">
          <span class="text-muted">{t("app.text.title")}</span>
          <input
            type="text"
            value={title()}
            onInput={(e) => setTitle(e.currentTarget.value)}
            class="px-2 py-1 rounded bg-elevated border border-default text-highlighted text-xs w-48"
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
        <div class="flex items-center gap-2">
          <span class="text-muted">{t("app.text.action")}</span>
          <input
            type="text"
            value={actionLabel()}
            onInput={(e) => setActionLabel(e.currentTarget.value)}
            class="px-2 py-1 rounded bg-elevated border border-default text-highlighted text-xs w-24"
          />
        </div>
        <div class="flex items-center gap-2">
          <span class="text-muted">{t("app.text.cancel")}</span>
          <input
            type="text"
            value={cancelLabel()}
            onInput={(e) => setCancelLabel(e.currentTarget.value)}
            class="px-2 py-1 rounded bg-elevated border border-default text-highlighted text-xs w-24"
          />
        </div>
      </div>

      {/* Trigger & Preview */}
      <div class="space-y-3">
        <RLConfirm
          open={open()}
          onOpenChange={setOpen}
          color={variant() === "destructive" ? "error" : "primary"}
          title={title()}
          description={description()}
          actionLabel={actionLabel()}
          cancelLabel={cancelLabel()}
          onConfirm={() => {
            setLastAction("Confirmed");
            setOpen(false);
          }}
          onCancel={() => {
            setLastAction("Cancelled");
            setOpen(false);
          }}
          triggerSlot={
            <RLButton
              color={variant() === "destructive" ? "error" : "primary"}
              onClick={() => setOpen(true)}
            >
              Open {variant() === "destructive" ? "Destructive" : "Standard"} Confirmation
            </RLButton>
          }
        />

        <div class="text-xs text-muted font-mono">
          Last Action: <span class="text-highlighted font-bold">{lastAction()}</span>
        </div>
      </div>
    </div>
  );
};

export const confirmAudit: ComponentAuditDefinition = {
  id: "confirm",
  name: "Confirm",
  category: "Overlay & Dialog",
  status: "Auditing",
  description:
    "An alert dialog primitive composed on RLModal for critical confirmations with role='alertdialog' semantics.",
  importPath: "@rimelight/ui/components/confirm/RLConfirm.tsx",
  renderSandbox: () => <ConfirmSandbox />,
  testScenarios: [
    {
      id: "variants-matrix",
      get title() {
        return t("app.text.confirmation-variants-default-destructive");
      },
      description:
        "Standard confirmation with primary CTA and destructive confirmation with error styled CTA.",
      render: () => {
        const [defaultOpen, setDefaultOpen] = createSignal(false);
        const [destructOpen, setDestructOpen] = createSignal(false);
        return (
          <div class="flex flex-wrap gap-4 items-center">
            <RLButton variant="outline" onClick={() => setDefaultOpen(true)}>
              Standard Confirmation
            </RLButton>
            <RLConfirm
              open={defaultOpen()}
              onOpenChange={setDefaultOpen}
              color="primary"
              title={"Publish Changes?"}
              description="Your drafted changes will immediately go live to all visitors."
              actionLabel="Publish Now"
              onConfirm={() => setDefaultOpen(false)}
              onCancel={() => setDefaultOpen(false)}
            />

            <RLButton color="error" onClick={() => setDestructOpen(true)}>
              Destructive Confirmation
            </RLButton>
            <RLConfirm
              open={destructOpen()}
              onOpenChange={setDestructOpen}
              color="error"
              title={"Delete Repository?"}
              description="This will immediately and irreversibly delete the repository and all branches."
              actionLabel="Delete Repository"
              onConfirm={() => setDestructOpen(false)}
              onCancel={() => setDestructOpen(false)}
            />
          </div>
        );
      },
    },
    {
      id: "default-children",
      title: "Default Children Body",
      description: "Children render as the dialog body between the description and the action row.",
      render: () => {
        const [open, setOpen] = createSignal(false);
        return (
          <div>
            <RLConfirm
              open={open()}
              onOpenChange={setOpen}
              triggerLabel="Open with children"
              title="Review details"
              onConfirm={() => setOpen(false)}
              onCancel={() => setOpen(false)}
            >
              <p class="text-sm text-muted">Children render as the dialog body.</p>
            </RLConfirm>
          </div>
        );
      },
    },
    {
      id: "trigger-slot",
      title: "Trigger Slot",
      description: "A custom trigger element replaces the default trigger button.",
      render: () => {
        const [open, setOpen] = createSignal(false);
        return (
          <div>
            <RLConfirm
              open={open()}
              onOpenChange={setOpen}
              title="Archive project?"
              onConfirm={() => setOpen(false)}
              onCancel={() => setOpen(false)}
              triggerSlot={
                <RLButton variant="outline" onClick={() => setOpen(true)}>
                  Archive project
                </RLButton>
              }
            />
          </div>
        );
      },
    },
    {
      id: "title-slot",
      title: "Title Slot",
      description: "Custom title markup renders in place of the title string.",
      render: () => {
        const [open, setOpen] = createSignal(false);
        return (
          <div>
            <RLConfirm
              open={open()}
              onOpenChange={setOpen}
              triggerLabel="Open title slot"
              titleSlot={() => (
                <span class="text-error font-bold">{"⚠️ Warning: Sensitive Action"}</span>
              )}
              actionLabel="Proceed"
              cancelLabel="Abort"
              onConfirm={() => setOpen(false)}
              onCancel={() => setOpen(false)}
            />
          </div>
        );
      },
    },
    {
      id: "description-slot",
      title: "Description Slot",
      description: "Custom description markup renders in place of the description string.",
      render: () => {
        const [open, setOpen] = createSignal(false);
        return (
          <div>
            <RLConfirm
              open={open()}
              onOpenChange={setOpen}
              triggerLabel="Open description slot"
              title="Export data?"
              descriptionSlot={() => (
                <span class="text-xs text-muted">
                  Custom formatted notice regarding your data export request.
                </span>
              )}
              onConfirm={() => setOpen(false)}
              onCancel={() => setOpen(false)}
            />
          </div>
        );
      },
    },
    {
      id: "footer-slot",
      title: "Footer Slot",
      description: "Custom footer replaces the default Cancel and Confirm row.",
      render: () => {
        const [open, setOpen] = createSignal(false);
        return (
          <div>
            <RLConfirm
              open={open()}
              onOpenChange={setOpen}
              triggerLabel="Open footer slot"
              title="Acknowledge notice"
              footerSlot={() => (
                <div class="flex w-full justify-end">
                  <RLButton variant="solid" onClick={() => setOpen(false)}>
                    Understood
                  </RLButton>
                </div>
              )}
            />
          </div>
        );
      },
    },
  ],
  checklist: [
    {
      criterion: "API and slot pattern parity",
      status: "pass",
      notes:
        "Full support for title, description, color (primary, error), actionLabel, cancelLabel, triggerLabel, onConfirm, onCancel, and slot props.",
    },
    {
      criterion: "Composition over RLModal",
      status: "pass",
      notes:
        "Built cleanly as a specialized wrapper on RLModal with zero duplicate modal mechanics.",
    },
    {
      criterion: "Full WAI-ARIA compliance",
      status: "pass",
      notes:
        "Renders role='alertdialog', aria-modal='true', automatic deterministic aria-labelledby and aria-describedby.",
    },
    {
      criterion: "Theme token resolution",
      status: "pass",
      notes: "Classes live exclusively in confirm.theme.ts; zero inline styles.",
    },
  ],
};
