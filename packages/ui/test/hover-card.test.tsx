import { describe, it, expect } from "vite-plus/test";
import { mountComponent } from "./utils/browser-render";
import { RLHoverCard } from "../src/components/hover-card/RLHoverCard";

const trigger = (container: HTMLElement) =>
  container.querySelector<HTMLElement>("[data-slot='trigger']") as HTMLElement;
const body = (container: HTMLElement) =>
  container.querySelector<HTMLElement>("[data-slot='body']") as HTMLElement;

describe("RLHoverCard", () => {
  it("renders the trigger label only when no triggerSlot is given", () => {
    const labelled = mountComponent(() => <RLHoverCard triggerLabel="Who">Card</RLHoverCard>);
    expect(labelled.querySelector("[data-slot='label']")?.textContent).toBe("Who");

    const slotted = mountComponent(() => (
      <RLHoverCard triggerLabel="Who" triggerSlot={<button type="button">Custom</button>}>
        Card
      </RLHoverCard>
    ));
    expect(slotted.querySelector("[data-slot='label']")).toBeNull();
    expect(trigger(slotted).textContent).toContain("Custom");
  });

  it("exposes the side the card attaches to, defaulting to bottom", () => {
    const def = mountComponent(() => <RLHoverCard>Card</RLHoverCard>);
    expect(def.querySelector("[data-slot='root']")?.getAttribute("data-side")).toBe("bottom");

    const top = mountComponent(() => <RLHoverCard side="top">Card</RLHoverCard>);
    expect(top.querySelector("[data-slot='root']")?.getAttribute("data-side")).toBe("top");
  });

  it("renders children inside the body", () => {
    const container = mountComponent(() => <RLHoverCard>Card content</RLHoverCard>);
    expect(body(container).textContent).toContain("Card content");
  });
});
