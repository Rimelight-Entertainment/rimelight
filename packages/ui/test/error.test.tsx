import { describe, it, expect } from "vite-plus/test";
import { mountComponent } from "./utils/browser-render";
import { RLError } from "../src/components/error/RLError";
import { RLErrorTheme } from "../src/components/error/error.theme";
import { RLErrorBoundary } from "../src/components/error-boundary/RLErrorBoundary";
import { HttpError, getErrorStatus, isHttpError } from "../src/components/error/http-error";

describe("HttpError", () => {
  it("exposes 4xx messages and hides 5xx messages by default", () => {
    expect(new HttpError(404, "Missing").expose).toBe(true);
    expect(new HttpError(500, "db down").expose).toBe(false);
    expect(new HttpError(502, "ok to show", { expose: true }).expose).toBe(true);
  });

  it("resolves status for any thrown value", () => {
    expect(getErrorStatus(new HttpError(403))).toBe(403);
    expect(getErrorStatus(new Error("x"))).toBe(500);
    expect(getErrorStatus("x")).toBe(500);
    expect(isHttpError({ name: "HttpError", status: 401 })).toBe(true);
  });
});

describe("RLError", () => {
  it("renders status pill, preset title and default home action", () => {
    const c = mountComponent(() => <RLError status={404} />);
    expect(c.textContent).toContain("HTTP status 404");
    expect(c.querySelector("h1")?.textContent).toBe("Page Not Found");
    expect(c.querySelector("a")?.getAttribute("href")).toBe("/");
  });

  it("uses the status color through color: auto", () => {
    expect(RLErrorTheme({ color: "primary" }).root).toContain("rl-color-primary");
    const c = mountComponent(() => <RLError status={401} />);
    expect(c.querySelector("[data-slot=root]")?.className).toContain("rl-color-warning");
  });

  it("prefers explicit text and hides actions with []", () => {
    const c = mountComponent(() => (
      <RLError status={403} title="Nope" description="Editors only" actions={[]} />
    ));
    expect(c.textContent).toContain("Nope");
    expect(c.textContent).toContain("Editors only");
    expect(c.querySelector("[data-slot=actions]")).toBeNull();
  });

  it("uses overrides from the app JSON under rimelight.ui", () => {
    const c = mountComponent(() => <RLError status={418} />);
    expect(c.querySelector("h1")?.textContent).toBe("I'm a Teapot");
  });

  it("falls back to generic client text for unknown 4xx statuses", () => {
    const c = mountComponent(() => <RLError status={422} />);
    expect(c.querySelector("h1")?.textContent).toBe("Request Error");
  });

  it("shows an exposed HttpError message but not an unexpected error message", () => {
    const shown = mountComponent(() => <RLError error={new HttpError(404, "Post is gone")} />);
    expect(shown.textContent).toContain("Post is gone");

    const hidden = mountComponent(() => (
      <RLError error={new Error("SQLITE_ERROR: no such column")} showDetails={false} />
    ));
    expect(hidden.textContent).not.toContain("SQLITE_ERROR");
    expect(hidden.textContent).toContain("Something Went Wrong");
  });

  it("renders the details panel only when enabled", () => {
    const c = mountComponent(() => <RLError error={new Error("boom")} showDetails />);
    expect(c.querySelector("details")?.textContent).toContain("boom");
  });

  it("renders children inside the card", () => {
    const c = mountComponent(() => (
      <RLError status={403}>
        <span data-test="extra">Signed in as a@b.c</span>
      </RLError>
    ));
    expect(c.querySelector("[data-slot=body] [data-test=extra]")).not.toBeNull();
  });
});

describe("RLErrorBoundary", () => {
  const Throws = (props: { error: unknown }) => {
    throw props.error;
  };

  it("renders RLError with the thrown HttpError status", () => {
    const c = mountComponent(() => (
      <RLErrorBoundary>
        <Throws error={new HttpError(403, "Only editors")} />
      </RLErrorBoundary>
    ));
    expect(c.textContent).toContain("HTTP status 403");
    expect(c.textContent).toContain("Only editors");
  });

  it("offers retry for unexpected errors and calls onError", () => {
    const seen: unknown[] = [];
    const c = mountComponent(() => (
      <RLErrorBoundary onError={(e) => seen.push(e)} retryLabel="Retry">
        <Throws error={new Error("crash")} />
      </RLErrorBoundary>
    ));
    expect(c.textContent).toContain("HTTP status 500");
    expect(c.textContent).toContain("Retry");
    expect(seen.length).toBe(1);
  });

  it("supports a custom fallback", () => {
    const c = mountComponent(() => (
      <RLErrorBoundary fallbackSlot={() => <p data-test="custom">custom</p>}>
        <Throws error={new Error("x")} />
      </RLErrorBoundary>
    ));
    expect(c.querySelector("[data-test=custom]")).not.toBeNull();
  });
});
