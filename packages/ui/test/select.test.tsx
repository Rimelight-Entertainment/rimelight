import { describe, it, expect } from "vite-plus/test";
import { renderToString } from "@solidjs/web";
import { RLSelect } from "../src/components/select/RLSelect";
import { cleanHtml } from "./utils/normalize";

function ssr(fn: () => any): string {
  return cleanHtml(renderToString(fn));
}

describe("RLSelect — server render", () => {
  it("renders the root, native select, and trigger with data-slot", () => {
    const html = ssr(() => <RLSelect items={["a"]} theme="dark" />);
    expect(html).toContain('data-slot="root"');
    expect(html).toContain("data-theme");
    expect(html).toContain('data-slot="select"');
    expect(html).toContain('data-slot="trigger"');
  });

  it("marks icon layout with data-variant and leaves other layouts unmarked", () => {
    expect(ssr(() => <RLSelect layout="icon" />)).toContain('data-variant="icon"');
    expect(ssr(() => <RLSelect />)).not.toContain("data-variant");
  });

  it("uses children in place of items", () => {
    const html = ssr(() => (
      <RLSelect items={["ignored"]}>
        <option value="custom">Custom</option>
      </RLSelect>
    ));
    expect(html).toContain("Custom");
    expect(html).not.toContain("ignored");
  });
});

describe("RLSelect — slots and interaction", () => {
  it("renders the leadingIcon when no leadingSlot is given", () => {
    const html = ssr(() => <RLSelect items={["a"]} leadingIcon="star" />);
    expect(html).toContain('data-slot="leading"');
    expect(html).toContain('data-slot="icon"');
  });

  it("prefers the leadingSlot node over leadingIcon", () => {
    const html = ssr(() => (
      <RLSelect items={["a"]} leadingIcon="star" leadingSlot={<span class="custom-lead">L</span>} />
    ));
    expect(html).toContain("custom-lead");
    expect(html).not.toContain('data-slot="icon"');
  });

  it("renders a render-function leadingSlot", () => {
    const html = ssr(() => <RLSelect items={["a"]} leadingSlot={() => <span>Fn</span>} />);
    expect(html).toContain("<span>Fn</span>");
  });
});
