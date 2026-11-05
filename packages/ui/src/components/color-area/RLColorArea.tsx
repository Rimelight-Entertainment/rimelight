import type { Component } from "solid-js";
import type { RLColorAreaProps } from "./color-area.types";
import { RLColorAreaTheme } from "./color-area.theme";
import { createMemo, createSignal, Show } from "solid-js";
import { uiT } from "../../locale";
import { createControllable } from "../../controllable";
import {
  clamp,
  getChannelRange,
  hexToRgb,
  hslToRgb,
  hsbToRgb,
  rgbToHex,
  rgbToHsb,
  rgbToHsl,
} from "../color-picker/color";

const OMIT_KEYS = [
  "colorSpace",
  "defaultValue",
  "value",
  "disabled",
  "name",
  "xChannel",
  "xName",
  "yChannel",
  "yName",
  "onValueChange",
  "onValueChangeEnd",
] as const;

type Channel = NonNullable<RLColorAreaProps["xChannel"]>;

interface ChannelState {
  hue: number;
  sat: number;
  light: number;
  bright: number;
  red: number;
  green: number;
  blue: number;
}

export const RLColorArea: Component<RLColorAreaProps> = (props) => {
  const { Tag, classes, rest, children, theme } = RLColorAreaTheme.setup(props, {
    omit: OMIT_KEYS,
  });

  const colorSpace = () => props.colorSpace ?? "hsl";
  const xChannel = (): Channel => props.xChannel ?? "saturation";
  const yChannel = (): Channel => props.yChannel ?? "lightness";

  const [value, setValue] = createControllable(
    () => props.value,
    props.defaultValue ?? "#ff0000",
    (next) => props.onValueChange?.(next),
  );
  const [isDragging, setIsDragging] = createSignal(false);
  let areaRef: HTMLDivElement | undefined;

  const syncChannelsFromValue = (hex: string, currentHue = 0): ChannelState => {
    const rgb = hexToRgb(hex);
    const hsl = rgbToHsl(rgb[0], rgb[1], rgb[2]);
    const hsb = rgbToHsb(rgb[0], rgb[1], rgb[2]);
    const max = Math.max(rgb[0], rgb[1], rgb[2]);
    const min = Math.min(rgb[0], rgb[1], rgb[2]);
    return {
      hue: max !== min ? hsl[0] : currentHue,
      sat: hsl[1],
      light: hsl[2],
      bright: hsb[2],
      red: rgb[0],
      green: rgb[1],
      blue: rgb[2],
    };
  };

  const [state, setState] = createSignal<ChannelState>((prev) =>
    syncChannelsFromValue(value(), prev?.hue ?? 0),
  );

  const channelValue = (ch: Channel, s: ChannelState): number => {
    switch (ch) {
      case "hue":
        return s.hue;
      case "saturation":
        return s.sat;
      case "lightness":
        return s.light;
      case "brightness":
        return s.bright;
      case "red":
        return s.red;
      case "green":
        return s.green;
      case "blue":
        return s.blue;
      default:
        return 0;
    }
  };

  const pctX = createMemo(() => {
    const ch = xChannel();
    const range = getChannelRange(ch);
    const s = state();
    return ((channelValue(ch, s) - range.min) / (range.max - range.min)) * 100;
  });

  const pctY = createMemo(() => {
    const ch = yChannel();
    const range = getChannelRange(ch);
    const s = state();
    return 100 - ((channelValue(ch, s) - range.min) / (range.max - range.min)) * 100;
  });

  const xVal = createMemo(() => channelValue(xChannel(), state()));
  const yVal = createMemo(() => channelValue(yChannel(), state()));

  const areaStyle = createMemo(() => {
    const hueVal = state().hue;
    const cs = colorSpace();
    const xCh = xChannel();
    const yCh = yChannel();
    let background: string;
    if (cs === "hsl" && xCh === "saturation" && yCh === "lightness") {
      background =
        "linear-gradient(to top, #000 0%, transparent 50%, #fff 100%), linear-gradient(to right, #808080 0%, transparent 100%), hsl(" +
        hueVal +
        ", 100%, 50%)";
    } else if (cs === "hsb" && xCh === "saturation" && yCh === "brightness") {
      background =
        "linear-gradient(to top, #000 0%, transparent 100%), linear-gradient(to right, #fff 0%, transparent 100%), hsl(" +
        hueVal +
        ", 100%, 50%)";
    } else {
      background = `hsl(${hueVal}, 100%, 50%)`;
    }
    return { "--rl-area-bg": background };
  });

  const applyChannelValues = (newX: number, newY: number) => {
    const cur = state();
    let hue = cur.hue;
    let saturation = cur.sat;
    let lightness = cur.light;
    let brightness = cur.bright;
    let r = cur.red;
    let g = cur.green;
    let b = cur.blue;

    let newRgb: [number, number, number] = [r, g, b];
    const cs = colorSpace();
    const xCh = xChannel();
    const yCh = yChannel();

    if (cs === "hsl") {
      if (xCh === "saturation") saturation = newX;
      if (yCh === "lightness") lightness = newY;
      if (xCh === "lightness") lightness = newX;
      if (yCh === "saturation") saturation = newY;
      if (xCh === "hue") hue = newX;
      if (yCh === "hue") hue = newY;
      newRgb = hslToRgb(hue, saturation, lightness);
    } else if (cs === "hsb") {
      if (xCh === "saturation") saturation = newX;
      if (yCh === "brightness") brightness = newY;
      if (xCh === "brightness") brightness = newX;
      if (yCh === "saturation") saturation = newY;
      if (xCh === "hue") hue = newX;
      if (yCh === "hue") hue = newY;
      newRgb = hsbToRgb(hue, saturation, brightness);
    } else if (cs === "rgb") {
      if (xCh === "red") r = newX;
      if (yCh === "green") g = newY;
      if (xCh === "green") g = newX;
      if (yCh === "red") r = newY;
      if (xCh === "blue") b = newX;
      if (yCh === "blue") b = newY;
      newRgb = [r, g, b];
    }

    const newValue = rgbToHex(newRgb[0], newRgb[1], newRgb[2]);
    if (newValue !== value()) {
      setState({
        hue,
        sat: saturation,
        light: lightness,
        bright: brightness,
        red: newRgb[0],
        green: newRgb[1],
        blue: newRgb[2],
      });
      setValue(newValue);
    }
  };

  const applyPointer = (clientX: number, clientY: number) => {
    const area = areaRef;
    if (!area || props.disabled) return;
    const rect = area.getBoundingClientRect();
    const x = clamp((clientX - rect.left) / rect.width, 0, 1);
    const y = 1 - clamp((clientY - rect.top) / rect.height, 0, 1);

    const xRange = getChannelRange(xChannel());
    const yRange = getChannelRange(yChannel());
    const newX = Math.round(xRange.min + x * (xRange.max - xRange.min));
    const newY = Math.round(yRange.min + y * (yRange.max - yRange.min));
    applyChannelValues(newX, newY);
  };

  const handlePointerDown = (e: PointerEvent) => {
    if (props.disabled) return;
    setIsDragging(true);
    try {
      (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    } catch {}
    applyPointer(e.clientX, e.clientY);
  };

  const handlePointerMove = (e: PointerEvent) => {
    if (!isDragging()) return;
    applyPointer(e.clientX, e.clientY);
  };

  const handlePointerUp = (e: PointerEvent) => {
    if (!isDragging()) return;
    setIsDragging(false);
    try {
      (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
    } catch {}
    props.onValueChangeEnd?.(value());
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if (props.disabled) return;
    const isShift = e.shiftKey;
    const stepSize = isShift ? 10 : 1;
    const xRange = getChannelRange(xChannel());
    const yRange = getChannelRange(yChannel());
    let posX = xVal();
    let posY = yVal();
    let handled = false;

    if (e.key === "ArrowLeft") {
      posX = clamp(posX - stepSize, xRange.min, xRange.max);
      handled = true;
    } else if (e.key === "ArrowRight") {
      posX = clamp(posX + stepSize, xRange.min, xRange.max);
      handled = true;
    } else if (e.key === "ArrowUp") {
      posY = clamp(posY + stepSize, yRange.min, yRange.max);
      handled = true;
    } else if (e.key === "ArrowDown") {
      posY = clamp(posY - stepSize, yRange.min, yRange.max);
      handled = true;
    } else if (e.key === "Home") {
      posX = xRange.min;
      handled = true;
    } else if (e.key === "End") {
      posX = xRange.max;
      handled = true;
    }

    if (handled) {
      e.preventDefault();
      applyChannelValues(posX, posY);
    }
  };

  return (
    <Tag
      data-slot="root"
      data-theme={theme()}
      class={classes().root}
      data-color-space={colorSpace()}
      data-value={value()}
      data-x-channel={xChannel()}
      data-y-channel={yChannel()}
      data-disabled={props.disabled ? "true" : "false"}
      {...rest}
    >
      <div
        ref={(el) => (areaRef = el)}
        class={classes().area}
        data-slot="area"
        style={areaStyle()}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
      >
        <div
          class={classes().thumb}
          data-slot="thumb"
          role="slider"
          aria-label={uiT("color-area.thumb")}
          tabindex={0}
          style={{
            "--rl-thumb-x": `${pctX()}%`,
            "--rl-thumb-y": `${pctY()}%`,
            "--rl-thumb-bg": value(),
          }}
          onKeyDown={handleKeyDown}
        />
      </div>
      {children()}
      <Show when={props.name}>
        {(name) => <input type="hidden" name={name()} value={value()} data-main-input />}
      </Show>
      <Show when={props.xName}>
        {(xName) => <input type="hidden" name={xName()} value={xVal()} data-x-input />}
      </Show>
      <Show when={props.yName}>
        {(yName) => <input type="hidden" name={yName()} value={yVal()} data-y-input />}
      </Show>
    </Tag>
  );
};
