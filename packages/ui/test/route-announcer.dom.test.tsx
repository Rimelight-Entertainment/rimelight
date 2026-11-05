import { afterEach, describe, it, expect } from "vite-plus/test";
import { flush } from "solid-js";
import { render } from "@solidjs/web";
import { RLRouteAnnouncer } from "../src/components/route-announcer/RLRouteAnnouncer";

const settle = () => {
  const { promise, resolve } = Promise.withResolvers<void>();
  setTimeout(resolve, 0);
  return promise;
};

afterEach(() => {
  document.title = "";
});

describe("RLRouteAnnouncer", () => {
  it("renders children inside the root", () => {
    const container = document.createElement("div");
    container.setAttribute("data-test-root", "");
    document.body.appendChild(container);
    render(
      () => (
        <RLRouteAnnouncer>
          <span data-testid="child" />
        </RLRouteAnnouncer>
      ),
      container,
    );
    flush();

    expect(container.querySelector('[data-slot="root"] [data-testid="child"]')).not.toBeNull();
  });

  it("announces the document title after mount", async () => {
    document.title = "Pricing | Rimelight";
    const container = document.createElement("div");
    document.body.appendChild(container);
    const dispose = render(() => <RLRouteAnnouncer />, container);

    await settle();

    expect(container.querySelector('[role="status"]')?.textContent).toBe("Pricing | Rimelight");
    dispose();
    container.remove();
  });

  it("falls back to the prefix when the document has no title", async () => {
    document.title = "";
    const container = document.createElement("div");
    document.body.appendChild(container);
    const dispose = render(() => <RLRouteAnnouncer prefix="Went to" />, container);

    await settle();

    expect(container.querySelector('[role="status"]')?.textContent).toBe("Went to");
    dispose();
    container.remove();
  });
});
