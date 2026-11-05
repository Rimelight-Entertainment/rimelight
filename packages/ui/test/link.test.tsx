import { describe, it, expect } from "vite-plus/test";

import { RLLink } from "../src/components/link/RLLink";
import { mountComponent } from "./utils/browser-render";

const anchorOf = (container: HTMLElement) => container.querySelector("a") as HTMLAnchorElement;

describe("RLLink", () => {
  describe("href and attributes", () => {
    it("renders an anchor with the given href", () => {
      const container = mountComponent(() => <RLLink href="/docs" localize={false} label="Docs" />);
      expect(anchorOf(container).getAttribute("href")).toBe("/docs");
    });

    it("renders children in place of the label", () => {
      const container = mountComponent(() => (
        <RLLink href="/about" localize={false} label="Ignored">
          <span data-testid="child" />
        </RLLink>
      ));
      expect(container.querySelector("[data-testid='child']")).not.toBeNull();
      expect(container.querySelector("[data-slot='label']")).toBeNull();
    });

    it("renders the label when there are no children", () => {
      const container = mountComponent(() => <RLLink href="/docs" localize={false} label="Docs" />);
      expect(container.querySelector("[data-slot='label']")?.textContent).toContain("Docs");
    });

    it("sets aria-current when active, using the current value", () => {
      const container = mountComponent(() => (
        <RLLink href="/docs" localize={false} label="Docs" active current="step" />
      ));
      expect(anchorOf(container).getAttribute("aria-current")).toBe("step");
    });

    it("defaults aria-current to page when active", () => {
      const container = mountComponent(() => (
        <RLLink href="/docs" localize={false} label="Docs" active />
      ));
      expect(anchorOf(container).getAttribute("aria-current")).toBe("page");
    });

    it("omits aria-current when not active", () => {
      const container = mountComponent(() => <RLLink href="/docs" localize={false} label="Docs" />);
      expect(anchorOf(container).hasAttribute("aria-current")).toBe(false);
    });
  });

  describe("disabled", () => {
    it("removes href and reports aria-disabled", () => {
      const container = mountComponent(() => <RLLink href="/docs" label="Docs" disabled />);
      expect(anchorOf(container).hasAttribute("href")).toBe(false);
      expect(anchorOf(container).getAttribute("aria-disabled")).toBe("true");
    });
  });

  describe("external links", () => {
    it("opens external links in a new tab with a safe rel", () => {
      const container = mountComponent(() => <RLLink href="https://example.com" label="Open" />);
      expect(anchorOf(container).getAttribute("target")).toBe("_blank");
      expect(anchorOf(container).getAttribute("rel")).toBe("noopener noreferrer");
    });

    it("appends the new-tab hint for links opening in a new tab", () => {
      const container = mountComponent(() => <RLLink href="https://example.com" label="Open" />);
      expect(container.querySelector("[data-slot='external-hint']")).not.toBeNull();
    });

    it("hides the hint when an explicit aria-label carries the name", () => {
      const container = mountComponent(() => (
        <RLLink href="https://example.com" label="Open" aria-label="Open in a new tab" />
      ));
      expect(container.querySelector("[data-slot='external-hint']")).toBeNull();
    });

    it("omits the hint for internal links and same-tab targets", () => {
      const internal = mountComponent(() => <RLLink href="/docs" localize={false} label="Docs" />);
      expect(internal.querySelector("[data-slot='external-hint']")).toBeNull();

      const sameTab = mountComponent(() => (
        <RLLink href="https://example.com" target="_self" label="Same tab" />
      ));
      expect(sameTab.querySelector("[data-slot='external-hint']")).toBeNull();
    });

    it("shows the external icon by default and hides it with noExternalIcon", () => {
      const withIcon = mountComponent(() => <RLLink href="https://example.com" label="Open" />);
      expect(withIcon.querySelector("[data-slot='trailing-icon']")).not.toBeNull();

      const withoutIcon = mountComponent(() => (
        <RLLink href="https://example.com" label="Open" noExternalIcon />
      ));
      expect(withoutIcon.querySelector("[data-slot='trailing-icon']")).toBeNull();
    });

    it("omits rel when noRel is set", () => {
      const container = mountComponent(() => (
        <RLLink href="https://example.com" label="Open" noRel />
      ));
      expect(anchorOf(container).hasAttribute("rel")).toBe(false);
    });

    it("omits rel when rel is an empty string", () => {
      const container = mountComponent(() => (
        <RLLink href="https://example.com" label="Open" rel="" />
      ));
      expect(anchorOf(container).hasAttribute("rel")).toBe(false);
    });
  });

  describe("icons and slots", () => {
    it("renders leading and trailing icons", () => {
      const container = mountComponent(() => (
        <RLLink
          href="/docs"
          localize={false}
          label="Docs"
          leadingIcon="i-lucide-book-open"
          trailingIcon="arrow-right"
        />
      ));
      expect(container.querySelector("[data-slot='leading-icon']")).not.toBeNull();
      expect(container.querySelector("[data-slot='trailing-icon']")).not.toBeNull();
    });

    it("replaces the leading icon with the leadingSlot", () => {
      const container = mountComponent(() => (
        <RLLink
          href="/docs"
          localize={false}
          label="Docs"
          leadingIcon="i-lucide-book-open"
          leadingSlot={<span data-testid="custom" />}
        />
      ));
      expect(container.querySelector("[data-testid='custom']")).not.toBeNull();
      expect(container.querySelector("[data-slot='leading-icon']")).toBeNull();
    });

    it("replaces the trailing icon with the trailingSlot", () => {
      const container = mountComponent(() => (
        <RLLink
          href="https://example.com"
          label="Open"
          trailingSlot={<span data-testid="custom" />}
        />
      ));
      expect(container.querySelector("[data-testid='custom']")).not.toBeNull();
      expect(container.querySelector("[data-slot='trailing-icon']")).toBeNull();
    });

    it("renders JSX children once", () => {
      let count = 0;
      const Child = () => {
        count++;
        return <span data-testid="child">Child</span>;
      };
      mountComponent(() => (
        <RLLink href="/about" localize={false}>
          <Child />
        </RLLink>
      ));
      expect(count).toBe(1);
    });
  });
});
