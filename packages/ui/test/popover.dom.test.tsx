import { describe, it, expect, afterEach } from "vite-plus/test";
import { flush } from "solid-js";
import { render } from "@solidjs/web";
import { RLPopover } from "../src/components/popover/RLPopover";

const disposers: Array<() => void> = [];

function mount(fn: () => any): HTMLElement {
  const container = document.createElement("div");
  document.body.appendChild(container);
  disposers.push(render(fn, container));
  flush();
  return container;
}

function click(el: HTMLElement | null | undefined): void {
  el?.click();
  flush();
}

function hover(el: HTMLElement | null | undefined, type: "mouseenter" | "mouseleave"): void {
  el?.dispatchEvent(new MouseEvent(type));
  flush();
}

afterEach(() => {
  while (disposers.length) disposers.pop()?.();
  document.body.innerHTML = "";
});

const trigger = (root: HTMLElement) => root.querySelector<HTMLElement>("[data-slot='trigger']");

const content = (root: HTMLElement) => root.querySelector<HTMLElement>("[data-slot='content']");

describe("RLPopover", () => {
  describe("trigger", () => {
    it("renders a default RLButton labelled with triggerLabel", () => {
      const root = mount(() => <RLPopover triggerLabel="Open menu" />);
      expect(trigger(root)?.querySelector("button")?.textContent).toContain("Open menu");
    });

    it("replaces the default trigger with triggerSlot content", () => {
      const root = mount(() => (
        <RLPopover triggerLabel="Open menu" triggerSlot={<span>Custom trigger</span>} />
      ));
      expect(trigger(root)?.textContent).toContain("Custom trigger");
      expect(trigger(root)?.textContent).not.toContain("Open menu");
      expect(trigger(root)?.querySelector("button")).toBeNull();
    });

    it("accepts a render function for triggerSlot", () => {
      const root = mount(() => <RLPopover triggerSlot={() => <span>Render trigger</span>} />);
      expect(trigger(root)?.textContent).toContain("Render trigger");
    });
  });

  describe("content", () => {
    it("keeps the content hidden until the popover opens", () => {
      const root = mount(() => (
        <RLPopover triggerLabel="Open">
          <span>Body text</span>
        </RLPopover>
      ));
      expect(content(root)).toBeNull();
      expect(root.textContent).not.toContain("Body text");
    });

    it("shows the children when defaultOpen is set", () => {
      const root = mount(() => (
        <RLPopover defaultOpen>
          <span>Body text</span>
        </RLPopover>
      ));
      expect(content(root)?.textContent).toContain("Body text");
    });

    it("opens on trigger click and closes on a second click", () => {
      const root = mount(() => (
        <RLPopover triggerLabel="Open">
          <span>Body text</span>
        </RLPopover>
      ));
      click(trigger(root));
      expect(content(root)?.textContent).toContain("Body text");
      click(trigger(root));
      expect(content(root)).toBeNull();
    });

    it("reports open state changes through onOpenChange", () => {
      const changes: boolean[] = [];
      const root = mount(() => (
        <RLPopover triggerLabel="Open" onOpenChange={(open) => changes.push(open)}>
          <span>Body text</span>
        </RLPopover>
      ));
      click(trigger(root));
      click(trigger(root));
      expect(changes).toEqual([true, false]);
    });

    it("keeps a controlled popover open until the parent updates open", () => {
      const changes: boolean[] = [];
      const root = mount(() => (
        <RLPopover open onOpenChange={(open) => changes.push(open)}>
          <span>Body text</span>
        </RLPopover>
      ));
      expect(content(root)?.textContent).toContain("Body text");
      click(trigger(root));
      expect(changes).toEqual([false]);
      expect(content(root)?.textContent).toContain("Body text");
    });

    it("closes when the document is clicked outside the popover", () => {
      const root = mount(() => (
        <RLPopover defaultOpen triggerLabel="Open">
          <span>Body text</span>
        </RLPopover>
      ));
      expect(content(root)).not.toBeNull();
      click(document.body);
      expect(content(root)).toBeNull();
    });
  });

  describe("mode", () => {
    it("ignores trigger clicks when mode is hover", () => {
      const root = mount(() => (
        <RLPopover mode="hover" triggerLabel="Open">
          <span>Body text</span>
        </RLPopover>
      ));
      click(trigger(root));
      expect(content(root)).toBeNull();
    });

    it("opens on pointer enter and closes on pointer leave when mode is hover", () => {
      const root = mount(() => (
        <RLPopover mode="hover" triggerLabel="Open">
          <span>Body text</span>
        </RLPopover>
      ));
      hover(trigger(root), "mouseenter");
      expect(content(root)?.textContent).toContain("Body text");
      hover(trigger(root), "mouseleave");
      expect(content(root)).toBeNull();
    });

    it("ignores pointer enter when mode is click", () => {
      const root = mount(() => (
        <RLPopover mode="click" triggerLabel="Open">
          <span>Body text</span>
        </RLPopover>
      ));
      hover(trigger(root), "mouseenter");
      expect(content(root)).toBeNull();
    });

    it("opens on trigger click when mode is both", () => {
      const root = mount(() => (
        <RLPopover mode="both" triggerLabel="Open">
          <span>Body text</span>
        </RLPopover>
      ));
      click(trigger(root));
      expect(content(root)?.textContent).toContain("Body text");
    });

    it("opens on pointer enter when mode is both", () => {
      const root = mount(() => (
        <RLPopover mode="both" triggerLabel="Open">
          <span>Body text</span>
        </RLPopover>
      ));
      hover(trigger(root), "mouseenter");
      expect(content(root)?.textContent).toContain("Body text");
    });
  });
});
