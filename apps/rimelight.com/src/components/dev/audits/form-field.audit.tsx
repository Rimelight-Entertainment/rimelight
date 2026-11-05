import { createSignal, For } from "solid-js";
import type { JSX } from "@solidjs/web";
import { RLFormField } from "@rimelight/ui/components/form-field/RLFormField.tsx";
import { RLInput } from "@rimelight/ui/components/input/RLInput.tsx";
import type { ComponentAuditDefinition } from "./types";

const SIZES = ["xs", "sm", "md", "lg", "xl"] as const;

export const FormFieldSandbox = (): JSX.Element => {
  const [size, setSize] = createSignal<(typeof SIZES)[number]>("md");
  const [required, setRequired] = createSignal(false);
  const [error, setError] = createSignal(false);

  return (
    <div class="flex flex-col gap-4">
      <div class="flex flex-wrap gap-2 text-xs">
        <For each={SIZES}>
          {(s) => (
            <button type="button" onClick={() => setSize(s)}>
              size: {s}
            </button>
          )}
        </For>
        <button type="button" onClick={() => setRequired((v) => !v)}>
          required: {String(required())}
        </button>
        <button type="button" onClick={() => setError((v) => !v)}>
          error: {String(error())}
        </button>
      </div>
      <RLFormField
        id="sandbox-email"
        label="Email"
        description="We will never share your email."
        error={error() ? "Enter a valid email address." : undefined}
        required={required()}
        size={size()}
      >
        <RLInput id="sandbox-email" type="email" placeholder="you@example.com" />
      </RLFormField>
    </div>
  );
};

export const formFieldAudit: ComponentAuditDefinition = {
  id: "form-field",
  name: "Form Field",
  category: "Form & Input",
  status: "Auditing",
  description:
    "Labels a form control with a description, an error message, required marker, and help or hint text.",
  importPath: "@rimelight/ui/components/form-field/RLFormField.tsx",
  renderSandbox: () => <FormFieldSandbox />,
  testScenarios: [
    {
      id: "default-slot",
      title: "Default slot children (control)",
      description: "The control is passed as children.",
      render: () => (
        <RLFormField id="default-slot-field" label="Name">
          <RLInput id="default-slot-field" placeholder="Name" />
        </RLFormField>
      ),
    },
    {
      id: "label-slot",
      title: "labelSlot slot",
      description: "Passes a custom label element in place of the label prop.",
      render: () => (
        <RLFormField
          id="label-slot-field"
          labelSlot={<span class="font-semibold">Custom label</span>}
        >
          <RLInput id="label-slot-field" placeholder="Custom label" />
        </RLFormField>
      ),
    },
    {
      id: "description-slot",
      title: "descriptionSlot slot",
      description: "Passes a custom description element in place of the description prop.",
      render: () => (
        <RLFormField
          id="description-slot-field"
          label="Website"
          descriptionSlot={
            <span>
              Include <code>https://</code>.
            </span>
          }
        >
          <RLInput id="description-slot-field" placeholder="https://" />
        </RLFormField>
      ),
    },
    {
      id: "error-slot",
      title: "errorSlot slot",
      description: "Passes a custom error element. Renders when error is set.",
      render: () => (
        <RLFormField
          id="error-slot-field"
          label="Username"
          error="unused"
          errorSlot={<span>Custom error node</span>}
        >
          <RLInput id="error-slot-field" placeholder="Username" />
        </RLFormField>
      ),
    },
    {
      id: "help-slot",
      title: "helpSlot slot",
      description: "Passes a help element below the control.",
      render: () => (
        <RLFormField
          id="help-slot-field"
          label="Password"
          helpSlot={<span>Use at least 12 characters.</span>}
        >
          <RLInput id="help-slot-field" type="password" />
        </RLFormField>
      ),
    },
    {
      id: "hint-slot",
      title: "hintSlot slot",
      description: "Passes a hint element below the control.",
      render: () => (
        <RLFormField
          id="hint-slot-field"
          label="Coupon"
          hintSlot={<span>Optional. Case sensitive.</span>}
        >
          <RLInput id="hint-slot-field" placeholder="CODE" />
        </RLFormField>
      ),
    },
    {
      id: "required-and-error",
      title: "required and error props",
      description: "Required marker and an error message with the error prop.",
      render: () => (
        <RLFormField id="required-field" label="Email" required={true} error="Email is required.">
          <RLInput id="required-field" type="email" required={true} />
        </RLFormField>
      ),
    },
    {
      id: "sizes",
      title: "Size variants",
      description: "Renders each size variant xs through xl.",
      render: () => (
        <div class="flex flex-col gap-3">
          <For each={SIZES}>
            {(s) => (
              <RLFormField id={`size-${s}`} label={`Size ${s}`} size={s}>
                <RLInput id={`size-${s}`} placeholder={`Size ${s}`} />
              </RLFormField>
            )}
          </For>
        </div>
      ),
    },
  ],
};
