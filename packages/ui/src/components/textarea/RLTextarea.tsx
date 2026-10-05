import { createMemo, omit, type Component } from "solid-js";
import type { RLTextareaProps } from "./textarea.types";
import { textareaTheme } from "./textarea.theme";

export const RLTextarea: Component<RLTextareaProps> = (allProps) => {
  const props = allProps;
  const rest = omit(
    allProps,
    "value",
    "placeholder",
    "disabled",
    "readonly",
    "name",
    "required",
    "rows",
    "autoGrow",
    "error",
    "size",
    "color",
    "ui",
    "class",
    "onInput",
    "onChange",
    "onBlur",
    "onFocus",
    "onKeyDown",
    "ref",
  );

  const resolvedClasses = createMemo(() =>
    textareaTheme({
      size: props.size ?? "md",
      error: !!props.error,
      ui: props.ui,
      class: props.class,
    }),
  );

  return (
    <div class={resolvedClasses().root} data-slot="root">
      <textarea
        ref={props.ref}
        name={props.name}
        rows={props.autoGrow ? undefined : (props.rows ?? 4)}
        style={props.autoGrow ? "field-sizing: content; min-height: unset;" : undefined}
        value={props.value !== undefined ? props.value : ""}
        placeholder={props.placeholder}
        disabled={props.disabled}
        readonly={props.readonly}
        required={props.required}
        class={resolvedClasses().textarea}
        data-slot="textarea"
        onInput={props.onInput}
        onChange={props.onChange}
        onBlur={props.onBlur}
        onFocus={props.onFocus}
        onKeyDown={props.onKeyDown}
        {...rest}
      />
    </div>
  );
};
