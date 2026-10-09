import { describe, it, expect } from "vite-plus/test";

import { RLLink } from "../src/components/link/RLLink";
import { renderToString } from "@solidjs/web";
import { cleanHtml } from "./utils/normalize";

function render(fn: () => any): string {
  return cleanHtml(renderToString(fn));
}

describe("RLLink", () => {
  describe("External link affordances", () => {
    it("appends the screen-reader hint for links opening in a new tab", () => {
      const html = render(() => <RLLink href="https://example.com" label="Open" />);
      expect(html).toContain('data-slot="external-hint"');
      expect(html).toContain("(opens in a new tab)");
      expect(html).toContain("sr-only");
    });

    it("hides the hint when an explicit aria-label carries the name", () => {
      const html = render(() => (
        <RLLink href="https://example.com" label="Open" aria-label="Open in a new tab" />
      ));
      expect(html).not.toContain('data-slot="external-hint"');
    });

    it("omits the hint for internal links and same-tab targets", () => {
      expect(render(() => <RLLink to="/docs" label="Docs" />)).not.toContain(
        'data-slot="external-hint"',
      );
      expect(
        render(() => <RLLink href="https://example.com" target="_self" label="Same tab" />),
      ).not.toContain('data-slot="external-hint"');
    });

    it("keeps the hint in raw mode", () => {
      const html = render(() => <RLLink href="https://example.com" label="Open" raw />);
      expect(html).toContain('data-slot="external-hint"');
      expect(html).toContain("sr-only");
    });

    it("supports ui.externalHint overrides", () => {
      const html = render(() => (
        <RLLink
          href="https://example.com"
          label="Open"
          ui={{ externalHint: "custom-hint-class" }}
        />
      ));
      expect(html).toContain('data-slot="external-hint"');
      expect(html).toContain("custom-hint-class");
    });
  });

  describe("Icons & prefetch", () => {
    it("renders leading and trailing icons as inline svg", () => {
      const html = render(() => <RLLink to="/docs" label="Docs" leadingIcon="bookOpen" />);
      expect(html).toContain('data-slot="leading-icon"');
      expect(html).toContain("<svg");

      const trailingHtml = render(() => (
        <RLLink to="/docs" label="Docs" trailingIcon="arrowRight" />
      ));
      expect(trailingHtml).toContain('data-slot="trailing-icon"');
      expect(trailingHtml).toContain("<svg");
    });

    it("emits data-astro-prefetch on links", () => {
      expect(render(() => <RLLink to="/docs" label="Docs" prefetch />)).toContain(
        'data-astro-prefetch="viewport"',
      );
      expect(render(() => <RLLink to="/docs" label="Docs" />)).not.toContain("data-astro-prefetch");
    });

    it("applies active and disabled semantics", () => {
      const activeHtml = render(() => <RLLink to="/docs" label="Docs" active />);
      expect(activeHtml).toContain('aria-current="page"');

      const disabledHtml = render(() => <RLLink href="/docs" label="Docs" disabled />);
      expect(disabledHtml).toContain('aria-disabled="true"');
      expect(disabledHtml).not.toContain("href=");
    });
  });
});
