import { describe, it, expect } from "vite-plus/test";
import { renderToString } from "@solidjs/web";
import { RLTabs } from "../src/components/tabs/RLTabs";
import { cleanHtml } from "./utils/normalize";
import { mountComponent } from "./utils/browser-render";

const items = [
  { label: "One", value: "one", content: "Panel one" },
  { label: "Two", value: "two", content: "Panel two" },
  { label: "Three", value: "three", content: "Panel three", disabled: true },
];

const triggers = (c: HTMLElement) => Array.from(c.querySelectorAll<HTMLElement>("[role='tab']"));
const bodies = (c: HTMLElement) =>
  Array.from(c.querySelectorAll<HTMLElement>("[data-slot='body']"));
const activeValue = (c: HTMLElement) =>
  triggers(c)
    .find((t) => t.getAttribute("data-state") === "active")
    ?.getAttribute("data-value");

describe("RLTabs", () => {
  it("renders the root with orientation", () => {
    const html = cleanHtml(
      renderToString(() => <RLTabs items={items} orientation="vertical" variant="link" />),
    );
    expect(html).toContain('data-slot="root"');
    expect(html).toContain('data-orientation="vertical"');
  });

  it("sets data-theme from the theme prop", () => {
    const html = cleanHtml(renderToString(() => <RLTabs items={items} theme="dark" />));
    expect(html).toContain('data-theme="dark"');
  });

  it("activates the first item when no value is given", () => {
    const c = mountComponent(() => <RLTabs items={items} />);
    expect(activeValue(c)).toBe("one");
  });

  it("activates defaultValue when uncontrolled", () => {
    const c = mountComponent(() => <RLTabs items={items} defaultValue="two" />);
    expect(activeValue(c)).toBe("two");
  });

  it("renders only the active panel by default", () => {
    const c = mountComponent(() => <RLTabs items={items} />);
    expect(bodies(c).map((b) => b.textContent)).toEqual(["Panel one"]);
  });

  it("keeps inactive panels mounted and hidden when unmountOnHide is false", () => {
    const c = mountComponent(() => <RLTabs items={items} unmountOnHide={false} />);
    const panels = bodies(c);
    expect(panels.map((b) => b.textContent)).toEqual(["Panel one", "Panel two", "Panel three"]);
    expect(panels[0]!.hidden).toBe(false);
    expect(panels[1]!.hidden).toBe(true);
    expect(panels[2]!.hidden).toBe(true);
  });

  it("renders no panels when body is false", () => {
    const c = mountComponent(() => <RLTabs items={items} body={false} />);
    expect(bodies(c)).toHaveLength(0);
    expect(triggers(c)).toHaveLength(3);
  });

  it("renders children in place of the item panels", () => {
    const c = mountComponent(() => <RLTabs items={items}>Custom body</RLTabs>);
    expect(bodies(c)).toHaveLength(0);
    expect(c.textContent).toContain("Custom body");
    expect(c.textContent).not.toContain("Panel one");
  });

  it("renders badges inside the trigger", () => {
    const c = mountComponent(() => (
      <RLTabs items={[{ label: "Inbox", value: "inbox", badge: 4 }]} />
    ));
    expect(triggers(c)[0]!.textContent).toContain("4");
  });

  it("renders no overflow control when all tabs fit", () => {
    const c = mountComponent(() => <RLTabs items={items} maxTabs={3} />);
    expect(c.querySelector("[data-slot='overflow-trigger']")).toBeNull();
  });
});
