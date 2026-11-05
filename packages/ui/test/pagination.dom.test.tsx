import { describe, it, expect, afterEach } from "vite-plus/test";
import { flush } from "solid-js";
import { render } from "@solidjs/web";
import { RLPagination } from "../src/components/pagination/RLPagination";
import { uiT } from "../src/locale";

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

afterEach(() => {
  while (disposers.length) disposers.pop()?.();
  document.body.innerHTML = "";
});

const pageButtons = (root: HTMLElement) =>
  Array.from(root.querySelectorAll<HTMLButtonElement>("[data-slot='list'] button")).filter(
    (btn) => btn.getAttribute("aria-label") === null,
  );

const pageButton = (root: HTMLElement, page: number) =>
  pageButtons(root).find((btn) => btn.textContent?.trim() === String(page));

const previousButton = (root: HTMLElement) =>
  root.querySelector<HTMLButtonElement>(`button[aria-label="${uiT("pagination.previous")}"]`);

const nextButton = (root: HTMLElement) =>
  root.querySelector<HTMLButtonElement>(`button[aria-label="${uiT("pagination.next")}"]`);

const ellipses = (root: HTMLElement) => root.querySelectorAll("[data-slot='ellipsis']");

describe("RLPagination", () => {
  describe("pages", () => {
    it("renders a numbered link for every page when the total fits", () => {
      const root = mount(() => <RLPagination totalPages={5} />);
      expect(pageButtons(root).map((btn) => btn.textContent?.trim())).toEqual([
        "1",
        "2",
        "3",
        "4",
        "5",
      ]);
      expect(ellipses(root)).toHaveLength(0);
    });

    it("marks defaultPage as the current page", () => {
      const root = mount(() => <RLPagination totalPages={5} defaultPage={3} />);
      expect(pageButton(root, 3)?.getAttribute("aria-current")).toBe("page");
      expect(pageButton(root, 1)?.hasAttribute("aria-current")).toBe(false);
    });

    it("marks the controlled page as the current page", () => {
      const root = mount(() => <RLPagination totalPages={5} page={4} />);
      expect(pageButton(root, 4)?.getAttribute("aria-current")).toBe("page");
    });

    it("collapses long ranges with ellipses and keeps the first and last pages", () => {
      const root = mount(() => <RLPagination totalPages={10} page={5} />);
      expect(pageButtons(root).map((btn) => btn.textContent?.trim())).toEqual([
        "1",
        "4",
        "5",
        "6",
        "10",
      ]);
      expect(ellipses(root)).toHaveLength(2);
    });

    it("shows a single ellipsis when the current page is near the start", () => {
      const root = mount(() => <RLPagination totalPages={10} page={1} />);
      expect(pageButtons(root).map((btn) => btn.textContent?.trim())).toEqual(["1", "2", "10"]);
      expect(ellipses(root)).toHaveLength(1);
    });
  });

  describe("navigation", () => {
    it("moves to the page whose number is clicked", () => {
      const pages: number[] = [];
      const root = mount(() => (
        <RLPagination totalPages={5} onValueChange={(p) => pages.push(p)} />
      ));
      click(pageButton(root, 4));
      expect(pages).toEqual([4]);
      expect(pageButton(root, 4)?.getAttribute("aria-current")).toBe("page");
    });

    it("moves forward and back with the next and previous controls", () => {
      const pages: number[] = [];
      const root = mount(() => (
        <RLPagination totalPages={5} defaultPage={2} onValueChange={(p) => pages.push(p)} />
      ));
      click(nextButton(root));
      click(previousButton(root));
      click(previousButton(root));
      expect(pages).toEqual([3, 2, 1]);
    });

    it("does not change the displayed page for a controlled page without an update", () => {
      const root = mount(() => <RLPagination totalPages={5} page={2} onValueChange={() => {}} />);
      click(pageButton(root, 5));
      expect(pageButton(root, 2)?.getAttribute("aria-current")).toBe("page");
      expect(pageButton(root, 5)?.hasAttribute("aria-current")).toBe(false);
    });
  });

  describe("previous and next controls", () => {
    it("disables the previous control on the first page", () => {
      const root = mount(() => <RLPagination totalPages={5} page={1} />);
      expect(previousButton(root)?.disabled).toBe(true);
      expect(nextButton(root)?.disabled).toBe(false);
    });

    it("disables the next control on the last page", () => {
      const root = mount(() => <RLPagination totalPages={5} page={5} />);
      expect(nextButton(root)?.disabled).toBe(true);
      expect(previousButton(root)?.disabled).toBe(false);
    });
  });

  describe("boundaries", () => {
    it("renders a single page with both controls disabled", () => {
      const root = mount(() => <RLPagination totalPages={1} />);
      expect(pageButtons(root).map((btn) => btn.textContent?.trim())).toEqual(["1"]);
      expect(previousButton(root)?.disabled).toBe(true);
      expect(nextButton(root)?.disabled).toBe(true);
      expect(ellipses(root)).toHaveLength(0);
    });

    it("defaults to a single page when totalPages is omitted", () => {
      const root = mount(() => <RLPagination />);
      expect(pageButtons(root).map((btn) => btn.textContent?.trim())).toEqual(["1"]);
    });

    it("labels the navigation landmark", () => {
      const root = mount(() => <RLPagination totalPages={3} />);
      expect(root.querySelector("nav")?.getAttribute("aria-label")).toBe(uiT("pagination.label"));
    });
  });
});
