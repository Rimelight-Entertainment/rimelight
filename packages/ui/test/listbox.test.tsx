import { describe, it, expect } from "vite-plus/test";
import { renderToString } from "@solidjs/web";
import { RLListbox } from "../src/components/listbox/RLListbox";
import { cleanHtml } from "./utils/normalize";

function render(fn: () => any): string {
  return cleanHtml(renderToString(fn));
}

describe("RLListbox", () => {
  it("renders children inside the root", () => {
    const html = render(() => <RLListbox>options</RLListbox>);
    expect(html).toContain('data-slot="root"');
    expect(html).toContain("options");
  });

  it("renders the root as the as prop element", () => {
    const html = render(() => <RLListbox as="ul">options</RLListbox>);
    expect(html.startsWith("<ul")).toBe(true);
  });

  it("forwards extra attributes to the root", () => {
    const html = render(() => <RLListbox id="listbox-1">options</RLListbox>);
    expect(html).toContain('id="listbox-1"');
  });
});
