import { describe, it, expect, afterEach } from "vite-plus/test";
import { createSignal, flush as flushSolid } from "solid-js";
import { render } from "@solidjs/web";
import { RLErrorBoundary } from "../src/components/error-boundary/RLErrorBoundary";

const disposers: Array<() => void> = [];

function mount(fn: () => any): HTMLElement {
  const container = document.createElement("div");
  document.body.appendChild(container);
  disposers.push(render(fn, container));
  flushSolid();
  return container;
}

afterEach(() => {
  while (disposers.length) disposers.pop()?.();
  document.body.innerHTML = "";
});

const flush = (): Promise<void> => {
  const { promise, resolve } = Promise.withResolvers<void>();
  setTimeout(resolve, 0);
  return promise;
};

/** Throws on the first render only, so a retry or reset can recover. */
function flakyChild() {
  let attempts = 0;
  return () => {
    attempts += 1;
    if (attempts === 1) throw new Error("once");
    return <span data-test="recovered">ok</span>;
  };
}

describe("RLErrorBoundary", () => {
  it("offers retry for 5xx errors and recovers the children on click", async () => {
    const Flaky = flakyChild();
    const c = mount(() => (
      <RLErrorBoundary>
        <Flaky />
      </RLErrorBoundary>
    ));
    const actions = c.querySelector("[data-slot=actions]");
    expect(actions?.children.length).toBe(2);

    (c.querySelector("[data-slot=actions] button") as HTMLButtonElement).click();
    await flush();
    expect(c.querySelector("[data-test=recovered]")).not.toBeNull();
  });

  it("passes error and reset to a custom fallbackSlot", async () => {
    const Flaky = flakyChild();
    const c = mount(() => (
      <RLErrorBoundary
        fallbackSlot={({ error, reset }) => (
          <button data-test="custom" onClick={() => reset()}>
            {error instanceof Error ? error.message : "unknown"}
          </button>
        )}
      >
        <Flaky />
      </RLErrorBoundary>
    ));
    expect(c.querySelector("[data-slot=card]")).toBeNull();
    expect(c.querySelector("[data-test=custom]")?.textContent).toBe("once");

    (c.querySelector("[data-test=custom]") as HTMLButtonElement).click();
    await flush();
    expect(c.querySelector("[data-test=recovered]")).not.toBeNull();
  });

  it("clears the error when resetKey changes", async () => {
    const [key, setKey] = createSignal(1);
    const Flaky = flakyChild();
    const c = mount(() => (
      <RLErrorBoundary resetKey={key()}>
        <Flaky />
      </RLErrorBoundary>
    ));
    expect(c.querySelector("[data-slot=card]")).not.toBeNull();

    setKey(2);
    await flush();
    expect(c.querySelector("[data-test=recovered]")).not.toBeNull();
  });
});
