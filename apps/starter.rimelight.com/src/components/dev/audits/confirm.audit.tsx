import { createSignal, For } from "solid-js";
import type { JSX } from "@solidjs/web";
import { RLConfirm } from "@rimelight/ui/components/confirm/RLConfirm.tsx";
import { RLButton } from "@rimelight/ui/components/button/RLButton.tsx";
import type { ComponentAuditDefinition } from "./types";

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
          <span class="text-muted mr-1">Variant:</span>
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
          <span class="text-muted">Title:</span>
          <input
            type="text"
            value={title()}
            onInput={(e) => setTitle(e.currentTarget.value)}
            class="px-2 py-1 rounded bg-elevated border border-default text-highlighted text-xs w-48"
          />
        </div>
        <div class="flex items-center gap-2">
          <span class="text-muted">Desc:</span>
          <input
            type="text"
            value={description()}
            onInput={(e) => setDescription(e.currentTarget.value)}
            class="px-2 py-1 rounded bg-elevated border border-default text-highlighted text-xs w-56"
          />
        </div>
        <div class="flex items-center gap-2">
          <span class="text-muted">Action:</span>
          <input
            type="text"
            value={actionLabel()}
            onInput={(e) => setActionLabel(e.currentTarget.value)}
            class="px-2 py-1 rounded bg-elevated border border-default text-highlighted text-xs w-24"
          />
        </div>
        <div class="flex items-center gap-2">
          <span class="text-muted">Cancel:</span>
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
          variant={variant()}
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
          trigger={
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
      title: "Confirmation Variants (Default & Destructive)",
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
              variant="default"
              title="Publish Changes?"
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
              variant="destructive"
              title="Delete Repository?"
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
      id: "custom-slots-and-labels",
      title: "Custom Slots & Layout",
      description: "Custom titleSlot, descriptionSlot, and triggerLabel.",
      render: () => {
        const [open, setOpen] = createSignal(false);
        return (
          <div>
            <RLConfirm
              open={open()}
              onOpenChange={setOpen}
              triggerLabel="Confirm with Custom Slots"
              titleSlot={<span class="text-error-500 font-bold">⚠️ Warning: Sensitive Action</span>}
              descriptionSlot={
                <span class="text-xs text-muted">
                  Custom formatted notice regarding your data export request.
                </span>
              }
              actionLabel="Proceed"
              cancelLabel="Abort"
              onConfirm={() => setOpen(false)}
              onCancel={() => setOpen(false)}
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
        "Full support for title, description, variant (default, destructive), actionLabel, cancelLabel, triggerLabel, onConfirm, onCancel, and slot aliases.",
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
