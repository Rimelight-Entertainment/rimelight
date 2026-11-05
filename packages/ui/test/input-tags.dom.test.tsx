import { describe, it, expect, afterEach } from "vite-plus/test";
import { flush } from "solid-js";
import { render } from "@solidjs/web";
import { RLInputTags } from "../src/components/input-tags/RLInputTags";
import { uiT } from "../src/locale";

const disposers: Array<() => void> = [];

function mount(fn: () => any): HTMLElement {
  const container = document.createElement("div");
  document.body.appendChild(container);
  disposers.push(render(fn, container));
  flush();
  return container;
}

function dispatch(el: Element | null | undefined, event: Event): void {
  el?.dispatchEvent(event);
  flush();
}

afterEach(() => {
  while (disposers.length) disposers.pop()?.();
  document.body.innerHTML = "";
});

const tagLabels = (root: HTMLElement) =>
  Array.from(root.querySelectorAll("[data-slot='tag']")).map((el) => el.textContent?.trim());

const addInput = (root: HTMLElement) =>
  root.querySelector<HTMLInputElement>("input[data-slot='input']");

function pressEnter(root: HTMLElement, value: string): void {
  const el = addInput(root);
  if (el) el.value = value;
  dispatch(el, new Event("input", { bubbles: true }));
  dispatch(el, new KeyboardEvent("keydown", { key: "Enter", bubbles: true }));
}

describe("RLInputTags", () => {
  describe("items", () => {
    it("renders one tag per string item", () => {
      const root = mount(() => <RLInputTags items={["red", "green"]} />);
      expect(tagLabels(root)).toEqual(["red", "green"]);
    });

    it("renders the label of object items", () => {
      const root = mount(() => <RLInputTags items={[{ label: "Frontend", value: "fe" }]} />);
      expect(tagLabels(root)).toEqual(["Frontend"]);
    });

    it("limits rendered tags to displayLimit and counts the rest", () => {
      const root = mount(() => <RLInputTags items={["a", "b", "c", "d", "e"]} displayLimit={2} />);
      expect(tagLabels(root)).toEqual(["a", "b"]);
      expect(root.querySelector("[data-slot='more']")?.textContent).toContain("+3 more");
    });

    it("shows four tags by default and counts the overflow", () => {
      const root = mount(() => <RLInputTags items={["a", "b", "c", "d", "e"]} />);
      expect(tagLabels(root)).toHaveLength(4);
      expect(root.querySelector("[data-slot='more']")?.textContent).toContain("+1 more");
    });

    it("omits the overflow counter when every tag fits", () => {
      const root = mount(() => <RLInputTags items={["a", "b"]} />);
      expect(root.querySelector("[data-slot='more']")).toBeNull();
    });

    it("submits each tag as a hidden input when name is set", () => {
      const root = mount(() => (
        <RLInputTags name="tags" items={["red", { label: "Blue", value: "b" }]} />
      ));
      const hidden = Array.from(root.querySelectorAll<HTMLInputElement>("input[type='hidden']"));
      expect(hidden.map((el) => el.name)).toEqual(["tags", "tags"]);
      expect(hidden.map((el) => el.value)).toEqual(["red", "b"]);
    });

    it("renders no hidden inputs when name is not set", () => {
      const root = mount(() => <RLInputTags items={["red"]} />);
      expect(root.querySelector("input[type='hidden']")).toBeNull();
    });
  });

  describe("input", () => {
    it("renders no text input by default", () => {
      const root = mount(() => <RLInputTags items={["a"]} />);
      expect(addInput(root)).toBeNull();
    });

    it("renders a text input when hasInput is set", () => {
      const root = mount(() => <RLInputTags hasInput />);
      expect(addInput(root)?.type).toBe("text");
    });

    it("uses the placeholder prop for the add-tag input", () => {
      const root = mount(() => <RLInputTags hasInput placeholder="Skill" />);
      expect(addInput(root)?.getAttribute("placeholder")).toBe("Skill");
    });

    it("falls back to the localized placeholder when none is given", () => {
      const root = mount(() => <RLInputTags hasInput />);
      expect(addInput(root)?.getAttribute("placeholder")).toBe(uiT("input-tags.placeholder"));
    });

    it("calls onAddTag with the trimmed text when Enter is pressed", () => {
      const added: string[] = [];
      const root = mount(() => <RLInputTags hasInput onAddTag={(tag) => added.push(tag)} />);
      pressEnter(root, "  typescript  ");
      expect(added).toEqual(["typescript"]);
    });

    it("clears the add-tag input after a tag is submitted", () => {
      const root = mount(() => <RLInputTags hasInput onAddTag={() => {}} />);
      pressEnter(root, "solid");
      expect(addInput(root)?.value).toBe("");
    });

    it("does not call onAddTag for blank input", () => {
      const added: string[] = [];
      const root = mount(() => <RLInputTags hasInput onAddTag={(tag) => added.push(tag)} />);
      pressEnter(root, "   ");
      expect(added).toEqual([]);
    });

    it("does not call onAddTag for keys other than Enter", () => {
      const added: string[] = [];
      const root = mount(() => <RLInputTags hasInput onAddTag={(tag) => added.push(tag)} />);
      const el = addInput(root);
      if (el) el.value = "draft";
      dispatch(el, new Event("input", { bubbles: true }));
      dispatch(el, new KeyboardEvent("keydown", { key: "a", bubbles: true }));
      expect(added).toEqual([]);
    });
  });

  describe("children", () => {
    it("renders default children when there are no items", () => {
      const root = mount(() => (
        <RLInputTags>
          <span>No tags yet</span>
        </RLInputTags>
      ));
      expect(root.textContent).toContain("No tags yet");
    });

    it("hides default children once items are present", () => {
      const root = mount(() => (
        <RLInputTags items={["a"]}>
          <span>No tags yet</span>
        </RLInputTags>
      ));
      expect(root.textContent).not.toContain("No tags yet");
    });
  });
});
