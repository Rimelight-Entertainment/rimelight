import { describe, it, expect } from "vite-plus/test";
import { mountComponent } from "./utils/browser-render";
import { RLErrorBoundary } from "../src/components/error-boundary/RLErrorBoundary";
import { HttpError } from "../src/components/error/http-error";

const Throws = (props: { error: unknown }) => {
  throw props.error;
};

describe("RLErrorBoundary", () => {
  it("renders children without an error card when nothing throws", () => {
    const c = mountComponent(() => (
      <RLErrorBoundary>
        <span data-test="ok">ok</span>
      </RLErrorBoundary>
    ));
    expect(c.querySelector("[data-test=ok]")).not.toBeNull();
    expect(c.querySelector("[data-slot=card]")).toBeNull();
  });

  it("renders RLError with the status of the thrown HttpError", () => {
    const c = mountComponent(() => (
      <RLErrorBoundary>
        <Throws error={new HttpError(403, "Only editors")} />
      </RLErrorBoundary>
    ));
    expect(c.querySelector("[data-slot=badge-label]")?.textContent).toContain("403");
    expect(c.querySelector("[data-slot=description]")?.textContent).toContain("Only editors");
  });

  it("calls onError once with the thrown value", () => {
    const boom = new Error("crash");
    const seen: unknown[] = [];
    mountComponent(() => (
      <RLErrorBoundary onError={(e) => seen.push(e)}>
        <Throws error={boom} />
      </RLErrorBoundary>
    ));
    expect(seen).toEqual([boom]);
  });

  it("offers only the home action for 4xx errors", () => {
    const c = mountComponent(() => (
      <RLErrorBoundary>
        <Throws error={new HttpError(404, "Missing")} />
      </RLErrorBoundary>
    ));
    expect(c.querySelector("[data-slot=actions] button")).toBeNull();
    expect(c.querySelector("[data-slot=actions] a")).not.toBeNull();
  });

  it("points the home action at homeHref", () => {
    const c = mountComponent(() => (
      <RLErrorBoundary homeHref="/docs">
        <Throws error={new HttpError(404, "Missing")} />
      </RLErrorBoundary>
    ));
    expect(c.querySelector("[data-slot=actions] a")?.getAttribute("href")).toContain("/docs");
  });
});
