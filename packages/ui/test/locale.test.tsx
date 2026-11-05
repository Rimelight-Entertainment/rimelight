import { describe, it, expect } from "vite-plus/test";
import { uiT } from "../src/locale";
import { localizeHref, resolveLinkAttrs } from "../src/components/link/link.helpers";
import { mountComponent } from "./utils/browser-render";
import { RLPost } from "../src/components/post/RLPost";
import { RLNavigationMenu } from "../src/components/navigation-menu/RLNavigationMenu";

describe("ui translations", () => {
  it("returns built-in text, config overrides, or the key", () => {
    expect(uiT("error.retry")).toBe("Try again");
    expect(uiT("error.titles.418")).toBe("I'm a Teapot");
    expect(uiT("missing.key")).toBe("missing.key");
  });
});

describe("link localization", () => {
  it("localizes internal paths through getLocaleUrl", () => {
    expect(resolveLinkAttrs({ href: "/docs", localize: "pt" }).href).toBe("/pt/docs");
    // default locale has no prefix in the test config
    expect(resolveLinkAttrs({ href: "/docs" }).href).toBe("/docs");
  });

  it("leaves external, relative and opted-out links alone", () => {
    expect(resolveLinkAttrs({ href: "https://example.com", localize: "pt" }).href).toBe(
      "https://example.com",
    );
    expect(resolveLinkAttrs({ href: "relative/path", localize: "pt" }).href).toBe("relative/path");
    expect(resolveLinkAttrs({ href: "/docs", localize: false }).href).toBe("/docs");
  });
});

describe("localizeHref", () => {
  it("is shared by non-link components", () => {
    expect(localizeHref("/blog/a", "pt")).toBe("/pt/blog/a");
    expect(localizeHref("/blog/a", false)).toBe("/blog/a");
    expect(localizeHref("//cdn.example.com/x", "pt")).toBe("//cdn.example.com/x");
  });

  it("localizes RLPost and RLNavigationMenu links", () => {
    const post = mountComponent(() => <RLPost href="/blog/a" localize="pt" title="A" />);
    expect(post.querySelector("a")?.getAttribute("href")).toBe("/pt/blog/a");

    const nav = mountComponent(() => (
      <RLNavigationMenu items={[{ label: "Docs", href: "/docs", localize: "pt" }]} />
    ));
    expect(nav.querySelector("a")?.getAttribute("href")).toBe("/pt/docs");
  });
});
