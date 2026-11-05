import { describe, it, expect } from "vite-plus/test";
import { renderToString } from "@solidjs/web";

import { RLChatMessage } from "../src/components/chat-message/RLChatMessage";
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

describe("RLChatMessage", () => {
  describe("Exports", () => {
    it("exports RLChatMessage component", () => {
      expect(RLChatMessage).toBeDefined();
    });
  });

  describe("Structure & Props", () => {
    it("renders an article with children", () => {
      const html = render(() => <RLChatMessage>Message body</RLChatMessage>);
      expect(attr(rootTag(html), "role")).toBe("article");
      expect(html).toContain("Message body");
    });

    it("defaults data-from to assistant", () => {
      const tag = rootTag(render(() => <RLChatMessage />));
      expect(attr(tag, "data-from")).toBe("assistant");
    });

    it("reflects the from prop in data-from", () => {
      const tag = rootTag(render(() => <RLChatMessage from="user" />));
      expect(attr(tag, "data-from")).toBe("user");
    });

    it("renders the requested element through as", () => {
      const html = render(() => <RLChatMessage as="li" />);
      expect(html).toContain("<li");
    });
  });
});
