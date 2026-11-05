import { createSignal, onSettled, Show } from "solid-js";
import type { JSX } from "@solidjs/web";
import { RLShortcuts } from "@rimelight/ui/components/shortcuts/RLShortcuts.tsx";
import { defineShortcuts } from "@rimelight/ui/shortcuts";
import { RLButton } from "@rimelight/ui/components/button/RLButton.tsx";
import type { ComponentAuditDefinition } from "./types";

const DEMO_CATEGORIES = { navigation: "Navigation", editing: "Editing" };

const ShortcutsDemoRegistration = (): JSX.Element => {
  onSettled(() =>
    defineShortcuts({
      meta_k: {
        handler: () => {},
        label: "Open search",
        description: "Search across the site",
        category: "navigation",
        order: 2,
      },
      meta_s: {
        handler: () => {},
        label: "Save",
        description: "Save the current document",
        category: "editing",
        order: 1,
      },
    }),
  );
  return <p class="text-sm text-muted">Demo shortcuts are registered for this scenario.</p>;
};

export const ShortcutsSandbox = (): JSX.Element => {
  const [open, setOpen] = createSignal(false);
  const [portal, setPortal] = createSignal(true);

  return (
    <div class="flex flex-col gap-6">
      <div class="flex flex-wrap gap-2">
        <RLButton variant="solid" color="primary" size="sm" onClick={() => setOpen(true)}>
          Open shortcuts
        </RLButton>
        <RLButton
          variant={portal() ? "solid" : "outline"}
          color="neutral"
          size="sm"
          onClick={() => setPortal(!portal())}
        >
          portal
        </RLButton>
      </div>

      <RLShortcuts
        open={open()}
        onOpenChange={setOpen}
        portal={portal()}
        categories={DEMO_CATEGORIES}
      />
    </div>
  );
};

export const shortcutsAudit: ComponentAuditDefinition = {
  id: "shortcuts",
  name: "Shortcuts",
  category: "Overlay & Dialog",
  status: "Auditing",
  description:
    "A keyboard shortcuts cheat sheet listing the active shortcuts grouped by category, with Escape and backdrop dismissal.",
  importPath: "@rimelight/ui/components/shortcuts/RLShortcuts.tsx",
  renderSandbox: () => <ShortcutsSandbox />,
  testScenarios: [
    {
      id: "controlled",
      title: "Controlled open state",
      description: "The open prop and onOpenChange drive the dialog from outside.",
      render: () => {
        const [open, setOpen] = createSignal(false);
        return (
          <div class="flex flex-col items-start gap-3">
            <RLButton variant="outline" color="neutral" size="sm" onClick={() => setOpen(true)}>
              Open
            </RLButton>
            <Show when={open()}>
              <p class="text-sm text-muted">Dialog is open.</p>
            </Show>
            <RLShortcuts open={open()} onOpenChange={setOpen} />
          </div>
        );
      },
    },
    {
      id: "default-open",
      title: "Default open",
      description: "defaultOpen shows the dialog on mount when uncontrolled.",
      render: () => <RLShortcuts defaultOpen />,
    },
    {
      id: "listed-shortcuts",
      title: "Listed shortcuts",
      description:
        "Registered shortcuts are listed under their category labels, with keys and descriptions.",
      render: () => (
        <div class="flex flex-col gap-3">
          <ShortcutsDemoRegistration />
          <RLShortcuts defaultOpen categories={DEMO_CATEGORIES} />
        </div>
      ),
    },
    {
      id: "inline",
      title: "Inline rendering",
      description: "With portal false the dialog renders in place instead of in document.body.",
      render: () => {
        const [open, setOpen] = createSignal(true);
        return (
          <div class="relative h-96 overflow-hidden rounded-xl border border-default">
            <RLShortcuts open={open()} onOpenChange={setOpen} portal={false} />
          </div>
        );
      },
    },
  ],
};
