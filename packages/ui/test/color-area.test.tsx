import { describe, it, expect } from "vite-plus/test";
import { renderToString } from "@solidjs/web";

import { RLColorArea } from "../src/components/color-area/RLColorArea";
import { areaBackground } from "../src/components/color-area/color-area.helpers";
import { DEFAULT_COLOR_AREA_HEX } from "../src/constants/color";
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

function hiddenInput(html: string, dataAttr: string): string {
  return html.match(new RegExp(`<input[^>]*${dataAttr}[^>]*>`))?.[0] ?? "";
}

describe("RLColorArea", () => {
  describe("value and channels", () => {
    it("starts at the default hex with saturation and lightness axes", () => {
      const root = tagWithSlot(
        render(() => <RLColorArea />),
        "root",
      );
      expect(attr(root, "data-value")).toBe(DEFAULT_COLOR_AREA_HEX);
      expect(attr(root, "data-x-channel")).toBe("saturation");
      expect(attr(root, "data-y-channel")).toBe("lightness");
      expect(attr(root, "data-color-space")).toBe("hsl");
    });

    it("starts at defaultValue when uncontrolled", () => {
      const root = tagWithSlot(
        render(() => <RLColorArea defaultValue="#0000ff" />),
        "root",
      );
      expect(attr(root, "data-value")).toBe("#0000ff");
    });

    it("reflects controlled value over defaultValue", () => {
      const root = tagWithSlot(
        render(() => <RLColorArea value="#00ff00" defaultValue="#0000ff" />),
        "root",
      );
      expect(attr(root, "data-value")).toBe("#00ff00");
    });

    it("passes axis channels through to data attributes", () => {
      const root = tagWithSlot(
        render(() => <RLColorArea colorSpace="rgb" xChannel="red" yChannel="green" />),
        "root",
      );
      expect(attr(root, "data-color-space")).toBe("rgb");
      expect(attr(root, "data-x-channel")).toBe("red");
      expect(attr(root, "data-y-channel")).toBe("green");
    });
  });

  describe("disabled flag", () => {
    it("omits data-disabled when enabled", () => {
      expect(
        tagWithSlot(
          render(() => <RLColorArea />),
          "root",
        ),
      ).not.toMatch(/data-disabled/);
    });

    it("sets data-disabled to an empty value when disabled", () => {
      const root = tagWithSlot(
        render(() => <RLColorArea disabled />),
        "root",
      );
      expect(root).toMatch(/\sdata-disabled(=""|\s|>)/);
    });
  });

  describe("thumb", () => {
    it("exposes a slider role and a localized default label", () => {
      const thumb = tagWithSlot(
        render(() => <RLColorArea />),
        "thumb",
      );
      expect(thumb).toMatch(/role="slider"/);
      expect(attr(thumb, "aria-label")).toBeTruthy();
    });

    it("applies kebab-case aria props to the thumb", () => {
      const thumb = tagWithSlot(
        render(() => (
          <RLColorArea
            aria-label="Shade"
            aria-labelledby="shade-label"
            aria-describedby="shade-help"
          />
        )),
        "thumb",
      );
      expect(attr(thumb, "aria-label")).toBe("Shade");
      expect(attr(thumb, "aria-labelledby")).toBe("shade-label");
      expect(attr(thumb, "aria-describedby")).toBe("shade-help");
    });

    it("is removed from tab order when disabled", () => {
      const thumb = tagWithSlot(
        render(() => <RLColorArea disabled />),
        "thumb",
      );
      expect(attr(thumb, "tabindex")).toBe("-1");
    });
  });

  describe("hidden inputs", () => {
    it("renders no hidden inputs without names", () => {
      expect(render(() => <RLColorArea />)).not.toMatch(/type="hidden"/);
    });

    it("renders main, x, and y hidden inputs when their names are set", () => {
      const html = render(() => (
        <RLColorArea name="color" xName="sat" yName="light" defaultValue="#ff0000" />
      ));
      expect(attr(hiddenInput(html, "data-main-input"), "name")).toBe("color");
      expect(attr(hiddenInput(html, "data-main-input"), "value")).toBe("#ff0000");
      expect(attr(hiddenInput(html, "data-x-input"), "name")).toBe("sat");
      expect(attr(hiddenInput(html, "data-y-input"), "name")).toBe("light");
    });
  });
});

describe("color-area helpers", () => {
  it("layers shading washes for hsl saturation and lightness", () => {
    const bg = areaBackground(0, "hsl", "saturation", "lightness");
    expect(bg).toContain("linear-gradient(to top, #000000 0%");
    expect(bg).toContain("#ffffff 100%");
    expect(bg).toContain("#808080 0%");
    expect(bg.endsWith("hsl(0, 100%, 50%)")).toBe(true);
  });

  it("layers shading washes for hsb saturation and brightness", () => {
    const bg = areaBackground(120, "hsb", "saturation", "brightness");
    expect(bg).toContain("linear-gradient(to right, #ffffff 0%");
    expect(bg.endsWith("hsl(120, 100%, 50%)")).toBe(true);
  });

  it("shows only the hue layer for other axis pairs", () => {
    expect(areaBackground(200, "rgb", "red", "green")).toBe("hsl(200, 100%, 50%)");
  });
});
