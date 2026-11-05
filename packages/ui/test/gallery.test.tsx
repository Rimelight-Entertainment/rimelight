import { describe, it, expect } from "vite-plus/test";
import { renderToString } from "@solidjs/web";
import { RLGallery } from "../src/components/gallery/RLGallery";
import { cleanHtml } from "./utils/normalize";

function render(fn: () => any): string {
  return cleanHtml(renderToString(fn));
}

describe("RLGallery", () => {
  it("renders children inside the root", () => {
    const html = render(() => <RLGallery>photos</RLGallery>);
    expect(html).toContain('data-slot="root"');
    expect(html).toContain("photos");
  });

  it("renders the root as the as prop element", () => {
    const html = render(() => <RLGallery as="section">photos</RLGallery>);
    expect(html.startsWith("<section")).toBe(true);
  });

  it("forwards extra attributes to the root", () => {
    const html = render(() => <RLGallery id="gallery-1">photos</RLGallery>);
    expect(html).toContain('id="gallery-1"');
  });
});
