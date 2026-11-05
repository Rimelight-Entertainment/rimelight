import { describe, it, expect } from "vite-plus/test";
import { renderToString } from "@solidjs/web";

import { RLColorSlider } from "../src/components/color-slider/RLColorSlider";
import {
  keyboardTarget,
  readChannel,
  thumbPercent,
  trackGradient,
  valueAtFraction,
  writeChannel,
} from "../src/components/color-slider/color-slider.helpers";
import { getChannelRange } from "../src/components/color-picker/color";
import { DEFAULT_COLOR_HEX } from "../src/constants/color";
import { cleanHtml } from "./utils/normalize";

function render(fn: () => any): string {
  return cleanHtml(renderToString(fn));
}

function tagWithSlot(html: string, slot: string): string {
  return html.match(new RegExp(`<[a-z]+[^>]*data-slot="${slot}"[^>]*>`))?.[0] ?? "";
}

function attr(tag: string, name: string): string | undefined {
  return tag.match(new RegExp(`\\s${name}="([^"]*)"`))?.[1];
}

describe("RLColorSlider", () => {
  describe("uncontrolled state", () => {
    it("starts at the default hex when no value is given", () => {
      const html = render(() => <RLColorSlider channel="hue" />);
      expect(attr(tagWithSlot(html, "root"), "data-value")).toBe(DEFAULT_COLOR_HEX);
    });

    it("starts at defaultValue when uncontrolled", () => {
      const html = render(() => <RLColorSlider channel="hue" defaultValue="#ff0000" />);
      expect(attr(tagWithSlot(html, "root"), "data-value")).toBe("#ff0000");
    });

    it("reflects controlled value over defaultValue", () => {
      const html = render(() => (
        <RLColorSlider channel="hue" value="#00ff00" defaultValue="#ff0000" />
      ));
      expect(attr(tagWithSlot(html, "root"), "data-value")).toBe("#00ff00");
    });
  });

  describe("data attributes", () => {
    it("defaults the color space to hsl and orientation to horizontal", () => {
      const root = tagWithSlot(
        render(() => <RLColorSlider channel="hue" />),
        "root",
      );
      expect(attr(root, "data-color-space")).toBe("hsl");
      expect(attr(root, "data-orientation")).toBe("horizontal");
      expect(attr(root, "data-channel")).toBe("hue");
    });

    it("omits presence flags when false", () => {
      const root = tagWithSlot(
        render(() => <RLColorSlider channel="hue" />),
        "root",
      );
      expect(root).not.toMatch(/data-disabled/);
      expect(root).not.toMatch(/data-inverted/);
    });

    it("sets presence flags to an empty value when true", () => {
      const root = tagWithSlot(
        render(() => <RLColorSlider channel="hue" disabled inverted />),
        "root",
      );
      expect(root).toMatch(/\sdata-disabled(=""|\s|>)/);
      expect(root).toMatch(/\sdata-inverted(=""|\s|>)/);
    });
  });

  describe("thumb", () => {
    it("exposes a slider role with aria-disabled only when disabled", () => {
      const enabled = tagWithSlot(
        render(() => <RLColorSlider channel="hue" />),
        "thumb",
      );
      const disabled = tagWithSlot(
        render(() => <RLColorSlider channel="hue" disabled />),
        "thumb",
      );
      expect(enabled).toMatch(/role="slider"/);
      expect(enabled).not.toMatch(/aria-disabled/);
      expect(attr(disabled, "aria-disabled")).toBe("true");
    });

    it("applies kebab-case aria props to the thumb", () => {
      const thumb = tagWithSlot(
        render(() => (
          <RLColorSlider
            channel="hue"
            aria-label="Hue"
            aria-labelledby="hue-label"
            aria-describedby="hue-help"
          />
        )),
        "thumb",
      );
      expect(attr(thumb, "aria-label")).toBe("Hue");
      expect(attr(thumb, "aria-labelledby")).toBe("hue-label");
      expect(attr(thumb, "aria-describedby")).toBe("hue-help");
    });

    it("is focusable when enabled and removed from tab order when disabled", () => {
      const enabled = tagWithSlot(
        render(() => <RLColorSlider channel="hue" />),
        "thumb",
      );
      const disabled = tagWithSlot(
        render(() => <RLColorSlider channel="hue" disabled />),
        "thumb",
      );
      expect(attr(enabled, "tabindex")).toBe("0");
      expect(attr(disabled, "tabindex")).toBe("-1");
    });
  });

  describe("hidden input", () => {
    it("renders no hidden input without name", () => {
      const html = render(() => <RLColorSlider channel="hue" />);
      expect(html).not.toMatch(/type="hidden"/);
    });

    it("renders a hidden input carrying the hex value when name is set", () => {
      const html = render(() => <RLColorSlider channel="hue" name="hue" defaultValue="#ff0000" />);
      const input = html.match(/<input[^>]*type="hidden"[^>]*>/)?.[0] ?? "";
      expect(attr(input, "name")).toBe("hue");
      expect(attr(input, "value")).toBe("#ff0000");
    });
  });
});

describe("color-slider helpers", () => {
  it("reads hsl lightness of pure red as 50", () => {
    expect(readChannel("#ff0000", "lightness", "hsl")).toBe(50);
  });

  it("reads rgb red of pure red as 255", () => {
    expect(readChannel("#ff0000", "red", "rgb")).toBe(255);
  });

  it("returns 0 for a channel outside the color space", () => {
    expect(readChannel("#ff0000", "hue", "rgb")).toBe(0);
  });

  it("writes a channel and returns the resulting hex", () => {
    expect(writeChannel("#ff0000", "red", "rgb", 0)).toBe("#000000");
  });

  it("leaves the color unchanged when writing a channel outside the color space", () => {
    expect(writeChannel("#ff0000", "hue", "rgb", 90)).toBe("#ff0000");
  });

  it("places the thumb at the channel fraction, mirrored when inverted", () => {
    expect(thumbPercent("#ff0000", "red", "rgb", false)).toBe(100);
    expect(thumbPercent("#ff0000", "red", "rgb", true)).toBe(0);
  });

  it("maps track fractions to channel values within range", () => {
    const range = getChannelRange("red");
    expect(valueAtFraction("red", 0, 1)).toBe(range.min);
    expect(valueAtFraction("red", 1, 1)).toBe(range.max);
  });

  it("snaps fractional values to the step", () => {
    expect(valueAtFraction("red", 0.5, 10) % 10).toBe(0);
  });

  it("steps with the arrow key matching the track orientation", () => {
    expect(keyboardTarget("ArrowRight", true, "red", 10, 1)).toBe(11);
    expect(keyboardTarget("ArrowUp", true, "red", 10, 1)).toBeUndefined();
    expect(keyboardTarget("ArrowUp", false, "red", 10, 1)).toBe(11);
  });

  it("clamps decrease to the channel minimum", () => {
    const range = getChannelRange("red");
    expect(keyboardTarget("ArrowLeft", true, "red", range.min, 1)).toBe(range.min);
  });

  it("jumps to the range ends with Home and End", () => {
    const range = getChannelRange("red");
    expect(keyboardTarget("Home", true, "red", 100, 1)).toBe(range.min);
    expect(keyboardTarget("End", true, "red", 100, 1)).toBe(range.max);
  });

  it("builds a hue track from the shared spectrum stops", () => {
    expect(trackGradient("#ff0000", "hue", "hsl", true)).toContain("#ffff00 17%");
  });
});
