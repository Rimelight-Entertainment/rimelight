import { describe, it, expect, vi, afterEach } from "vite-plus/test";

import { RLScrollToTop } from "../src/components/scroll-to-top/RLScrollToTop";
import {
  gaugeVars,
  scrollState,
  scrollToTop,
  trackScroll,
} from "../src/components/scroll-to-top/scroll-to-top.helpers";
import type { ScrollState } from "../src/components/scroll-to-top/scroll-to-top.types";
import { renderSolid } from "./utils/normalize";

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe("scrollState", () => {
  it("is visible only strictly past the threshold", () => {
    expect(scrollState(200, 3000, 1000, 200).isVisible).toBe(false);
    expect(scrollState(201, 3000, 1000, 200).isVisible).toBe(true);
  });

  it("reports zero progress when the page is not scrollable", () => {
    expect(scrollState(0, 800, 800, 200).scrollPercentage).toBe(0);
    expect(scrollState(500, 600, 800, 200).scrollPercentage).toBe(0);
  });

  it("maps scroll position to the scrollable distance and clamps at 100", () => {
    expect(scrollState(1000, 3000, 1000, 0).scrollPercentage).toBe(50);
    expect(scrollState(2500, 3000, 1000, 0).scrollPercentage).toBe(100);
  });
});

describe("gaugeVars", () => {
  it("sizes the ring from half the progress width", () => {
    expect(gaugeVars(6, 0)["--rl-stt-border"]).toBe("3px");
  });

  it("leaves the gauge empty at the top of the page", () => {
    expect(gaugeVars(6, 0)["--rl-stt-gauge"]).toContain("currentColor 0deg, transparent 0deg");
  });

  it("sweeps a full turn at 100%", () => {
    expect(gaugeVars(6, 100)["--rl-stt-gauge"]).toContain(
      "currentColor 360deg, transparent 360deg",
    );
  });
});

describe("scrollToTop", () => {
  it("scrolls the window smoothly to the top", () => {
    const scrollTo = vi.spyOn(window, "scrollTo").mockImplementation(() => {});
    scrollToTop();
    expect(scrollTo).toHaveBeenCalledWith({ top: 0, behavior: "smooth" });
  });
});

describe("trackScroll", () => {
  it("reports state on the next frame and cancels a pending frame on cleanup", () => {
    const frames: FrameRequestCallback[] = [];
    const cancel = vi.fn();
    vi.stubGlobal("requestAnimationFrame", (cb: FrameRequestCallback) => frames.push(cb));
    vi.stubGlobal("cancelAnimationFrame", cancel);

    const updates: ScrollState[] = [];
    const stop = trackScroll(200, (state) => updates.push(state));
    expect(updates).toEqual([]);

    frames.shift()?.(0);
    expect(updates).toEqual([{ isVisible: false, scrollPercentage: 0 }]);

    trackScroll(200, () => {})();
    stop();
    expect(cancel).toHaveBeenCalledTimes(1);
  });
});

describe("RLScrollToTop", () => {
  it("renders hidden with its root and button before any scroll", () => {
    const html = renderSolid(RLScrollToTop);
    expect(html).toContain('data-slot="root"');
    expect(html).toContain('data-state="hidden"');
    expect(html).toContain('data-slot="button"');
    expect(html).toContain("aria-label=");
  });

  it("renders the progress ring by default and omits it when hasProgress is false", () => {
    expect(renderSolid(RLScrollToTop)).toContain('data-slot="progress"');
    expect(renderSolid(RLScrollToTop, { hasProgress: false })).not.toContain(
      'data-slot="progress"',
    );
  });

  it("renders the arrow icon by default and children in its place when provided", () => {
    expect(renderSolid(RLScrollToTop)).toContain('data-slot="icon"');

    const custom = renderSolid(RLScrollToTop, {}, "custom-glyph");
    expect(custom).toContain("custom-glyph");
    expect(custom).not.toContain('data-slot="icon"');
  });

  it("renders through the as tag", () => {
    expect(renderSolid(RLScrollToTop, { as: "section" }).startsWith("<section")).toBe(true);
  });
});
