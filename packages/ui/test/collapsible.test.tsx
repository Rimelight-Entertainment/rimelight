import { describe, it, expect } from "vite-plus/test";

import { RLCollapsible } from "../src/components/collapsible/RLCollapsible";
import { renderToString } from "@solidjs/web";
import { cleanHtml } from "./utils/normalize";

function render(fn: () => any): string {
  return cleanHtml(renderToString(fn));
}

function slotTag(html: string, slot: string): string {
  const match = html.match(new RegExp(`<[a-z0-9]+[^>]*data-slot="${slot}"[^>]*>`));
  return match?.[0] ?? "";
}

function attr(tag: string, name: string): string | undefined {
  return tag.match(new RegExp(`\\s${name}="([^"]*)"`))?.[1];
}

describe("RLCollapsible", () => {
  describe("Exports", () => {
    it("exports RLCollapsible component from package index", () => {
      expect(RLCollapsible).toBeDefined();
    });
  });

  describe("Structure & Polymorphism", () => {
    it("renders default structure with root, trigger, and content slots", () => {
      const html = render(() => (
        <RLCollapsible defaultOpen={true} content={<div>Collapsible content</div>}>
          <button type="button">Toggle</button>
        </RLCollapsible>
      ));
      expect(html).toMatch(/^<div/);
      expect(slotTag(html, "root")).not.toBe("");
      expect(slotTag(html, "trigger")).not.toBe("");
      expect(slotTag(html, "content")).not.toBe("");
      expect(html).toContain("Toggle");
      expect(html).toContain("Collapsible content");
    });

    it("renders polymorphic root element via as prop", () => {
      const sectionHtml = render(() => (
        <RLCollapsible as="section" defaultOpen={true} content={<div>Inner</div>}>
          <button type="button">Toggle</button>
        </RLCollapsible>
      ));
      expect(sectionHtml).toMatch(/^<section/);

      const navHtml = render(() => (
        <RLCollapsible as="nav" defaultOpen={true} content={<div>Links</div>}>
          <button type="button">Menu</button>
        </RLCollapsible>
      ));
      expect(navHtml).toMatch(/^<nav/);
    });

    it("forwards extra HTML attributes, id, and aria labels to root element", () => {
      const html = render(() => (
        <RLCollapsible
          id="custom-collapsible"
          ariaLabel="FAQ section"
          ariaLabelledby="faq-heading"
          ariaDescribedby="faq-desc"
          data-testid="test-collapsible"
          content={<div>Body</div>}
        >
          <button type="button">Header</button>
        </RLCollapsible>
      ));
      const root = slotTag(html, "root");
      expect(attr(root, "id")).toBe("custom-collapsible");
      expect(attr(root, "aria-label")).toBe("FAQ section");
      expect(attr(root, "aria-labelledby")).toBe("faq-heading");
      expect(attr(root, "aria-describedby")).toBe("faq-desc");
      expect(attr(root, "data-testid")).toBe("test-collapsible");
    });
  });

  describe("Open & Closed States", () => {
    it("defaults to closed state when neither open nor defaultOpen is passed", () => {
      const html = render(() => (
        <RLCollapsible content={<div>Hidden Body</div>}>
          <button type="button">Trigger</button>
        </RLCollapsible>
      ));
      const root = slotTag(html, "root");
      const trigger = slotTag(html, "trigger");
      expect(attr(root, "data-state")).toBe("closed");
      expect(attr(trigger, "data-state")).toBe("closed");
      expect(attr(trigger, "aria-expanded")).toBe("false");
      // Default unmountOnHide is true, so content is unmounted
      expect(slotTag(html, "content")).toBe("");
      expect(html).not.toContain("Hidden Body");
    });

    it("renders open when defaultOpen is true", () => {
      const html = render(() => (
        <RLCollapsible defaultOpen={true} content={<div>Visible Content</div>}>
          <button type="button">Trigger</button>
        </RLCollapsible>
      ));
      const root = slotTag(html, "root");
      const trigger = slotTag(html, "trigger");
      const content = slotTag(html, "content");
      expect(attr(root, "data-state")).toBe("open");
      expect(attr(trigger, "data-state")).toBe("open");
      expect(attr(trigger, "aria-expanded")).toBe("true");
      expect(attr(content, "data-state")).toBe("open");
      expect(html).toContain("Visible Content");
    });

    it("respects controlled open prop", () => {
      const openHtml = render(() => (
        <RLCollapsible open={true} content={<div>Controlled Content</div>}>
          <button type="button">Trigger</button>
        </RLCollapsible>
      ));
      expect(attr(slotTag(openHtml, "root"), "data-state")).toBe("open");
      expect(openHtml).toContain("Controlled Content");

      const closedHtml = render(() => (
        <RLCollapsible open={false} defaultOpen={true} content={<div>Controlled Content</div>}>
          <button type="button">Trigger</button>
        </RLCollapsible>
      ));
      expect(attr(slotTag(closedHtml, "root"), "data-state")).toBe("closed");
      expect(closedHtml).not.toContain("Controlled Content");
    });
  });

  describe("Unmount on Hide", () => {
    it("unmounts content from DOM when closed and unmountOnHide is true", () => {
      const html = render(() => (
        <RLCollapsible unmountOnHide={true} content={<div>Secret text</div>}>
          <button type="button">Trigger</button>
        </RLCollapsible>
      ));
      expect(slotTag(html, "content")).toBe("");
      expect(html).not.toContain("Secret text");
    });

    it("keeps content in DOM with hidden attribute when unmountOnHide is false", () => {
      const html = render(() => (
        <RLCollapsible unmountOnHide={false} content={<div>Persistent text</div>}>
          <button type="button">Trigger</button>
        </RLCollapsible>
      ));
      const content = slotTag(html, "content");
      expect(content).not.toBe("");
      expect(attr(content, "data-state")).toBe("closed");
      expect(content).toContain("hidden");
      expect(html).toContain("Persistent text");
    });
  });

  describe("Disabled State", () => {
    it("applies data-disabled attributes when disabled is true", () => {
      const html = render(() => (
        <RLCollapsible disabled={true} defaultOpen={true} content={<div>Content</div>}>
          <button type="button">Trigger</button>
        </RLCollapsible>
      ));
      expect(slotTag(html, "root")).toContain("data-disabled");
      expect(slotTag(html, "trigger")).toContain("data-disabled");
      expect(slotTag(html, "content")).toContain("data-disabled");
    });
  });

  describe("Slots and Render Props", () => {
    it("supports render function for trigger receiving open state", () => {
      const html = render(() => (
        <RLCollapsible defaultOpen={true} content={<div>Content</div>}>
          {({ open }: { open: boolean }) => (
            <button type="button">{open ? "Expanded" : "Collapsed"}</button>
          )}
        </RLCollapsible>
      ));
      expect(html).toContain("Expanded");
    });

    it("supports trigger slot alias and content slot alias", () => {
      const html = render(() => (
        <RLCollapsible
          defaultOpen={true}
          triggerSlot={<span class="custom-trigger">Trigger Slot</span>}
          contentSlot={<span class="custom-content">Content Slot</span>}
        />
      ));
      expect(html).toContain("custom-trigger");
      expect(html).toContain("custom-content");
    });

    it("supports trigger prop alongside children as content", () => {
      const html = render(() => (
        <RLCollapsible defaultOpen={true} trigger={<button type="button">Trigger Prop</button>}>
          <div class="child-content">Child Content</div>
        </RLCollapsible>
      ));
      expect(html).toContain("Trigger Prop");
      expect(html).toContain("Child Content");
    });
  });

  describe("ARIA & Accessibility", () => {
    it("connects trigger aria-controls with content id", () => {
      const html = render(() => (
        <RLCollapsible id="faq-item" defaultOpen={true} content={<div>Answer</div>}>
          <button type="button">Question</button>
        </RLCollapsible>
      ));
      const trigger = slotTag(html, "trigger");
      const content = slotTag(html, "content");
      expect(attr(trigger, "aria-controls")).toBe("faq-item-content");
      expect(attr(content, "id")).toBe("faq-item-content");
    });
  });

  describe("Custom UI and Classes", () => {
    it("applies class to root and custom UI overrides to slots", () => {
      const html = render(() => (
        <RLCollapsible
          class="custom-root-class"
          ui={{
            root: "ui-root-override",
            trigger: "ui-trigger-override",
            content: "ui-content-override",
          }}
          defaultOpen={true}
          content={<div>Custom UI Content</div>}
        >
          <button type="button">Custom UI Trigger</button>
        </RLCollapsible>
      ));
      expect(slotTag(html, "root")).toContain("custom-root-class");
      expect(slotTag(html, "root")).toContain("ui-root-override");
      expect(slotTag(html, "trigger")).toContain("ui-trigger-override");
      expect(slotTag(html, "content")).toContain("ui-content-override");
    });

    it("applies data-theme attribute when provided", () => {
      const html = render(() => (
        <RLCollapsible theme="dark" content={<div>Dark content</div>}>
          <button type="button">Dark toggle</button>
        </RLCollapsible>
      ));
      expect(attr(slotTag(html, "root"), "data-theme")).toBe("dark");
    });
  });
});
