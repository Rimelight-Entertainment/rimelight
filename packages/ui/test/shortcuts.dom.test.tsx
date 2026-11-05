import { describe, it, expect, afterEach, vi } from "vite-plus/test";
import { flush } from "solid-js";
import { render } from "@solidjs/web";
import { RLShortcuts } from "../src/components/shortcuts/RLShortcuts";
import { defineShortcuts, activeShortcutsStore, setShortcutsModalOpen } from "../src/shortcuts";

const disposers: Array<() => void> = [];

function mount(fn: () => any): HTMLElement {
  const container = document.createElement("div");
  document.body.appendChild(container);
  disposers.push(render(fn, container));
  flush();
  return container;
}

function q<T extends HTMLElement = HTMLElement>(selector: string): T | null {
  return document.querySelector<T>(selector);
}

function click(el: HTMLElement | null): void {
  el?.click();
  flush();
}

function pressEscape(): void {
  window.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape" }));
  flush();
}

afterEach(() => {
  while (disposers.length) disposers.pop()?.();
  setShortcutsModalOpen(false);
  document.body.innerHTML = "";
  document.body.style.overflow = "";
});

describe("@rimelight/ui shortcuts runtime — DOM", () => {
  it("should register shortcuts into activeShortcutsStore before listeners subscribe", () => {
    const cleanup = defineShortcuts({
      meta_k: {
        handler: () => {},
        label: "Open Search",
        category: "navigation",
      },
    });
    flush();
    expect(activeShortcutsStore.some((s) => s.label === "Open Search")).toBe(true);
    cleanup();
    flush();
    expect(activeShortcutsStore.some((s) => s.label === "Open Search")).toBe(false);
  });

  it("should trigger multi-modifier shortcuts like meta_alt_t via Ctrl+Alt+T on Windows/Linux", () => {
    let triggered = false;
    const cleanup = defineShortcuts({
      meta_alt_t: () => {
        triggered = true;
      },
    });

    const event = new KeyboardEvent("keydown", {
      key: "t",
      code: "KeyT",
      ctrlKey: true,
      altKey: true,
      metaKey: false,
      bubbles: true,
      cancelable: true,
    });
    window.dispatchEvent(event);

    expect(triggered).toBe(true);
    cleanup();
  });

  it("should resolve shortcuts using codeKey when Alt produces a special character", () => {
    let triggered = false;
    const cleanup = defineShortcuts({
      meta_alt_t: () => {
        triggered = true;
      },
    });

    // On Mac / special layout, Alt+T produces '†' in e.key but 'KeyT' in e.code
    const event = new KeyboardEvent("keydown", {
      key: "†",
      code: "KeyT",
      ctrlKey: true,
      altKey: true,
      metaKey: false,
      bubbles: true,
      cancelable: true,
    });
    window.dispatchEvent(event);

    expect(triggered).toBe(true);
    cleanup();
  });
});

describe("RLShortcuts", () => {
  describe("visibility", () => {
    it("renders nothing while closed", () => {
      mount(() => <RLShortcuts open={false} />);
      expect(q('[data-slot="root"]')).toBeNull();
    });

    it("renders the dialog when defaultOpen is set", () => {
      mount(() => <RLShortcuts defaultOpen />);
      const dialog = q('[data-slot="dialog"]');
      expect(dialog?.getAttribute("role")).toBe("dialog");
      expect(dialog?.getAttribute("aria-modal")).toBe("true");
    });

    it("labels the dialog with its title", () => {
      mount(() => <RLShortcuts defaultOpen />);
      const dialog = q<HTMLElement>('[data-slot="dialog"]');
      const labelledBy = dialog?.getAttribute("aria-labelledby");
      expect(labelledBy).toBeTruthy();
      expect(document.getElementById(labelledBy ?? "")?.getAttribute("data-slot")).toBe("title");
    });

    it("ignores the global modal store when open is controlled", () => {
      setShortcutsModalOpen(true);
      mount(() => <RLShortcuts open={false} />);
      expect(q('[data-slot="root"]')).toBeNull();
    });

    it("follows the global modal store when open is not controlled", () => {
      setShortcutsModalOpen(true);
      mount(() => <RLShortcuts />);
      expect(q('[data-slot="root"]')).not.toBeNull();
    });
  });

  describe("listing", () => {
    it("lists registered shortcuts with their label and description", () => {
      const cleanup = defineShortcuts({
        meta_k: {
          handler: () => {},
          label: "Open Search",
          description: "Search across the site",
          category: "navigation",
        },
      });
      disposers.push(cleanup);

      mount(() => <RLShortcuts defaultOpen />);
      const names = Array.from(document.querySelectorAll('[data-slot="name"]')).map(
        (el) => el.textContent,
      );
      const descriptions = Array.from(document.querySelectorAll('[data-slot="desc"]')).map(
        (el) => el.textContent,
      );
      expect(names).toContain("Open Search");
      expect(descriptions).toContain("Search across the site");
    });
  });

  describe("closing", () => {
    it("closes when the close button is clicked", () => {
      const onOpenChange = vi.fn();
      mount(() => <RLShortcuts defaultOpen onOpenChange={onOpenChange} />);
      click(q<HTMLButtonElement>('[data-slot="close"]'));
      expect(onOpenChange).toHaveBeenCalledWith(false);
      expect(q('[data-slot="root"]')).toBeNull();
    });

    it("closes on Escape", () => {
      mount(() => <RLShortcuts defaultOpen />);
      pressEscape();
      expect(q('[data-slot="root"]')).toBeNull();
    });

    it("closes when the backdrop is clicked", () => {
      mount(() => <RLShortcuts defaultOpen />);
      click(q<HTMLElement>('[data-slot="root"]'));
      expect(q('[data-slot="root"]')).toBeNull();
    });

    it("stays open when the dialog itself is clicked", () => {
      mount(() => <RLShortcuts defaultOpen />);
      click(q<HTMLElement>('[data-slot="dialog"]'));
      expect(q('[data-slot="root"]')).not.toBeNull();
    });
  });

  describe("portal", () => {
    it("renders inline inside its container when portal is false", () => {
      const container = mount(() => <RLShortcuts defaultOpen portal={false} />);
      expect(container.querySelector('[data-slot="root"]')).not.toBeNull();
    });

    it("renders into document.body by default", () => {
      const container = mount(() => <RLShortcuts defaultOpen />);
      expect(container.querySelector('[data-slot="root"]')).toBeNull();
      expect(document.body.querySelector('[data-slot="root"]')).not.toBeNull();
    });
  });
});
