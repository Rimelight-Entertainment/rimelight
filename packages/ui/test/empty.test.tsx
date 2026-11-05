import { describe, it, expect } from "vite-plus/test";
import { mountComponent } from "./utils/browser-render";
import { RLEmpty } from "../src/components/empty/RLEmpty";

describe("RLEmpty", () => {
  it("renders the title and description props", () => {
    const c = mountComponent(() => <RLEmpty title="No results" description="Try again" />);
    expect(c.querySelector("[data-slot=title]")?.textContent).toBe("No results");
    expect(c.querySelector("[data-slot=description]")?.textContent).toBe("Try again");
  });

  it("omits the title and description when they are not set", () => {
    const c = mountComponent(() => <RLEmpty />);
    expect(c.querySelector("[data-slot=title]")).toBeNull();
    expect(c.querySelector("[data-slot=description]")).toBeNull();
  });

  it("renders one button per action", () => {
    const c = mountComponent(() => (
      <RLEmpty
        actions={[
          { label: "Create", onClick: () => {} },
          { label: "Import", onClick: () => {} },
        ]}
      />
    ));
    expect(c.querySelector("[data-slot=actions]")?.children.length).toBe(2);
  });

  it("omits the actions area when actions is empty", () => {
    const c = mountComponent(() => <RLEmpty actions={[]} />);
    expect(c.querySelector("[data-slot=actions]")).toBeNull();
  });

  it("renders actionsSlot in place of the default actions", () => {
    const c = mountComponent(() => (
      <RLEmpty
        actions={[{ label: "Create", onClick: () => {} }]}
        actionsSlot={<span data-test="custom-actions">custom</span>}
      />
    ));
    expect(c.querySelector("[data-slot=actions] [data-test=custom-actions]")).not.toBeNull();
    expect(c.querySelector("[data-slot=actions] button")).toBeNull();
  });

  it("shows an avatar placeholder while loading even without an icon", () => {
    const c = mountComponent(() => <RLEmpty loading />);
    expect(c.querySelector("[data-slot=avatar]")).not.toBeNull();
  });

  it("renders leadingSlot in place of the avatar", () => {
    const c = mountComponent(() => (
      <RLEmpty icon="i-lucide-inbox" leadingSlot={<span data-test="lead">lead</span>} />
    ));
    expect(c.querySelector("[data-slot=leading] [data-test=lead]")).not.toBeNull();
    expect(c.querySelector("[data-slot=avatar]")).toBeNull();
  });

  it("renders children inside the body", () => {
    const c = mountComponent(() => (
      <RLEmpty>
        <span data-test="child">child</span>
      </RLEmpty>
    ));
    expect(c.querySelector("[data-slot=body] [data-test=child]")).not.toBeNull();
  });

  it("prefers bodySlot over children", () => {
    const c = mountComponent(() => (
      <RLEmpty bodySlot={<span data-test="body-slot">body</span>}>
        <span data-test="child">child</span>
      </RLEmpty>
    ));
    expect(c.querySelector("[data-slot=body] [data-test=body-slot]")).not.toBeNull();
    expect(c.querySelector("[data-test=child]")).toBeNull();
  });

  it("replaces the whole header with headerSlot", () => {
    const c = mountComponent(() => (
      <RLEmpty title="Hidden" headerSlot={<h2 data-test="header">Custom</h2>} />
    ));
    expect(c.querySelector("[data-slot=header]")).toBeNull();
    expect(c.querySelector("[data-test=header]")).not.toBeNull();
    expect(c.textContent).not.toContain("Hidden");
  });

  it("renders footerSlot", () => {
    const c = mountComponent(() => (
      <RLEmpty footerSlot={<span data-test="footer-note">note</span>} />
    ));
    expect(c.querySelector("[data-slot=footer] [data-test=footer-note]")).not.toBeNull();
  });
});
