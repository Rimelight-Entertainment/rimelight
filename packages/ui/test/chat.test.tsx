import { describe, it, expect } from "vite-plus/test";
import { renderToString } from "@solidjs/web";

import { RLChat } from "../src/components/chat/RLChat";
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

describe("RLChat", () => {
  describe("Exports", () => {
    it("exports RLChat component", () => {
      expect(RLChat).toBeDefined();
    });
  });

  describe("Structure & Props", () => {
    it("renders children inside a labelled region", () => {
      const html = render(() => <RLChat>Conversation body</RLChat>);
      const tag = rootTag(html);
      expect(attr(tag, "role")).toBe("region");
      expect(attr(tag, "aria-label")).toBeTruthy();
      expect(html).toContain("Conversation body");
    });

    it("uses a custom aria-label when provided", () => {
      const tag = rootTag(render(() => <RLChat aria-label="Support chat" />));
      expect(attr(tag, "aria-label")).toBe("Support chat");
    });

    it("renders the requested element through as", () => {
      const html = render(() => <RLChat as="section" />);
      expect(html).toContain("<section");
    });

    it("does not leak the status prop onto the DOM", () => {
      const html = render(() => <RLChat status="streaming" />);
      expect(html).not.toContain("status=");
    });
  });

  describe("Status", () => {
    it("marks the region busy while submitted", () => {
      const tag = rootTag(render(() => <RLChat status="submitted" />));
      expect(attr(tag, "aria-busy")).toBe("true");
    });

    it("marks the region busy while streaming", () => {
      const tag = rootTag(render(() => <RLChat status="streaming" />));
      expect(attr(tag, "aria-busy")).toBe("true");
    });

    it("omits aria-busy when ready", () => {
      const tag = rootTag(render(() => <RLChat status="ready" />));
      expect(attr(tag, "aria-busy")).toBeUndefined();
    });
  });
});
