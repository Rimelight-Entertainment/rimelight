import { describe, it, expect } from "vite-plus/test";
import { RLPage } from "../src/components/page/RLPage";
import { renderSolid } from "./utils/normalize";

describe("RLPage", () => {
  it("renders the default slot inside the center column", () => {
    const html = renderSolid(RLPage, {}, "Main");
    expect(html).toContain('data-slot="root"');
    expect(html).toContain('data-slot="center"');
    expect(html).toContain("Main");
  });

  it("omits the leading and trailing columns when their slots are not provided", () => {
    const html = renderSolid(RLPage, {}, "Main");
    expect(html).not.toContain('data-slot="leading"');
    expect(html).not.toContain('data-slot="trailing"');
  });

  it("renders the leading slot content as a plain element", () => {
    const html = renderSolid(
      RLPage,
      { leadingSlot: <nav class="leading-nav">Navigation</nav> },
      "Main",
    );
    expect(html).toContain('data-slot="leading"');
    expect(html).toContain("Navigation");
    expect(html).not.toContain('data-slot="trailing"');
  });

  it("renders the trailing slot content as a plain element", () => {
    const html = renderSolid(
      RLPage,
      { trailingSlot: <aside class="trailing-toc">Contents</aside> },
      "Main",
    );
    expect(html).toContain('data-slot="trailing"');
    expect(html).toContain("Contents");
    expect(html).not.toContain('data-slot="leading"');
  });

  it("invokes render-function slots with the slot renderer", () => {
    const html = renderSolid(RLPage, { leadingSlot: () => <nav>Rendered nav</nav> }, "Main");
    expect(html).toContain('data-slot="leading"');
    expect(html).toContain("Rendered nav");
  });

  it("keeps both side columns and the center column when both slots are provided", () => {
    const html = renderSolid(
      RLPage,
      { leadingSlot: <div>Left</div>, trailingSlot: <div>Right</div> },
      "Main",
    );
    expect(html).toContain('data-slot="leading"');
    expect(html).toContain('data-slot="center"');
    expect(html).toContain('data-slot="trailing"');
    expect(html).toContain("Left");
    expect(html).toContain("Right");
    expect(html).toContain("Main");
  });

  it("renders the root as the element given by the as prop", () => {
    const html = renderSolid(RLPage, { as: "main" }, "Main");
    expect(html).toMatch(/^<main/);
    expect(html).toContain("</main>");
  });

  it("forwards the class prop and ui root override to the root element", () => {
    const html = renderSolid(RLPage, { class: "custom-root", ui: { root: "ui-root" } }, "Main");
    expect(html).toContain("custom-root");
    expect(html).toContain("ui-root");
  });

  it("does not leak internal props onto the DOM", () => {
    const html = renderSolid(
      RLPage,
      {
        as: "section",
        ui: { root: "x" },
        leadingSlot: <div>Left</div>,
        trailingSlot: <div>Right</div>,
      },
      "Main",
    );
    expect(html).not.toContain("ui=");
    expect(html).not.toContain("as=");
    expect(html).not.toContain("leadingSlot=");
    expect(html).not.toContain("trailingSlot=");
  });
});
