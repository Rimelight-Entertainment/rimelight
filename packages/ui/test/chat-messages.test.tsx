import { describe, it, expect } from "vite-plus/test";
import { renderToString } from "@solidjs/web";

import { RLChatMessages } from "../src/components/chat-messages/RLChatMessages";
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

describe("RLChatMessages", () => {
  describe("Exports", () => {
    it("exports RLChatMessages component", () => {
      expect(RLChatMessages).toBeDefined();
    });
  });

  describe("Structure & Props", () => {
    it("renders a log region with a default label", () => {
      const tag = rootTag(render(() => <RLChatMessages />));
      expect(attr(tag, "role")).toBe("log");
      expect(attr(tag, "aria-label")).toBeTruthy();
    });

    it("uses a custom aria-label when provided", () => {
      const tag = rootTag(render(() => <RLChatMessages aria-label="Thread" />));
      expect(attr(tag, "aria-label")).toBe("Thread");
    });

    it("renders children inside the log", () => {
      const html = render(() => <RLChatMessages>Hello there</RLChatMessages>);
      expect(html).toContain("Hello there");
    });

    it("renders the requested element through as", () => {
      const html = render(() => <RLChatMessages as="ol" />);
      expect(html).toContain("<ol");
    });
  });
});
