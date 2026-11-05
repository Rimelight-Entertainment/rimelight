import { describe, it, expect } from "vite-plus/test";

import { RLBrowserMockup } from "../src/components/browser-mockup/RLBrowserMockup";
import { renderToString } from "@solidjs/web";
import { cleanHtml } from "./utils/normalize";

function render(fn: () => any): string {
  return cleanHtml(renderToString(fn));
}

describe("RLBrowserMockup", () => {
  describe("Structure", () => {
    it("renders a region with header, controls, navigation and body", () => {
      const html = render(() => (
        <RLBrowserMockup navigation url="https://rimelight.com">
          <p>Content</p>
        </RLBrowserMockup>
      ));
      expect(html).toContain('role="region"');
      expect(html).toContain('data-slot="root"');
      expect(html).toContain('data-slot="header"');
      expect(html).toContain('data-slot="controls"');
      expect(html).toContain('data-slot="navigation"');
      expect(html).toContain('data-slot="body"');
      expect(html).toContain("<p>Content</p>");
    });

    it("renders the body children inside the body slot", () => {
      const html = render(() => (
        <RLBrowserMockup>
          <p>Body text</p>
        </RLBrowserMockup>
      ));
      expect(html).toMatch(/data-slot="body"[^>]*>\s*<p>Body text<\/p>/);
    });

    it("renders the custom 'as' tag as root", () => {
      const html = render(() => <RLBrowserMockup as="section">x</RLBrowserMockup>);
      expect(html).toMatch(/^<section[^>]*data-slot="root"/);
    });
  });

  describe("Window controls", () => {
    it("renders close, minimize and maximize dots by default", () => {
      const html = render(() => <RLBrowserMockup>x</RLBrowserMockup>);
      expect(html).toContain('data-slot="dot-close"');
      expect(html).toContain('data-slot="dot-minimize"');
      expect(html).toContain('data-slot="dot-maximize"');
    });

    it("hides the controls when controls is false", () => {
      const html = render(() => <RLBrowserMockup controls={false}>x</RLBrowserMockup>);
      expect(html).not.toContain('data-slot="controls"');
    });

    it("hides the controls when controlsVariant is none", () => {
      const html = render(() => <RLBrowserMockup controlsVariant="none">x</RLBrowserMockup>);
      expect(html).not.toContain('data-slot="controls"');
    });

    it("replaces the controls with controlsSlot", () => {
      const html = render(() => (
        <RLBrowserMockup controlsSlot={() => <span data-test="custom-controls" />}>
          x
        </RLBrowserMockup>
      ));
      expect(html).toContain('data-test="custom-controls"');
      expect(html).not.toContain('data-slot="dot-close"');
    });
  });

  describe("Navigation", () => {
    it("hides back, forward and reload buttons by default", () => {
      const html = render(() => <RLBrowserMockup>x</RLBrowserMockup>);
      expect(html).not.toContain('data-slot="back"');
      expect(html).not.toContain('data-slot="forward"');
      expect(html).not.toContain('data-slot="reload"');
    });

    it("renders back, forward and reload buttons when navigation is set", () => {
      const html = render(() => <RLBrowserMockup navigation>x</RLBrowserMockup>);
      expect(html).toContain('data-slot="back"');
      expect(html).toContain('data-slot="forward"');
      expect(html).toContain('data-slot="reload"');
    });

    it("replaces the navigation buttons with navigationSlot", () => {
      const html = render(() => (
        <RLBrowserMockup navigation navigationSlot={() => <span data-test="custom-nav" />}>
          x
        </RLBrowserMockup>
      ));
      expect(html).toContain('data-test="custom-nav"');
      expect(html).not.toContain('data-slot="back"');
    });
  });

  describe("URL bar", () => {
    it("renders the url text when url is set", () => {
      const html = render(() => (
        <RLBrowserMockup url="https://rimelight.com/docs">x</RLBrowserMockup>
      ));
      expect(html).toContain('data-slot="url-bar"');
      expect(html).toContain('data-slot="url-text"');
      expect(html).toContain("https://rimelight.com/docs");
    });

    it("omits the url text when url is not set", () => {
      const html = render(() => <RLBrowserMockup>x</RLBrowserMockup>);
      expect(html).not.toContain('data-slot="url-text"');
    });

    it("renders the default icon prefix when urlPrefix is not set", () => {
      const html = render(() => <RLBrowserMockup url="https://rimelight.com">x</RLBrowserMockup>);
      expect(html).toContain('data-slot="url-prefix"');
      expect(html).toContain('data-slot="url-icon"');
    });

    it("renders a string urlPrefix as text instead of the icon", () => {
      const html = render(() => (
        <RLBrowserMockup url="https://rimelight.com" urlPrefix="https://">
          x
        </RLBrowserMockup>
      ));
      expect(html).toContain("https://");
      expect(html).not.toContain('data-slot="url-icon"');
    });

    it("omits the url prefix when urlPrefix is false", () => {
      const html = render(() => (
        <RLBrowserMockup url="https://rimelight.com" urlPrefix={false}>
          x
        </RLBrowserMockup>
      ));
      expect(html).not.toContain('data-slot="url-prefix"');
    });

    it("replaces the url prefix with urlPrefixSlot inside the prefix wrapper", () => {
      const html = render(() => (
        <RLBrowserMockup
          url="https://rimelight.com"
          urlPrefixSlot={() => <span data-test="prefix" />}
        >
          x
        </RLBrowserMockup>
      ));
      expect(html).toMatch(/data-slot="url-prefix"[^>]*>\s*<span data-test="prefix"/);
      expect(html).not.toContain('data-slot="url-icon"');
    });

    it("renders urlSuffixSlot content after the url text", () => {
      const html = render(() => (
        <RLBrowserMockup
          url="https://rimelight.com"
          urlSuffixSlot={() => <span data-test="suffix" />}
        >
          x
        </RLBrowserMockup>
      ));
      expect(html).toContain('data-slot="url-suffix"');
      expect(html).toContain('data-test="suffix"');
    });

    it("replaces the whole url bar with urlBarSlot", () => {
      const html = render(() => (
        <RLBrowserMockup url="https://rimelight.com" urlBarSlot={() => <span data-test="bar" />}>
          x
        </RLBrowserMockup>
      ));
      expect(html).toContain('data-test="bar"');
      expect(html).not.toContain('data-slot="url-bar"');
    });
  });

  describe("Header and actions", () => {
    it("renders actionsSlot content inside the actions wrapper", () => {
      const html = render(() => (
        <RLBrowserMockup actionsSlot={() => <button data-test="deploy">Deploy</button>}>
          x
        </RLBrowserMockup>
      ));
      expect(html).toMatch(/data-slot="actions"[^>]*>\s*<button data-test="deploy">/);
    });

    it("replaces the whole header with headerSlot", () => {
      const html = render(() => (
        <RLBrowserMockup
          url="https://rimelight.com"
          navigation
          headerSlot={() => <span data-test="header" />}
        >
          x
        </RLBrowserMockup>
      ));
      expect(html).toContain('data-test="header"');
      expect(html).not.toContain('data-slot="controls"');
      expect(html).not.toContain('data-slot="url-bar"');
      expect(html).not.toContain('data-slot="actions"');
    });
  });
});
