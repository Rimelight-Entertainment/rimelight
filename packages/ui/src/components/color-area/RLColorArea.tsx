import type { RLColorAreaProps } from "./color-area.types";
import { RLColorAreaTheme } from "./color-area.theme";
import { createEffect, createMemo, createSignal, omit, type Component } from "solid-js";

type Channel =
  | "hue"
  | "saturation"
  | "red"
  | "green"
  | "blue"
  | "alpha"
  | "lightness"
  | "brightness";

interface ChannelState {
  hue: number;
  sat: number;
  light: number;
  bright: number;
  red: number;
  green: number;
  blue: number;
}

const clamp = (val: number, min: number, max: number) => Math.max(min, Math.min(max, val));

const hexToRgb = (hex: string): [number, number, number] => {
  const shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
  const fullHex = hex.replace(shorthandRegex, (_, r, g, b) => r + r + g + g + b + b);
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(fullHex);
  return result
    ? [parseInt(result[1]!, 16), parseInt(result[2]!, 16), parseInt(result[3]!, 16)]
    : [0, 0, 0];
};

const toHex = (c: number): string => {
  const hex = Math.max(0, Math.min(255, c)).toString(16);
  return hex.length === 1 ? "0" + hex : hex;
};

const rgbToHex = (r: number, g: number, b: number): string => "#" + toHex(r) + toHex(g) + toHex(b);

const rgbToHsl = (r: number, g: number, b: number): [number, number, number] => {
  r /= 255;
  g /= 255;
  b /= 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      case b:
        h = (r - g) / d + 4;
        break;
    }
    h /= 6;
  }
  return [Math.round(h * 360), Math.round(s * 100), Math.round(l * 100)];
};

const hue2rgb = (p: number, q: number, t: number): number => {
  if (t < 0) t += 1;
  if (t > 1) t -= 1;
  if (t < 1 / 6) return p + (q - p) * 6 * t;
  if (t < 1 / 2) return q;
  if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
  return p;
};

const hslToRgb = (h: number, s: number, l: number): [number, number, number] => {
  h /= 360;
  s /= 100;
  l /= 100;
  let r = l;
  let g = l;
  let b = l;
  if (s !== 0) {
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = hue2rgb(p, q, h + 1 / 3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1 / 3);
  }
  return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
};

const rgbToHsb = (r: number, g: number, b: number): [number, number, number] => {
  r /= 255;
  g /= 255;
  b /= 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const v = max;
  const d = max - min;
  s = max === 0 ? 0 : d / max;
  if (max !== min) {
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      case b:
        h = (r - g) / d + 4;
        break;
    }
    h /= 6;
  }
  return [Math.round(h * 360), Math.round(s * 100), Math.round(v * 100)];
};

const hsbToRgb = (h: number, s: number, b: number): [number, number, number] => {
  h /= 360;
  s /= 100;
  b /= 100;
  let r = 0;
  let g = 0;
  let bl = 0;
  const i = Math.floor(h * 6);
  const f = h * 6 - i;
  const p = b * (1 - s);
  const q = b * (1 - f * s);
  const t = b * (1 - (1 - f) * s);
  switch (i % 6) {
    case 0:
      r = b;
      g = t;
      bl = p;
      break;
    case 1:
      r = q;
      g = b;
      bl = p;
      break;
    case 2:
      r = p;
      g = b;
      bl = t;
      break;
    case 3:
      r = p;
      g = q;
      bl = b;
      break;
    case 4:
      r = t;
      g = p;
      bl = b;
      break;
    case 5:
      r = b;
      g = p;
      bl = q;
      break;
  }
  return [Math.round(r * 255), Math.round(g * 255), Math.round(bl * 255)];
};

const getChannelRange = (channel: string): { min: number; max: number } => {
  switch (channel) {
    case "hue":
      return { min: 0, max: 360 };
    case "alpha":
      return { min: 0, max: 100 };
    case "red":
    case "green":
    case "blue":
      return { min: 0, max: 255 };
    default:
      return { min: 0, max: 100 };
  }
};

export const RLColorArea: Component<RLColorAreaProps> = (allProps) => {
  const props = allProps;
  const rest = omit(
    allProps,
    "colorSpace",
    "defaultValue",
    "disabled",
    "modelValue",
    "name",
    "required",
    "xChannel",
    "xName",
    "yChannel",
    "yName",
    "color",
    "theme",
    "ui",
    "class",
    "onChange",
    "onValueChange",
    "onChangeEnd",
    "children",
  );

  const colorSpace = props.colorSpace ?? "hsl";
  const xChannel: Channel = props.xChannel ?? "saturation";
  const yChannel: Channel = props.yChannel ?? "lightness";

  const initialValue = props.modelValue || props.defaultValue || "#ff0000";

  const [value, setValue] = createSignal<string>(initialValue);
  const [isDragging, setIsDragging] = createSignal(false);
  const [state, setState] = createSignal<ChannelState>({
    hue: 0,
    sat: 0,
    light: 50,
    bright: 100,
    red: 255,
    green: 0,
    blue: 0,
  });
  let areaRef: HTMLDivElement | undefined;

  const syncChannelsFromValue = (hex: string, current: ChannelState): ChannelState => {
    const rgb = hexToRgb(hex);
    const hsl = rgbToHsl(rgb[0], rgb[1], rgb[2]);
    const hsb = rgbToHsb(rgb[0], rgb[1], rgb[2]);
    const max = Math.max(rgb[0], rgb[1], rgb[2]);
    const min = Math.min(rgb[0], rgb[1], rgb[2]);
    return {
      hue: max !== min ? hsl[0] : current.hue,
      sat: hsl[1],
      light: hsl[2],
      bright: hsb[2],
      red: rgb[0],
      green: rgb[1],
      blue: rgb[2],
    };
  };

  createEffect(
    () => value(),
    (hex) => {
      setState((prev) => syncChannelsFromValue(hex, prev));
    },
  );

  const resolvedClasses = createMemo(() =>
    RLColorAreaTheme({
      color: props.color ?? "primary",
      theme: props.theme,
      ui: props.ui,
      class: props.class,
    }),
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
    const range = getChannelRange(xChannel);
    const s = state();
    return ((channelValue(xChannel, s) - range.min) / (range.max - range.min)) * 100;
  });

  const pctY = createMemo(() => {
    const range = getChannelRange(yChannel);
    const s = state();
    return 100 - ((channelValue(yChannel, s) - range.min) / (range.max - range.min)) * 100;
  });

  const xVal = createMemo(() => channelValue(xChannel, state()));
  const yVal = createMemo(() => channelValue(yChannel, state()));

  const areaStyle = createMemo(() => {
    const hueVal = state().hue;
    let background: string;
    if (colorSpace === "hsl" && xChannel === "saturation" && yChannel === "lightness") {
      background =
        "linear-gradient(to top, #000 0%, transparent 50%, #fff 100%), linear-gradient(to right, #808080 0%, transparent 100%), hsl(" +
        hueVal +
        ", 100%, 50%)";
    } else if (colorSpace === "hsb" && xChannel === "saturation" && yChannel === "brightness") {
      background =
        "linear-gradient(to top, #000 0%, transparent 100%), linear-gradient(to right, #fff 0%, transparent 100%), hsl(" +
        hueVal +
        ", 100%, 50%)";
    } else {
      background = `hsl(${hueVal}, 100%, 50%)`;
    }
    return {
      background,
      backgroundRepeat: "no-repeat",
      backgroundSize: "100% 100%",
    };
  });

  const applyPointer = (clientX: number, clientY: number) => {
    const area = areaRef;
    if (!area) return;
    if (props.disabled) return;
    const rect = area.getBoundingClientRect();
    const x = clamp((clientX - rect.left) / rect.width, 0, 1);
    const y = 1 - clamp((clientY - rect.top) / rect.height, 0, 1);

    const xRange = getChannelRange(xChannel);
    const yRange = getChannelRange(yChannel);
    const newX = Math.round(xRange.min + x * (xRange.max - xRange.min));
    const newY = Math.round(yRange.min + y * (yRange.max - yRange.min));

    const cur = state();
    let hue = cur.hue;
    let saturation = cur.sat;
    let lightness = cur.light;
    let brightness = cur.bright;
    let r = cur.red;
    let g = cur.green;
    let b = cur.blue;

    let newRgb: [number, number, number] = [r, g, b];

    if (colorSpace === "hsl") {
      if (xChannel === "saturation") saturation = newX;
      if (yChannel === "lightness") lightness = newY;
      if (xChannel === "lightness") lightness = newX;
      if (yChannel === "saturation") saturation = newY;
      if (xChannel === "hue") hue = newX;
      if (yChannel === "hue") hue = newY;
      newRgb = hslToRgb(hue, saturation, lightness);
    } else if (colorSpace === "hsb") {
      if (xChannel === "saturation") saturation = newX;
      if (yChannel === "brightness") brightness = newY;
      if (xChannel === "brightness") brightness = newX;
      if (yChannel === "saturation") saturation = newY;
      if (xChannel === "hue") hue = newX;
      if (yChannel === "hue") hue = newY;
      newRgb = hsbToRgb(hue, saturation, brightness);
    } else if (colorSpace === "rgb") {
      if (xChannel === "red") r = newX;
      if (yChannel === "green") g = newY;
      if (xChannel === "green") g = newX;
      if (yChannel === "red") r = newY;
      if (xChannel === "blue") b = newX;
      if (yChannel === "blue") b = newY;
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
      props.onChange?.(newValue);
      props.onValueChange?.(newValue);
    }
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
    props.onChangeEnd?.(value());
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if (props.disabled) return;
    const isShift = e.shiftKey;
    const stepSize = isShift ? 10 : 1;
    const xRange = getChannelRange(xChannel);
    const yRange = getChannelRange(yChannel);
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
      const cur = state();
      let hue = cur.hue;
      let saturation = cur.sat;
      let lightness = cur.light;
      let brightness = cur.bright;
      let r = cur.red;
      let g = cur.green;
      let b = cur.blue;

      let newRgb: [number, number, number] = [r, g, b];

      if (colorSpace === "hsl") {
        if (xChannel === "saturation") saturation = posX;
        if (yChannel === "lightness") lightness = posY;
        if (xChannel === "lightness") lightness = posX;
        if (yChannel === "saturation") saturation = posY;
        if (xChannel === "hue") hue = posX;
        if (yChannel === "hue") hue = posY;
        newRgb = hslToRgb(hue, saturation, lightness);
      } else if (colorSpace === "hsb") {
        if (xChannel === "saturation") saturation = posX;
        if (yChannel === "brightness") brightness = posY;
        if (xChannel === "brightness") brightness = posX;
        if (yChannel === "saturation") saturation = posY;
        if (xChannel === "hue") hue = posX;
        if (yChannel === "hue") hue = posY;
        newRgb = hsbToRgb(hue, saturation, brightness);
      } else if (colorSpace === "rgb") {
        if (xChannel === "red") r = posX;
        if (yChannel === "green") g = posY;
        if (xChannel === "green") g = posX;
        if (yChannel === "red") r = posY;
        if (xChannel === "blue") b = posX;
        if (yChannel === "blue") b = posY;
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
        props.onChange?.(newValue);
        props.onValueChange?.(newValue);
      }
    }
  };

  return (
    <div
      class={`${resolvedClasses().root}  ${props.disabled ? "opacity-50 pointer-events-none" : ""}`}
      data-slot="root"
      data-color-space={colorSpace}
      data-value={value()}
      data-x-channel={xChannel}
      data-y-channel={yChannel}
      data-disabled={props.disabled ? "true" : "false"}
      data-theme={props.theme}
      {...rest}
    >
      <div
        ref={(el) => (areaRef = el)}
        class={resolvedClasses().area}
        data-slot="area"
        style={areaStyle()}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
      >
        <div
          class={resolvedClasses().thumb}
          data-slot="thumb"
          role="slider"
          aria-label="Color Area Thumb"
          tabindex={0}
          style={{
            left: `${pctX()}%`,
            top: `${pctY()}%`,
            "background-color": value(),
          }}
          onKeyDown={handleKeyDown}
        />
      </div>
      {props.name ? (
        <input type="hidden" name={props.name} value={value()} data-main-input />
      ) : null}
      {props.xName ? <input type="hidden" name={props.xName} value={xVal()} data-x-input /> : null}
      {props.yName ? <input type="hidden" name={props.yName} value={yVal()} data-y-input /> : null}
    </div>
  );
};
