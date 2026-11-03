import { describe, it, expect } from "vite-plus/test";
import { renderToString } from "@solidjs/web";
import {
  RLSplitter,
  inferFallbackTotalPx,
  isPanelItem,
  resolveConstraintPx,
  resolveValuePx,
} from "../src/components/splitter/RLSplitter";
import { cleanHtml } from "./utils/normalize";
import { mountComponent } from "./utils/browser-render";

function render(fn: () => any): string {
  return cleanHtml(renderToString(fn));
}

function slotTag(html: string, slot: string): string {
  const match = html.match(new RegExp(`<[a-z0-9-]+[^>]*data-slot="${slot}"[^>]*>`));
  return match?.[0] ?? "";
}

function attr(tag: string, name: string): string | undefined {
  return tag.match(new RegExp(`\\s${name}="([^"]*)"`))?.[1];
}

describe("RLSplitter Component Test Suite", () => {
  describe("Exports", () => {
    it("exports RLSplitter component from package index", () => {
      expect(RLSplitter).toBeDefined();
    });
  });

  describe("Structure, Anatomy & Slots", () => {
    it("renders root, panel, handle, handleControl, and intersection slots", () => {
      const html = render(() => (
        <RLSplitter
          defaultValue={["30%", "70%"]}
          panels={[
            { min: "20%", content: <div>Sidebar</div> },
            { min: "30%", content: <div>Content</div> },
          ]}
        />
      ));

      expect(html).toMatch(/^<div/);
      const root = slotTag(html, "root");
      expect(root).not.toBe("");
      expect(root).toContain("data-resizable-root");
      expect(slotTag(html, "panel")).not.toBe("");
      expect(slotTag(html, "handle")).not.toBe("");
      expect(slotTag(html, "handleControl")).not.toBe("");
      expect(slotTag(html, "intersection")).not.toBe("");
      expect(html).toContain("data-resizable-handle-start-target");
      expect(html).toContain("data-resizable-handle-end-target");
      expect(html).toContain("Sidebar");
      expect(html).toContain("Content");
    });

    it("renders polymorphic root element via as prop", () => {
      const html = render(() => (
        <RLSplitter as="section">
          <div>Left</div>
          <div>Right</div>
        </RLSplitter>
      ));
      expect(html).toMatch(/^<section/);
    });

    it("pairs declarative panel constraints with children fallback", () => {
      const html = render(() => (
        <RLSplitter
          defaultValue={["32%", "68%"]}
          panels={[{ min: "25%", max: "45%" }, { min: "35%" }]}
        >
          <div>Inspector</div>
          <div>Viewport</div>
        </RLSplitter>
      ));
      expect(html).toContain("Inspector");
      expect(html).toContain("Viewport");
      const handle = slotTag(html, "handle");
      expect(attr(handle, "aria-valuenow")).toBe("32");
      expect(attr(handle, "aria-valuemin")).toBe("25");
      expect(attr(handle, "aria-valuemax")).toBe("45");
    });
  });

  describe("Sizing & Normalization", () => {
    it("normalizes percentage defaultValue and sets flex-basis on panels", () => {
      const container = mountComponent(() => (
        <RLSplitter defaultValue={["30%", "70%"]} panels={[{ content: "A" }, { content: "B" }]} />
      ));
      const panels = container.querySelectorAll('[data-slot="panel"]');
      expect(panels.length).toBe(2);
      expect(panels[0]?.getAttribute("style")).toContain("30%");
      expect(panels[1]?.getAttribute("style")).toContain("70%");
    });

    it("normalizes pixel value array and clamps to min and max constraints", () => {
      const container = mountComponent(() => (
        <RLSplitter
          value={[100, 700]}
          panels={[
            { min: 200, content: "Logs" },
            { min: 150, content: "Output" },
          ]}
        />
      ));
      const panels = container.querySelectorAll('[data-slot="panel"]');
      expect(panels.length).toBe(2);
      // 100 clamped up to 200 out of 800 total => 25% and 75%
      expect(panels[0]?.getAttribute("style")).toContain("25%");
      expect(panels[1]?.getAttribute("style")).toContain("75%");
    });

    it("supports multi-column layouts with 3 or more panels", () => {
      const container = mountComponent(() => (
        <RLSplitter
          defaultValue={["20%", "35%", "45%"]}
          panels={[
            { min: "15%", content: "Mailboxes" },
            { min: "25%", content: "Threads" },
            { min: "30%", content: "Reading Pane" },
          ]}
        />
      ));
      const panels = container.querySelectorAll('[data-slot="panel"]');
      const handles = container.querySelectorAll('[data-slot="handle"]');
      expect(panels.length).toBe(3);
      expect(handles.length).toBe(2);
    });

    it("resolves constraints and values across pixels, ratios, and percentages", () => {
      expect(resolveConstraintPx("25%", 800, 0)).toBe(200);
      expect(resolveConstraintPx(150, 800, 0)).toBe(150);
      expect(resolveConstraintPx(1, 800, 1)).toBe(800);
      expect(resolveConstraintPx(0, 800, 0)).toBe(0);
      expect(resolveValuePx("35%", 800)).toBe(280);
      expect(resolveValuePx(280, 800)).toBe(280);
      expect(inferFallbackTotalPx([280, 520], false)).toBe(800);
      expect(isPanelItem({ min: "20%", content: "Nav" })).toBe(true);
    });
  });

  describe("Collapsible Panels & Handle Action", () => {
    it("marks collapsed panels and collapse handles with data-collapsed and data-collapse", () => {
      const container = mountComponent(() => (
        <RLSplitter
          defaultValue={["25%", "75%"]}
          panels={[
            {
              collapsible: true,
              collapsibleMin: 56,
              defaultCollapsed: true,
              content: (state) => (
                <span>{state.collapsed ? `Rail:${state.size}px` : "Full Sidebar"}</span>
              ),
              handle: {
                action: "collapse",
                children: (state) => (
                  <span data-state-label>{state.collapsed ? "CollapsedIcon" : "ExpandedIcon"}</span>
                ),
              },
            },
            { min: "30%", content: "Workspace" },
          ]}
        />
      ));

      const firstPanel = container.querySelector('[data-resizable-panel="0"]');
      const handle = container.querySelector('[data-slot="handle"]');
      expect(firstPanel?.hasAttribute("data-collapsed")).toBe(true);
      expect(handle?.hasAttribute("data-collapse")).toBe(true);
      expect(handle?.hasAttribute("data-collapsed")).toBe(true);
      expect(container.textContent).toContain("CollapsedIcon");
      expect(container.textContent).toContain("Rail:56px");
    });
  });

  describe("Orientation, Intersection & Disabled State", () => {
    it("renders vertical orientation with horizontal aria-orientation on separator", () => {
      const html = render(() => (
        <RLSplitter
          orientation="vertical"
          panels={[{ content: "Query Editor" }, { content: "Results" }]}
        />
      ));

      const root = slotTag(html, "root");
      const handle = slotTag(html, "handle");
      expect(attr(root, "data-orientation")).toBe("vertical");
      expect(attr(handle, "aria-orientation")).toBe("horizontal");
      expect(handle).toContain("cursor-row-resize");
    });

    it("enables intersection targets when intersection prop is set", () => {
      const container = mountComponent(() => (
        <RLSplitter intersection={true} panels={[{ content: "A" }, { content: "B" }]} />
      ));
      const startTarget = container.querySelector("[data-resizable-handle-start-target]");
      const endTarget = container.querySelector("[data-resizable-handle-end-target]");
      expect(startTarget).not.toBeNull();
      expect(endTarget).not.toBeNull();
      expect(startTarget?.className).not.toContain("hidden");
    });

    it("locks handles when disabled is true or adjacent panel has resizable={false}", () => {
      const disabledHtml = render(() => (
        <RLSplitter disabled={true} panels={[{ content: "A" }, { content: "B" }]} />
      ));
      expect(slotTag(disabledHtml, "root")).toContain("data-disabled");
      expect(attr(slotTag(disabledHtml, "handle"), "tabindex")).toBe("-1");
      expect(attr(slotTag(disabledHtml, "handle"), "aria-disabled")).toBe("true");

      const lockedHtml = render(() => (
        <RLSplitter panels={[{ resizable: false, content: "Fixed" }, { content: "Flexible" }]} />
      ));
      expect(attr(slotTag(lockedHtml, "handle"), "tabindex")).toBe("-1");
      expect(attr(slotTag(lockedHtml, "handle"), "aria-disabled")).toBe("true");
    });
  });

  describe("Custom UI, Classes, Styles & Translations", () => {
    it("applies custom class, ui/classes slot overrides, styles, and translations", () => {
      const html = render(() => (
        <RLSplitter
          class="custom-root"
          classes={{ root: "alias-root" }}
          ui={{
            panel: "custom-panel",
            handle: "custom-handle",
            handleControl: "custom-control",
          }}
          styles={{
            root: "min-height: 200px",
          }}
          translations={{ resize: "Custom resize label" }}
          panels={[{ content: "One" }, { content: "Two" }]}
        />
      ));

      expect(slotTag(html, "root")).toContain("custom-root");
      expect(slotTag(html, "root")).toContain("alias-root");
      expect(slotTag(html, "root")).toContain("min-height: 200px");
      expect(slotTag(html, "panel")).toContain("custom-panel");
      expect(slotTag(html, "handle")).toContain("custom-handle");
      expect(slotTag(html, "handleControl")).toContain("custom-control");
      expect(attr(slotTag(html, "handle"), "aria-label")).toBe("Custom resize label");
    });
  });
});
