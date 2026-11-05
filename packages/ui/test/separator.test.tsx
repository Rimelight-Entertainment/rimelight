import { describe, it, expect } from "vite-plus/test";
import { RLSeparator } from "../src/components/separator/RLSeparator";
import { renderSolid } from "./utils/normalize";

describe("RLSeparator — server render", () => {
  it("renders a decorative divider by default", () => {
    const html = renderSolid(RLSeparator, {});
    expect(html).toContain('data-slot="root"');
    expect(html).not.toContain("data-theme=");
    expect(html).toContain('role="none"');
    expect(html).not.toContain("aria-orientation");
    expect(html).toContain('data-slot="border"');
  });

  it("exposes a separator role with horizontal orientation when not decorative", () => {
    const html = renderSolid(RLSeparator, { decorative: false });
    expect(html).toContain('role="separator"');
    expect(html).toContain('aria-orientation="horizontal"');
  });

  it("reports the vertical orientation when not decorative", () => {
    const html = renderSolid(RLSeparator, { decorative: false, orientation: "vertical" });
    expect(html).toContain('aria-orientation="vertical"');
  });

  it("renders no content container when there is nothing to show", () => {
    expect(renderSolid(RLSeparator, {})).not.toContain('data-slot="container"');
  });

  it("renders the label prop inside the container", () => {
    const html = renderSolid(RLSeparator, { label: "Or" });
    expect(html).toContain('data-slot="container"');
    expect(html).toContain('data-slot="label"');
    expect(html).toContain("Or");
  });

  it("renders children inside the label", () => {
    const html = renderSolid(RLSeparator, {}, "Section");
    expect(html).toContain('data-slot="container"');
    expect(html).toContain("Section");
  });

  it("renders the icon prop as an icon element", () => {
    expect(renderSolid(RLSeparator, { icon: "star" })).toContain('data-slot="icon"');
  });

  it("renders an avatar from an image URL string", () => {
    const html = renderSolid(RLSeparator, { avatar: "https://example.com/a.png" });
    expect(html).toContain('data-slot="avatar"');
    expect(html).toContain('src="https://example.com/a.png"');
  });

  it("replaces the avatar with avatarSlot", () => {
    const html = renderSolid(RLSeparator, {
      avatar: "https://example.com/a.png",
      avatarSlot: "CUSTOM_AVATAR",
    });
    expect(html).toContain("CUSTOM_AVATAR");
    expect(html).not.toContain('data-slot="avatar"');
  });

  it("replaces the icon with iconSlot", () => {
    const html = renderSolid(RLSeparator, { icon: "star", iconSlot: "CUSTOM_ICON" });
    expect(html).toContain("CUSTOM_ICON");
    expect(html).not.toContain('data-slot="icon"');
  });

  it("shows the container when only a slot is provided", () => {
    expect(renderSolid(RLSeparator, { iconSlot: "CUSTOM_ICON" })).toContain(
      'data-slot="container"',
    );
  });
});
