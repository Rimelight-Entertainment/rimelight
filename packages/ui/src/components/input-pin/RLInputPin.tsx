import { createMemo, createSignal, omit, For, type Component } from "solid-js";
import type { RLInputPinProps } from "./input-pin";
import { inputPinTheme } from "./input-pin.theme";
import { inputTheme } from "../input/input.theme";

export const RLInputPin: Component<RLInputPinProps> = (allProps) => {
  const props = allProps;
  const rest = omit(
    allProps,
    "children",
    "length",
    "value",
    "defaultValue",
    "name",
    "disabled",
    "required",
    "type",
    "size",
    "ui",
    "class",
    "onInput",
    "onChange",
    "onKeyDown",
    "onComplete",
  );

  const resolvedClasses = createMemo(() =>
    inputPinTheme({
      ui: props.ui,
      class: props.class,
    }),
  );

  const cellsClasses = createMemo(() =>
    inputTheme({
      variant: "default",
      size: props.size ?? "md",
      error: false,
      ui: props.ui,
    }),
  );

  const length = () => props.length ?? 4;
  const pinType = () => props.type ?? "numeric";

  const initial = (props.value ?? props.defaultValue ?? "").split("");
  const cells = createMemo(() => Array.from({ length: length() }));

  const [current, setCurrent] = createSignal<string>(props.value ?? props.defaultValue ?? "");

  let pinRefs: Array<HTMLInputElement | undefined> = [];

  const setCellRef = (el: HTMLInputElement | undefined, index: number) => {
    pinRefs[index] = el;
  };

  const focusCell = (index: number) => {
    const el = pinRefs[index];
    if (el) {
      el.focus();
      el.select();
    }
  };

  const handleInput = (e: InputEvent & { currentTarget: HTMLInputElement }, index: number) => {
    const input = e.currentTarget;
    let digit = input.value;
    if (pinType() === "numeric") {
      digit = digit.replace(/[^0-9]/g, "");
    } else if (pinType() === "alphanumeric") {
      digit = digit.replace(/[^0-9a-zA-Z]/g, "");
    } else {
      digit = digit.replace(/[^0-9]/g, "");
    }
    digit = digit.slice(-1);
    input.value = digit;
    const next = current().slice(0, index) + digit + current().slice(index + 1);
    setCurrent(next);
    props.onInput?.(e);
    props.onChange?.(e);
    if (digit) {
      if (index < length() - 1) {
        focusCell(index + 1);
      } else if (next.length === length()) {
        props.onComplete?.(next);
      }
    }
  };

  const handleKeyDown = (e: KeyboardEvent & { currentTarget: HTMLInputElement }, index: number) => {
    props.onKeyDown?.(e);
    const input = e.currentTarget;
    if (e.key === "Backspace" && input.value === "") {
      e.preventDefault();
      if (index > 0) focusCell(index - 1);
    } else if (e.key === "ArrowLeft") {
      e.preventDefault();
      if (index > 0) focusCell(index - 1);
    } else if (e.key === "ArrowRight") {
      e.preventDefault();
      if (index < length() - 1) focusCell(index + 1);
    }
  };

  const handlePaste = (e: ClipboardEvent, index: number) => {
    const pasted = (e.clipboardData?.getData("text") ?? "")
      .replace(pinType() === "numeric" ? /[^0-9]/g : /[^0-9a-zA-Z]/g, "")
      .slice(0, length());
    if (!pasted) return;
    e.preventDefault();
    const next = current().split("");
    for (let i = 0; i < pasted.length; i++) {
      const char = pasted[i];
      if (char !== undefined && index + i < length()) next[index + i] = char;
    }
    const joined = next.join("");
    setCurrent(joined);
    const endIndex = Math.min(index + pasted.length, length() - 1);
    const endEl = pinRefs[endIndex];
    if (endEl) {
      endEl.value = joined[endIndex] ?? "";
      endEl.focus();
    }
    if (joined.length === length()) props.onComplete?.(joined);
  };

  return (
    <div class={resolvedClasses().root} data-slot="root" {...rest}>
      <div
        role="group"
        aria-label="One-time code"
        class="flex items-center gap-2"
        data-slot="group"
      >
        <For each={cells()}>
          {(_, index) => (
            <div
              class={`${cellsClasses().root} w-12 h-12 flex items-center justify-center rounded-md`}
              data-slot="cell"
            >
              <input
                ref={(el) => setCellRef(el, index())}
                type="text"
                name={props.name ? `${props.name}-${index()}` : undefined}
                inputmode={pinType() === "numeric" ? "numeric" : "text"}
                autocomplete="one-time-code"
                maxlength={1}
                value={initial[index()] ?? ""}
                disabled={props.disabled}
                required={props.required}
                aria-label={`Digit ${index() + 1}`}
                class={`${cellsClasses().input} w-full text-center`}
                data-slot="input"
                onInput={(e) =>
                  handleInput(e as InputEvent & { currentTarget: HTMLInputElement }, index())
                }
                onKeyDown={(e) =>
                  handleKeyDown(e as KeyboardEvent & { currentTarget: HTMLInputElement }, index())
                }
                onPaste={(e) => handlePaste(e, index())}
              />
            </div>
          )}
        </For>
      </div>
      {props.children}
    </div>
  );
};
