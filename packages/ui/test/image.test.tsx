import { describe, it, expect } from "vite-plus/test";
import { mountComponent } from "./utils/browser-render";
import { RLImage } from "../src/components/image/RLImage";

describe("RLImage", () => {
  it("renders the source image inside a lightbox trigger by default", () => {
    const c = mountComponent(() => <RLImage src="/cat.png" alt="A cat" />);
    const img = c.querySelector("[data-slot=trigger] [data-slot=trigger-image]");
    expect(img?.getAttribute("src")).toContain("/cat.png");
    expect(img?.getAttribute("alt")).toBe("A cat");
  });

  it("renders a static, non-interactive image when lightbox is false", () => {
    const c = mountComponent(() => <RLImage src="/cat.png" lightbox={false} />);
    expect(c.querySelector("[data-slot=static-trigger] [data-slot=trigger-image]")).not.toBeNull();
    expect(c.querySelector("[data-slot=trigger]")).toBeNull();
    expect(c.querySelector("[data-slot=dialog]")).toBeNull();
  });

  it("wraps the image and caption in a figure when a caption is given", () => {
    const c = mountComponent(() => <RLImage src="/cat.png" caption="Sunset" />);
    const figure = c.querySelector("figure[data-slot=figure]");
    expect(figure).not.toBeNull();
    expect(figure?.querySelector("[data-slot=caption]")?.textContent).toBe("Sunset");
  });

  it("renders the caption without a figure when figure is false", () => {
    const c = mountComponent(() => <RLImage src="/cat.png" caption="Sunset" figure={false} />);
    expect(c.querySelector("[data-slot=figure]")).toBeNull();
    expect(c.querySelector("p[data-slot=caption]")?.textContent).toBe("Sunset");
  });

  it("replaces the default trigger with triggerSlot", () => {
    const c = mountComponent(() => (
      <RLImage src="/cat.png" triggerSlot={<button data-test="custom-trigger">open</button>} />
    ));
    expect(c.querySelector("[data-slot=trigger]")).toBeNull();
    expect(c.querySelector("[data-test=custom-trigger]")).not.toBeNull();
  });

  it("renders captionSlot inside the figure", () => {
    const c = mountComponent(() => (
      <RLImage
        src="/cat.png"
        caption="Sunset"
        captionSlot={<span data-test="extra-caption">credit</span>}
      />
    ));
    expect(c.querySelector("[data-slot=figure] [data-test=extra-caption]")).not.toBeNull();
  });

  it("renders a light and a dark image when darkSrc differs from the light source", () => {
    const c = mountComponent(() => <RLImage src="/light.png" darkSrc="/dark.png" />);
    expect(c.querySelector("[data-slot=color-mode]")).not.toBeNull();
    expect(c.querySelectorAll("[data-slot=trigger-image]").length).toBe(2);
  });

  it("uses a picture element with a source per breakpoint when mobile and desktop sources are set", () => {
    const c = mountComponent(() => (
      <RLImage mobileSrc="/m.png" desktopSrc="/d.png" lightbox={false} />
    ));
    expect(c.querySelector("picture")).not.toBeNull();
    expect(c.querySelectorAll("picture source").length).toBe(2);
  });
});
