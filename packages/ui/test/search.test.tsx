import { describe, it, expect } from "vite-plus/test";
import { renderToString } from "@solidjs/web";
import { RLSearch } from "../src/components/search/RLSearch";
import { cleanHtml } from "./utils/normalize";

function ssr(fn: () => any): string {
  return cleanHtml(renderToString(fn));
}

describe("RLSearch — server render", () => {
  it("renders the root with data-slot and data-theme and a default labelled trigger", () => {
    const html = ssr(() => <RLSearch theme="dark" />);
    expect(html).toContain('data-slot="root"');
    expect(html).toContain("data-theme");
    expect(html).toContain('aria-label="Search"');
    expect(html).not.toContain('data-slot="modal"');
  });

  it("renders the triggerSlot node instead of the default trigger", () => {
    const html = ssr(() => <RLSearch triggerSlot={<span class="custom-trigger">Find</span>} />);
    expect(html).toContain("custom-trigger");
    expect(html).toContain('data-slot="trigger"');
    expect(html).not.toContain('aria-label="Search"');
  });

  it("uses children as the trigger when no triggerSlot is given", () => {
    const html = ssr(() => <RLSearch>Child trigger</RLSearch>);
    expect(html).toContain("Child trigger");
    expect(html).not.toContain('aria-label="Search"');
  });
});
