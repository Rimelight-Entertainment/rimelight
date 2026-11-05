import { createSignal } from "solid-js";
import type { JSX } from "@solidjs/web";
import { RLForm } from "@rimelight/ui/components/form/RLForm.tsx";
import { RLInput } from "@rimelight/ui/components/input/RLInput.tsx";
import type { ComponentAuditDefinition } from "./types";

export const FormSandbox = (): JSX.Element => {
  const [submitted, setSubmitted] = createSignal("not submitted");

  return (
    <div class="flex flex-col gap-4">
      <RLForm
        onSubmit={(e) => {
          e.preventDefault();
          setSubmitted("submitted");
        }}
      >
        <RLInput name="email" type="email" placeholder="you@example.com" required={true} />
        <button type="submit" class="rounded-md border border-default px-3 py-1 text-sm">
          Submit
        </button>
      </RLForm>
      <span class="text-xs">{submitted()}</span>
    </div>
  );
};

export const formAudit: ComponentAuditDefinition = {
  id: "form",
  name: "Form",
  category: "Form & Input",
  status: "Auditing",
  description:
    "Native form element with vertical spacing between children and an onSubmit handler that receives the submit event.",
  importPath: "@rimelight/ui/components/form/RLForm.tsx",
  renderSandbox: () => <FormSandbox />,
  testScenarios: [
    {
      id: "default-slot",
      title: "Default slot children",
      description: "Form fields and a submit button passed as children.",
      render: () => (
        <RLForm>
          <RLInput name="name" placeholder="Name" />
          <button type="submit" class="rounded-md border border-default px-3 py-1 text-sm">
            Save
          </button>
        </RLForm>
      ),
    },
    {
      id: "on-submit",
      title: "onSubmit handler",
      description: "onSubmit prevents the native navigation and logs the submit event type.",
      render: () => (
        <RLForm
          onSubmit={(e) => {
            e.preventDefault();
            console.info("form submit", e.type);
          }}
        >
          <RLInput name="query" placeholder="Search" />
          <button type="submit" class="rounded-md border border-default px-3 py-1 text-sm">
            Search
          </button>
        </RLForm>
      ),
    },
  ],
};
