import { createSignal, For, Show } from "solid-js";
import type { JSX } from "@solidjs/web";
import { RLToast } from "@rimelight/ui/components/toast/RLToast.tsx";
import { RLButton } from "@rimelight/ui/components/button/RLButton.tsx";
import type { ComponentAuditDefinition } from "./types";

const COLORS = ["primary", "secondary", "info", "success", "warning", "error"] as const;
const DURATIONS = [0, 4000, 6000] as const;

export const ToastSandbox = (): JSX.Element => {
  const [color, setColor] = createSignal<(typeof COLORS)[number]>("primary");
  const [duration, setDuration] = createSignal<(typeof DURATIONS)[number]>(0);
  const [dismissible, setDismissible] = createSignal(true);
  const [visible, setVisible] = createSignal(true);
  const [dismissCount, setDismissCount] = createSignal(0);

  return (
    <div class="flex flex-col gap-6">
      <div class="p-4 rounded-xl border border-default bg-elevated/20 flex flex-wrap items-center gap-3 text-xs">
        <span class="font-semibold text-muted">color:</span>
        <For each={COLORS}>
          {(c) => (
            <button
              type="button"
              class={`px-2 py-1 rounded border border-default ${color() === c ? "bg-primary text-on-primary" : ""}`}
              onClick={() => setColor(c)}
            >
              {c}
            </button>
          )}
        </For>
        <span class="font-semibold text-muted">duration:</span>
        <For each={DURATIONS}>
          {(d) => (
            <button
              type="button"
              class={`px-2 py-1 rounded border border-default ${duration() === d ? "bg-primary text-on-primary" : ""}`}
              onClick={() => setDuration(d)}
            >
              {d}
            </button>
          )}
        </For>
        <button
          type="button"
          class={`px-2 py-1 rounded border border-default ${dismissible() ? "bg-primary text-on-primary" : ""}`}
          onClick={() => setDismissible(!dismissible())}
        >
          dismissible
        </button>
        <button
          type="button"
          class="px-2 py-1 rounded border border-default"
          onClick={() => setVisible(true)}
        >
          show again
        </button>
        <span class="text-muted">onDismiss calls: {dismissCount()}</span>
      </div>

      <Show when={visible()}>
        <RLToast
          color={color()}
          title="Changes saved"
          description="Your draft was stored locally."
          duration={duration()}
          dismissible={dismissible()}
          onDismiss={() => {
            setDismissCount(dismissCount() + 1);
            setVisible(false);
          }}
        />
      </Show>
    </div>
  );
};

export const toastAudit: ComponentAuditDefinition = {
  id: "toast",
  name: "Toast",
  category: "Feedback",
  status: "Auditing",
  description:
    "A transient notification with a color-driven icon, title, description, custom actions, an optional dismiss button, and auto-dismiss after a duration.",
  importPath: "@rimelight/ui/components/toast/RLToast.tsx",
  renderSandbox: () => <ToastSandbox />,
  testScenarios: [
    {
      id: "colors",
      title: "Color matrix",
      description:
        "Each color variant applies its palette and the matching icon. Sticky and non-dismissible for a stable comparison.",
      render: () => (
        <div class="flex flex-col gap-3">
          <For each={COLORS}>
            {(c) => (
              <RLToast
                color={c}
                title={`${c} notification`}
                description={`A ${c} toast.`}
                duration={0}
                dismissible={false}
              />
            )}
          </For>
        </div>
      ),
    },
    {
      id: "dismissible",
      title: "Dismissible",
      description: "The close button is shown by default and calls onDismiss.",
      render: () => <RLToast title="Dismissible" description="Close me." duration={0} />,
    },
    {
      id: "non-dismissible",
      title: "Non-dismissible",
      description: "No close button, no dismissible marker, and no auto-dismiss.",
      render: () => (
        <RLToast
          title="Consent required"
          description="This prompt stays open."
          duration={4000}
          dismissible={false}
        />
      ),
    },
    {
      id: "auto-dismiss",
      title: "Auto-dismiss",
      description: "A positive duration closes the toast after that many milliseconds.",
      render: () => (
        <RLToast title="Closing soon" description="Closes after 4 seconds." duration={4000} />
      ),
    },
    {
      id: "title-slot",
      title: "titleSlot",
      description: "Render-function slot that replaces the title text.",
      render: () => (
        <RLToast
          duration={0}
          titleSlot={() => (
            <span class="font-semibold">
              Custom title <code class="text-xs">v2</code>
            </span>
          )}
          description="Title is replaced by the slot."
        />
      ),
    },
    {
      id: "description-slot",
      title: "descriptionSlot",
      description: "Render-function slot that replaces the description text.",
      render: () => (
        <RLToast
          title="Update available"
          duration={0}
          descriptionSlot={() => (
            <span>
              Restart to apply <strong>version 2.1</strong>.
            </span>
          )}
        />
      ),
    },
    {
      id: "actions-slot",
      title: "actionsSlot",
      description: "Render-function slot placed in the actions row below the text.",
      render: () => (
        <RLToast
          title="Item deleted"
          description="You can undo this within a few seconds."
          duration={0}
          actionsSlot={() => (
            <RLButton size="xs" variant="outline">
              Undo
            </RLButton>
          )}
        />
      ),
    },
    {
      id: "children",
      title: "Default slot (children)",
      description: "Children render in the body after the title and description.",
      render: () => (
        <RLToast title="Upload complete" duration={0} class="max-w-sm">
          <p class="text-xs text-muted">Three files were added to the library.</p>
        </RLToast>
      ),
    },
  ],
  checklist: [
    {
      criterion: "Alert semantics by color",
      status: "pending",
      notes:
        "error uses role alert with aria-live assertive; other colors use role status with aria-live polite.",
    },
    {
      criterion: "Timers pause on hover and focus",
      status: "pending",
      notes: "Auto-dismiss pauses while hovered or focused and resumes with the remaining time.",
    },
    {
      criterion: "Slot parity (titleSlot, descriptionSlot, actionsSlot, children)",
      status: "pending",
      notes: "Each slot replaces or extends its region without rendering content twice.",
    },
  ],
};
