import { describe, it, expect, afterEach } from "vite-plus/test";
import { flush } from "solid-js";
import { render } from "@solidjs/web";
import { RLInputTime } from "../src/components/input-time/RLInputTime";

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

describe("RLInputTime", () => {
  describe("value", () => {
    it("renders a native time input", () => {
      const root = mount(() => <RLInputTime />);
      expect(input(root)?.type).toBe("time");
    });

    it("renders the value prop", () => {
      const root = mount(() => <RLInputTime value="10:30" />);
      expect(input(root)?.value).toBe("10:30");
    });

    it("renders defaultValue when no value is controlled", () => {
      const root = mount(() => <RLInputTime defaultValue="09:00" />);
      expect(input(root)?.value).toBe("09:00");
    });

    it("prefers value over defaultValue", () => {
      const root = mount(() => <RLInputTime value="18:15" defaultValue="09:00" />);
      expect(input(root)?.value).toBe("18:15");
    });

    it("calls onValueChange with the new time when the user changes it", () => {
      const changes: string[] = [];
      const root = mount(() => <RLInputTime onValueChange={(v) => changes.push(v)} />);
      const el = input(root);
      if (el) el.value = "14:45";
      dispatch(el, new Event("change", { bubbles: true }));
      expect(changes).toEqual(["14:45"]);
    });

    it("calls onInput when the native input event fires", () => {
      let fired = 0;
      const root = mount(() => <RLInputTime onInput={() => fired++} />);
      dispatch(input(root), new Event("input", { bubbles: true }));
      expect(fired).toBe(1);
    });
  });

  describe("constraints", () => {
    it("forwards min, max and step to the native input", () => {
      const root = mount(() => <RLInputTime min="08:00" max="17:00" step={900} />);
      expect(input(root)?.getAttribute("min")).toBe("08:00");
      expect(input(root)?.getAttribute("max")).toBe("17:00");
      expect(input(root)?.getAttribute("step")).toBe("900");
    });

    it("forwards the name prop for form submission", () => {
      const root = mount(() => <RLInputTime name="starts_at" />);
      expect(input(root)?.name).toBe("starts_at");
    });

    it("forwards the placeholder prop", () => {
      const root = mount(() => <RLInputTime placeholder="HH:mm" />);
      expect(input(root)?.getAttribute("placeholder")).toBe("HH:mm");
    });

    it("disables the input when disabled is set", () => {
      const root = mount(() => <RLInputTime disabled />);
      expect(input(root)?.disabled).toBe(true);
    });

    it("marks the input readonly when readonly is set", () => {
      const root = mount(() => <RLInputTime readonly />);
      expect(input(root)?.readOnly).toBe(true);
    });

    it("marks the input required when required is set", () => {
      const root = mount(() => <RLInputTime required />);
      expect(input(root)?.required).toBe(true);
    });
  });

  describe("children", () => {
    it("renders default children after the input", () => {
      const root = mount(() => (
        <RLInputTime>
          <span>Timezone</span>
        </RLInputTime>
      ));
      const container = root.querySelector("[data-slot='root']");
      expect(container?.lastElementChild?.textContent).toBe("Timezone");
    });
  });
});
