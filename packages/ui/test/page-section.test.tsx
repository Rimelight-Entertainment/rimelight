import { describe, it, expect, beforeEach, afterEach } from "vite-plus/test";
import { RLPageSection } from "../src/components/page-section/RLPageSection";

describe("RLPageSection", () => {
  let container: HTMLDivElement;

  beforeEach(() => {
    container = document.createElement("div");
    document.body.appendChild(container);
  });

  afterEach(() => {
    container.remove();
  });

  it("renders with default props and title", () => {
    const section = (
      <RLPageSection title="Dashboard" description="Test description">
        <div>Content</div>
      </RLPageSection>
    );

    expect(section).toBeDefined();
  });

  it("renders hero variant with h1", () => {
    const section = <RLPageSection variant="hero" title="Hero Title" />;

    expect(section).toBeDefined();
  });
});
