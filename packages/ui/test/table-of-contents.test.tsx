import { describe, it, expect } from "vite-plus/test";
import { RLTableOfContents } from "../src/components/table-of-contents/RLTableOfContents";
import type { TableOfContentsHeading } from "../src/components/table-of-contents/table-of-contents.types";
import { mountComponent } from "./utils/browser-render";

const headings: TableOfContentsHeading[] = [
  { depth: 1, slug: "title", text: "Title" },
  { depth: 2, slug: "intro", text: "Intro" },
  { depth: 3, slug: "details", text: "Details" },
  { depth: 4, slug: "deep", text: "Deep" },
];

const linkTexts = (c: HTMLElement) =>
  Array.from(c.querySelectorAll<HTMLElement>("[data-slot='link-text']")).map(
    (el) => el.textContent,
  );

describe("RLTableOfContents", () => {
  it("lists h2 and h3 headings by default", () => {
    const c = mountComponent(() => <RLTableOfContents headings={headings} />);
    expect(linkTexts(c)).toEqual(["Intro", "Details"]);
  });

  it("bounds the listed heading levels with tableOfContents", () => {
    const c = mountComponent(() => (
      <RLTableOfContents
        headings={headings}
        tableOfContents={{ minHeadingLevel: 3, maxHeadingLevel: 4 }}
      />
    ));
    expect(linkTexts(c)).toEqual(["Details", "Deep"]);
  });

  it("renders nothing when tableOfContents is false", () => {
    const c = mountComponent(() => (
      <RLTableOfContents headings={headings} tableOfContents={false} />
    ));
    expect(c.querySelector("[data-slot='root']")).toBeNull();
  });

  it("hides the root when no heading falls inside the bounds", () => {
    const c = mountComponent(() => (
      <RLTableOfContents
        headings={[{ depth: 1, slug: "title", text: "Title" }]}
        tableOfContents={{ minHeadingLevel: 2, maxHeadingLevel: 3 }}
      />
    ));
    const root = c.querySelector<HTMLElement>("[data-slot='root']")!;
    expect(root.hidden).toBe(true);
    expect(linkTexts(c)).toEqual([]);
  });

  it("links each heading to its slug with its depth", () => {
    const c = mountComponent(() => <RLTableOfContents headings={headings} />);
    const links = Array.from(c.querySelectorAll<HTMLAnchorElement>("a[data-slot='link']"));
    expect(links.map((a) => a.getAttribute("href"))).toEqual(["#intro", "#details"]);
    expect(links[1]!.dataset["depth"]).toBe("3");
  });

  it("renders the collapsible dropdown with a summary and the heading list", () => {
    const c = mountComponent(() => <RLTableOfContents headings={headings} collapsible />);
    const details = c.querySelector<HTMLDetailsElement>("details[data-slot='root']")!;
    expect(details).not.toBeNull();
    expect(details.querySelector("summary[data-slot='trigger']")).not.toBeNull();
    expect(
      Array.from(c.querySelectorAll<HTMLElement>("[data-slot='body-link']")).map(
        (a) => a.textContent,
      ),
    ).toEqual(["Intro", "Details"]);
  });

  it("reports the trigger state as open or closed", () => {
    const c = mountComponent(() => <RLTableOfContents headings={headings} collapsible />);
    const trigger = c.querySelector<HTMLElement>("[data-slot='trigger']")!;
    expect(trigger.getAttribute("data-state")).toBe("closed");
  });
});
