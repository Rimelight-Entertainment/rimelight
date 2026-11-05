import { describe, it, expect, vi, afterEach } from "vite-plus/test";
import { flush } from "solid-js";
import { render } from "@solidjs/web";
import { RLSearch } from "../src/components/search/RLSearch";

const disposers: Array<() => void> = [];

function mount(fn: () => any): HTMLElement {
  const container = document.createElement("div");
  document.body.appendChild(container);
  disposers.push(render(fn, container));
  flush();
  return container;
}

function openDialog(): HTMLElement | null {
  return document.querySelector("[role='dialog']");
}

function wait(ms: number): Promise<void> {
  const { promise, resolve } = Promise.withResolvers<void>();
  setTimeout(resolve, ms);
  return promise;
}

afterEach(() => {
  while (disposers.length) disposers.pop()?.();
  document.body.innerHTML = "";
  document.body.style.overflow = "";
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe("RLSearch — open and close", () => {
  it("opens the dialog when the default trigger is clicked", () => {
    const container = mount(() => <RLSearch />);
    container.querySelector("button")?.click();
    flush();
    expect(openDialog()).not.toBeNull();
  });

  it("opens the dialog when a triggerSlot is clicked", () => {
    const container = mount(() => <RLSearch triggerSlot={<span>Find</span>} />);
    container
      .querySelector("[data-slot='trigger']")
      ?.dispatchEvent(new Event("click", { bubbles: true }));
    flush();
    expect(openDialog()).not.toBeNull();
  });

  it("closes on Escape", () => {
    const container = mount(() => <RLSearch defaultOpen />);
    expect(openDialog()).not.toBeNull();
    window.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape" }));
    flush();
    expect(openDialog()).toBeNull();
    expect(container).toBeDefined();
  });

  it("closes on backdrop click but not on dialog click", () => {
    mount(() => <RLSearch defaultOpen />);
    const dialog = openDialog();
    dialog?.dispatchEvent(new Event("click", { bubbles: true }));
    flush();
    expect(openDialog()).not.toBeNull();
    document
      .querySelector<HTMLElement>("[data-slot='modal']")
      ?.dispatchEvent(new Event("click", { bubbles: true }));
    flush();
    expect(openDialog()).toBeNull();
  });

  it("reflects a controlled open prop and reports close through onOpenChange", () => {
    const onOpenChange = vi.fn();
    mount(() => <RLSearch open onOpenChange={onOpenChange} />);
    expect(openDialog()).not.toBeNull();
    window.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape" }));
    expect(onOpenChange).toHaveBeenCalledWith(false);
    // Controlled: stays open until the parent changes `open`.
    expect(openDialog()).not.toBeNull();
  });
});

describe("RLSearch — search results", () => {
  it("shows the placeholder from props inside the dialog", () => {
    mount(() => <RLSearch defaultOpen placeholder="Find docs" />);
    const input = document.querySelector<HTMLInputElement>("[role='dialog'] input");
    expect(input?.getAttribute("placeholder")).toBe("Find docs");
  });

  it("renders fetched results with a fallback title and source badge", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(
        async () =>
          new Response(
            JSON.stringify([{ title: "", url: "/guide", sourceType: "Docs", snippet: "Intro" }]),
            { status: 200 },
          ),
      ),
    );
    mount(() => <RLSearch defaultOpen endpoint="/api/x" />);
    const input = document.querySelector<HTMLInputElement>("[role='dialog'] input");
    if (!input) throw new Error("input missing");
    input.value = "guide";
    input.dispatchEvent(new Event("input", { bubbles: true }));
    await wait(260);
    const dialog = openDialog();
    expect(dialog?.textContent).toContain("Untitled");
    expect(dialog?.textContent).toContain("Docs");
    expect(dialog?.textContent).toContain("Intro");
    expect(dialog?.querySelector("a")?.getAttribute("href")).toBe("/guide");
  });

  it("shows the no-results label when the endpoint returns an empty list", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => new Response("[]", { status: 200 })),
    );
    mount(() => <RLSearch defaultOpen messages={{ noResultsLabel: "Nothing here" }} />);
    const input = document.querySelector<HTMLInputElement>("[role='dialog'] input");
    if (!input) throw new Error("input missing");
    input.value = "zzz";
    input.dispatchEvent(new Event("input", { bubbles: true }));
    await wait(260);
    expect(document.querySelector("[data-slot='empty']")?.textContent).toContain("Nothing here");
  });

  it("treats a failed request as an empty result and logs the error", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => new Response("", { status: 500 })),
    );
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    mount(() => <RLSearch defaultOpen />);
    const input = document.querySelector<HTMLInputElement>("[role='dialog'] input");
    if (!input) throw new Error("input missing");
    input.value = "boom";
    input.dispatchEvent(new Event("input", { bubbles: true }));
    await wait(260);
    expect(errorSpy).toHaveBeenCalled();
    expect(document.querySelector("[data-slot='empty']")).not.toBeNull();
  });
});
