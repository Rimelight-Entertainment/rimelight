import { createMemo, Show, type Component } from "solid-js";

import { createControllable } from "../../controllable";
import { DEFAULT_COLOR_HEX } from "../../constants/color";
import { uiT } from "../../locale";
import { clamp } from "../color-picker/color";
import { RLColorSliderTheme } from "./color-slider.theme";
import {
  keyboardTarget,
  thumbPercent,
  trackGradient,
  valueAtFraction,
  writeChannel,
  readChannel,
} from "./color-slider.helpers";
import type { RLColorSliderProps } from "./color-slider.types";

const OMIT_KEYS = [
  "channel",
  "colorSpace",
  "value",
  "defaultValue",
  "disabled",
  "inverted",
  "name",
  "orientation",
  "step",
  "aria-label",
  "aria-labelledby",
  "aria-describedby",
  "onValueChange",
  "onValueChangeEnd",
] as const;

export const RLColorSlider: Component<RLColorSliderProps> = (props) => {
  const { Tag, classes, rest, children, theme } = RLColorSliderTheme.setup(props, {
    omit: OMIT_KEYS,
  });

  let trackRef: HTMLDivElement | undefined;
  let isDragging = false;

  const colorSpace = () => props.colorSpace ?? "hsl";
  const orientation = () => props.orientation ?? "horizontal";
  const horizontal = () => orientation() === "horizontal";
  const step = () => props.step ?? 1;

  const [currentHex, setCurrentHex] = createControllable(
    () => props.value,
    props.defaultValue ?? DEFAULT_COLOR_HEX,
    (next) => props.onValueChange?.(next),
  );

  const channelValue = () => readChannel(currentHex(), props.channel, colorSpace());
  const thumbPos = createMemo(() =>
    thumbPercent(currentHex(), props.channel, colorSpace(), props.inverted ?? false),
  );

  const thumbStyle = createMemo(() => {
    const pct = `${thumbPos()}%`;
    const thumbColor = currentHex();
    return horizontal()
      ? { "--rl-thumb-x": pct, "--rl-thumb-y": "50%", "--rl-thumb-bg": thumbColor }
      : { "--rl-thumb-x": "50%", "--rl-thumb-y": pct, "--rl-thumb-bg": thumbColor };
  });

  const updateColor = (newHex: string, isFinal: boolean) => {
    setCurrentHex(newHex);
    if (isFinal) props.onValueChangeEnd?.(newHex);
  };

  const updateFromPointer = (clientX: number, clientY: number, isFinal = false) => {
    if (!trackRef || props.disabled) return;
    const rect = trackRef.getBoundingClientRect();
    let fraction = horizontal()
      ? clamp((clientX - rect.left) / rect.width, 0, 1)
      : 1 - clamp((clientY - rect.top) / rect.height, 0, 1);
    if (props.inverted) fraction = 1 - fraction;
    const value = valueAtFraction(props.channel, fraction, step());
    updateColor(writeChannel(currentHex(), props.channel, colorSpace(), value), isFinal);
  };

  const handlePointerDown = (e: PointerEvent) => {
    if (props.disabled) return;
    isDragging = true;
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    updateFromPointer(e.clientX, e.clientY);
  };

  const handlePointerMove = (e: PointerEvent) => {
    if (!isDragging) return;
    updateFromPointer(e.clientX, e.clientY);
  };

  const handlePointerUp = (e: PointerEvent) => {
    if (!isDragging) return;
    isDragging = false;
    try {
      (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
    } catch {
      // Pointer capture may already be released by the browser.
    }
    updateFromPointer(e.clientX, e.clientY, true);
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if (props.disabled) return;
    const stepSize = step() * (e.shiftKey ? 10 : 1);
    const next = keyboardTarget(e.key, horizontal(), props.channel, channelValue(), stepSize);
    if (next === undefined) return;
    e.preventDefault();
    updateColor(writeChannel(currentHex(), props.channel, colorSpace(), next), true);
  };

  return (
    <Tag
      data-slot="root"
      data-theme={theme()}
      class={classes().root}
      data-channel={props.channel}
      data-color-space={colorSpace()}
      data-orientation={orientation()}
      data-value={currentHex()}
      data-disabled={props.disabled ? "" : undefined}
      data-inverted={props.inverted ? "" : undefined}
      {...rest}
    >
      <div
        ref={(el) => (trackRef = el)}
        data-slot="track"
        class={classes().track}
        style={{
          "--rl-slider-track": trackGradient(
            currentHex(),
            props.channel,
            colorSpace(),
            horizontal(),
          ),
        }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
      >
        <div
          data-slot="thumb"
          role="slider"
          class={classes().thumb}
          style={{
            "--rl-thumb-x": thumbStyle()["--rl-thumb-x"],
            "--rl-thumb-y": thumbStyle()["--rl-thumb-y"],
            "--rl-thumb-bg": thumbStyle()["--rl-thumb-bg"],
          }}
          tabindex={props.disabled ? -1 : 0}
          aria-label={props["aria-label"] ?? uiT("color-slider.thumb")}
          aria-labelledby={props["aria-labelledby"]}
          aria-describedby={props["aria-describedby"]}
          aria-disabled={props.disabled ? "true" : undefined}
          onKeyDown={handleKeyDown}
        />
      </div>
      {children()}
      <Show when={props.name}>
        <input type="hidden" name={props.name} value={currentHex()} data-main-input />
      </Show>
    </Tag>
  );
};
