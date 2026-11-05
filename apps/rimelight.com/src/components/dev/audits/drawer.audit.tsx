import { createSignal, For } from "solid-js";
import type { JSX } from "@solidjs/web";
import { RLDrawer } from "@rimelight/ui/components/drawer/RLDrawer.tsx";
import type { ComponentAuditDefinition } from "./types";

const SIDES = ["bottom", "top", "left", "right"] as const;

export const DrawerSandbox = (): JSX.Element => {
  const [side, setSide] = createSignal<(typeof SIDES)[number]>("bottom");
  const [dismissible, setDismissible] = createSignal(true);

  return (
    <div class="flex flex-col gap-6">
      <div class="p-4 rounded-xl border border-default bg-elevated/20 flex flex-wrap items-center gap-4 text-xs">
        <div class="flex items-center gap-2">
          <span class="text-muted">{"side"}</span>
          <For each={SIDES}>
            {(s) => (
              <button
                type="button"
                aria-pressed={side() === s ? "true" : "false"}
                class={`px-2 py-1 rounded-md border border-default ${side() === s ? "bg-primary text-on-primary" : ""}`}
                onClick={() => setSide(s)}
              >
                {s}
              </button>
            )}
          </For>
        </div>
        <label class="flex items-center gap-2">
          <input
            type="checkbox"
            checked={dismissible()}
            onChange={(e) => setDismissible(e.currentTarget.checked)}
          />
          <span class="text-muted">{"dismissible"}</span>
        </label>
      </div>

      <div class="p-8 rounded-xl border border-default bg-elevated/10 flex items-center justify-center">
        <RLDrawer
          triggerLabel="Open drawer"
          title="Drawer title"
          description="Explanation of what this drawer does."
          side={side()}
          dismissible={dismissible()}
        >
          <p class="text-sm text-muted">{"Drawer body content."}</p>
        </RLDrawer>
      </div>
    </div>
  );
};

export const drawerAudit: ComponentAuditDefinition = {
  id: "drawer",
  name: "Drawer",
  category: "Overlay & Dialog",
  status: "Auditing",
  description:
    "An edge-anchored modal panel built on the native <dialog> element with side (bottom, top, left, right), controlled and uncontrolled open state, dismissible backdrop and Escape handling, scroll locking, and trigger, title, description, and footer slots.",
  importPath: "@rimelight/ui/components/drawer/RLDrawer.tsx",
  renderSandbox: () => <DrawerSandbox />,
  testScenarios: [
    {
      id: "default-slot",
      title: "Default slot (children)",
      description: "Body content passed as children with the default trigger label and title.",
      render: () => (
        <RLDrawer triggerLabel="Open drawer" title="Default slot">
          <p class="text-sm text-muted">{"Body content passed as children."}</p>
        </RLDrawer>
      ),
    },
    {
      id: "trigger-slot",
      title: "Trigger slot",
      description:
        "Custom trigger content replaces the triggerLabel button. Children still render.",
      render: () => (
        <RLDrawer
          triggerSlot={
            <span class="inline-flex items-center rounded-md border border-default px-3 py-1.5 text-sm">
              {"Custom trigger"}
            </span>
          }
          title="Trigger slot"
        >
          <p class="text-sm text-muted">{"Children render inside the drawer."}</p>
        </RLDrawer>
      ),
    },
    {
      id: "title-slot",
      title: "Title slot",
      description:
        "Custom title content takes precedence over the title string. Children still render.",
      render: () => (
        <RLDrawer
          triggerLabel="Open drawer"
          title="Ignored title string"
          titleSlot={<span class="text-primary font-bold">{"Custom title slot"}</span>}
        >
          <p class="text-sm text-muted">{"Children render inside the drawer."}</p>
        </RLDrawer>
      ),
    },
    {
      id: "description-slot",
      title: "Description slot",
      description:
        "Custom description content takes precedence over the description string. Children still render.",
      render: () => (
        <RLDrawer
          triggerLabel="Open drawer"
          title="Description slot"
          description="Ignored description string"
          descriptionSlot={
            <span class="text-xs italic text-muted">{"Custom description slot"}</span>
          }
        >
          <p class="text-sm text-muted">{"Children render inside the drawer."}</p>
        </RLDrawer>
      ),
    },
    {
      id: "footer-slot",
      title: "Footer slot",
      description: "Footer content renders below the body. Children still render.",
      render: () => (
        <RLDrawer
          triggerLabel="Open drawer"
          title="Footer slot"
          footerSlot={
            <div class="flex justify-end gap-2">
              <button type="button" class="px-3 py-1.5 rounded-md border border-default text-sm">
                {"Confirm"}
              </button>
            </div>
          }
        >
          <p class="text-sm text-muted">{"Children render inside the drawer."}</p>
        </RLDrawer>
      ),
    },
    {
      id: "sides",
      title: "Sides",
      description: "Each side value anchors the drawer to a different viewport edge.",
      render: () => (
        <div class="flex flex-wrap gap-4">
          <For each={SIDES}>
            {(s) => (
              <RLDrawer triggerLabel={s} side={s} title={`Drawer from ${s}`}>
                <p class="text-sm text-muted">{`Anchored to the ${s} edge.`}</p>
              </RLDrawer>
            )}
          </For>
        </div>
      ),
    },
  ],
  checklist: [
    {
      criterion:
        "Slot pattern parity (triggerSlot, titleSlot, descriptionSlot, footerSlot, default)",
      status: "pending",
    },
    {
      criterion: "Controlled and uncontrolled open state",
      status: "pending",
    },
    {
      criterion: "Dismissal via close button, Escape, and backdrop click",
      status: "pending",
    },
  ],
};
