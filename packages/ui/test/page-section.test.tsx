import { describe, it, expect } from "vite-plus/test";
import { RLPageSection } from "../src/components/page-section/RLPageSection";
import { mountComponent } from "./utils/browser-render";

function root(container: HTMLElement): HTMLElement | null {
  return container.querySelector<HTMLElement>("[data-slot='root']");
}

describe("RLPageSection", () => {
  it("renders a section root by default and the requested element with as", () => {
    const section = root(mountComponent(() => <RLPageSection title="Hi" />));
    const article = root(mountComponent(() => <RLPageSection as="article" title="Hi" />));
    expect(section?.tagName).toBe("SECTION");
    expect(article?.tagName).toBe("ARTICLE");
  });

  it("renders title as h2 by default and as h1 in the hero layout", () => {
    const standard = mountComponent(() => <RLPageSection title="Standard" />);
    const hero = mountComponent(() => <RLPageSection layout="hero" title="Hero" />);
    expect(standard.querySelector("h2")?.textContent).toBe("Standard");
    expect(standard.querySelector("h1")).toBeNull();
    expect(hero.querySelector("h1")?.textContent).toBe("Hero");
    expect(hero.querySelector("h2")).toBeNull();
  });

  it("renders headline, description, and icon when provided", () => {
    const withAll = mountComponent(() => (
      <RLPageSection
        headline="Eyebrow"
        title="Title"
        description="Details"
        icon="i-lucide-rocket"
      />
    ));
    const bare = mountComponent(() => <RLPageSection title="Title" />);
    expect(withAll.textContent).toContain("Eyebrow");
    expect(withAll.textContent).toContain("Details");
    expect(withAll.innerHTML.length).toBeGreaterThan(bare.innerHTML.length);
    expect(bare.textContent).not.toContain("Eyebrow");
    expect(bare.textContent).not.toContain("Details");
  });

  it("renders no header element when no header content is provided", () => {
    const container = mountComponent(() => <RLPageSection>Only children</RLPageSection>);
    expect(container.querySelector("h1")).toBeNull();
    expect(container.querySelector("h2")).toBeNull();
    expect(container.textContent).toContain("Only children");
  });

  it("renders each slot and replaces its default content", () => {
    const container = mountComponent(() => (
      <RLPageSection
        title="Default title"
        description="Default description"
        icon="i-lucide-rocket"
        backgroundSlot={<span>Background slot</span>}
        leadingSlot={<span>Leading slot</span>}
        titleSlot={<span>Title slot</span>}
        descriptionSlot={<span>Description slot</span>}
        bodySlot={<span>Body slot</span>}
        footerSlot={<span>Footer slot</span>}
      >
        Children
      </RLPageSection>
    ));
    expect(container.textContent).toContain("Background slot");
    expect(container.textContent).toContain("Leading slot");
    expect(container.textContent).toContain("Title slot");
    expect(container.textContent).toContain("Description slot");
    expect(container.textContent).toContain("Body slot");
    expect(container.textContent).toContain("Footer slot");
    expect(container.textContent).toContain("Children");
    expect(container.textContent).not.toContain("Default title");
    expect(container.textContent).not.toContain("Default description");
  });

  it("replaces the whole header when headerSlot is provided", () => {
    const container = mountComponent(() => (
      <RLPageSection title="Default title" headerSlot={<span>Custom header</span>} />
    ));
    expect(container.textContent).toContain("Custom header");
    expect(container.textContent).not.toContain("Default title");
    expect(container.querySelector("h2")).toBeNull();
  });

  it("accepts render-function slots", () => {
    const container = mountComponent(() => (
      <RLPageSection bodySlot={() => <span>Rendered body</span>} />
    ));
    expect(container.textContent).toContain("Rendered body");
  });

  it("renders an anchor with href for each entry in links", () => {
    const container = mountComponent(() => (
      <RLPageSection
        links={[
          { label: "First", href: "https://example.com/first" },
          { label: "Second", href: "https://example.com/second" },
        ]}
      />
    ));
    expect(container.textContent).toContain("First");
    expect(container.textContent).toContain("Second");
    const anchors = container.querySelectorAll("a");
    expect(anchors.length).toBe(2);
    expect(anchors[0]?.getAttribute("href")).toBe("https://example.com/first");
    expect(anchors[1]?.getAttribute("href")).toBe("https://example.com/second");
  });

  it("hides links when footerSlot is provided", () => {
    const container = mountComponent(() => (
      <RLPageSection
        links={[{ label: "Hidden link", href: "/hidden" }]}
        footerSlot={<span>Custom footer</span>}
      />
    ));
    expect(container.textContent).toContain("Custom footer");
    expect(container.textContent).not.toContain("Hidden link");
  });

  it("renders actionSlot alongside links", () => {
    const container = mountComponent(() => (
      <RLPageSection
        links={[{ label: "Go", href: "/go" }]}
        actionSlot={<span>Extra action</span>}
      />
    ));
    expect(container.textContent).toContain("Go");
    expect(container.textContent).toContain("Extra action");
  });

  it("applies containIntrinsicSize as a CSS variable on the root", () => {
    const container = mountComponent(() => (
      <RLPageSection contentVisibility="auto" containIntrinsicSize="auto 500px" title="Lazy" />
    ));
    const style = root(container)?.getAttribute("style") ?? "";
    expect(style).toContain("--rl-contain-intrinsic-size");
    expect(style).toContain("auto 500px");
  });

  it("exposes the orientation on the root", () => {
    const container = mountComponent(() => <RLPageSection orientation="horizontal" title="Wide" />);
    expect(root(container)?.getAttribute("data-orientation")).toBe("horizontal");
  });

  it("renders children without wrapper content when no slots or props are set", () => {
    const container = mountComponent(() => <RLPageSection>Plain</RLPageSection>);
    expect(container.querySelector("[data-slot='background']")).toBeNull();
    expect(container.textContent?.trim()).toBe("Plain");
  });
});
