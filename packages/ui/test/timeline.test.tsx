import { describe, expect, it } from "vite-plus/test";
import { RLTimeline } from "../src/components/timeline/RLTimeline";
import type { TimelineItem } from "../src/components/timeline/timeline.types";
import { mountComponent } from "./utils/browser-render";

const items: TimelineItem[] = [
  { value: "draft", date: "Jan", title: "Draft", description: "First pass" },
  { value: "review", date: "Feb", title: "Review", description: "Feedback round" },
  { value: "publish", date: "Mar", title: "Publish" },
];

const itemNodes = (container: HTMLElement) =>
  Array.from(container.querySelectorAll<HTMLElement>('[data-slot="item"]'));

describe("RLTimeline", () => {
  it("renders one item per entry with its date, title, and description", () => {
    const container = mountComponent(() => <RLTimeline items={items} />);
    const nodes = itemNodes(container);

    expect(nodes).toHaveLength(3);
    expect(nodes[0]?.querySelector('[data-slot="date"]')?.textContent).toBe("Jan");
    expect(nodes[0]?.querySelector('[data-slot="title"]')?.textContent).toBe("Draft");
    expect(nodes[0]?.querySelector('[data-slot="description"]')?.textContent).toBe("First pass");
    expect(nodes[2]?.querySelector('[data-slot="description"]')).toBeNull();
  });

  it("omits the separator after the last item", () => {
    const container = mountComponent(() => <RLTimeline items={items} />);

    expect(container.querySelectorAll('[data-slot="separator"]')).toHaveLength(2);
  });

  it("marks entries before value as completed and the matching entry as active", () => {
    const container = mountComponent(() => <RLTimeline items={items} value="review" />);
    const states = itemNodes(container).map((node) => node.getAttribute("data-state"));

    expect(states).toEqual(["completed", "active", null]);
  });

  it("accepts a numeric value as the item index", () => {
    const container = mountComponent(() => <RLTimeline items={items} value={2} />);
    const states = itemNodes(container).map((node) => node.getAttribute("data-state"));

    expect(states).toEqual(["completed", "completed", "active"]);
  });

  it("uses defaultValue when value is not set", () => {
    const container = mountComponent(() => <RLTimeline items={items} defaultValue="draft" />);
    const states = itemNodes(container).map((node) => node.getAttribute("data-state"));

    expect(states).toEqual(["active", null, null]);
  });

  it("reports the horizontal orientation on the root", () => {
    const container = mountComponent(() => <RLTimeline items={items} orientation="horizontal" />);

    expect(container.querySelector('[data-slot="root"]')?.getAttribute("data-orientation")).toBe(
      "horizontal",
    );
  });

  it("renders children instead of items when items is empty", () => {
    const container = mountComponent(() => (
      <RLTimeline items={[]}>
        <p data-testid="empty">Nothing yet</p>
      </RLTimeline>
    ));

    expect(itemNodes(container)).toHaveLength(0);
    expect(container.querySelectorAll('[data-testid="empty"]')).toHaveLength(1);
  });

  it("replaces the indicator contents with indicatorSlot, receiving item and index", () => {
    const container = mountComponent(() => (
      <RLTimeline
        items={items}
        indicatorSlot={({ item, index }) => (
          <span data-testid="indicator">
            {item.title}-{index}
          </span>
        )}
      />
    ));

    const indicators = Array.from(container.querySelectorAll('[data-testid="indicator"]')).map(
      (node) => node.textContent,
    );

    expect(indicators).toEqual(["Draft-0", "Review-1", "Publish-2"]);
  });

  it("replaces date, title, and description with wrapperSlot", () => {
    const container = mountComponent(() => (
      <RLTimeline
        items={items}
        wrapperSlot={({ item }) => <div data-testid="wrapper">{item.title}!</div>}
      />
    ));

    expect(container.querySelectorAll('[data-testid="wrapper"]')).toHaveLength(3);
    expect(container.querySelector('[data-slot="date"]')).toBeNull();
    expect(container.querySelector('[data-slot="title"]')).toBeNull();
    expect(container.querySelector('[data-slot="description"]')).toBeNull();
  });

  it("uses titleSlot, dateSlot, and descriptionSlot in place of the item fields", () => {
    const container = mountComponent(() => (
      <RLTimeline
        items={items}
        dateSlot={({ index }) => <span data-testid="date">Step {index}</span>}
        titleSlot={({ item }) => <span data-testid="title">{item.title?.toUpperCase()}</span>}
        descriptionSlot={() => <span data-testid="description">Custom</span>}
      />
    ));

    const titles = Array.from(container.querySelectorAll('[data-testid="title"]')).map(
      (node) => node.textContent,
    );

    expect(titles).toEqual(["DRAFT", "REVIEW", "PUBLISH"]);
    expect(container.querySelector('[data-testid="date"]')?.textContent).toBe("Step 0");
    expect(container.querySelectorAll('[data-testid="description"]')).toHaveLength(3);
  });
});
