import { describe, it, expect, vi, afterEach } from "vite-plus/test";
import { flush } from "solid-js";
import { render } from "@solidjs/web";
import { RLModal } from "../src/components/modal/RLModal";

const disposers: Array<() => void> = [];

function mount(fn: () => any): void {
  const container = document.createElement("div");
  document.body.appendChild(container);
  disposers.push(render(fn, container));
  flush();
}

function q<T extends HTMLElement = HTMLElement>(selector: string): T | null {
  return document.querySelector<T>(selector);
}

function click(el: HTMLElement | null): void {
  el?.click();
  flush();
}

function press(key: string): void {
  window.dispatchEvent(new KeyboardEvent("keydown", { key, bubbles: true }));
  flush();
}

afterEach(() => {
  while (disposers.length) disposers.pop()?.();
  document.body.innerHTML = "";
  document.body.style.overflow = "";
});

describe("RLModal", () => {
  describe("open state", () => {
    it("stays closed and unmounted by default", () => {
      mount(() => <RLModal triggerLabel="Open" />);
      expect(q('[data-slot="content"]')).toBeNull();
      expect(q('[data-slot="trigger"]')).not.toBeNull();
    });

    it("opens from the trigger when uncontrolled", () => {
      mount(() => <RLModal triggerLabel="Open" title="Hello" />);
      click(q('[data-slot="trigger"]'));
      expect(q('[data-slot="content"]')?.getAttribute("data-state")).toBe("open");
    });

    it("keeps closed content mounted when unmountOnHide is false", () => {
      mount(() => <RLModal portal={false} unmountOnHide={false} />);
      expect(q('[data-slot="content"]')?.getAttribute("data-state")).toBe("closed");
    });

    it("labels the dialog with its title and description", () => {
      mount(() => <RLModal open portal={false} title="Delete" description="Cannot undo" />);
      const content = q('[data-slot="content"]');
      const labelledBy = content?.getAttribute("aria-labelledby") ?? "";
      const describedBy = content?.getAttribute("aria-describedby") ?? "";
      expect(document.getElementById(labelledBy)?.textContent).toBe("Delete");
      expect(document.getElementById(describedBy)?.textContent).toBe("Cannot undo");
    });

    it("prefers an explicit aria-labelledby over the title", () => {
      mount(() => <RLModal open portal={false} title="Delete" aria-labelledby="external" />);
      expect(q('[data-slot="content"]')?.getAttribute("aria-labelledby")).toBe("external");
    });

    it("marks the dialog modal only when modal is true", () => {
      mount(() => <RLModal open portal={false} role="alertdialog" modal={false} />);
      const content = q('[data-slot="content"]');
      expect(content?.getAttribute("role")).toBe("alertdialog");
      expect(content?.getAttribute("aria-modal")).toBeNull();
    });
  });

  describe("dismissal", () => {
    it("reports close requests from the close control through onOpenChange", () => {
      const onOpenChange = vi.fn();
      mount(() => <RLModal open portal={false} title="T" onOpenChange={onOpenChange} />);
      click(q('[data-slot="close"]'));
      expect(onOpenChange).toHaveBeenCalledWith(false);
    });

    it("closes an uncontrolled dialog on Escape", () => {
      mount(() => <RLModal portal={false} triggerLabel="Open" />);
      click(q('[data-slot="trigger"]'));
      press("Escape");
      expect(q('[data-slot="content"]')).toBeNull();
    });

    it("ignores Escape when dismissible is false", () => {
      mount(() => <RLModal portal={false} triggerLabel="Open" dismissible={false} />);
      click(q('[data-slot="trigger"]'));
      press("Escape");
      expect(q('[data-slot="content"]')?.getAttribute("data-state")).toBe("open");
    });

    it("closes on an overlay click but not on a content click", () => {
      const onOpenChange = vi.fn();
      mount(() => <RLModal open portal={false} title="T" onOpenChange={onOpenChange} />);
      click(q('[data-slot="content"]'));
      expect(onOpenChange).not.toHaveBeenCalled();
      click(q('[data-slot="overlay"]'));
      expect(onOpenChange).toHaveBeenCalledTimes(1);
    });

    it("omits the close control when dismissible is false", () => {
      mount(() => <RLModal open portal={false} title="T" dismissible={false} />);
      expect(q('[data-slot="close"]')).toBeNull();
    });

    it("closes a non-modal dialog on an outside click", () => {
      mount(() => <RLModal portal={false} triggerLabel="Open" modal={false} />);
      click(q('[data-slot="trigger"]'));
      click(document.body);
      expect(q('[data-slot="content"]')).toBeNull();
    });
  });

  describe("scroll lock", () => {
    it("locks body scroll while a modal dialog is open and restores it on close", () => {
      mount(() => <RLModal portal={false} triggerLabel="Open" />);
      click(q('[data-slot="trigger"]'));
      expect(document.body.style.overflow).toBe("hidden");
      press("Escape");
      expect(document.body.style.overflow).toBe("");
    });

    it("leaves body scroll alone when lockScroll is false", () => {
      mount(() => <RLModal open portal={false} lockScroll={false} title="T" />);
      expect(document.body.style.overflow).toBe("");
    });
  });

  describe("slots", () => {
    it("replaces the default trigger with triggerSlot and opens from it", () => {
      mount(() => (
        <RLModal
          triggerLabel="Default"
          triggerSlot={
            <button type="button" data-testid="custom">
              Launch
            </button>
          }
          title="T"
        />
      ));
      expect(q('[data-slot="trigger"]')).toBeNull();
      click(q('[data-testid="custom"]'));
      expect(q('[data-slot="content"]')?.getAttribute("data-state")).toBe("open");
    });

    it("replaces the whole header with headerSlot", () => {
      mount(() => (
        <RLModal
          open
          portal={false}
          title="Ignored"
          headerSlot={<div data-testid="my-header">Header</div>}
        />
      ));
      expect(q('[data-testid="my-header"]')).not.toBeNull();
      expect(q('[data-slot="title"]')).toBeNull();
    });

    it("replaces the title and description with titleSlot and descriptionSlot", () => {
      mount(() => (
        <RLModal
          open
          portal={false}
          title="Plain"
          description="Plain description"
          titleSlot={<span>Custom title</span>}
          descriptionSlot={<span>Custom description</span>}
        />
      ));
      expect(q('[data-slot="title"]')?.textContent).toBe("Custom title");
      expect(q('[data-slot="description"]')?.textContent).toBe("Custom description");
    });

    it("renders actionsSlot in the header", () => {
      mount(() => (
        <RLModal open portal={false} title="T" actionsSlot={<button type="button">Act</button>} />
      ));
      expect(q('[data-slot="actions"]')?.textContent).toContain("Act");
    });

    it("replaces the default close control with closeSlot and closes from it", () => {
      const onOpenChange = vi.fn();
      mount(() => (
        <RLModal
          open
          portal={false}
          title="T"
          onOpenChange={onOpenChange}
          closeSlot={
            <button type="button" data-testid="my-close">
              Done
            </button>
          }
        />
      ));
      expect(q('[data-slot="close"]')).toBeNull();
      click(q('[data-testid="my-close"]'));
      expect(onOpenChange).toHaveBeenCalledWith(false);
    });

    it("renders children as the body when bodySlot is absent", () => {
      mount(() => (
        <RLModal open portal={false} title="T">
          Children body
        </RLModal>
      ));
      expect(q('[data-slot="body"]')?.textContent).toBe("Children body");
    });

    it("renders bodySlot in place of children", () => {
      mount(() => (
        <RLModal open portal={false} bodySlot={<p>Slot body</p>}>
          Children body
        </RLModal>
      ));
      expect(q('[data-slot="body"]')?.textContent).toBe("Slot body");
    });

    it("renders footerSlot only when provided", () => {
      mount(() => <RLModal open portal={false} title="T" />);
      expect(q('[data-slot="footer"]')).toBeNull();
    });

    it("renders footerSlot below the body", () => {
      mount(() => (
        <RLModal open portal={false} footerSlot={<span data-testid="foot">Footer</span>} />
      ));
      expect(q('[data-slot="footer"] [data-testid="foot"]')).not.toBeNull();
    });
  });

  describe("lifecycle and portal", () => {
    it("fires enter and leave callbacks on user-driven transitions", () => {
      const onEnter = vi.fn();
      const onAfterEnter = vi.fn();
      const onLeave = vi.fn();
      const onAfterLeave = vi.fn();
      mount(() => (
        <RLModal
          portal={false}
          triggerLabel="Open"
          onEnter={onEnter}
          onAfterEnter={onAfterEnter}
          onLeave={onLeave}
          onAfterLeave={onAfterLeave}
        />
      ));
      click(q('[data-slot="trigger"]'));
      expect(onEnter).toHaveBeenCalledTimes(1);
      expect(onAfterEnter).toHaveBeenCalledTimes(1);
      press("Escape");
      expect(onLeave).toHaveBeenCalledTimes(1);
      expect(onAfterLeave).toHaveBeenCalledTimes(1);
    });

    it("renders into the element passed as portal", () => {
      const target = document.createElement("section");
      document.body.appendChild(target);
      mount(() => <RLModal open portal={target} title="T" />);
      expect(target.querySelector('[data-slot="content"]')).not.toBeNull();
    });
  });
});
