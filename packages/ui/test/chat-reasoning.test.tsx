import { describe, it, expect } from "vite-plus/test";
import { renderToString } from "@solidjs/web";

import { RLChatReasoning } from "../src/components/chat-reasoning/RLChatReasoning";
import { cleanHtml } from "./utils/normalize";

function render(fn: () => any): string {
  return cleanHtml(renderToString(fn));
}

describe("RLChatReasoning", () => {
  describe("Exports", () => {
    it("exports RLChatReasoning component", () => {
      expect(RLChatReasoning).toBeDefined();
    });
  });

  describe("Structure & Props", () => {
    it("renders a details element with the default label in its summary", () => {
      const html = render(() => <RLChatReasoning>Thinking steps</RLChatReasoning>);
      expect(html).toContain("<details");
      expect(html).toContain("<summary");
      expect(html).toContain("Thinking steps");
    });

    it("renders the custom label in the summary", () => {
      const html = render(() => <RLChatReasoning label="Thought process" />);
      expect(html).toContain("Thought process");
    });

    it("opens the block when defaultOpen is set", () => {
      const html = render(() => <RLChatReasoning defaultOpen />);
      expect(html).toMatch(/<details[^>]*\sopen/);
    });

    it("keeps the block closed by default", () => {
      const html = render(() => <RLChatReasoning />);
      expect(html).not.toMatch(/<details[^>]*\sopen/);
    });

    it("does not leak streaming or label props onto the DOM", () => {
      const html = render(() => <RLChatReasoning streaming label="Reasoning" />);
      expect(html).not.toContain("streaming=");
      expect(html).not.toContain("label=");
    });
  });

  describe("Streaming", () => {
    it("flags the root with data-streaming while streaming", () => {
      const html = render(() => <RLChatReasoning streaming />);
      expect(html).toMatch(/<details[^>]*\sdata-streaming(=""|[\s>])/);
    });

    it("omits data-streaming when not streaming", () => {
      const html = render(() => <RLChatReasoning />);
      expect(html).not.toContain("data-streaming");
    });
  });
});
