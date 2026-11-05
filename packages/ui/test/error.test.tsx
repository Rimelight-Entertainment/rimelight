import { describe, it, expect } from "vite-plus/test";
import { mountComponent } from "./utils/browser-render";
import { RLError } from "../src/components/error/RLError";
import { HttpError, getErrorStatus, isHttpError } from "../src/components/error/http-error";

describe("HttpError", () => {
  it("exposes its message by default for 4xx and hides it for 5xx", () => {
    expect(new HttpError(404, "Missing").expose).toBe(true);
    expect(new HttpError(500, "db down").expose).toBe(false);
  });

  it("honors an explicit expose flag", () => {
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
  it("shows the status badge unless hideStatus is set", () => {
    const shown = mountComponent(() => <RLError status={404} />);
    expect(shown.querySelector("[data-slot=badge-label]")?.textContent).toContain("404");

    const hidden = mountComponent(() => <RLError status={404} hideStatus />);
    expect(hidden.querySelector("[data-slot=badge]")).toBeNull();
  });

  it("derives the status from a thrown error when no status is given", () => {
    const c = mountComponent(() => <RLError error={new HttpError(403, "Only editors")} />);
    expect(c.querySelector("[data-slot=badge-label]")?.textContent).toContain("403");
  });

  it("links to home by default", () => {
    const c = mountComponent(() => <RLError status={404} />);
    expect(c.querySelector("[data-slot=actions] a")?.getAttribute("href")).toBe("/");
  });

  it("uses explicit title and description over built-in text", () => {
    const c = mountComponent(() => (
      <RLError status={403} title="Nope" description="Editors only" />
    ));
    expect(c.querySelector("[data-slot=title]")?.textContent).toBe("Nope");
    expect(c.querySelector("[data-slot=description]")?.textContent).toBe("Editors only");
  });

  it("hides the actions area when actions is []", () => {
    const c = mountComponent(() => <RLError status={403} actions={[]} />);
    expect(c.querySelector("[data-slot=actions]")).toBeNull();
  });

  it("renders the actionsSlot in place of the default actions", () => {
    const c = mountComponent(() => (
      <RLError status={403} actionsSlot={<button data-test="custom-action">Go</button>} />
    ));
    expect(c.querySelector("[data-slot=actions] [data-test=custom-action]")).not.toBeNull();
    expect(c.querySelector("[data-slot=actions] a")).toBeNull();
  });

  it("renders the footerSlot", () => {
    const c = mountComponent(() => (
      <RLError status={403} footerSlot={<span data-test="footer-note">note</span>} />
    ));
    expect(c.querySelector("[data-slot=footer] [data-test=footer-note]")).not.toBeNull();
  });

  it("shows an exposed HttpError message but not an unexpected error message", () => {
    const shown = mountComponent(() => <RLError error={new HttpError(404, "Post is gone")} />);
    expect(shown.querySelector("[data-slot=description]")?.textContent).toContain("Post is gone");

    const hidden = mountComponent(() => (
      <RLError error={new Error("SQLITE_ERROR: no such column")} hasDetails={false} />
    ));
    expect(hidden.textContent).not.toContain("SQLITE_ERROR");
  });

  it("renders the details panel only when hasDetails is enabled", () => {
    const hidden = mountComponent(() => <RLError error={new Error("boom")} hasDetails={false} />);
    expect(hidden.querySelector("[data-slot=details]")).toBeNull();

    const shown = mountComponent(() => <RLError error={new Error("boom")} hasDetails />);
    expect(shown.querySelector("[data-slot=details]")?.textContent).toContain("boom");
  });

  it("renders children inside the body", () => {
    const c = mountComponent(() => (
      <RLError status={403}>
        <span data-test="extra">Signed in as a@b.c</span>
      </RLError>
    ));
    expect(c.querySelector("[data-slot=body] [data-test=extra]")).not.toBeNull();
  });
});
