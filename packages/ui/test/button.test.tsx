import { describe, it, expect } from "vite-plus/test";

import { RLButton } from "../src/components/button/RLButton";
import { renderToString } from "@solidjs/web";
import { cleanHtml } from "./utils/normalize";

function render(fn: () => any): string {
  return cleanHtml(renderToString(fn));
}

describe("RLButton", () => {
  const colors = [
    "primary",
    "secondary",
    "success",
    "info",
    "warning",
    "error",
    "neutral",
  ] as const;

  const variants = ["solid", "outline", "soft", "subtle", "ghost", "link"] as const;
  const sizes = ["xs", "sm", "md", "lg", "xl"] as const;

  describe("Basic rendering & label", () => {
    it("renders label via label prop", () => {
      const html = render(() => <RLButton label="Save Changes" />);
      expect(html).toContain("Save Changes");
      expect(html).toContain('data-slot="root"');
      expect(html).toContain('data-slot="label"');
      expect(html.startsWith("<button")).toBe(true);
      expect(html).toContain('type="button"');
    });

    it("renders label via children default slot", () => {
      const html = render(() => <RLButton>Submit Form</RLButton>);
      expect(html).toContain("Submit Form");
      expect(html).toContain('data-slot="root"');
    });

    it("prefers children when both label and children are provided", () => {
      const html = render(() => <RLButton label="Prop Label">Children Label</RLButton>);
      expect(html).toContain("Children Label");
      expect(html).not.toContain("Prop Label");
    });

    it("supports custom button types (submit, reset, button)", () => {
      const submitHtml = render(() => <RLButton type="submit" label="Submit" />);
      expect(submitHtml).toContain('type="submit"');

      const resetHtml = render(() => <RLButton type="reset" label="Reset" />);
      expect(resetHtml).toContain('type="reset"');
    });
  });

  describe("Polymorphic rendering & Link support", () => {
    it("renders as anchor tag when href or to is provided", () => {
      const hrefHtml = render(() => <RLButton href="https://example.com" label="External Link" />);
      expect(hrefHtml.startsWith("<a")).toBe(true);
      expect(hrefHtml).toContain('href="https://example.com"');

      const toHtml = render(() => <RLButton to="/docs/getting-started" label="Internal Link" />);
      expect(toHtml.startsWith("<a")).toBe(true);
      expect(toHtml).toContain('href="/docs/getting-started"');
    });

    it("handles external links with rel and target defaults", () => {
      const html = render(() => <RLButton href="https://example.com" label="External" />);
      expect(html).toContain('target="_blank"');
      expect(html).toContain('rel="noopener noreferrer"');
    });

    it("supports custom rel, target and noRel on links", () => {
      const noRelHtml = render(() => (
        <RLButton href="https://example.com" noRel target="_self" label="Link" />
      ));
      expect(noRelHtml).not.toContain("rel=");
      expect(noRelHtml).toContain('target="_self"');
    });

    it("supports polymorphic 'as' prop when not a link", () => {
      const divHtml = render(() => <RLButton as="div" label="Div Button" />);
      expect(divHtml.startsWith("<div")).toBe(true);
      expect(divHtml).not.toContain('type="button"');
    });
  });

  describe("Color and Variant permutations", () => {
    for (const color of colors) {
      for (const variant of variants) {
        it(`renders correctly for color=${color}, variant=${variant}`, () => {
          const html = render(() => <RLButton color={color} variant={variant} label="Action" />);
          expect(html).toContain("Action");
          expect(html).toContain('data-slot="root"');
        });
      }
    }
  });

  describe("Size scales and Square buttons", () => {
    for (const size of sizes) {
      it(`renders size=${size}`, () => {
        const html = render(() => <RLButton size={size} label="Size Test" />);
        expect(html).toContain("Size Test");
      });
    }

    it("renders square padding when square=true", () => {
      const html = render(() => <RLButton square leadingIcon="check" />);
      expect(html).toContain("p-1.5");
      expect(html).not.toContain("px-");
    });

    it("automatically applies square padding for icon-only button without label", () => {
      const html = render(() => <RLButton icon="search" />);
      expect(html).toContain("p-1.5");
      expect(html).not.toContain("px-");
    });

    it("applies standard padding when label is present, even with icon", () => {
      const html = render(() => <RLButton icon="search" label="Search" />);
      expect(html).toContain("px-2.5");
    });
  });

  describe("Block and layout justify", () => {
    it("renders full width with block=true", () => {
      const html = render(() => <RLButton block label="Full Width Button" />);
      expect(html).toContain("w-full");
      expect(html).toContain("justify-center");
    });

    it("supports justify alignment variations", () => {
      const startHtml = render(() => <RLButton justify="start" label="Start" />);
      expect(startHtml).toContain("justify-start");

      const betweenHtml = render(() => <RLButton justify="between" label="Between" />);
      expect(betweenHtml).toContain("justify-between");
    });
  });

  describe("Icons and Avatars", () => {
    it("renders icon as leading by default", () => {
      const html = render(() => <RLButton icon="rocket" label="Launch" />);
      expect(html).toContain('data-slot="leading-icon"');
      expect(html).toContain("Launch");
    });

    it("renders icon as trailing when trailing=true", () => {
      const html = render(() => <RLButton icon="arrow-right" trailing label="Next" />);
      expect(html).toContain('data-slot="trailing-icon"');
      expect(html).toContain("Next");
    });

    it("renders separate leadingIcon and trailingIcon", () => {
      const html = render(() => (
        <RLButton leadingIcon="user" trailingIcon="chevron-down" label="Profile" />
      ));
      expect(html).toContain('data-slot="leading-icon"');
      expect(html).toContain('data-slot="trailing-icon"');
      expect(html).toContain("Profile");
    });

    it("renders avatar in leading position", () => {
      const html = render(() => (
        <RLButton avatar={{ src: "https://example.com/avatar.png" }} label="User" />
      ));
      expect(html).toContain('data-slot="leading-avatar"');
      expect(html).toContain("User");
    });

    it("supports custom leading and trailing slot content", () => {
      const html = render(() => (
        <RLButton
          leading={<span class="custom-leading">🚀</span>}
          trailing={<span class="custom-trailing">➡️</span>}
          label="Custom Slots"
        />
      ));
      expect(html).toContain("custom-leading");
      expect(html).toContain("custom-trailing");
      expect(html).toContain("Custom Slots");
    });
  });

  describe("Loading states", () => {
    it("renders loading spinner and sets disabled / aria-busy", () => {
      const html = render(() => <RLButton loading label="Processing" />);
      expect(html).toContain("Processing");
      expect(html).toContain('data-loading="true"');
      expect(html).toContain('aria-busy="true"');
      expect(html).toContain("disabled");
      expect(html).toContain("animate-spin");
    });

    it("renders trailing loading spinner when trailing=true", () => {
      const html = render(() => <RLButton loading trailing label="Saving" />);
      expect(html).toContain('data-slot="trailing-icon"');
      expect(html).toContain("animate-spin");
    });

    it("supports custom loadingIcon", () => {
      const html = render(() => <RLButton loading loadingIcon="rotate-cw" label="Refreshing" />);
      expect(html).toContain("Refreshing");
      expect(html).toContain('data-loading="true"');
    });

    it("disables link and prevents interaction when loading", () => {
      const html = render(() => <RLButton href="/dashboard" loading label="Dashboard" />);
      expect(html).not.toContain('href="/dashboard"');
      expect(html).toContain('aria-disabled="true"');
      expect(html).toContain('tabindex="-1"');
    });
  });

  describe("Active state and styling", () => {
    it("applies active styling, activeColor, and activeVariant", () => {
      const html = render(() => (
        <RLButton
          active
          color="neutral"
          variant="outline"
          activeColor="primary"
          activeVariant="solid"
          label="Active Item"
        />
      ));
      expect(html).toContain("Active Item");
      expect(html).toContain("rl-color-primary");
    });

    it("applies activeClass when active=true and inactiveClass when active=false", () => {
      const activeHtml = render(() => (
        <RLButton active activeClass="font-black" inactiveClass="font-light" label="Tab" />
      ));
      expect(activeHtml).toContain("font-black");
      expect(activeHtml).not.toContain("font-light");

      const inactiveHtml = render(() => (
        <RLButton active={false} activeClass="font-black" inactiveClass="font-light" label="Tab" />
      ));
      expect(inactiveHtml).toContain("font-light");
      expect(inactiveHtml).not.toContain("font-black");
    });

    it("sets aria-current on active links", () => {
      const html = render(() => (
        <RLButton href="/current" active ariaCurrentValue="page" label="Current Page" />
      ));
      expect(html).toContain('aria-current="page"');
    });
  });

  describe("Field group integration", () => {
    it("applies fieldGroup horizontal styles", () => {
      const html = render(() => <RLButton fieldGroup="horizontal" label="Segment" />);
      expect(html).toContain("first:rounded-e-none");
      expect(html).toContain("last:rounded-s-none");
    });

    it("applies fieldGroup vertical styles", () => {
      const html = render(() => <RLButton fieldGroup="vertical" label="Stack" />);
      expect(html).toContain("first:rounded-b-none");
      expect(html).toContain("last:rounded-t-none");
    });
  });

  describe("WAI-ARIA & Accessibility", () => {
    it("passes aria-label for icon-only button", () => {
      const html = render(() => <RLButton icon="search" aria-label="Search items" />);
      expect(html).toContain('aria-label="Search items"');
    });

    it("passes aria-labelledby when provided", () => {
      const html = render(() => <RLButton ariaLabelledby="heading-id" label="Linked" />);
      expect(html).toContain('aria-labelledby="heading-id"');
    });

    it("sets disabled and aria-disabled on disabled buttons", () => {
      const html = render(() => <RLButton disabled label="Disabled Action" />);
      expect(html).toContain("disabled");
      expect(html).toContain('aria-disabled="true"');
    });

    it("sets aria-disabled and strips href on disabled links", () => {
      const html = render(() => (
        <RLButton href="https://example.com" disabled label="Disabled Link" />
      ));
      expect(html).not.toContain("href=");
      expect(html).toContain('aria-disabled="true"');
      expect(html).toContain('tabindex="-1"');
    });
  });

  describe("Slot overrides via ui prop", () => {
    it("accepts ui.base and ui.root overrides seamlessly", () => {
      const uiBaseHtml = render(() => <RLButton label="Custom" ui={{ base: "shadow-2xl" }} />);
      expect(uiBaseHtml).toContain("shadow-2xl");

      const uiRootHtml = render(() => (
        <RLButton label="Custom" ui={{ root: "backdrop-blur-md" }} />
      ));
      expect(uiRootHtml).toContain("backdrop-blur-md");
    });

    it("accepts slot class overrides for label and icons", () => {
      const html = render(() => (
        <RLButton
          icon="star"
          label="Starred"
          ui={{
            label: "tracking-widest",
            leadingIcon: "text-amber-400",
          }}
        />
      ));
      expect(html).toContain("tracking-widest");
      expect(html).toContain("text-amber-400");
    });
  });

  describe("CSP Compliance", () => {
    it("does not render any inline style attribute", () => {
      const html = render(() => (
        <RLButton
          color="primary"
          variant="solid"
          size="lg"
          icon="star"
          block
          label="CSP Safe Button"
        />
      ));
      expect(html).not.toContain('style="');
    });
  });

  describe("External link affordances", () => {
    it("appends the screen-reader hint for links opening in a new tab", () => {
      const html = render(() => <RLButton href="https://example.com" label="Open" />);
      expect(html).toContain('data-slot="external-hint"');
      expect(html).toContain("(opens in a new tab)");
      expect(html).toContain("sr-only");
    });

    it("hides the hint when an explicit aria-label carries the name", () => {
      const html = render(() => (
        <RLButton href="https://example.com" label="Open" aria-label="Open example in a new tab" />
      ));
      expect(html).not.toContain('data-slot="external-hint"');
    });

    it("omits the hint for internal links", () => {
      const html = render(() => <RLButton to="/docs" label="Docs" />);
      expect(html).not.toContain('data-slot="external-hint"');
    });

    it("omits the hint when target is not _blank", () => {
      const html = render(() => (
        <RLButton href="https://example.com" target="_self" label="Same tab" />
      ));
      expect(html).not.toContain('data-slot="external-hint"');
    });

    it("omits the hint on non-link buttons", () => {
      const html = render(() => <RLButton label="Plain" />);
      expect(html).not.toContain('data-slot="external-hint"');
    });

    it("appends a trailing external icon for explicit external links", () => {
      const html = render(() => <RLButton href="https://example.com" external label="Open" />);
      expect(html).toContain('data-slot="trailing-icon"');
      expect(html).toContain("<svg");
    });

    it("omits the external icon for auto-detected external links", () => {
      const html = render(() => <RLButton href="https://example.com" label="Open" />);
      expect(html).not.toContain('data-slot="trailing-icon"');
    });

    it("omits the external icon on icon-only buttons even when external", () => {
      const html = render(() => (
        <RLButton href="https://example.com" external icon="twitter" aria-label="Twitter" />
      ));
      expect(html).not.toContain('data-slot="trailing-icon"');
      expect(html).toContain('data-slot="leading-icon"');
    });

    it("removes the external icon via noExternalIcon", () => {
      const html = render(() => (
        <RLButton href="https://example.com" external label="Open" noExternalIcon />
      ));
      expect(html).not.toContain('data-slot="trailing-icon"');
    });

    it("renders a custom externalIcon instead of the default one", () => {
      const defaultHtml = render(() => (
        <RLButton href="https://example.com" external label="Open" />
      ));
      const customHtml = render(() => (
        <RLButton
          href="https://example.com"
          external
          label="Open"
          externalIcon="arrowUpFromLine"
          trailingIcon="arrowUpFromLine"
        />
      ));
      expect(customHtml).toContain('data-slot="trailing-icon"');
      expect(customHtml).not.toBe(defaultHtml);
    });

    it("keeps the hint present but overrides its class via ui.externalHint", () => {
      const html = render(() => (
        <RLButton
          href="https://example.com"
          label="Open"
          ui={{ externalHint: "sr-only custom-hint" }}
        />
      ));
      expect(html).toContain('data-slot="external-hint"');
      expect(html).toContain("custom-hint");
    });
  });

  describe("Polymorphic semantics", () => {
    it("keeps native button semantics without an explicit role", () => {
      const html = render(() => <RLButton label="Native" />);
      expect(html.startsWith("<button")).toBe(true);
      expect(html).toContain('type="button"');
      expect(html).not.toContain('role="button"');
    });

    it("adds role and tabindex to a non-native custom root", () => {
      const html = render(() => <RLButton as="div" label="Custom" />);
      expect(html.startsWith("<div")).toBe(true);
      expect(html).toContain('role="button"');
      expect(html).toContain('tabindex="0"');
      expect(html).not.toContain('type="');
    });

    it("keeps tabindex=-1 on disabled non-native roots", () => {
      const html = render(() => <RLButton as="div" disabled label="Custom" />);
      expect(html).toContain('tabindex="-1"');
      expect(html).toContain('aria-disabled="true"');
    });

    it("does not force type on tags outside button/input", () => {
      const html = render(() => <RLButton as="span" label="Span" />);
      expect(html.startsWith("<span")).toBe(true);
      expect(html).not.toContain('type="button"');
    });
  });

  describe("Square parity with Nuxt UI", () => {
    it("stays square for icon-only buttons even when square={false}", () => {
      const html = render(() => <RLButton icon="search" square={false} />);
      expect(html).toContain("aspect-square");
      expect(html).not.toContain("px-2.5");
    });

    it("keeps standard padding for labeled buttons with square={false}", () => {
      const html = render(() => <RLButton icon="search" label="Search" square={false} />);
      expect(html).toContain("px-2.5");
      expect(html).not.toContain("aspect-square");
    });

    it("keeps standard padding when children are provided without a label", () => {
      const html = render(() => <RLButton icon="search">Search</RLButton>);
      expect(html).toContain("px-2.5");
      expect(html).not.toContain("aspect-square");
    });
  });
});
