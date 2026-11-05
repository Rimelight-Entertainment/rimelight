import { describe, it, expect } from "vite-plus/test";
import { mountComponent } from "./utils/browser-render";
import { RLPackageManagers } from "../src/components/package-managers/RLPackageManagers";

const tabsOf = (container: HTMLElement) =>
  Array.from(container.querySelectorAll<HTMLElement>("[role='tab']"));

const commandOf = (container: HTMLElement) => container.querySelector("pre code")?.textContent;

describe("RLPackageManagers — structure", () => {
  it("renders one tab per default manager in order", () => {
    const container = mountComponent(() => <RLPackageManagers pkg="react" />);
    expect(tabsOf(container).map((tab) => tab.textContent)).toEqual([
      "npm",
      "pnpm",
      "yarn",
      "deno",
      "bun",
      "vp",
    ]);
  });

  it("renders the list, trigger, content, code and copy slots", () => {
    const container = mountComponent(() => <RLPackageManagers pkg="react" />);
    for (const slot of ["root", "list", "trigger", "content", "code-block", "copy-button"]) {
      expect(container.querySelector(`[data-slot='${slot}']`)).not.toBeNull();
    }
  });

  it("renders the root as the requested element", () => {
    const container = mountComponent(() => <RLPackageManagers as="section" pkg="react" />);
    expect(container.querySelector("section[data-slot='root']")).not.toBeNull();
  });

  it("forwards class and attributes to the root without leaking command props", () => {
    const container = mountComponent(() => (
      <RLPackageManagers class="custom" id="pm" pkg="react" dev />
    ));
    const root = container.querySelector<HTMLElement>("[data-slot='root']");
    expect(root?.classList.contains("custom")).toBe(true);
    expect(root?.id).toBe("pm");
    expect(root?.hasAttribute("pkg")).toBe(false);
    expect(root?.hasAttribute("dev")).toBe(false);
  });

  it("links each tab to its panel", () => {
    const container = mountComponent(() => <RLPackageManagers id="pm" pkg="react" />);
    const tab = tabsOf(container)[0];
    const panel = container.querySelector<HTMLElement>("[role='tabpanel']");
    expect(tab?.id).toBe("pm-tab-npm");
    expect(tab?.getAttribute("aria-controls")).toBe(panel?.id);
    expect(panel?.getAttribute("aria-labelledby")).toBe(tab?.id);
  });
});

describe("RLPackageManagers — commands", () => {
  it("renders the add command for the first manager", () => {
    const container = mountComponent(() => <RLPackageManagers pkg="react" />);
    expect(commandOf(container)).toBe("npm i react");
  });

  it("adds the dev flag to add commands", () => {
    const container = mountComponent(() => <RLPackageManagers pkg="react" dev />);
    expect(commandOf(container)).toBe("npm i -D react");
  });

  it("ignores the dev flag for non-add commands", () => {
    const container = mountComponent(() => <RLPackageManagers type="install" dev />);
    expect(commandOf(container)).toBe("npm install");
  });

  it("renders the remove command", () => {
    const container = mountComponent(() => <RLPackageManagers type="remove" pkg="react" />);
    expect(commandOf(container)).toBe("npm uninstall react");
  });

  it("appends args after a double dash for npm install-style commands", () => {
    const container = mountComponent(() => <RLPackageManagers pkg="react" args="--force" />);
    expect(commandOf(container)).toBe("npm i react -- --force");
  });

  it("appends args without a double dash for other managers", () => {
    const container = mountComponent(() => (
      <RLPackageManagers managers={["pnpm"]} pkg="react" args="--force" />
    ));
    expect(commandOf(container)).toBe("pnpm add react --force");
  });

  it("prepends the prefix", () => {
    const container = mountComponent(() => (
      <RLPackageManagers managers={["npm"]} pkg="react" prefix="sudo" />
    ));
    expect(commandOf(container)).toBe("sudo npm i react");
  });

  it("renders the comment above the command with the manager name substituted", () => {
    const container = mountComponent(() => (
      <RLPackageManagers managers={["bun"]} pkg="react" comment="Install with {PKG}" />
    ));
    expect(commandOf(container)).toBe("# Install with bun\nbun add react");
  });

  it("strips the version from a scoped package for yarn create", () => {
    const container = mountComponent(() => (
      <RLPackageManagers managers={["yarn"]} type="create" pkg="@scope/tool@1.2.3" />
    ));
    expect(commandOf(container)).toBe("yarn create @scope/tool");
  });
});

describe("RLPackageManagers — manager and type boundaries", () => {
  it("shows only the given managers in the given order", () => {
    const container = mountComponent(() => (
      <RLPackageManagers managers={["bun", "npm"]} pkg="react" />
    ));
    expect(tabsOf(container).map((tab) => tab.textContent)).toEqual(["bun", "npm"]);
  });

  it("omits managers that have no command for the requested type", () => {
    const container = mountComponent(() => <RLPackageManagers type="dlx" pkg="react" />);
    expect(tabsOf(container).map((tab) => tab.textContent)).toEqual([
      "npm",
      "pnpm",
      "yarn",
      "deno",
      "vp",
    ]);
  });

  it("renders no tabs and no command for an empty manager list", () => {
    const container = mountComponent(() => <RLPackageManagers managers={[]} pkg="react" />);
    expect(tabsOf(container)).toHaveLength(0);
    expect(container.querySelector("pre")).toBeNull();
  });

  it("renders no tabs when no manager supports the requested type", () => {
    const container = mountComponent(() => (
      <RLPackageManagers managers={["bun"]} type="dlx" pkg="react" />
    ));
    expect(tabsOf(container)).toHaveLength(0);
  });
});
