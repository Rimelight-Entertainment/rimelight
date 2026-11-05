import { describe, it, expect } from "vite-plus/test";
import { renderToString } from "@solidjs/web";

import { RLChatShimmer } from "../src/components/chat-shimmer/RLChatShimmer";
import { cleanHtml } from "./utils/normalize";

function render(fn: () => any): string {
  return cleanHtml(renderToString(fn));
}

describe("RLChatShimmer", () => {
  describe("Exports", () => {
    it("exports RLChatShimmer component", () => {
      expect(RLChatShimmer).toBeDefined();
    });
  });

  describe("Structure & Props", () => {
    it("renders children as an inline span by default", () => {
      const html = render(() => <RLChatShimmer>Working</RLChatShimmer>);
      expect(html).toContain("<span");
      expect(html).toContain("Working");
    });

    it("renders the requested element through as", () => {
      const html = render(() => <RLChatShimmer as="p">Working</RLChatShimmer>);
      expect(html).toContain("<p");
    });
  });
});
