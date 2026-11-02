import { describe, it, expect } from "vite-plus/test";
import { renderToString } from "@solidjs/web";
import { RLContextMenu } from "../src/components/context-menu/RLContextMenu";
import type { ContextMenuItem } from "../src/components/context-menu/context-menu.types";
import * as components from "../src/components/index";
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

describe("RLContextMenu", () => {
  describe("Exports", () => {
    it("exports RLContextMenu as a single component from index", () => {
      expect(components.RLContextMenu).toBeDefined();
    });
  });

  describe("Single Component Anatomy & Trigger", () => {
    it("renders trigger and closed state by default", () => {
      const html = render(() => (
        <RLContextMenu items={[{ label: "Copy" }]} class="custom-trigger">
          Right-click here
        </RLContextMenu>
      ));

      const trigger = slotTag(html, "trigger");
      expect(trigger).not.toBe("");
      expect(trigger).toContain("custom-trigger");
      expect(trigger).toContain("data-closed");
      expect(attr(trigger, "data-state")).toBe("closed");
      expect(html).toContain("Right-click here");
      expect(slotTag(html, "content")).toBe("");
    });

    it("supports explicit trigger prop", () => {
      const html = render(() => (
        <RLContextMenu
          trigger={<span class="explicit-trigger">Custom Surface</span>}
          items={[{ label: "Copy" }]}
        />
      ));

      const trigger = slotTag(html, "trigger");
      expect(trigger).not.toBe("");
      expect(html).toContain("explicit-trigger");
      expect(html).toContain("Custom Surface");
    });

    it("supports polymorphic trigger via `as` prop", () => {
      const html = render(() => (
        <RLContextMenu as="section" class="poly-trigger" items={[{ label: "Copy" }]}>
          Surface
        </RLContextMenu>
      ));

      expect(slotTag(html, "trigger")).toMatch(/^<section/);
    });
  });

  describe("Open States & Content Anatomy", () => {
    it("renders overlay, positioner, content, groups, and items when open", () => {
      const html = render(() => (
        <RLContextMenu
          open
          portal={false}
          align="end"
          placement="bottom"
          items={[
            {
              label: "Copy",
              description: "Copy selection to clipboard",
              icon: "copy",
              kbds: ["Ctrl", "C"],
            },
            { type: "separator" },
            {
              label: "Delete",
              icon: "trash-2",
              variant: "danger",
            },
          ]}
        >
          Surface
        </RLContextMenu>
      ));

      const trigger = slotTag(html, "trigger");
      const content = slotTag(html, "content");
      expect(trigger).toContain("data-expanded");
      expect(slotTag(html, "overlay")).not.toBe("");
      expect(slotTag(html, "positioner")).not.toBe("");
      expect(content).not.toBe("");
      expect(content).toContain("data-expanded");
      expect(attr(content, "data-align")).toBe("end");
      expect(attr(content, "data-side")).toBe("bottom");

      expect(slotTag(html, "group")).not.toBe("");
      expect(slotTag(html, "item")).not.toBe("");
      expect(slotTag(html, "itemLeading")).not.toBe("");
      expect(slotTag(html, "itemWrapper")).not.toBe("");
      expect(slotTag(html, "itemLabel")).not.toBe("");
      expect(slotTag(html, "itemDescription")).not.toBe("");
      expect(slotTag(html, "itemTrailing")).not.toBe("");
      expect(slotTag(html, "itemKbds")).not.toBe("");
      expect(slotTag(html, "separator")).not.toBe("");

      expect(html).toContain("Copy");
      expect(html).toContain("Copy selection to clipboard");
      expect(html).toContain("Ctrl");
      expect(html).toContain("Delete");
      expect(html).toContain("data-danger");
    });

    it("renders when defaultOpen is true", () => {
      const html = render(() => (
        <RLContextMenu defaultOpen portal={false} items={[{ label: "Inspect" }]}>
          Surface
        </RLContextMenu>
      ));

      expect(slotTag(html, "content")).not.toBe("");
      expect(html).toContain("Inspect");
    });

    it("keeps content in DOM when unmountOnHide={false} and closed", () => {
      const html = render(() => (
        <RLContextMenu
          open={false}
          unmountOnHide={false}
          portal={false}
          items={[{ label: "Persisted Action" }]}
        >
          Surface
        </RLContextMenu>
      ));

      const content = slotTag(html, "content");
      expect(content).not.toBe("");
      expect(content).toContain("data-closed");
      expect(html).toContain("Persisted Action");
    });
  });

  describe("Item Models (Groups, Checkbox, Radio, Submenus, Disabled)", () => {
    it("renders explicit group items with groupLabel and children/items", () => {
      const items: ContextMenuItem[] = [
        {
          type: "group",
          label: "Project brief.pdf",
          children: [
            { label: "Open preview", icon: "eye" },
            { label: "Rename", icon: "edit-2" },
          ],
        },
      ];

      const html = render(() => (
        <RLContextMenu open portal={false} items={items}>
          File
        </RLContextMenu>
      ));

      expect(slotTag(html, "groupLabel")).not.toBe("");
      expect(html).toContain("Project brief.pdf");
      expect(html).toContain("Open preview");
      expect(html).toContain("Rename");
    });

    it("renders shorthand top-level group object without explicit type='group'", () => {
      const html = render(() => (
        <RLContextMenu
          open
          portal={false}
          items={[
            {
              label: "Actions",
              items: [
                { label: "Copy path", icon: "i-lucide:copy" },
                { label: "Rename file", icon: "i-lucide:edit-2" },
                { label: "Delete", icon: "i-lucide:trash-2", variant: "danger" },
              ],
            },
          ]}
        >
          File
        </RLContextMenu>
      ));

      expect(slotTag(html, "groupLabel")).not.toBe("");
      expect(html).toContain("Actions");
      expect(html).toContain("Copy path");
      expect(html).toContain("Rename file");
      expect(html).toContain("Delete");
    });

    it("supports array-of-arrays item grouping with automatic separators", () => {
      const html = render(() => (
        <RLContextMenu
          open
          portal={false}
          items={[[{ label: "Cut" }, { label: "Copy" }], [{ label: "Paste" }]]}
        >
          File
        </RLContextMenu>
      ));

      expect(html).toContain("Cut");
      expect(html).toContain("Copy");
      expect(html).toContain("Paste");
      expect(slotTag(html, "separator")).not.toBe("");
    });

    it("renders checkbox and radio items with data-selected and itemIndicator", () => {
      const items: ContextMenuItem[] = [
        {
          type: "checkbox",
          label: "Pin item",
          checked: true,
        },
        { type: "separator" },
        {
          type: "radio",
          label: "High priority",
          group: "priority",
          value: "high",
          checked: true,
        },
        {
          type: "radio",
          label: "Low priority",
          group: "priority",
          value: "low",
          checked: false,
        },
      ];

      const html = render(() => (
        <RLContextMenu open portal={false} items={items}>
          Surface
        </RLContextMenu>
      ));

      expect(html).toContain('role="menuitemcheckbox"');
      expect(html).toContain('role="menuitemradio"');
      expect(html).toContain("data-selected");
      expect(slotTag(html, "itemIndicator")).not.toBe("");
    });

    it("renders submenu items with itemSubIndicator and open submenu content", () => {
      const items: ContextMenuItem[] = [
        {
          label: "Sort by",
          open: true,
          children: [
            { label: "Name", icon: "arrow-down-a-z" },
            { label: "Modified date", icon: "calendar" },
          ],
        },
        { label: "Refresh", icon: "refresh-cw" },
      ];

      const html = render(() => (
        <RLContextMenu open portal={false} items={items}>
          Surface
        </RLContextMenu>
      ));

      expect(slotTag(html, "itemSubIndicator")).not.toBe("");
      expect(html).toContain("Sort by");
      expect(html).toContain("Name");
      expect(html).toContain("Modified date");
    });

    it("marks disabled trigger and disabled items with data-disabled", () => {
      const html = render(() => (
        <RLContextMenu
          open
          portal={false}
          disabled
          items={[{ label: "Disabled Action", disabled: true }]}
        >
          Disabled Trigger
        </RLContextMenu>
      ));

      expect(slotTag(html, "trigger")).toContain("data-disabled");
      expect(slotTag(html, "item")).toContain("data-disabled");
    });
  });

  describe("Custom Renderers & Styling", () => {
    it("supports topRender, bottomRender, and itemRender", () => {
      const html = render(() => (
        <RLContextMenu
          open
          portal={false}
          topRender={() => <div class="custom-top">Header Metadata</div>}
          bottomRender={() => <div class="custom-bottom">Footer Info</div>}
          itemRender={(props) => (
            <div class="custom-item-render" data-index={props.index}>
              Custom: {props.item.label}
            </div>
          )}
          items={[{ label: "Action 1" }]}
        >
          Surface
        </RLContextMenu>
      ));

      expect(html).toContain("custom-top");
      expect(html).toContain("Header Metadata");
      expect(html).toContain("custom-bottom");
      expect(html).toContain("Footer Info");
      expect(html).toContain("custom-item-render");
      expect(html).toContain("Custom: Action 1");
    });

    it("applies ui / classes and styles overrides across slots", () => {
      const html = render(() => (
        <RLContextMenu
          open
          portal={false}
          size="lg"
          ui={{
            trigger: "ui-trigger-custom",
            content: "ui-content-custom",
            item: "ui-item-custom",
          }}
          classes={{
            group: "classes-group-custom",
          }}
          items={[{ label: "Styled Item" }]}
        >
          Surface
        </RLContextMenu>
      ));

      expect(slotTag(html, "trigger")).toContain("ui-trigger-custom");
      expect(slotTag(html, "content")).toContain("ui-content-custom");
      expect(slotTag(html, "group")).toContain("classes-group-custom");
      expect(slotTag(html, "item")).toContain("ui-item-custom");
    });
  });
});
