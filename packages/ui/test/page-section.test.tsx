import { describe, it, expect, beforeEach, afterEach } from "vite-plus/test";
import { renderToString } from "@solidjs/web";
import { RLPageSection } from "../src/components/page-section/RLPageSection";

describe("RLPageSection", () => {
  let container: HTMLDivElement;

  beforeEach(() => {
    container = document.createElement("div");
    document.body.appendChild(container);
  });

  afterEach(() => {
    container.remove();
  });

  it("renders with default props and title", () => {
    const html = renderToString(() => (
      <RLPageSection title="Dashboard" description="Test description">
        <div>Content</div>
      </RLPageSection>
    ));

    expect(html).toContain("Dashboard");
    expect(html).toContain("Test description");
    expect(html).toContain("Content");
    expect(html).toContain("<h2");
  });

  it("renders hero variant with h1", () => {
    const html = renderToString(() => <RLPageSection variant="hero" title="Hero Title" />);

    expect(html).toContain("<h1");
    expect(html).toContain("Hero Title");
  });

  it("renders as custom tag using dynamic as prop", () => {
    const html = renderToString(() => <RLPageSection as="article" title="Article Title" />);

    expect(html).toContain("<article");
    expect(html).toContain("Article Title");
  });

  it("renders background prop in the dedicated background container", () => {
    const html = renderToString(() => (
      <RLPageSection
        title="With Bg Prop"
        background={<div class="bg-layer">Custom Background</div>}
      >
        <div class="main-body">Main Children</div>
      </RLPageSection>
    ));

    expect(html).toContain('data-slot="background"');
    expect(html).toContain("Custom Background");
    expect(html).toContain("Main Children");
    const bgContainerIndex = html.indexOf('data-slot="background"');
    const bgTextIndex = html.indexOf("Custom Background");
    expect(bgTextIndex).toBeGreaterThan(bgContainerIndex);
  });

  it("renders body, header, and footer props correctly", () => {
    const html = renderToString(() => (
      <RLPageSection
        header={<div>Custom Header</div>}
        body={<div>Custom Body</div>}
        footer={<div>Custom Footer</div>}
      >
        <div>Default Child</div>
      </RLPageSection>
    ));

    expect(html).toContain("Custom Header");
    expect(html).toContain("Custom Body");
    expect(html).toContain("Custom Footer");
    expect(html).toContain("Default Child");
  });

  it("places background prop in the background container, not inside inner content", () => {
    const el = document.createElement("div");
    el.innerHTML = renderToString(() => (
      <RLPageSection title="Home Hero" background={<div class="bg-img">Hero Image</div>}>
        <div class="hero-logo">Logo</div>
      </RLPageSection>
    ));

    const bgSlot = el.querySelector('[data-slot="background"]');
    expect(bgSlot).not.toBeNull();
    expect(bgSlot?.textContent).toContain("Hero Image");

    expect(bgSlot?.querySelector(".hero-logo")).toBeNull();
    expect(el.querySelector(".hero-logo")).not.toBeNull();
  });
});
