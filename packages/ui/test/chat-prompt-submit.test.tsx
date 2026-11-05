import { describe, it, expect } from "vite-plus/test";
import { renderToString } from "@solidjs/web";

import { RLChatPromptSubmit } from "../src/components/chat-prompt-submit/RLChatPromptSubmit";
import { cleanHtml } from "./utils/normalize";

function render(fn: () => any): string {
  return cleanHtml(renderToString(fn));
}

describe("RLChatPromptSubmit", () => {
  describe("Exports", () => {
    it("exports RLChatPromptSubmit component", () => {
      expect(RLChatPromptSubmit).toBeDefined();
    });
  });

  describe("Status", () => {
    it("submits the prompt when ready", () => {
      const html = render(() => <RLChatPromptSubmit status="ready" />);
      expect(html).toContain('type="submit"');
      expect(html).toContain('aria-label="Send message"');
    });

    it("becomes a stop button while streaming", () => {
      const html = render(() => <RLChatPromptSubmit status="streaming" />);
      expect(html).toContain('type="button"');
      expect(html).toContain('aria-label="Stop generating"');
    });

    it("uses a custom aria-label when provided", () => {
      const html = render(() => <RLChatPromptSubmit aria-label="Post" />);
      expect(html).toContain('aria-label="Post"');
    });

    it("does not leak the status or onStop props onto the DOM", () => {
      const html = render(() => <RLChatPromptSubmit status="streaming" onStop={() => {}} />);
      expect(html).not.toContain("status=");
      expect(html).not.toContain("onStop");
    });
  });
});
