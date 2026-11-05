import { describe, it, expect, afterEach, vi } from "vite-plus/test";
import { flush } from "solid-js";
import { render } from "@solidjs/web";
import { RLSlideover } from "../src/components/slideover/RLSlideover";

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
  document.body.innerHTML = "";
  document.body.style.overflow = "";
});

describe("RLSlideover", () => {
  describe("root", () => {
    it("marks the root with data-slot and data-theme", () => {
      const container = mount(() => <RLSlideover triggerLabel="Open" title="Menu" theme="dark" />);
      const root = container.querySelector<HTMLElement>('[data-slot="root"]');
      expect(root).not.toBeNull();
      expect(root?.hasAttribute("data-theme")).toBe(true);
    });
  });

  describe("trigger", () => {
    it("renders a default trigger button from triggerLabel", () => {
      mount(() => <RLSlideover triggerLabel="Open menu" title="Menu" />);
      const trigger = q<HTMLButtonElement>('[data-slot="trigger"]');
      expect(trigger?.textContent).toBe("Open menu");
    });

    it("renders triggerSlot in place of the default button", () => {
      mount(() => (
        <RLSlideover title="Menu" triggerSlot={<span data-testid="custom-trigger">Custom</span>} />
      ));
      expect(q('[data-testid="custom-trigger"]')).not.toBeNull();
      expect(q('[data-slot="trigger"]')).toBeNull();
    });

    it("opens the sheet when the trigger is clicked", () => {
      mount(() => <RLSlideover triggerLabel="Open" title="Menu" />);
      expect(q('[data-slot="content"]')).toBeNull();
      click(q<HTMLButtonElement>('[data-slot="trigger"]'));
      expect(q('[data-slot="content"]')?.getAttribute("data-state")).toBe("open");
    });
  });

  describe("content", () => {
    it("renders children in the body slot", () => {
      mount(() => (
        <RLSlideover triggerLabel="Open" title="Menu" defaultOpen>
          <p data-testid="child">Body text</p>
        </RLSlideover>
      ));
      const body = q('[data-slot="body"]');
      expect(body?.querySelector('[data-testid="child"]')).not.toBeNull();
    });

    it("renders titleSlot over the title string", () => {
      mount(() => (
        <RLSlideover
          title="String title"
          titleSlot={<span data-testid="rich-title">Rich</span>}
          defaultOpen
        />
      ));
      const title = q('[data-slot="title"]');
      expect(title?.querySelector('[data-testid="rich-title"]')).not.toBeNull();
      expect(title?.textContent).not.toContain("String title");
    });

    it("renders the description string when no descriptionSlot is given", () => {
      mount(() => <RLSlideover title="Menu" description="Helpful text" defaultOpen />);
      expect(q('[data-slot="description"]')?.textContent).toBe("Helpful text");
    });

    it("renders descriptionSlot over the description string", () => {
      mount(() => (
        <RLSlideover
          title="Menu"
          description="String"
          descriptionSlot={<span data-testid="rich-desc">Rich</span>}
          defaultOpen
        />
      ));
      expect(q('[data-slot="description"] [data-testid="rich-desc"]')).not.toBeNull();
    });

    it("renders footerSlot only when provided", () => {
      mount(() => (
        <RLSlideover
          title="Menu"
          footerSlot={<button data-testid="save">Save</button>}
          defaultOpen
        />
      ));
      expect(q('[data-slot="footer"] [data-testid="save"]')).not.toBeNull();
    });

    it("omits the footer when footerSlot is not provided", () => {
      mount(() => <RLSlideover title="Menu" defaultOpen />);
      expect(q('[data-slot="footer"]')).toBeNull();
    });
  });

  describe("closing", () => {
    it("closes when the close button is clicked", () => {
      mount(() => <RLSlideover title="Menu" defaultOpen />);
      click(q<HTMLButtonElement>('[data-slot="close"]'));
      expect(q('[data-slot="content"]')).toBeNull();
    });

    it("closes on Escape", () => {
      mount(() => <RLSlideover title="Menu" defaultOpen />);
      pressEscape();
      expect(q('[data-slot="content"]')).toBeNull();
    });

    it("closes when the backdrop is clicked", () => {
      mount(() => <RLSlideover title="Menu" defaultOpen />);
      click(q<HTMLElement>('[data-slot="backdrop"]'));
      expect(q('[data-slot="content"]')).toBeNull();
    });

    it("hides the close button and ignores Escape and the backdrop when dismissible is false", () => {
      mount(() => <RLSlideover title="Menu" dismissible={false} defaultOpen />);
      expect(q('[data-slot="close"]')).toBeNull();
      expect(q('[data-slot="backdrop"]')).toBeNull();
      pressEscape();
      expect(q('[data-slot="content"]')).not.toBeNull();
    });

    it("keeps content mounted while closed when unmountOnHide is false", () => {
      mount(() => <RLSlideover triggerLabel="Open" title="Menu" unmountOnHide={false} />);
      const content = q('[data-slot="content"]');
      expect(content?.getAttribute("data-state")).toBe("closed");
    });

    it("removes content while closed by default", () => {
      mount(() => <RLSlideover triggerLabel="Open" title="Menu" />);
      expect(q('[data-slot="content"]')).toBeNull();
    });
  });

  describe("open state", () => {
    it("reports changes through onOpenChange", () => {
      const onOpenChange = vi.fn();
      mount(() => <RLSlideover title="Menu" defaultOpen onOpenChange={onOpenChange} />);
      click(q<HTMLButtonElement>('[data-slot="close"]'));
      expect(onOpenChange).toHaveBeenCalledWith(false);
    });

    it("follows the controlled open prop", () => {
      mount(() => <RLSlideover title="Menu" open={true} />);
      expect(q('[data-slot="content"]')?.getAttribute("data-state")).toBe("open");
    });

    it("keeps the controlled state when the close button is clicked and open is not updated", () => {
      mount(() => <RLSlideover title="Menu" open={true} onOpenChange={() => {}} />);
      click(q<HTMLButtonElement>('[data-slot="close"]'));
      expect(q('[data-slot="content"]')?.getAttribute("data-state")).toBe("open");
    });
  });

  describe("portal", () => {
    it("renders inline inside the root when portal is false", () => {
      const container = mount(() => <RLSlideover title="Menu" portal={false} defaultOpen />);
      const root = container.querySelector('[data-slot="root"]');
      expect(root?.querySelector('[data-slot="content"]')).not.toBeNull();
    });

    it("renders into document.body by default", () => {
      const container = mount(() => <RLSlideover title="Menu" defaultOpen />);
      const root = container.querySelector('[data-slot="root"]');
      expect(root?.querySelector('[data-slot="content"]')).toBeNull();
      expect(document.body.querySelector('[data-slot="content"]')).not.toBeNull();
    });
  });
});
