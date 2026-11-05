import { describe, it, expect } from "vite-plus/test";
import { renderToString } from "@solidjs/web";

import { RLChatPalette } from "../src/components/chat-palette/RLChatPalette";
import { cleanHtml } from "./utils/normalize";

function render(fn: () => any): string {
  return cleanHtml(renderToString(fn));
}

function rootTag(html: string): string {
  return html.match(/<[a-z0-9]+[^>]*data-slot="root"[^>]*>/)?.[0] ?? "";
}

function attr(tag: string, name: string): string | undefined {
  return tag.match(new RegExp(`\\s${name}="([^"]*)"`))?.[1];
}

describe("RLChatPalette", () => {
  describe("Exports", () => {
    it("exports RLChatPalette component", () => {
      expect(RLChatPalette).toBeDefined();
    });
  });

  describe("Structure & Props", () => {
    it("renders a labelled group", () => {
      const tag = rootTag(render(() => <RLChatPalette />));
      expect(attr(tag, "role")).toBe("group");
      expect(attr(tag, "aria-label")).toBeTruthy();
    });

    it("uses a custom aria-label when provided", () => {
      const tag = rootTag(render(() => <RLChatPalette aria-label="Quick replies" />));
      expect(attr(tag, "aria-label")).toBe("Quick replies");
    });

    it("renders children inside the group", () => {
      const html = render(() => <RLChatPalette>Suggestion</RLChatPalette>);
      expect(html).toContain("Suggestion");
    });
  });
});
