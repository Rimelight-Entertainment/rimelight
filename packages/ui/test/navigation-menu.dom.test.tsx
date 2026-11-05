import { describe, it, expect, afterEach } from "vite-plus/test";
import { flush } from "solid-js";
import { render } from "@solidjs/web";
import { RLNavigationMenu } from "../src/components/navigation-menu/RLNavigationMenu";

const disposers: Array<() => void> = [];

function mount(fn: () => any): HTMLElement {
  const container = document.createElement("div");
  document.body.appendChild(container);
  disposers.push(render(fn, container));
  flush();
  return container;
}

function click(el: HTMLElement | null): void {
  el?.click();
  flush();
}

function trigger(root: HTMLElement): HTMLButtonElement | null {
  return root.querySelector<HTMLButtonElement>("[data-nav-trigger]");
}

afterEach(() => {
  while (disposers.length) disposers.pop()?.();
  document.body.innerHTML = "";
});

const items = [
  { label: "Home", href: "/" },
  {
    label: "Docs",
    panel: "docs",
    children: [{ label: "Guide", href: "/docs/guide", description: "Read it" }],
  },
];

describe("RLNavigationMenu", () => {
  it("renders plain items as links and items with children as triggers", () => {
    const root = mount(() => <RLNavigationMenu items={items} />);
    expect(root.querySelector("a[data-slot='link']")?.getAttribute("href")).toBe("/");
    expect(trigger(root)?.textContent).toContain("Docs");
    expect(trigger(root)?.getAttribute("aria-expanded")).toBe("false");
  });

  it("opens the item's panel when its trigger is clicked and closes it on a second click", () => {
    const root = mount(() => <RLNavigationMenu items={items} />);
    click(trigger(root));
    expect(trigger(root)?.getAttribute("aria-expanded")).toBe("true");
    expect(root.querySelector("[data-nav-viewport-content]")?.getAttribute("data-state")).toBe(
      "open",
    );
    click(trigger(root));
    expect(trigger(root)?.getAttribute("aria-expanded")).toBe("false");
  });

  it("uses a keyed panel from `panels` for the item that names it", () => {
    const root = mount(() => (
      <RLNavigationMenu items={items} panels={{ docs: () => <span>Docs panel</span> }} />
    ));
    expect(root.textContent).toContain("Docs panel");
  });

  it("uses the generic panelSlot for items with children and no keyed panel", () => {
    const root = mount(() => (
      <RLNavigationMenu
        items={[{ label: "Docs", children: [{ label: "Guide" }] }]}
        panelSlot={() => <span>Generic panel</span>}
      />
    ));
    expect(root.textContent).toContain("Generic panel");
  });

  it("renders the default panel links for children when no panel renderer exists", () => {
    const root = mount(() => (
      <RLNavigationMenu items={[{ label: "Docs", children: [{ label: "Guide", href: "/g" }] }]} />
    ));
    expect(root.querySelector("[data-slot='panel'] a")?.getAttribute("href")).toBe("/g");
  });

  it("renders vertical items as closed accordions until their trigger opens them", () => {
    const root = mount(() => <RLNavigationMenu items={items} orientation="vertical" />);
    expect(root.querySelector("[data-nav-viewport-wrapper]")).toBeNull();
    expect(root.querySelector("[data-nav-content]")?.getAttribute("data-state")).toBe("closed");
    click(trigger(root));
    expect(root.querySelector("[data-nav-content]")?.getAttribute("data-state")).toBe("open");
  });
});
