import { afterAll, afterEach, describe, expect, it } from "vite-plus/test";
import { type Component, createComponent } from "solid-js";
import { mountComponent } from "./utils/browser-render";
import {
  closeAst,
  listComponentFolders,
  minimalProps,
  usesChildren,
  type ComponentFolder,
} from "./utils/conformance-ast";

// Renders every component in src/components with minimal valid props (derived from its props type
// by AST, see minimalProps) and asserts the root-level behavior the conventions require.

const modules = import.meta.glob<Record<string, unknown>>("../src/components/*/RL*.tsx", {
  eager: true,
});

/** Per-folder overrides for required props whose type gives no safe default (see the unresolved assertion). */
const FIXTURE_OVERRIDES: Record<string, Record<string, unknown>> = {
  "color-slider": { channel: "hue" },
};

/**
 * Overlay fixtures, merged into every row's props. Overlays render their body only while open.
 * SSR `Portal` renders nothing, so overlays and shortcuts also set `portal: false`.
 */
const OVERLAY_FIXTURES: Record<string, { open: true; portal?: false }> = {
  modal: { open: true, portal: false },
  confirm: { open: true, portal: false },
  slideover: { open: true, portal: false },
  shortcuts: { open: true, portal: false },
};

/** Per-folder fixture props. Carousel renders its render-prop children once per item, so it needs one item. */
const FIXTURE_PROPS: Record<string, Record<string, unknown>> = {
  carousel: { items: [{ title: "a" }] },
};

const components = listComponentFolders().filter((c) => c.rlFile !== undefined);

afterAll(closeAst);
afterEach(() => {
  document.body.innerHTML = "";
});

function componentFor(c: ComponentFolder): Component<Record<string, unknown>> | undefined {
  const key = Object.keys(modules).find((k) => k.endsWith(`/${c.folder}/RL${c.pascal}.tsx`));
  const exported = key ? modules[key]?.[`RL${c.pascal}`] : undefined;
  return typeof exported === "function"
    ? (exported as Component<Record<string, unknown>>)
    : undefined;
}

function root(): HTMLElement | null {
  return document.querySelector<HTMLElement>('[data-slot="root"]');
}

function mount(
  Comp: Component<Record<string, unknown>>,
  props: Record<string, unknown>,
): HTMLElement {
  mountComponent(() => createComponent(Comp, props));
  const el = root();
  if (!el) throw new Error('no element with data-slot="root" was rendered');
  return el;
}

describe.each(components)("render $folder", (c) => {
  const Comp = () => {
    const found = componentFor(c);
    if (!found) throw new Error(`RL${c.pascal} is not exported from ${c.folder}`);
    return found;
  };
  const props = () => ({
    ...minimalProps(c, FIXTURE_OVERRIDES[c.folder]).props,
    ...FIXTURE_PROPS[c.folder],
    ...OVERLAY_FIXTURES[c.folder],
  });

  it("has fixtures for every required prop", () => {
    expect(minimalProps(c, FIXTURE_OVERRIDES[c.folder]).unresolved).toEqual([]);
  });

  it("renders a root element with data-slot=root", () => {
    expect(mount(Comp(), props()).getAttribute("data-slot")).toBe("root");
  });

  it("reflects the theme prop on data-theme", () => {
    expect(mount(Comp(), { ...props(), theme: "dark" }).getAttribute("data-theme")).toBe("dark");
  });

  it("merges the class prop onto the root", () => {
    expect(mount(Comp(), { ...props(), class: "rl-probe" }).classList.contains("rl-probe")).toBe(
      true,
    );
  });

  it("changes the root tag when as is set", () => {
    expect(mount(Comp(), { ...props(), as: "section" }).tagName).toBe("SECTION");
  });

  // Named exception: marquee duplicates children into a second aria-hidden track on purpose (seamless loop).
  if (c.rlFile && usesChildren(c.rlFile) && c.folder !== "marquee") {
    it("renders children exactly once", () => {
      const overlay = OVERLAY_FIXTURES[c.folder] ?? {};
      mount(Comp(), { ...props(), ...overlay, children: () => <span data-test-child="" /> });
      expect(document.querySelectorAll("[data-test-child]").length).toBe(1);
    });
  }
});
