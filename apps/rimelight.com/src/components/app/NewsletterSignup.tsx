import type { Component } from "solid-js";
import { RLForm } from "@rimelight/ui/components/form/RLForm.tsx";
import { RLFormField } from "@rimelight/ui/components/form-field/RLFormField.tsx";
import { RLFieldGroup } from "@rimelight/ui/components/field-group/RLFieldGroup.tsx";
import { RLInput } from "@rimelight/ui/components/input/RLInput.tsx";
import { RLButton } from "@rimelight/ui/components/button/RLButton.tsx";

export interface NewsletterSignupProps {
  title?: string;
  fieldLabel?: string;
  description?: string;
  placeholder?: string;
  submit?: string;
  buttonLabel?: string;
  rc?: {
    group?: string;
    label?: string;
    description?: string;
    input?: string;
    button?: string;
  };
}

export const NewsletterSignup: Component<NewsletterSignupProps> = (props) => {
  const resolvedFieldLabel = () => props.title ?? props.fieldLabel ?? "Subscribe to our Newsletter";
  const resolvedButtonLabel = () => props.submit ?? props.buttonLabel ?? "Subscribe";
  const resolvedDescription = () =>
    props.description ?? "Stay updated on new posts and updates. Unsubscribe at any time.";

  return (
    <RLForm>
      <RLFormField
        name="email"
        label={resolvedFieldLabel()}
        description={resolvedDescription()}
        class={`${props.rc?.label || ""} ${props.rc?.description || ""}`}
      >
        <RLFieldGroup class={`pt-2 ${props.rc?.group || ""}`}>
          <RLInput
            type="email"
            placeholder={props.placeholder || "email@domain.com"}
            class={props.rc?.input}
          />
          <RLButton type="submit" label={resolvedButtonLabel()} class={props.rc?.button} />
        </RLFieldGroup>
      </RLFormField>
    </RLForm>
  );
};

export default NewsletterSignup;
