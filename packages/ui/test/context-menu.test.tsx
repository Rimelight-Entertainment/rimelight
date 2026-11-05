import { describe, it, expect } from "vite-plus/test";
import { renderToString } from "@solidjs/web";
import { RLContextMenu } from "../src/components/context-menu/RLContextMenu";
import type { ContextMenuItem } from "../src/components/context-menu/context-menu.types";
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
  describe("Trigger", () => {
    it("renders children as the trigger and is closed by default", () => {
      const html = render(() => (
        <RLContextMenu items={[{ label: "Copy" }]}>Right-click here</RLContextMenu>
      ));

      const trigger = slotTag(html, "trigger");
      expect(html).toContain("Right-click here");
      expect(attr(trigger, "aria-expanded")).toBe("false");
      expect(attr(trigger, "data-state")).toBe("closed");
      expect(slotTag(html, "body")).toBe("");
    });

    it("renders triggerSlot in place of children", () => {
      const html = render(() => (
        <RLContextMenu
          triggerSlot={<span class="explicit-trigger">Custom Surface</span>}
          items={[{ label: "Copy" }]}
        >
          Ignored children
        </RLContextMenu>
      ));

      expect(html).toContain("Custom Surface");
      expect(html).not.toContain("Ignored children");
    });

    it("exposes accessible names through kebab-case aria props", () => {
      const html = render(() => (
        <RLContextMenu aria-label="File actions" aria-describedby="hint" items={[]}>
          File
        </RLContextMenu>
      ));

      const trigger = slotTag(html, "trigger");
      expect(attr(trigger, "aria-label")).toBe("File actions");
      expect(attr(trigger, "aria-describedby")).toBe("hint");
      expect(attr(trigger, "aria-haspopup")).toBe("menu");
    });

    it("marks the trigger disabled when disabled", () => {
      const html = render(() => (
        <RLContextMenu disabled items={[{ label: "Copy" }]}>
          Surface
        </RLContextMenu>
      ));

      expect(slotTag(html, "trigger")).toContain("data-disabled");
    });

    it("supports polymorphic root via `as` prop", () => {
      const html = render(() => (
        <RLContextMenu as="section" items={[{ label: "Copy" }]}>
          Surface
        </RLContextMenu>
      ));

      expect(html).toMatch(/^<section[^>]*data-slot="root"/);
    });
  });

  describe("Open state", () => {
    it("renders overlay, positioner, body, and items with placement attributes", () => {
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
              color: "error",
            },
          ]}
        >
          Surface
        </RLContextMenu>
      ));

      const body = slotTag(html, "body");
      expect(attr(slotTag(html, "trigger"), "aria-expanded")).toBe("true");
      expect(slotTag(html, "overlay")).not.toBe("");
      expect(slotTag(html, "positioner")).not.toBe("");
      expect(attr(body, "data-state")).toBe("open");
      expect(attr(body, "data-align")).toBe("end");
      expect(attr(body, "data-side")).toBe("bottom");

      expect(html).toContain("Copy");
      expect(html).toContain("Copy selection to clipboard");
      expect(html).toContain("Ctrl");
      expect(html).toContain("Delete");
      expect(slotTag(html, "separator")).not.toBe("");
      expect(slotTag(html, "item-kbds")).not.toBe("");
    });

    it("marks error-colored items with data-danger", () => {
      const html = render(() => (
        <RLContextMenu open portal={false} items={[{ label: "Delete", color: "error" }]}>
          Surface
        </RLContextMenu>
      ));

      expect(slotTag(html, "item")).toContain("data-danger");
    });

    it("renders when defaultOpen is true", () => {
      const html = render(() => (
        <RLContextMenu defaultOpen portal={false} items={[{ label: "Inspect" }]}>
          Surface
        </RLContextMenu>
      ));

      expect(attr(slotTag(html, "body"), "data-state")).toBe("open");
      expect(html).toContain("Inspect");
    });

    it("unmounts the body when closed by default", () => {
      const html = render(() => (
        <RLContextMenu portal={false} items={[{ label: "Hidden" }]}>
          Surface
        </RLContextMenu>
      ));

      expect(slotTag(html, "body")).toBe("");
      expect(html).not.toContain("Hidden");
    });

    it("keeps the body in the DOM when unmountOnHide={false} and closed", () => {
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

      expect(attr(slotTag(html, "body"), "data-state")).toBe("closed");
      expect(html).toContain("Persisted Action");
    });
  });

  describe("Items", () => {
    it("renders group items with a group label", () => {
      const items: ContextMenuItem[] = [
        {
          type: "group",
          label: "Actions",
          items: [
            { label: "Copy path", icon: "copy" },
            { label: "Rename file", icon: "edit-2" },
          ],
        },
      ];

      const html = render(() => (
        <RLContextMenu open portal={false} items={items}>
          File
        </RLContextMenu>
      ));

      expect(slotTag(html, "group-label")).not.toBe("");
      expect(html).toContain("Actions");
      expect(html).toContain("Copy path");
      expect(html).toContain("Rename file");
    });

    it("inserts separators between array-of-arrays groups", () => {
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

    it("reports checked state for checkbox and radio items through aria-checked", () => {
      const items: ContextMenuItem[] = [
        { type: "checkbox", label: "Pin item", checked: true },
        { type: "separator" },
        { type: "radio", label: "High priority", group: "priority", value: "high", checked: true },
        { type: "radio", label: "Low priority", group: "priority", value: "low", checked: false },
      ];

      const html = render(() => (
        <RLContextMenu open portal={false} items={items}>
          Surface
        </RLContextMenu>
      ));

      expect(html).toContain('role="menuitemcheckbox"');
      expect(html).toContain('role="menuitemradio"');
      expect(html).toContain('aria-checked="true"');
      expect(html).toContain('aria-checked="false"');
      expect(slotTag(html, "item-indicator")).not.toBe("");
    });

    it("renders submenu items with an indicator and the open submenu body", () => {
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

      expect(slotTag(html, "item-sub-indicator")).not.toBe("");
      expect(slotTag(html, "submenu")).not.toBe("");
      expect(html).toContain("Name");
      expect(html).toContain("Modified date");
    });

    it("marks disabled items with data-disabled and aria-disabled", () => {
      const html = render(() => (
        <RLContextMenu open portal={false} items={[{ label: "Disabled Action", disabled: true }]}>
          Surface
        </RLContextMenu>
      ));

      const item = slotTag(html, "item");
      expect(item).toContain("data-disabled");
      expect(attr(item, "aria-disabled")).toBe("true");
    });
  });

  describe("Slots", () => {
    it("renders topSlot and bottomSlot around the items", () => {
      const html = render(() => (
        <RLContextMenu
          open
          portal={false}
          topSlot={({ open }) => <div class="custom-top">Header {String(open)}</div>}
          bottomSlot={() => <div class="custom-bottom">Footer Info</div>}
          items={[{ label: "Action 1" }]}
        >
          Surface
        </RLContextMenu>
      ));

      expect(html).toContain("Header true");
      expect(html).toContain("Footer Info");
      expect(html.indexOf("Header true")).toBeLessThan(html.indexOf("Action 1"));
      expect(html.indexOf("Footer Info")).toBeGreaterThan(html.indexOf("Action 1"));
    });

    it("renders bodySlot inside the menu body", () => {
      const html = render(() => (
        <RLContextMenu open portal={false} bodySlot={<p class="extra-body">Extra body</p>}>
          Surface
        </RLContextMenu>
      ));

      expect(html).toContain("Extra body");
      expect(slotTag(html, "body")).not.toBe("");
    });

    it("renders each item through itemSlot", () => {
      const html = render(() => (
        <RLContextMenu
          open
          portal={false}
          itemSlot={(args) => (
            <div class="custom-item-render" data-index={args.index}>
              Custom: {args.item.label}
            </div>
          )}
          items={[{ label: "Action 1" }]}
        >
          Surface
        </RLContextMenu>
      ));

      expect(html).toContain("custom-item-render");
      expect(html).toContain("Custom: Action 1");
      expect(slotTag(html, "item")).toBe("");
    });
  });
});
