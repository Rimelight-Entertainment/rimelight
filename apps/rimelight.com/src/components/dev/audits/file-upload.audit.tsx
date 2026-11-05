import { createSignal } from "solid-js";
import type { JSX } from "@solidjs/web";
import { RLFileUpload } from "@rimelight/ui/components/file-upload/RLFileUpload.tsx";
import type { ComponentAuditDefinition } from "./types";

export const FileUploadSandbox = (): JSX.Element => {
  const [disabled, setDisabled] = createSignal(false);
  const [multiple, setMultiple] = createSignal(true);

  return (
    <div class="flex flex-col gap-6">
      <div class="p-4 rounded-xl border border-default bg-elevated/20 flex flex-wrap items-center gap-4 text-xs">
        <label class="flex items-center gap-2">
          <input
            type="checkbox"
            checked={disabled()}
            onChange={(e) => setDisabled(e.currentTarget.checked)}
          />
          {"disabled"}
        </label>
        <label class="flex items-center gap-2">
          <input
            type="checkbox"
            checked={multiple()}
            onChange={(e) => setMultiple(e.currentTarget.checked)}
          />
          {"multiple"}
        </label>
      </div>

      <div class="p-8 rounded-xl border border-default bg-elevated/10 flex items-center justify-center">
        <RLFileUpload
          accept="image/*,application/pdf"
          multiple={multiple()}
          disabled={disabled()}
          description="Images or PDFs up to 10 MB"
          class="max-w-md"
        />
      </div>
    </div>
  );
};

export const fileUploadAudit: ComponentAuditDefinition = {
  id: "file-upload",
  name: "File Upload",
  category: "Form & Input",
  status: "Auditing",
  description:
    "A click-or-drop target that opens a native file picker, accepts dropped files, reports the selection through onValueChange, shows the selected file name or count, and supports accept, multiple, disabled, title, description, icon, and iconSlot.",
  importPath: "@rimelight/ui/components/file-upload/RLFileUpload.tsx",
  renderSandbox: () => <FileUploadSandbox />,
  testScenarios: [
    {
      id: "default-slot",
      title: "Default slot (children)",
      description: "Children replace the default title, description, and accept hint.",
      render: () => (
        <RLFileUpload accept="image/*" class="max-w-md">
          <p class="text-sm text-muted">{"Drop your avatar here"}</p>
        </RLFileUpload>
      ),
    },
    {
      id: "icon-slot",
      title: "Icon slot",
      description:
        "Custom icon content replaces the default cloud-upload icon. The title still renders.",
      render: () => (
        <RLFileUpload
          title="Upload a document"
          description="PDF only"
          accept="application/pdf"
          class="max-w-md"
          iconSlot={<span class="text-2xl font-semibold">{"PDF"}</span>}
        />
      ),
    },
  ],
  checklist: [
    {
      criterion: "Slot pattern parity (iconSlot, default children)",
      status: "pending",
    },
    {
      criterion: "Keyboard activation (Enter and Space open the picker) and disabled state",
      status: "pending",
    },
    {
      criterion: "Drag-over highlighting and file name or count feedback via aria-live",
      status: "pending",
    },
  ],
};
