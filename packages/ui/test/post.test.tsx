import { describe, it, expect } from "vite-plus/test";

import { RLPost } from "../src/components/post/RLPost";
import { renderToString } from "@solidjs/web";
import { cleanHtml } from "./utils/normalize";

function render(fn: () => any): string {
  return cleanHtml(renderToString(fn));
}

function slotTag(html: string, slot: string): string {
  const match = html.match(new RegExp(`<[a-z0-9]+[^>]*data-slot="${slot}"[^>]*>`));
  return match?.[0] ?? "";
}

function slotContent(html: string, slot: string): string {
  const match = html.match(
    new RegExp(`<([a-z0-9]+)[^>]*data-slot="${slot}"[^>]*>([\\s\\S]*?)</\\1>`),
  );
  return match?.[2] ?? "";
}

function attr(tag: string, name: string): string | undefined {
  return tag.match(new RegExp(`\\s${name}="([^"]*)"`))?.[1];
}

describe("RLPost", () => {
  describe("Props", () => {
    it("renders title, description, badge and date in their slots", () => {
      const html = render(() => (
        <RLPost title="Hello" description="World" badge="News" date="2024-01-15" />
      ));
      expect(slotContent(html, "title")).toContain("Hello");
      expect(slotContent(html, "description")).toContain("World");
      expect(slotContent(html, "badge")).toContain("News");
      expect(slotContent(html, "date")).toContain("2024-01-15");
    });

    it("formats Date values for display", () => {
      const html = render(() => <RLPost title="T" date={new Date(2024, 0, 15)} />);
      expect(slotContent(html, "date")).toContain("2024");
    });

    it("renders an anchor root when href is set and a div otherwise", () => {
      const linked = render(() => <RLPost title="T" href="/blog/post" localize={false} />);
      const root = slotTag(linked, "root");
      expect(root.startsWith("<a ")).toBe(true);
      expect(attr(root, "href")).toBe("/blog/post");

      const plain = render(() => <RLPost title="T" />);
      expect(slotTag(plain, "root").startsWith("<div ")).toBe(true);
    });

    it("localizes internal hrefs by default", () => {
      const html = render(() => <RLPost title="T" href="/blog/post" />);
      expect(attr(slotTag(html, "root"), "href")).toContain("blog/post");
    });

    it("renders the image from a string or an object src with the title as alt", () => {
      const fromString = render(() => <RLPost title="Cover" image="/cover.png" />);
      expect(slotTag(fromString, "trigger-image")).toContain('src="/cover.png"');
      expect(slotTag(fromString, "trigger-image")).toContain('alt="Cover"');

      const fromObject = render(() => <RLPost image={{ src: "/obj.png" }} />);
      expect(slotTag(fromObject, "trigger-image")).toContain('src="/obj.png"');
      expect(slotTag(fromObject, "trigger-image")).toContain('alt=""');
    });

    it("renders children inside the body", () => {
      const html = render(() => <RLPost title="T">Child text</RLPost>);
      expect(slotTag(html, "body")).not.toBe("");
      expect(html).toContain("Child text");
    });

    it("forwards rest attributes to the root and not component props", () => {
      const html = render(() => (
        <RLPost
          title="T"
          description="D"
          badge="B"
          badgeColor="primary"
          date="2024-01-01"
          image="/i.png"
          localize={false}
          href="/x"
          id="post-1"
          aria-label="post-link"
          theme="dark"
        />
      ));
      const root = slotTag(html, "root");
      expect(attr(root, "id")).toBe("post-1");
      expect(attr(root, "aria-label")).toBe("post-link");
      const propNames = [
        "title",
        "description",
        "date",
        "image",
        "localize",
        "badge",
        "badgeColor",
      ];
      for (const name of propNames) {
        expect(attr(root, name)).toBeUndefined();
      }
      expect(attr(root, "data-theme")).toBe("dark");
    });
  });

  describe("Slots", () => {
    it("slot props replace their prop-driven defaults", () => {
      const html = render(() => (
        <RLPost
          title="Prop T"
          description="Prop D"
          image="/prop.png"
          badge="Prop B"
          date="2020-01-01"
          titleSlot={<span>Slot T</span>}
          descriptionSlot={<span>Slot D</span>}
          imageSlot={<span>Slot I</span>}
          badgeSlot={<span>Slot B</span>}
          dateSlot={<span>Slot Date</span>}
        />
      ));
      for (const text of ["Slot T", "Slot D", "Slot I", "Slot B", "Slot Date"]) {
        expect(html).toContain(text);
      }
      for (const text of ["Prop T", "Prop D", "Prop B", "2020-01-01"]) {
        expect(html).not.toContain(text);
      }
      expect(slotTag(html, "image-wrapper")).toBe("");
      expect(slotTag(html, "title")).toBe("");
    });

    it("renders render-function slots", () => {
      const html = render(() => <RLPost titleSlot={() => <span>Fn Title</span>} />);
      expect(html).toContain("Fn Title");
      expect(slotTag(html, "title")).toBe("");
    });

    it("renders footerSlot inside a footer", () => {
      const html = render(() => (
        <RLPost title="T" footerSlot={<button type="button">Read</button>} />
      ));
      expect(slotTag(html, "footer")).not.toBe("");
      expect(html).toContain("Read");
    });
  });

  describe("Boundaries", () => {
    it("omits empty elements when no value or slot is given", () => {
      const html = render(() => <RLPost title="" description="" />);
      for (const slot of ["image-wrapper", "title", "description", "badge", "date", "footer"]) {
        expect(slotTag(html, slot)).toBe("");
      }
      expect(slotTag(html, "body")).not.toBe("");
    });

    it("omits the date for null", () => {
      const html = render(() => <RLPost title="T" date={null} />);
      expect(slotTag(html, "date")).toBe("");
    });
  });
});
