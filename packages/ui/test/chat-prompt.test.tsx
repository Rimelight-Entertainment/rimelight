import { describe, it, expect } from "vite-plus/test";
import { renderToString } from "@solidjs/web";

import { RLChatPrompt } from "../src/components/chat-prompt/RLChatPrompt";
import { cleanHtml } from "./utils/normalize";

function render(fn: () => any): string {
  return cleanHtml(renderToString(fn));
}

describe("RLChatPrompt", () => {
  describe("Exports", () => {
    it("exports RLChatPrompt component", () => {
      expect(RLChatPrompt).toBeDefined();
    });
  });

  describe("Structure & Props", () => {
    it("renders a form root", () => {
      const html = render(() => <RLChatPrompt />);
      expect(html).toContain("<form");
      expect(html).toContain('data-slot="root"');
    });

    it("renders the placeholder and aria-label from the locale by default", () => {
      const html = render(() => <RLChatPrompt />);
      expect(html).toContain("placeholder=");
      expect(html).toContain("aria-label=");
    });

    it("uses a custom placeholder when provided", () => {
      const html = render(() => <RLChatPrompt placeholder="Ask anything" />);
      expect(html).toContain('placeholder="Ask anything"');
    });

    it("forwards name and disabled to the text field", () => {
      const html = render(() => <RLChatPrompt name="prompt" disabled />);
      expect(html).toContain('name="prompt"');
      expect(html).toContain("disabled");
    });

    it("renders children in the footer", () => {
      const html = render(() => <RLChatPrompt>Footer action</RLChatPrompt>);
      expect(html).toContain('data-slot="footer"');
      expect(html).toContain("Footer action");
    });

    it("omits the footer when there are no children", () => {
      const html = render(() => <RLChatPrompt />);
      expect(html).not.toContain('data-slot="footer"');
    });
  });
});
