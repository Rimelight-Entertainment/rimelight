import { describe, it, expect, afterEach } from "vite-plus/test";
import { flush as flushSolid } from "solid-js";
import { render } from "@solidjs/web";
import { RLImage } from "../src/components/image/RLImage";

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

describe("RLImage", () => {
  it("keeps the lightbox dialog closed until the trigger is clicked", async () => {
    const c = mount(() => <RLImage src="/cat.png" />);
    const dialog = c.querySelector<HTMLDialogElement>("[data-slot=dialog]");
    expect(dialog?.open).toBe(false);

    (c.querySelector("[data-slot=trigger]") as HTMLButtonElement).click();
    await flush();
    expect(dialog?.open).toBe(true);
  });

  it("shows a fallback when the image fails to load", async () => {
    const c = mount(() => <RLImage src="/missing.png" lightbox={false} />);
    expect(c.querySelector("[data-slot=fallback]")).toBeNull();

    c.querySelector("[data-slot=trigger-image]")?.dispatchEvent(new Event("error"));
    await flush();
    expect(c.querySelector("[data-slot=fallback]")).not.toBeNull();
  });
});
