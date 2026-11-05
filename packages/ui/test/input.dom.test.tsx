import { describe, it, expect, afterEach } from "vite-plus/test";
import { flush } from "solid-js";
import { render } from "@solidjs/web";
import { RLInput } from "../src/components/input/RLInput";

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

const input = (root: HTMLElement) =>
  root.querySelector<HTMLInputElement>("input[data-slot='input']");

describe("RLInput", () => {
  describe("props", () => {
    it("renders the value prop on the native input", () => {
      const root = mount(() => <RLInput value="hello" />);
      expect(input(root)?.value).toBe("hello");
    });

    it("renders a numeric value as text", () => {
      const root = mount(() => <RLInput value={42} />);
      expect(input(root)?.value).toBe("42");
    });

    it("renders the placeholder", () => {
      const root = mount(() => <RLInput placeholder="Search" />);
      expect(input(root)?.getAttribute("placeholder")).toBe("Search");
    });

    it("forwards the type prop to the native input", () => {
      const root = mount(() => <RLInput type="email" />);
      expect(input(root)?.type).toBe("email");
    });

    it("defaults to a text input when no type is given", () => {
      const root = mount(() => <RLInput />);
      expect(input(root)?.type).toBe("text");
    });

    it("forwards the name prop for form submission", () => {
      const root = mount(() => <RLInput name="email" />);
      expect(input(root)?.name).toBe("email");
    });

    it("disables the input when disabled is set", () => {
      const root = mount(() => <RLInput disabled />);
      expect(input(root)?.disabled).toBe(true);
    });

    it("marks the input readonly when readonly is set", () => {
      const root = mount(() => <RLInput readonly />);
      expect(input(root)?.readOnly).toBe(true);
    });

    it("marks the input required when required is set", () => {
      const root = mount(() => <RLInput required />);
      expect(input(root)?.required).toBe(true);
    });

    it("sets aria-invalid on the input when invalid is set", () => {
      const root = mount(() => <RLInput invalid />);
      expect(input(root)?.getAttribute("aria-invalid")).toBe("true");
    });

    it("omits aria-invalid when invalid is not set", () => {
      const root = mount(() => <RLInput />);
      expect(input(root)?.hasAttribute("aria-invalid")).toBe(false);
    });

    it("forwards autocomplete to the native input", () => {
      const root = mount(() => <RLInput autocomplete="email" />);
      expect(input(root)?.getAttribute("autocomplete")).toBe("email");
    });

    it("passes a ref to the native input element", () => {
      let captured: HTMLInputElement | undefined;
      mount(() => (
        <RLInput
          ref={(el: HTMLInputElement) => {
            captured = el;
          }}
        />
      ));
      expect(captured?.tagName).toBe("INPUT");
    });
  });

  describe("events", () => {
    it("reports the typed value through onInput", () => {
      const calls: string[] = [];
      const root = mount(() => <RLInput onInput={(e) => calls.push(e.currentTarget.value)} />);
      const el = input(root);
      if (el) el.value = "typed";
      dispatch(el, new Event("input", { bubbles: true }));
      expect(calls).toEqual(["typed"]);
    });

    it("calls onChange when the native change event fires", () => {
      let fired = 0;
      const root = mount(() => <RLInput onChange={() => fired++} />);
      dispatch(input(root), new Event("change", { bubbles: true }));
      expect(fired).toBe(1);
    });

    it("calls onFocus and onBlur when the input gains and loses focus", () => {
      const events: string[] = [];
      const root = mount(() => (
        <RLInput onFocus={() => events.push("focus")} onBlur={() => events.push("blur")} />
      ));
      dispatch(input(root), new Event("focus", { bubbles: true }));
      dispatch(input(root), new Event("blur", { bubbles: true }));
      expect(events).toEqual(["focus", "blur"]);
    });

    it("calls onKeyDown with the pressed key", () => {
      const keys: string[] = [];
      const root = mount(() => <RLInput onKeyDown={(e) => keys.push(e.key)} />);
      dispatch(input(root), new KeyboardEvent("keydown", { key: "Enter", bubbles: true }));
      expect(keys).toEqual(["Enter"]);
    });
  });

  describe("slots", () => {
    it("renders leadingSlot content before the input", () => {
      const root = mount(() => <RLInput leadingSlot={<span>Lead</span>} />);
      const container = root.querySelector("[data-slot='root']");
      expect(container?.firstElementChild?.textContent).toBe("Lead");
    });

    it("renders trailingSlot content after the input", () => {
      const root = mount(() => <RLInput trailingSlot={<span>Trail</span>} />);
      const container = root.querySelector("[data-slot='root']");
      expect(container?.lastElementChild?.textContent).toBe("Trail");
    });

    it("renders a leading icon wrapper when leadingIcon is set", () => {
      const root = mount(() => <RLInput leadingIcon="search" />);
      expect(root.querySelector("[data-slot='leading']")).not.toBeNull();
    });

    it("renders a trailing icon wrapper when trailingIcon is set", () => {
      const root = mount(() => <RLInput trailingIcon="x" />);
      expect(root.querySelector("[data-slot='trailing']")).not.toBeNull();
    });

    it("replaces the leadingIcon with leadingSlot when both are set", () => {
      const root = mount(() => <RLInput leadingIcon="search" leadingSlot={<span>Custom</span>} />);
      expect(root.querySelector("[data-slot='leading']")).toBeNull();
      expect(root.textContent).toContain("Custom");
    });

    it("replaces the trailingIcon with trailingSlot when both are set", () => {
      const root = mount(() => <RLInput trailingIcon="x" trailingSlot={<span>Custom</span>} />);
      expect(root.querySelector("[data-slot='trailing']")).toBeNull();
      expect(root.textContent).toContain("Custom");
    });

    it("renders default children after the input", () => {
      const root = mount(() => (
        <RLInput>
          <span>Extra</span>
        </RLInput>
      ));
      const container = root.querySelector("[data-slot='root']");
      expect(container?.lastElementChild?.textContent).toBe("Extra");
    });
  });
});
