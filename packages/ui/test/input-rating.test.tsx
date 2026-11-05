import { describe, it, expect } from "vite-plus/test";
import { mountComponent } from "./utils/browser-render";
import { RLInputRating } from "../src/components/input-rating/RLInputRating";

describe("RLInputRating", () => {
  it("exposes a slider with the default value and length", () => {
    const container = mountComponent(() => <RLInputRating />);
    const slider = container.querySelector("[role='slider']");
    expect(slider?.getAttribute("aria-valuenow")).toBe("0");
    expect(slider?.getAttribute("aria-valuemax")).toBe("5");
  });

  it("renders one item per length unit", () => {
    const container = mountComponent(() => <RLInputRating length={3} />);
    expect(container.querySelectorAll("[data-slot='item']").length).toBe(3);
  });

  it("submits the current value through the hidden input", () => {
    const container = mountComponent(() => <RLInputRating name="stars" value={4} />);
    const input = container.querySelector("input[type='hidden']") as HTMLInputElement;
    expect(input.name).toBe("stars");
    expect(input.value).toBe("4");
  });
});
