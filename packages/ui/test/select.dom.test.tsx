import { describe, it, expect, vi, afterEach } from "vite-plus/test";
import { render } from "@solidjs/web";
import { RLSelect } from "../src/components/select/RLSelect";

const disposers: Array<() => void> = [];

function mount(fn: () => any): HTMLElement {
  const container = document.createElement("div");
  document.body.appendChild(container);
  disposers.push(render(fn, container));
  return container;
}

function select(container: HTMLElement): HTMLSelectElement {
  const el = container.querySelector("select");
  if (!el) throw new Error("select not rendered");
  return el;
}

afterEach(() => {
  while (disposers.length) disposers.pop()?.();
  document.body.innerHTML = "";
});

describe("RLSelect — options and value", () => {
  it("renders string and object items with label fallback to value", () => {
    const container = mount(() => (
      <RLSelect
        items={[
          "red",
          { value: 2, label: "Two" },
          { value: "three" },
          { label: "Dis", disabled: true },
        ]}
      />
    ));
    const options = [...select(container).querySelectorAll("option")];
    expect(options.map((o) => o.value)).toEqual(["red", "2", "three", ""]);
    expect(options.map((o) => o.textContent)).toEqual(["red", "Two", "three", "Dis"]);
    expect(options[3]?.disabled).toBe(true);
  });

  it("renders no options for empty items", () => {
    const container = mount(() => <RLSelect items={[]} />);
    expect(select(container).querySelectorAll("option")).toHaveLength(0);
  });

  it("shows a disabled placeholder option that is selected when nothing is chosen", () => {
    const container = mount(() => <RLSelect items={["a"]} placeholder="Pick one" />);
    const first = select(container).querySelector("option");
    expect(first?.textContent).toBe("Pick one");
    expect(first?.disabled).toBe(true);
    expect(select(container).value).toBe("");
  });

  it("omits the placeholder when multiple is set", () => {
    const container = mount(() => <RLSelect items={["a"]} placeholder="Pick one" multiple />);
    expect(select(container).querySelectorAll("option")).toHaveLength(1);
  });

  it("selects defaultValue, and the controlled value takes precedence over it", () => {
    const uncontrolled = mount(() => <RLSelect items={["a", "b"]} defaultValue="b" />);
    expect(select(uncontrolled).value).toBe("b");

    const controlled = mount(() => <RLSelect items={["a", "b"]} defaultValue="b" value="a" />);
    expect(select(controlled).value).toBe("a");
  });

  it("forwards id, name, required, and aria-label to the native select", () => {
    const container = mount(() => (
      <RLSelect id="sort" name="sort" required aria-label="Sort by" items={["a"]} />
    ));
    const el = select(container);
    expect(el.id).toBe("sort");
    expect(el.name).toBe("sort");
    expect(el.required).toBe(true);
    expect(el.getAttribute("aria-label")).toBe("Sort by");
  });
});

describe("RLSelect — slots and interaction", () => {
  it("calls onChange with the new value and keeps the uncontrolled selection", () => {
    let seen: string | undefined;
    const onChange = vi.fn((e: { currentTarget: HTMLSelectElement }) => {
      seen = e.currentTarget.value;
    });
    const container = mount(() => <RLSelect items={["a", "b"]} onChange={onChange} />);
    const el = select(container);
    el.value = "b";
    el.dispatchEvent(new Event("change"));
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(seen).toBe("b");
    expect(el.value).toBe("b");
  });

  it("renders a disabled select with its disabled options marked", () => {
    const container = mount(() => (
      <RLSelect items={["a", { value: "b", disabled: true }]} disabled />
    ));
    const el = select(container);
    expect(el.disabled).toBe(true);
    expect(el.querySelectorAll("option")[1]?.disabled).toBe(true);
  });
});
