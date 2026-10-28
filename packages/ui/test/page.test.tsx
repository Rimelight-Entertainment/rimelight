import { describe, it, expect, beforeEach, afterEach } from "vite-plus/test";
import { renderToString } from "@solidjs/web";
import { RLPage } from "../src/components/page/RLPage";

const extractClass = (html: string, slot: string): string => {
  const tag = html.match(new RegExp(`<[^>]*data-slot="${slot}"[^>]*>`))?.[0] ?? "";
  return tag.match(/class="([^"]*)"/)?.[1] ?? "";
};

describe("RLPage", () => {
  let container: HTMLDivElement;

  beforeEach(() => {
    container = document.createElement("div");
    document.body.appendChild(container);
  });

  afterEach(() => {
    container.remove();
  });

  it("renders the default slot inside a centered single column", () => {
    const html = renderToString(() => (
      <RLPage>
        <div class="main-content">Main</div>
      </RLPage>
    ));

    expect(html).toContain("main-content");
    expect(html).toContain('data-slot="root"');
    expect(html).toContain('data-slot="center"');
    expect(html).not.toContain('data-slot="left"');
    expect(html).not.toContain('data-slot="right"');
    expect(extractClass(html, "center")).toContain("lg:col-span-10");
  });

  it("renders the left slot in its own column", () => {
    const html = renderToString(() => (
      <RLPage left={<nav class="left-nav">Navigation</nav>}>
        <div>Main</div>
      </RLPage>
    ));

    expect(html).toContain('data-slot="left"');
    expect(html).toContain("left-nav");
    expect(html).not.toContain('data-slot="right"');
    expect(extractClass(html, "left")).toContain("lg:col-span-2");
    expect(extractClass(html, "center")).toContain("lg:col-span-8");
  });

  it("renders the right slot in its own column", () => {
    const html = renderToString(() => (
      <RLPage right={<aside class="right-toc">Table of contents</aside>}>
        <div>Main</div>
      </RLPage>
    ));

    expect(html).toContain('data-slot="right"');
    expect(html).toContain("right-toc");
    expect(html).not.toContain('data-slot="left"');
    expect(extractClass(html, "right")).toContain("order-first");
    expect(extractClass(html, "center")).toContain("lg:col-span-8");
  });

  it("splits the center column when both left and right slots are provided", () => {
    const html = renderToString(() => (
      <RLPage left={<div>Left</div>} right={<div>Right</div>}>
        <div>Main</div>
      </RLPage>
    ));

    expect(html).toContain("Left");
    expect(html).toContain("Right");
    expect(html).toContain("Main");
    expect(extractClass(html, "center")).toContain("lg:col-span-6");
    expect(extractClass(html, "center")).not.toContain("lg:col-span-8");
    expect(extractClass(html, "center")).not.toContain("lg:col-span-10");
  });

  it("renders the root as a custom element with the as prop", () => {
    const html = renderToString(() => (
      <RLPage as="main">
        <div>Main</div>
      </RLPage>
    ));

    expect(html).toContain("<main");
    expect(html).toContain("</main>");
  });

  it("merges the class prop onto the root element", () => {
    const html = renderToString(() => (
      <RLPage class="custom-root">
        <div>Main</div>
      </RLPage>
    ));

    expect(extractClass(html, "root")).toContain("custom-root");
    expect(extractClass(html, "root")).toContain("lg:grid");
  });

  it("applies ui slot overrides", () => {
    const html = renderToString(() => (
      <RLPage
        left={<div>Left</div>}
        right={<div>Right</div>}
        ui={{ root: "ui-root", left: "ui-left", center: "ui-center", right: "ui-right" }}
      >
        <div>Main</div>
      </RLPage>
    ));

    expect(extractClass(html, "root")).toContain("ui-root");
    expect(extractClass(html, "left")).toContain("ui-left");
    expect(extractClass(html, "center")).toContain("ui-center");
    expect(extractClass(html, "right")).toContain("ui-right");
  });

  it("does not leak internal props onto the DOM", () => {
    const html = renderToString(() => (
      <RLPage as="section" ui={{ root: "x" }} left={<div>Left</div>} right={<div>Right</div>}>
        <div>Main</div>
      </RLPage>
    ));

    expect(html).not.toContain("ui=");
    expect(html).not.toContain("as=");
    expect(html).not.toContain("left=");
    expect(html).not.toContain("right=");
  });

  it("renders correctly in the DOM when mounted into a container", () => {
    container.innerHTML = renderToString(() => (
      <RLPage left={<div>Left</div>}>
        <div>Main</div>
      </RLPage>
    ));

    expect(container.querySelector('[data-slot="root"]')).not.toBeNull();
    expect(container.querySelector('[data-slot="left"]')?.textContent).toContain("Left");
    expect(container.querySelector('[data-slot="center"]')?.textContent).toContain("Main");
  });
});
