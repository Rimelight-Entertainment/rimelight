import { describe, it, expect, vi, afterEach } from "vite-plus/test";
import { render } from "@solidjs/web";
import { RLTextarea } from "../src/components/textarea/RLTextarea";

const disposers: Array<() => void> = [];

function mount(fn: () => any): HTMLElement {
  const container = document.createElement("div");
  document.body.appendChild(container);
  disposers.push(render(fn, container));
  return container;
}

function textarea(container: HTMLElement): HTMLTextAreaElement {
  const el = container.querySelector("textarea");
  if (!el) throw new Error("textarea not rendered");
  return el;
}

afterEach(() => {
  while (disposers.length) disposers.pop()?.();
  document.body.innerHTML = "";
});

describe("RLTextarea — DOM behavior", () => {
  it("starts from defaultValue when uncontrolled", () => {
    expect(textarea(mount(() => <RLTextarea defaultValue="hello" />)).value).toBe("hello");
  });

  it("shows the controlled value", () => {
    expect(textarea(mount(() => <RLTextarea value="fixed" />)).value).toBe("fixed");
  });

  it("reports each input through onValueChange and onInput", () => {
    const onValueChange = vi.fn();
    const onInput = vi.fn();
    const el = textarea(
      mount(() => <RLTextarea onValueChange={onValueChange} onInput={onInput} />),
    );

    el.value = "abc";
    el.dispatchEvent(new Event("input", { bubbles: true }));

    expect(onValueChange).toHaveBeenCalledWith("abc");
    expect(onInput).toHaveBeenCalledTimes(1);
  });

  it("fires onChange for native change events", () => {
    const onChange = vi.fn();
    const el = textarea(mount(() => <RLTextarea onChange={onChange} />));

    el.dispatchEvent(new Event("change"));

    expect(onChange).toHaveBeenCalledTimes(1);
  });

  it("forwards keydown to onKeyDown", () => {
    const onKeyDown = vi.fn();
    const el = textarea(mount(() => <RLTextarea onKeyDown={onKeyDown} />));

    el.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter", bubbles: true }));

    expect(onKeyDown).toHaveBeenCalledTimes(1);
  });
});
