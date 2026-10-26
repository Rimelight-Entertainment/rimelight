// @vitest-environment happy-dom
import { afterEach, describe, expect, it } from "vite-plus/test";
import { render } from "@solidjs/web";
import { BlockRegistry, builtinBlocks, type BaseBlock } from "@rimelight/cms";
import cmsConfig from "../cms.config";
import { DialogueBlock, ScriptBlock, SceneBlock } from "../src/components/blocks";

// The same registry the dashboard builds: built-ins plus the site's custom blocks.
const registry = new BlockRegistry().register(...builtinBlocks, ...(cmsConfig.blocks ?? []));
const types = (parent: string | null) =>
  registry
    .allowedChildren(parent)
    .map((d) => d.type)
    .sort();

const SCREENPLAY = ["ScriptBlock", "SceneBlock", "DialogueBlock"];

let dispose: (() => void) | undefined;
let host: HTMLElement | undefined;

function mount(view: () => any): HTMLElement {
  host = document.createElement("div");
  document.body.appendChild(host);
  dispose = render(view, host);
  return host;
}

afterEach(() => {
  dispose?.();
  host?.remove();
});

describe("screenplay block hierarchy", () => {
  it("is registered with the screenplay category", () => {
    for (const type of SCREENPLAY) {
      expect(registry.get(type), type).toBeDefined();
      expect(registry.get(type)?.category).toBe("screenplay");
    }
  });

  it("only offers a script at the root", () => {
    expect(types(null)).toContain("ScriptBlock");
    expect(types(null)).not.toContain("SceneBlock");
    expect(types(null)).not.toContain("DialogueBlock");
  });

  it("only allows scenes inside scripts", () => {
    expect(registry.accepts("ScriptBlock", "SceneBlock")).toBe(true);
    expect(registry.accepts("SectionBlock", "SceneBlock")).toBe(false);
    expect(registry.accepts("CalloutBlock", "SceneBlock")).toBe(false);
    expect(registry.accepts("TabItemBlock", "SceneBlock")).toBe(false);
  });

  it("only allows dialogue inside scenes", () => {
    expect(registry.accepts("SceneBlock", "DialogueBlock")).toBe(true);
    expect(registry.accepts("ScriptBlock", "DialogueBlock")).toBe(false);
    expect(registry.accepts("SectionBlock", "DialogueBlock")).toBe(false);
    expect(registry.accepts(null, "DialogueBlock")).toBe(false);
  });

  it("gives scripts only scenes, and scenes dialogue, paragraphs and callouts", () => {
    expect(types("ScriptBlock")).toEqual(["SceneBlock"]);
    expect(types("SceneBlock")).toEqual(["CalloutBlock", "DialogueBlock", "ParagraphBlock"]);
    expect(types("DialogueBlock")).toEqual([]);
  });
});

describe("screenplay defaults", () => {
  it("creates an empty script with no scenes yet", () => {
    const script = registry.create("ScriptBlock");
    expect(script.props).toEqual({ title: "", synopsis: "", characters: [] });
    expect(script.children).toEqual([]);
  });

  it("creates a scene at an interior morning slug with no transition", () => {
    const scene = registry.create("SceneBlock");
    expect(scene.props).toMatchObject({
      location: "",
      setting: "INTERIOR",
      timeOfDay: "MORNING",
      transition: "CUT_TO",
      description: [],
    });
    expect(scene.children).toEqual([]);
  });

  it("creates dialogue as a leaf with rich text", () => {
    const line = registry.create("DialogueBlock");
    expect(line.props).toEqual({ character: "", line: [] });
    expect(line.children).toBeUndefined();
    expect(registry.get("DialogueBlock")?.richText).toBe(true);
  });

  it("only uses default select values that are offered as options", () => {
    for (const type of SCREENPLAY) {
      const def = registry.get(type)!;
      for (const [key, field] of Object.entries(def.fields ?? {})) {
        if (field.type !== "select") continue;
        const values = (field.options ?? []).map((o) => o.value);
        expect(values.length, `${type}.${key} has options`).toBeGreaterThan(0);
        const current = def.defaultProps[key];
        if (current !== undefined) expect(values, `${type}.${key}`).toContain(current);
      }
    }
  });
});

describe("screenplay rendering", () => {
  it("renders the script title, synopsis, characters, plots and stinger", () => {
    const block: BaseBlock = {
      id: "s",
      type: "ScriptBlock",
      props: {
        title: "Pilot",
        synopsis: "A cold open",
        characters: ["Ada", "Ben"],
        aPlot: "The heist",
        bPlot: "The romance",
        cPlot: "",
        stinger: "A knock at the door",
      },
    };
    const text = mount(() => <ScriptBlock block={block} />).textContent ?? "";
    expect(text).toContain("Pilot");
    expect(text).toContain("A cold open");
    expect(text).toContain("Ada");
    expect(text).toContain("Ben");
    expect(text).toContain("A Plot");
    expect(text).toContain("The heist");
    expect(text).toContain("B Plot");
    expect(text).not.toContain("C Plot");
    expect(text).toContain("Stinger: A knock at the door");
  });

  it("omits the plot grid and stinger when a script has none", () => {
    const block: BaseBlock = {
      id: "s",
      type: "ScriptBlock",
      props: { title: "Bare", synopsis: "", characters: [] },
    };
    const text = mount(() => <ScriptBlock block={block} />).textContent ?? "";
    expect(text).toContain("Bare");
    expect(text).not.toContain("Plot");
    expect(text).not.toContain("Stinger");
  });

  it("builds the scene heading from setting, location and time of day", () => {
    const block: BaseBlock = {
      id: "sc",
      type: "SceneBlock",
      props: {
        location: "Kitchen",
        setting: "INTERIOR",
        timeOfDay: "NIGHT",
        transition: "CUT_TO",
        description: [{ type: "text", text: "Dishes everywhere." }],
      },
    };
    const text = mount(() => <SceneBlock block={block} locale="en" />).textContent ?? "";
    expect(text).toContain("INT.");
    expect(text).toContain("Kitchen");
    expect(text).toContain("- Night");
    expect(text).toContain("CUT TO");
    expect(text).toContain("Dishes everywhere.");
  });

  it("hides the transition for NONE and the setting for OTHER", () => {
    const block: BaseBlock = {
      id: "sc",
      type: "SceneBlock",
      props: {
        location: "Void",
        setting: "OTHER",
        timeOfDay: "OTHER",
        transition: "NONE",
        description: [],
      },
    };
    const text = mount(() => <SceneBlock block={block} />).textContent ?? "";
    expect(text).toContain("Void");
    expect(text).not.toContain("INT.");
    expect(text).not.toContain("EXT.");
    expect(text).not.toContain("Other");
    expect(text).not.toContain("NONE");
  });

  it("renders the speaker, parenthetical and line", () => {
    const block: BaseBlock = {
      id: "d",
      type: "DialogueBlock",
      props: {
        character: "ADA",
        parenthetical: "whispering",
        line: [{ type: "text", text: "Don't move." }],
      },
    };
    const text = mount(() => <DialogueBlock block={block} />).textContent ?? "";
    expect(text).toContain("ADA");
    expect(text).toContain("(whispering)");
    expect(text).toContain("Don't move.");
  });
});
