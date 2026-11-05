import { describe, it, expect, vi, afterEach } from "vite-plus/test";
import { flush } from "solid-js";
import { render } from "@solidjs/web";
import { RLPackageManagers } from "../src/components/package-managers/RLPackageManagers";
import { uiT } from "../src/locale";

const disposers: Array<() => void> = [];

function mount(fn: () => any): HTMLElement {
  const container = document.createElement("div");
  document.body.appendChild(container);
  disposers.push(render(fn, container));
  flush();
  return container;
}

const press = (el: Element, key: string) =>
  el.dispatchEvent(new KeyboardEvent("keydown", { key, bubbles: true }));

const tabsOf = (container: HTMLElement) =>
  Array.from(container.querySelectorAll<HTMLElement>("[role='tab']"));

const activeTab = (container: HTMLElement) =>
  tabsOf(container).find((tab) => tab.getAttribute("aria-selected") === "true");

const commandOf = (container: HTMLElement) => container.querySelector("pre code")?.textContent;

const copyButtonOf = (container: HTMLElement) =>
  container.querySelector<HTMLElement>("[data-slot='copy-button']");

afterEach(() => {
  while (disposers.length) disposers.pop()?.();
  document.body.innerHTML = "";
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

describe("RLPackageManagers — selection and keyboard", () => {
  it("selects the first tab by default", () => {
    const container = mount(() => <RLPackageManagers pkg="react" />);
    expect(activeTab(container)?.textContent).toBe("npm");
    expect(tabsOf(container)[0]?.getAttribute("data-state")).toBe("active");
    expect(tabsOf(container)[1]?.getAttribute("data-state")).toBe("inactive");
    expect(tabsOf(container)[1]?.tabIndex).toBe(-1);
  });

  it("selects a tab on click and shows its command", () => {
    const container = mount(() => <RLPackageManagers pkg="react" />);
    tabsOf(container)[1]?.click();
    flush();
    expect(activeTab(container)?.textContent).toBe("pnpm");
    expect(commandOf(container)).toBe("pnpm add react");
  });

  it("moves selection with ArrowRight and wraps from the last tab", () => {
    const container = mount(() => <RLPackageManagers pkg="react" />);
    press(tabsOf(container)[0]!, "ArrowRight");
    flush();
    expect(activeTab(container)?.textContent).toBe("pnpm");

    press(tabsOf(container)[5]!, "ArrowRight");
    flush();
    expect(activeTab(container)?.textContent).toBe("npm");
  });

  it("moves selection with ArrowLeft and wraps from the first tab", () => {
    const container = mount(() => <RLPackageManagers pkg="react" />);
    press(tabsOf(container)[0]!, "ArrowLeft");
    flush();
    expect(activeTab(container)?.textContent).toBe("vp");
  });

  it("jumps to the first and last tab with Home and End", () => {
    const container = mount(() => <RLPackageManagers pkg="react" />);
    press(tabsOf(container)[0]!, "End");
    flush();
    expect(activeTab(container)?.textContent).toBe("vp");

    press(tabsOf(container)[5]!, "Home");
    flush();
    expect(activeTab(container)?.textContent).toBe("npm");
  });

  it("ignores keys that do not navigate the tablist", () => {
    const container = mount(() => <RLPackageManagers pkg="react" />);
    press(tabsOf(container)[0]!, "a");
    flush();
    expect(activeTab(container)?.textContent).toBe("npm");
  });

  it("moves focus to the newly selected tab", () => {
    const container = mount(() => <RLPackageManagers pkg="react" />);
    press(tabsOf(container)[0]!, "ArrowRight");
    flush();
    expect(document.activeElement).toBe(tabsOf(container)[1]);
  });
});

describe("RLPackageManagers — copy", () => {
  it("copies the active command to the clipboard", () => {
    const writeText = vi.fn(() => Promise.resolve());
    vi.stubGlobal("navigator", { clipboard: { writeText } });
    const container = mount(() => <RLPackageManagers pkg="react" />);
    tabsOf(container)[1]?.click();
    flush();
    copyButtonOf(container)?.click();
    expect(writeText).toHaveBeenCalledWith("pnpm add react");
  });

  it("shows copied feedback and reverts after two seconds", async () => {
    vi.useFakeTimers();
    vi.stubGlobal("navigator", { clipboard: { writeText: vi.fn(() => Promise.resolve()) } });
    const container = mount(() => <RLPackageManagers pkg="react" managers={["npm"]} />);
    const copyLabel = uiT("package-managers.copyButton");
    const copiedLabel = uiT("package-managers.copied");

    copyButtonOf(container)?.click();
    await vi.advanceTimersByTimeAsync(0);
    flush();
    expect(copyButtonOf(container)?.textContent).toContain(copiedLabel);

    await vi.advanceTimersByTimeAsync(2000);
    flush();
    expect(copyButtonOf(container)?.textContent).toContain(copyLabel);
    expect(copyButtonOf(container)?.textContent).not.toContain(copiedLabel);
  });

  it("keeps the idle label when the clipboard write fails", async () => {
    vi.useFakeTimers();
    vi.stubGlobal("navigator", {
      clipboard: { writeText: vi.fn(() => Promise.reject(new Error("denied"))) },
    });
    const container = mount(() => <RLPackageManagers pkg="react" managers={["npm"]} />);

    copyButtonOf(container)?.click();
    await vi.advanceTimersByTimeAsync(0);
    flush();
    expect(copyButtonOf(container)?.textContent).toContain(uiT("package-managers.copyButton"));
    expect(copyButtonOf(container)?.textContent).not.toContain(uiT("package-managers.copied"));
  });
});
