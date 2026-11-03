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
    expect(html).not.toContain('data-slot="leading"');
    expect(html).not.toContain('data-slot="trailing"');
    expect(extractClass(html, "center")).toContain("lg:col-span-10");
  });

  it("renders the leading slot in its own column", () => {
    const html = renderToString(() => (
      <RLPage leadingSlot={<nav class="leading-nav">Navigation</nav>}>
        <div>Main</div>
      </RLPage>
    ));

    expect(html).toContain('data-slot="leading"');
    expect(html).toContain("leading-nav");
    expect(html).not.toContain('data-slot="trailing"');
    expect(extractClass(html, "leading")).toContain("lg:col-span-2");
    expect(extractClass(html, "center")).toContain("lg:col-span-8");
  });

  it("renders the trailing slot in its own column", () => {
    const html = renderToString(() => (
      <RLPage trailingSlot={<aside class="trailing-toc">Table of contents</aside>}>
        <div>Main</div>
      </RLPage>
    ));

    expect(html).toContain('data-slot="trailing"');
    expect(html).toContain("trailing-toc");
    expect(html).not.toContain('data-slot="leading"');
    expect(extractClass(html, "trailing")).toContain("order-first");
    expect(extractClass(html, "center")).toContain("lg:col-span-8");
  });

  it("splits the center column when both leading and trailing slots are provided", () => {
    const html = renderToString(() => (
      <RLPage leadingSlot={<div>Left</div>} trailingSlot={<div>Right</div>}>
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
        leadingSlot={<div>Left</div>}
        trailingSlot={<div>Right</div>}
        ui={{
          root: "ui-root",
          leading: "ui-leading",
          center: "ui-center",
          trailing: "ui-trailing",
        }}
      >
        <div>Main</div>
      </RLPage>
    ));

    expect(extractClass(html, "root")).toContain("ui-root");
    expect(extractClass(html, "leading")).toContain("ui-leading");
    expect(extractClass(html, "center")).toContain("ui-center");
    expect(extractClass(html, "trailing")).toContain("ui-trailing");
  });

  it("does not leak internal props onto the DOM", () => {
    const html = renderToString(() => (
      <RLPage
        as="section"
        ui={{ root: "x" }}
        leadingSlot={<div>Left</div>}
        trailingSlot={<div>Right</div>}
      >
        <div>Main</div>
      </RLPage>
    ));

    expect(html).not.toContain("ui=");
    expect(html).not.toContain("as=");
    expect(html).not.toContain("leading=");
    expect(html).not.toContain("trailing=");
  });

  it("renders correctly in the DOM when mounted into a container", () => {
    container.innerHTML = renderToString(() => (
      <RLPage leadingSlot={<div>Left</div>}>
        <div>Main</div>
      </RLPage>
    ));

    expect(container.querySelector('[data-slot="root"]')).not.toBeNull();
    expect(container.querySelector('[data-slot="leading"]')?.textContent).toContain("Left");
    expect(container.querySelector('[data-slot="center"]')?.textContent).toContain("Main");
  });
});
