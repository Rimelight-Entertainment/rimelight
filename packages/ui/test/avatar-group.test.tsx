import { describe, it, expect } from "vite-plus/test";

import { RLAvatarGroup } from "../src/components/avatar-group/RLAvatarGroup";
import { renderSolid } from "./utils/normalize";

const items = [
  { alt: "Ada", text: "AL" },
  { alt: "Grace", text: "GH" },
  { alt: "Linus", text: "LT" },
];

function baseCount(html: string): number {
  return html.match(/<span[^>]*data-slot="base"/g)?.length ?? 0;
}

describe("RLAvatarGroup", () => {
  it("renders one base item per avatar in items mode", () => {
    const html = renderSolid(RLAvatarGroup, { items });
    expect(baseCount(html)).toBe(3);
    expect(html).not.toContain("+");
  });

  it("limits items to max and shows the hidden count", () => {
    const html = renderSolid(RLAvatarGroup, { items, max: 2 });
    expect(baseCount(html)).toBe(2);
    expect(html).toMatch(/data-slot="more"[^>]*>\s*\+1\s*</);
  });

  it("renders children when items is empty", () => {
    const html = renderSolid(RLAvatarGroup, { items: [] }, ["A", "B"]);
    expect(baseCount(html)).toBe(2);
    expect(html).toContain("A");
    expect(html).toContain("B");
  });

  it("limits children to max and shows the hidden count", () => {
    const html = renderSolid(RLAvatarGroup, { max: 2 }, ["A", "B", "C"]);
    expect(baseCount(html)).toBe(2);
    expect(html).not.toContain("C");
    expect(html).toMatch(/data-slot="more"[^>]*>\s*\+1\s*</);
  });

  it("shows no counter when children fit within max", () => {
    const html = renderSolid(RLAvatarGroup, { max: 5 }, ["A", "B"]);
    expect(baseCount(html)).toBe(2);
    expect(html).not.toContain('data-slot="more"');
  });

  it("forwards extra attributes to the root element", () => {
    const html = renderSolid(RLAvatarGroup, { items, id: "team" });
    expect(html).toMatch(/<[a-z]+[^>]*data-slot="root"[^>]*id="team"/);
  });
});
