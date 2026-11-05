import type { JSX } from "@solidjs/web";
import { RLToaster } from "@rimelight/ui/components/toaster/RLToaster.tsx";
import { RLToast } from "@rimelight/ui/components/toast/RLToast.tsx";
import { type ComponentAuditDefinition } from "./types";

export const ToasterSandbox = (): JSX.Element => (
  <div class="flex flex-col gap-6">
    <p class="text-xs text-muted">
      The toaster is fixed to the bottom-right corner of the viewport. It renders queued toasts from
      the global store and only shows them when the store has entries. Its children are not
      rendered, so the default-slot scenario below documents that gap. The toast variants below
      render <code>RLToast</code> directly with the same props the toaster passes through, and they
      do not depend on the store.
    </p>
    <div class="p-8 rounded-xl border border-default bg-elevated/10 flex flex-col items-start justify-center gap-4">
      <RLToast
        title="Success"
        description="Saved."
        color="success"
        duration={0}
        dismissible={false}
      />
      <RLToast
        title="Error"
        description="Something failed."
        color="error"
        duration={0}
        dismissible={false}
      />
      <RLToast title="Info" description="FYI." color="info" duration={0} dismissible={false} />
      <RLToast
        title="Warning"
        description="Careful."
        color="warning"
        duration={0}
        dismissible={false}
      />
    </div>
    <RLToaster />
  </div>
);

export const toasterAudit: ComponentAuditDefinition = {
  id: "toaster",
  name: "Toaster",
  category: "Feedback",
  status: "Auditing",
  description:
    "A fixed, live region that renders queued toasts from the global toast store, with a bottom-right position. Toast variants are driven by color, with optional description and dismiss behavior.",
  importPath: "@rimelight/ui/components/toaster/RLToaster.tsx",
  renderSandbox: () => <ToasterSandbox />,
  testScenarios: [
    {
      id: "default-slot",
      title: "Default slot (children, known gap)",
      description:
        "Children are passed to RLToaster but are not rendered. The toaster renders only the global toast store. This scenario documents that gap.",
      render: () => <RLToaster>Ignored children</RLToaster>,
    },
    {
      id: "toast-success",
      title: "Toast: success",
      description: "Success intent with a description. Duration 0 keeps it open for inspection.",
      render: () => (
        <RLToast
          title="Success"
          description="Saved."
          color="success"
          duration={0}
          dismissible={false}
        />
      ),
    },
    {
      id: "toast-error",
      title: "Toast: error",
      description: "Error intent.",
      render: () => (
        <RLToast
          title="Error"
          description="Something failed."
          color="error"
          duration={0}
          dismissible={false}
        />
      ),
    },
    {
      id: "toast-info",
      title: "Toast: info",
      description: "Info intent.",
      render: () => (
        <RLToast title="Info" description="FYI." color="info" duration={0} dismissible={false} />
      ),
    },
    {
      id: "toast-warning",
      title: "Toast: warning",
      description: "Warning intent.",
      render: () => (
        <RLToast
          title="Warning"
          description="Careful."
          color="warning"
          duration={0}
          dismissible={false}
        />
      ),
    },
    {
      id: "toast-dismissible",
      title: "Toast: dismissible",
      description: "Close control present. Clicking it dismisses the toast and fires onDismiss.",
      render: () => (
        <RLToast
          title="Dismissible"
          description="Close me."
          color="primary"
          duration={0}
          onDismiss={() => {}}
        />
      ),
    },
  ],
};
