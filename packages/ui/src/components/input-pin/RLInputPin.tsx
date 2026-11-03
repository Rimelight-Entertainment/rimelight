import type { RLInputPinProps } from "./input-pin.types";
import { RLInputPinTheme } from "./input-pin.theme";
import { createMemo, For, type Component } from "solid-js";
import { RLInputTheme } from "../input/input.theme";
import { createControllable } from "../../controllable";
import { uiT } from "../../locale";

const OMIT_KEYS = [
  "length",
  "value",
  "defaultValue",
  "onValueChange",
  "name",
  "disabled",
  "required",
  "type",
  "onInput",
  "onKeyDown",
  "onComplete",
] as const;

export const RLInputPin: Component<RLInputPinProps> = (props) => {
  const { Tag, classes, rest, children, theme, ui } = RLInputPinTheme.setup(props, {
    omit: OMIT_KEYS,
  });

  const cellsClasses = createMemo(() => RLInputTheme({ size: props.size, ui: ui() }));

  const length = () => props.length ?? 4;
  const pinType = () => props.type ?? "numeric";
  const cells = createMemo(() => Array.from({ length: length() }));

  const [current, setCurrent] = createControllable<string>(
    () => props.value,
    props.defaultValue ?? "",
    (next) => props.onValueChange?.(next),
  );

  let pinRefs: Array<HTMLInputElement | undefined> = [];

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
    <Tag
      data-slot="root"
      data-theme={theme()}
      class={classes().root}
      {...rest}
      onChange={undefined}
    >
      <div
        role="group"
        aria-label={uiT("input-pin.label")}
        class={classes().group}
        data-slot="group"
      >
        <For each={cells()}>
          {(_, index) => (
            <div class={`${cellsClasses().root} ${classes().cell}`} data-slot="cell">
              <input
                ref={(el) => (pinRefs[index()] = el)}
                type="text"
                name={props.name ? `${props.name}-${index()}` : undefined}
                inputmode={pinType() === "numeric" ? "numeric" : "text"}
                autocomplete="one-time-code"
                maxlength={1}
                value={current()[index()] ?? ""}
                disabled={props.disabled}
                required={props.required}
                aria-label={uiT("input-pin.digitLabel").replace("{n}", String(index() + 1))}
                class={`${cellsClasses().input} ${classes().input}`}
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
      {children()}
    </Tag>
  );
};
