import { createSignal, For, Show } from "solid-js";
import type { JSX } from "@solidjs/web";
import { RLSlideover } from "@rimelight/ui/components/slideover/RLSlideover.tsx";
import type { SlideoverSide } from "@rimelight/ui/components/slideover/slideover.types.ts";
import { RLButton } from "@rimelight/ui/components/button/RLButton.tsx";
import type { ComponentAuditDefinition } from "./types";

const SIDES = ["left", "right", "top", "bottom"] as const;

export const SlideoverSandbox = (): JSX.Element => {
  const [side, setSide] = createSignal<SlideoverSide>("left");
  const [dismissible, setDismissible] = createSignal(true);
  const [unmountOnHide, setUnmountOnHide] = createSignal(true);
  const [portal, setPortal] = createSignal(true);

  return (
    <div class="flex flex-col gap-6">
      <div class="flex flex-wrap gap-2">
        <For each={SIDES}>
          {(value) => (
            <RLButton
              variant={side() === value ? "solid" : "outline"}
              color="neutral"
              size="sm"
              onClick={() => setSide(value)}
            >
              {value}
            </RLButton>
          )}
        </For>
        <RLButton
          variant={dismissible() ? "solid" : "outline"}
          color="neutral"
          size="sm"
          onClick={() => setDismissible(!dismissible())}
        >
          dismissible
        </RLButton>
        <RLButton
          variant={unmountOnHide() ? "solid" : "outline"}
          color="neutral"
          size="sm"
          onClick={() => setUnmountOnHide(!unmountOnHide())}
        >
          unmountOnHide
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

      <RLSlideover
        side={side()}
        dismissible={dismissible()}
        unmountOnHide={unmountOnHide()}
        portal={portal()}
        title="Sandbox sheet"
        description="Change the controls above to see how the sheet responds."
        triggerLabel="Open sheet"
        footerSlot={
          <RLButton variant="solid" color="primary" size="sm">
            Confirm
          </RLButton>
        }
      >
        <p class="text-sm text-muted">Body content of the sheet.</p>
      </RLSlideover>
    </div>
  );
};

export const slideoverAudit: ComponentAuditDefinition = {
  id: "slideover",
  name: "Slideover",
  category: "Overlay & Dialog",
  status: "Auditing",
  description:
    "A side sheet that slides in from an edge of the viewport, with a backdrop, close button, and optional portal.",
  importPath: "@rimelight/ui/components/slideover/RLSlideover.tsx",
  renderSandbox: () => <SlideoverSandbox />,
  testScenarios: [
    {
      id: "default-trigger-label",
      title: "Default trigger label",
      description: "A string triggerLabel renders a default button that opens the sheet.",
      render: () => (
        <RLSlideover triggerLabel="Open" title="Default trigger">
          <p class="text-sm text-muted">Opened from the default trigger button.</p>
        </RLSlideover>
      ),
    },
    {
      id: "children-body",
      title: "Children body",
      description: "Default children render in the body slot.",
      render: () => (
        <RLSlideover triggerLabel="Open" title="Children">
          <div class="flex flex-col gap-2 text-sm text-muted">
            <p>First paragraph of body content.</p>
            <p>Second paragraph of body content.</p>
          </div>
        </RLSlideover>
      ),
    },
    {
      id: "trigger-slot",
      title: "Trigger slot",
      description: "triggerSlot replaces the default trigger button.",
      render: () => (
        <RLSlideover
          title="Custom trigger"
          triggerSlot={
            <RLButton variant="outline" color="neutral">
              Custom trigger
            </RLButton>
          }
        >
          <p class="text-sm text-muted">Opened from a custom trigger.</p>
        </RLSlideover>
      ),
    },
    {
      id: "title-slot",
      title: "Title slot",
      description: "titleSlot takes precedence over the title string.",
      render: () => (
        <RLSlideover
          triggerLabel="Open"
          title="Ignored string title"
          titleSlot={<span class="text-primary">Rich title</span>}
        >
          <p class="text-sm text-muted">The title above is rendered from titleSlot.</p>
        </RLSlideover>
      ),
    },
    {
      id: "description-slot",
      title: "Description slot",
      description: "descriptionSlot takes precedence over the description string.",
      render: () => (
        <RLSlideover
          triggerLabel="Open"
          title="Description slot"
          description="Ignored string description"
          descriptionSlot={
            <span>
              Description with <strong>emphasis</strong>.
            </span>
          }
        >
          <p class="text-sm text-muted">The description above is rendered from descriptionSlot.</p>
        </RLSlideover>
      ),
    },
    {
      id: "footer-slot",
      title: "Footer slot",
      description: "footerSlot renders below the body.",
      render: () => (
        <RLSlideover
          triggerLabel="Open"
          title="Footer slot"
          footerSlot={
            <div class="flex gap-2">
              <RLButton variant="outline" color="neutral" size="sm">
                Cancel
              </RLButton>
              <RLButton variant="solid" color="primary" size="sm">
                Save
              </RLButton>
            </div>
          }
        >
          <p class="text-sm text-muted">Footer actions sit under the body.</p>
        </RLSlideover>
      ),
    },
    {
      id: "sides",
      title: "Sides",
      description: "Each side slides in from its edge: left, right, top, and bottom.",
      render: () => (
        <div class="flex flex-wrap gap-2">
          <For each={SIDES}>
            {(value) => (
              <RLSlideover side={value} triggerLabel={value} title={`From ${value}`}>
                <p class="text-sm text-muted">Sheet attached to the {value} edge.</p>
              </RLSlideover>
            )}
          </For>
        </div>
      ),
    },
    {
      id: "not-dismissible",
      title: "Not dismissible",
      description:
        "With dismissible false the close button, backdrop click, and Escape do not close the sheet.",
      render: () => (
        <RLSlideover triggerLabel="Open" title="Locked" dismissible={false}>
          <p class="text-sm text-muted">This sheet only closes programmatically.</p>
        </RLSlideover>
      ),
    },
    {
      id: "keep-mounted",
      title: "Keep mounted",
      description:
        "With unmountOnHide false the content stays in the DOM while the sheet is closed.",
      render: () => (
        <RLSlideover triggerLabel="Open" title="Kept mounted" unmountOnHide={false}>
          <p class="text-sm text-muted">Content persists between opens.</p>
        </RLSlideover>
      ),
    },
    {
      id: "inline",
      title: "Inline rendering",
      description: "With portal false the sheet renders in place instead of in document.body.",
      render: () => (
        <div class="relative h-64 overflow-hidden rounded-xl border border-default p-4">
          <RLSlideover triggerLabel="Open" title="Inline" portal={false}>
            <p class="text-sm text-muted">Rendered inside its container.</p>
          </RLSlideover>
        </div>
      ),
    },
    {
      id: "controlled",
      title: "Controlled open state",
      description: "The open prop and onOpenChange drive the sheet from outside.",
      render: () => {
        const [open, setOpen] = createSignal(false);
        return (
          <div class="flex flex-col items-start gap-3">
            <RLButton variant="outline" color="neutral" size="sm" onClick={() => setOpen(true)}>
              Open from outside
            </RLButton>
            <Show when={open()}>
              <p class="text-sm text-muted">Sheet is open.</p>
            </Show>
            <RLSlideover
              title="Controlled"
              open={open()}
              onOpenChange={setOpen}
              triggerLabel="Trigger"
            >
              <p class="text-sm text-muted">Open state is owned by the parent.</p>
            </RLSlideover>
          </div>
        );
      },
    },
  ],
};
