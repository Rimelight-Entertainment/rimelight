import { describe, it, expect } from "vite-plus/test";
import { RLSwitch } from "../src/components/switch/RLSwitch";
import { renderSolid } from "./utils/normalize";

describe("RLSwitch — server render", () => {
  it("renders a label root wrapping a checkbox input, track, and thumb", () => {
    const html = renderSolid(RLSwitch, { theme: "dark" });
    expect(html.startsWith("<label")).toBe(true);
    expect(html).toContain('data-slot="root"');
    expect(html).toContain("data-theme");
    expect(html).toContain('type="checkbox"');
    expect(html).toContain('data-slot="track"');
    expect(html).toContain('data-slot="thumb"');
  });

  it("renders the label prop as the label text", () => {
    const html = renderSolid(RLSwitch, { label: "Notifications" });
    expect(html).toContain('data-slot="label"');
    expect(html).toContain("Notifications");
  });

  it("falls back to children when no label prop is given", () => {
    const html = renderSolid(RLSwitch, {}, "Dark mode");
    expect(html).toContain('data-slot="label"');
    expect(html).toContain("Dark mode");
  });

  it("prefers the label prop over children", () => {
    const html = renderSolid(RLSwitch, { label: "Label" }, "Child");
    expect(html).toContain("Label");
    expect(html).not.toContain("Child");
  });

  it("omits the label element when there is no label or children", () => {
    expect(renderSolid(RLSwitch, {})).not.toContain('data-slot="label"');
  });

  it("routes aria-label to the checkbox input instead of the root", () => {
    const html = renderSolid(RLSwitch, { "aria-label": "Notifications" });
    expect(html).toMatch(/<input[^>]*aria-label="Notifications"/);
    expect(html.slice(0, html.indexOf(">") + 1)).not.toContain("aria-label");
  });
});
