import { createSignal, For } from "solid-js";
import type { JSX } from "@solidjs/web";
import { RLTextarea } from "@rimelight/ui/components/textarea/RLTextarea.tsx";
import type { ComponentAuditDefinition } from "./types";

const SIZES = ["xs", "sm", "md", "lg", "xl"] as const;

export const TextareaSandbox = (): JSX.Element => {
  const [size, setSize] = createSignal<(typeof SIZES)[number]>("md");
  const [invalid, setInvalid] = createSignal(false);
  const [disabled, setDisabled] = createSignal(false);
  const [readonly, setReadonly] = createSignal(false);
  const [autoGrow, setAutoGrow] = createSignal(false);
  const [rows, setRows] = createSignal(4);

  return (
    <div class="flex flex-col gap-6">
      {/* Control Toolbar */}
      <div class="p-4 rounded-xl border border-default bg-elevated/20 flex flex-wrap items-center gap-4 text-xs">
        <div class="flex items-center gap-2">
          <span class="font-semibold text-muted">Size</span>
          <For each={SIZES}>
            {(option) => (
              <button
                type="button"
                class={`px-2 py-1 rounded border border-default ${size() === option ? "bg-elevated" : ""}`}
                onClick={() => setSize(option)}
              >
                {option}
              </button>
            )}
          </For>
        </div>
        <div class="flex items-center gap-2">
          <span class="font-semibold text-muted">Rows</span>
          <button
            type="button"
            class="px-2 py-1 rounded border border-default"
            onClick={() => setRows((current) => Math.max(1, current - 1))}
          >
            -
          </button>
          <span>{rows()}</span>
          <button
            type="button"
            class="px-2 py-1 rounded border border-default"
            onClick={() => setRows((current) => current + 1)}
          >
            +
          </button>
        </div>
        <label class="flex items-center gap-1">
          <input
            type="checkbox"
            checked={invalid()}
            onChange={(event) => setInvalid(event.currentTarget.checked)}
          />
          invalid
        </label>
        <label class="flex items-center gap-1">
          <input
            type="checkbox"
            checked={disabled()}
            onChange={(event) => setDisabled(event.currentTarget.checked)}
          />
          disabled
        </label>
        <label class="flex items-center gap-1">
          <input
            type="checkbox"
            checked={readonly()}
            onChange={(event) => setReadonly(event.currentTarget.checked)}
          />
          readonly
        </label>
        <label class="flex items-center gap-1">
          <input
            type="checkbox"
            checked={autoGrow()}
            onChange={(event) => setAutoGrow(event.currentTarget.checked)}
          />
          autoGrow
        </label>
      </div>

      {/* Preview Area */}
      <div class="p-8 rounded-xl border border-default bg-elevated/10 w-full max-w-md">
        <RLTextarea
          size={size()}
          rows={rows()}
          invalid={invalid()}
          disabled={disabled()}
          readonly={readonly()}
          autoGrow={autoGrow()}
          placeholder="Write something"
        />
      </div>
    </div>
  );
};

const ControlledExample = (): JSX.Element => {
  const [value, setValue] = createSignal("Controlled text");
  return <RLTextarea value={value()} onValueChange={setValue} />;
};

export const textareaAudit: ComponentAuditDefinition = {
  id: "textarea",
  name: "Textarea",
  category: "Form & Input",
  status: "Auditing",
  description:
    "A multi-line native textarea with size variants, invalid styling, optional auto-grow, and controlled or uncontrolled value.",
  importPath: "@rimelight/ui/components/textarea/RLTextarea.tsx",
  renderSandbox: () => <TextareaSandbox />,
  testScenarios: [
    {
      id: "default",
      title: "Default",
      description: "Four visible rows with the medium size.",
      render: () => <RLTextarea placeholder="Default textarea" />,
    },
    {
      id: "sizes",
      title: "Size variants",
      description: "All size variants from xs to xl.",
      render: () => (
        <div class="flex flex-col gap-4 w-full max-w-md">
          <For each={SIZES}>
            {(option) => <RLTextarea size={option} placeholder={`Size ${option}`} />}
          </For>
        </div>
      ),
    },
    {
      id: "rows",
      title: "Custom row count",
      description: "The rows prop sets the visible line count.",
      render: () => <RLTextarea rows={8} placeholder="Eight rows" />,
    },
    {
      id: "auto-grow",
      title: "Auto-grow",
      description: "Grows with its content instead of scrolling; the rows prop is ignored.",
      render: () => <RLTextarea autoGrow placeholder="Type several lines to grow" />,
    },
    {
      id: "invalid",
      title: "Invalid",
      description: "Error border and focus ring with aria-invalid set.",
      render: () => <RLTextarea invalid defaultValue="This value is not valid" />,
    },
    {
      id: "disabled",
      title: "Disabled",
      description: "Disabled field that cannot be edited.",
      render: () => <RLTextarea disabled defaultValue="Disabled text" />,
    },
    {
      id: "readonly",
      title: "Read-only",
      description: "Read-only field that shows its value without editing.",
      render: () => <RLTextarea readonly defaultValue="Read-only text" />,
    },
    {
      id: "uncontrolled",
      title: "Uncontrolled default value",
      description: "Starts from defaultValue and keeps its own state.",
      render: () => <RLTextarea defaultValue="Uncontrolled starting text" />,
    },
    {
      id: "controlled",
      title: "Controlled value",
      description: "Value owned by the parent and updated through onValueChange.",
      render: () => <ControlledExample />,
    },
  ],
};
