import { describe, it, expect } from "vite-plus/test";
import { renderToString } from "@solidjs/web";

import { RLChatTool } from "../src/components/chat-tool/RLChatTool";
import { cleanHtml } from "./utils/normalize";

function render(fn: () => any): string {
  return cleanHtml(renderToString(fn));
}

function rootTag(html: string): string {
  return html.match(/<details[^>]*>/)?.[0] ?? "";
}

function attr(tag: string, name: string): string | undefined {
  return tag.match(new RegExp(`\\s${name}="([^"]*)"`))?.[1];
}

describe("RLChatTool", () => {
  describe("Exports", () => {
    it("exports RLChatTool component", () => {
      expect(RLChatTool).toBeDefined();
    });
  });

  describe("Structure & Props", () => {
    it("renders the tool name in the summary", () => {
      const html = render(() => <RLChatTool toolName="search" />);
      expect(html).toContain("<summary");
      expect(html).toContain("search");
    });

    it("renders children in the body", () => {
      const html = render(() => <RLChatTool>Tool output</RLChatTool>);
      expect(html).toContain('data-slot="body"');
      expect(html).toContain("Tool output");
    });

    it("opens the details when defaultOpen is set", () => {
      const tag = rootTag(render(() => <RLChatTool defaultOpen />));
      expect(tag).toMatch(/\sopen[\s>]/);
    });

    it("does not leak toolName, status, or defaultOpen onto the DOM", () => {
      const html = render(() => <RLChatTool toolName="search" status="running" defaultOpen />);
      expect(html).not.toContain("toolName=");
      expect(html).not.toContain("defaultOpen");
    });
  });

  describe("Status", () => {
    it("reflects the status in data-status", () => {
      const tag = rootTag(render(() => <RLChatTool status="completed" />));
      expect(attr(tag, "data-status")).toBe("completed");
    });

    it("defaults data-status to pending", () => {
      const tag = rootTag(render(() => <RLChatTool />));
      expect(attr(tag, "data-status")).toBe("pending");
    });

    it("shows a localized label for each status", () => {
      const html = render(() => <RLChatTool status="error" />);
      expect(html).toContain('data-slot="status"');
      expect(html).not.toContain("chat-tool.status.error");
    });
  });
});
