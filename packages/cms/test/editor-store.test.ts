import { afterEach, beforeEach, describe, expect, it, vi } from "vite-plus/test";
import { createRoot, createSignal } from "solid-js";
import {
  createBlockEditor,
  type CreateEditorOptions,
  type EditorContent,
} from "../src/editor/store";
import { BlockRegistry, defineBlock } from "../src/core/blocks/registry";
import { builtinBlocks } from "../src/core/blocks/builtins";
import type { BaseBlock } from "../src/core/types/blocks";

const registry = new BlockRegistry().register(
  ...builtinBlocks,
  defineBlock({ type: "ScriptBlock", label: "Script", defaultProps: {}, children: ["SceneBlock"] }),
  defineBlock({ type: "SceneBlock", label: "Scene", defaultProps: {}, parents: ["ScriptBlock"] }),
);

const paragraph = (id: string, text = ""): BaseBlock => ({
  id,
  type: "ParagraphBlock",
  props: { text: text ? [{ type: "text", text }] : [] },
});

/** Runs `fn` under a Solid root so stores and effects behave as they do in the dashboard. */
function withEditor<T>(options: Partial<CreateEditorOptions>, fn: (ed: any) => T): T {
  return createRoot((dispose) => {
    try {
      const ed = createBlockEditor({
        initial: { blocks: [], properties: {} },
        registry,
        save: async () => {},
        autosaveDelay: 1000,
        ...options,
      });
      return fn(ed);
    } finally {
      dispose();
    }
  });
}

describe("createBlockEditor: tree edits", () => {
  it("inserts at the root and selects + focuses the new block", () => {
    withEditor({}, (ed) => {
      const id = ed.insert("ParagraphBlock", null, 0);
      expect(id).toBeTruthy();
      expect(ed.selectedId()).toBe(id);
      expect(ed.focusRequest()).toEqual({ id, at: "start" });
      expect(ed.snapshot().blocks.map((b: BaseBlock) => b.id)).toEqual([id]);
    });
  });

  it("refuses an insert the registry does not allow", () => {
    withEditor({}, (ed) => {
      // A scene only exists inside a script.
      expect(ed.insert("SceneBlock", null, 0)).toBeNull();
      expect(ed.snapshot().blocks).toHaveLength(0);
    });
  });

  it("insertAfter falls back to a type the parent accepts", () => {
    withEditor({ initial: { blocks: [paragraph("a")], properties: {} } }, (ed) => {
      const id = ed.insertAfter("a", "ScriptBlock");
      expect(id).toBeTruthy();
      expect(ed.snapshot().blocks.map((b: BaseBlock) => b.id)).toEqual(["a", id]);
    });
  });

  it("removes a block and moves selection to the previous sibling", () => {
    withEditor({ initial: { blocks: [paragraph("a"), paragraph("b")], properties: {} } }, (ed) => {
      ed.remove("b");
      expect(ed.snapshot().blocks.map((b: BaseBlock) => b.id)).toEqual(["a"]);
      expect(ed.selectedId()).toBe("a");
      expect(ed.focusRequest()).toEqual({ id: "a", at: "end" });
    });
  });

  it("moves a block up and down with moveBy", () => {
    withEditor(
      { initial: { blocks: [paragraph("a"), paragraph("b"), paragraph("c")], properties: {} } },
      (ed) => {
        ed.moveBy("a", 1);
        expect(ed.snapshot().blocks.map((b: BaseBlock) => b.id)).toEqual(["b", "a", "c"]);
        ed.moveBy("c", -1);
        expect(ed.snapshot().blocks.map((b: BaseBlock) => b.id)).toEqual(["b", "c", "a"]);
        ed.moveBy("b", -1); // already first: no-op
        expect(ed.snapshot().blocks.map((b: BaseBlock) => b.id)).toEqual(["b", "c", "a"]);
      },
    );
  });

  it("does not move a block into itself", () => {
    const section: BaseBlock = {
      id: "s",
      type: "SectionBlock",
      props: {},
      children: [paragraph("p")],
    };
    withEditor({ initial: { blocks: [section], properties: {} } }, (ed) => {
      expect(ed.canMoveTo("s", "s")).toBe(false);
      ed.move("s", "s", 0);
      expect(ed.snapshot().blocks[0].id).toBe("s");
    });
  });

  it("duplicates a block next to the original with fresh ids", () => {
    withEditor({ initial: { blocks: [paragraph("a", "hi")], properties: {} } }, (ed) => {
      ed.duplicate("a");
      const [orig, copy] = ed.snapshot().blocks;
      expect(orig.id).toBe("a");
      expect(copy.id).not.toBe("a");
      expect(copy.props.text).toEqual(orig.props.text);
      expect(ed.selectedId()).toBe(copy.id);
      // Focus follows the selection, so keyboard input lands in the copy.
      expect(ed.focusRequest()).toEqual({ id: copy.id, at: "start" });
    });
  });

  it("Backspace at the start joins the text onto the block above, caret at the join", () => {
    withEditor(
      { initial: { blocks: [paragraph("a", "hello"), paragraph("b", "world")], properties: {} } },
      (ed) => {
        ed.joinWithPrevious("b");
        const blocks = ed.snapshot().blocks as BaseBlock[];
        expect(blocks.map((b) => b.id)).toEqual(["a"]);
        expect(blocks[0]!.props["text"]).toEqual([{ type: "text", text: "helloworld" }]);
        expect(ed.focusRequest()).toEqual({ id: "a", at: 5 });
      },
    );
  });

  it("accepts values read from the reactive doc (store proxies) without throwing", () => {
    withEditor({ initial: { blocks: [paragraph("a", "x")], properties: {} } }, (ed) => {
      // `doc` is the Solid store: its nested values are proxies, which structuredClone rejects.
      const fromStore = ed.doc.blocks[0].props.text;
      expect(() =>
        ed.updateProps("a", { text: [...fromStore, { type: "text", text: "y" }] }),
      ).not.toThrow();
      expect(
        ed
          .snapshot()
          .blocks[0].props.text.map((n: any) => n.text)
          .join(""),
      ).toBe("xy");
    });
  });

  it("does not join across a different text prop (e.g. a section title)", () => {
    const section: BaseBlock = {
      id: "s",
      type: "SectionBlock",
      props: { title: [] },
      children: [],
    };
    withEditor({ initial: { blocks: [section, paragraph("b", "x")], properties: {} } }, (ed) => {
      ed.joinWithPrevious("b");
      expect(ed.snapshot().blocks.map((b: BaseBlock) => b.id)).toEqual(["s", "b"]);
    });
  });

  it("transform keeps the text when both types have inline text", () => {
    withEditor({ initial: { blocks: [paragraph("a", "keep me")], properties: {} } }, (ed) => {
      // Paragraph (inline "text") → Section (inline "title"): the words carry over.
      ed.transform("a", "SectionBlock");
      const block = ed.get("a").block as BaseBlock;
      expect(block.type).toBe("SectionBlock");
      expect(JSON.stringify(block.props["title"])).toContain("keep me");
    });
  });
});

describe("createBlockEditor: locks", () => {
  it("blocks prop edits on fully templated blocks", () => {
    const locked: BaseBlock = { ...paragraph("a", "x"), templatedProps: true };
    withEditor({ initial: { blocks: [locked], properties: {} } }, (ed) => {
      ed.updateProps("a", { text: [{ type: "text", text: "changed" }] });
      expect(ed.snapshot().blocks[0].props.text[0].text).toBe("x");
    });
  });

  it("blocks edits only to the listed props when templatedProps is an array", () => {
    const partly: BaseBlock = { ...paragraph("a", "x"), templatedProps: ["text"] };
    withEditor({ initial: { blocks: [partly], properties: {} } }, (ed) => {
      ed.updateProps("a", { text: [{ type: "text", text: "nope" }] });
      expect(ed.snapshot().blocks[0].props.text[0].text).toBe("x");
      ed.updateProps("a", { other: 1 });
      expect(ed.snapshot().blocks[0].props.other).toBe(1);
    });
  });

  it("cannot remove, duplicate-away, or move a templated block", () => {
    const pinned: BaseBlock = { ...paragraph("a"), isTemplated: true };
    withEditor({ initial: { blocks: [pinned, paragraph("b")], properties: {} } }, (ed) => {
      ed.remove("a");
      expect(ed.snapshot().blocks.map((b: BaseBlock) => b.id)).toEqual(["a", "b"]);
      expect(ed.canMoveTo("a", null)).toBe(false);
    });
  });

  it("a read-only editor ignores every mutation", () => {
    withEditor({ readOnly: true, initial: { blocks: [paragraph("a")], properties: {} } }, (ed) => {
      expect(ed.insert("ParagraphBlock", null, 1)).toBeNull();
      expect(ed.selectedId()).toBeNull();
      ed.remove("a");
      expect(ed.focusRequest()).toBeNull();
      ed.setProperty("title", "nope");
      expect(ed.snapshot().properties).toEqual({});
      expect(ed.canUndo()).toBe(false);
    });
  });

  it("readOnly as a getter follows the lock state reactively", () => {
    createRoot((dispose) => {
      const [locked, setLocked] = createSignal(true);
      const ed = createBlockEditor({
        initial: { blocks: [paragraph("a")], properties: {} },
        registry,
        save: async () => {},
        readOnly: () => locked(),
      });
      expect(ed.readOnly).toBe(true);
      ed.remove("a");
      expect(ed.snapshot().blocks).toHaveLength(1);
      setLocked(false); // e.g. after a lock takeover
      expect(ed.readOnly).toBe(false);
      ed.remove("a");
      expect(ed.snapshot().blocks).toHaveLength(0);
      dispose();
    });
  });
});

describe("createBlockEditor: undo and redo", () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it("undoes and redoes a structural edit", () => {
    withEditor({}, (ed) => {
      ed.insert("ParagraphBlock", null, 0);
      expect(ed.canUndo()).toBe(true);
      ed.undo();
      expect(ed.snapshot().blocks).toHaveLength(0);
      expect(ed.canRedo()).toBe(true);
      ed.redo();
      expect(ed.snapshot().blocks).toHaveLength(1);
    });
  });

  it("merges rapid typing on one block into a single undo step", () => {
    withEditor({ initial: { blocks: [paragraph("a")], properties: {} } }, (ed) => {
      ed.updateProps("a", { text: [{ type: "text", text: "h" }] }, { coalesce: true });
      vi.advanceTimersByTime(100);
      ed.updateProps("a", { text: [{ type: "text", text: "he" }] }, { coalesce: true });
      vi.advanceTimersByTime(100);
      ed.updateProps("a", { text: [{ type: "text", text: "hey" }] }, { coalesce: true });
      ed.undo();
      expect(ed.snapshot().blocks[0].props.text).toEqual([]);
      expect(ed.canUndo()).toBe(false);
    });
  });

  it("starts a new undo step after the coalesce window", () => {
    withEditor({ initial: { blocks: [paragraph("a")], properties: {} } }, (ed) => {
      ed.updateProps("a", { text: [{ type: "text", text: "a" }] }, { coalesce: true });
      vi.advanceTimersByTime(2000);
      ed.updateProps("a", { text: [{ type: "text", text: "ab" }] }, { coalesce: true });
      ed.undo();
      expect(ed.snapshot().blocks[0].props.text[0].text).toBe("a");
    });
  });

  it("a new edit clears the redo stack", () => {
    withEditor({}, (ed) => {
      ed.insert("ParagraphBlock", null, 0);
      ed.undo();
      expect(ed.canRedo()).toBe(true);
      ed.insert("ParagraphBlock", null, 0);
      expect(ed.canRedo()).toBe(false);
    });
  });

  it("reset replaces the document and clears history", () => {
    withEditor({}, (ed) => {
      ed.insert("ParagraphBlock", null, 0);
      ed.reset({ blocks: [paragraph("z")], properties: {} });
      expect(ed.snapshot().blocks.map((b: BaseBlock) => b.id)).toEqual(["z"]);
      expect(ed.canUndo()).toBe(false);
      expect(ed.status()).toBe("saved");
    });
  });
});

describe("createBlockEditor: autosave", () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it("goes dirty, then saves once after the debounce", async () => {
    const save = vi.fn(async (_content: EditorContent): Promise<void> => {});
    withEditor({ save }, (ed) => {
      ed.insert("ParagraphBlock", null, 0);
      ed.insert("ParagraphBlock", null, 1);
      expect(ed.status()).toBe("dirty");
      vi.advanceTimersByTime(999);
      expect(save).not.toHaveBeenCalled();
      vi.advanceTimersByTime(1);
      expect(save).toHaveBeenCalledTimes(1);
      expect(save.mock.calls[0]![0].blocks).toHaveLength(2);
    });
  });

  it("reports error when save throws and keeps the changes dirty", async () => {
    const save = vi.fn(async (_content: EditorContent): Promise<void> => {
      throw new Error("network down");
    });
    await withEditorAsync({ save }, async (ed) => {
      ed.insert("ParagraphBlock", null, 0);
      await ed.flush();
      expect(ed.status()).toBe("error");
      expect(ed.error()).toBe("network down");
      // A failed save is retried by the next flush (e.g. Ctrl+S).
      save.mockResolvedValueOnce(undefined);
      await ed.flush();
      expect(ed.status()).toBe("saved");
      expect(ed.error()).toBeNull();
    });
  });

  it("flush saves immediately without waiting for the debounce", async () => {
    const save = vi.fn(async (_content: EditorContent): Promise<void> => {});
    await withEditorAsync({ save }, async (ed) => {
      ed.insert("ParagraphBlock", null, 0);
      await ed.flush();
      expect(save).toHaveBeenCalledTimes(1);
      expect(ed.status()).toBe("saved");
      expect(ed.lastSavedAt()).toBeInstanceOf(Date);
    });
  });

  it("a read-only editor never saves", async () => {
    const save = vi.fn(async (_content: EditorContent): Promise<void> => {});
    await withEditorAsync({ save, readOnly: true }, async (ed) => {
      await ed.flush();
      vi.advanceTimersByTime(5000);
      expect(save).not.toHaveBeenCalled();
    });
  });
});

/** Async variant of `withEditor`: the root is disposed after `fn` resolves. */
async function withEditorAsync<T>(
  options: Partial<CreateEditorOptions>,
  fn: (ed: any) => Promise<T>,
): Promise<T> {
  let dispose!: () => void;
  let ed: any;
  createRoot((d) => {
    dispose = d;
    ed = createBlockEditor({
      initial: { blocks: [], properties: {} },
      registry,
      save: async () => {},
      autosaveDelay: 1000,
      ...options,
    });
  });
  try {
    return await fn(ed);
  } finally {
    dispose();
  }
}

describe("createBlockEditor: multi-select", () => {
  const section = (id: string, children: BaseBlock[] = []): BaseBlock => ({
    id,
    type: "SectionBlock",
    props: { title: [] },
    children,
  });
  const tree = () => [
    paragraph("a", "A"),
    section("s", [paragraph("s1", "S1"), paragraph("s2", "S2")]),
    paragraph("b", "B"),
  ];

  it("toggles blocks in and out of the selection, anchored on the last one clicked", () => {
    withEditor({ initial: { blocks: tree(), properties: {} } }, (ed) => {
      ed.select("a");
      ed.toggleSelect("b");
      expect(ed.selectedIds()).toEqual(["a", "b"]);
      ed.toggleSelect("a");
      expect(ed.selectedIds()).toEqual(["b"]);
      expect(ed.selectedId()).toBe("a");
    });
  });

  it("shift-click selects the range in document order, across nesting", () => {
    withEditor({ initial: { blocks: tree(), properties: {} } }, (ed) => {
      ed.select("a");
      ed.extendSelect("s2");
      expect(ed.selectedIds()).toEqual(["a", "s", "s1", "s2"]);
    });
  });

  it("a plain select drops the multi-selection", () => {
    withEditor({ initial: { blocks: tree(), properties: {} } }, (ed) => {
      ed.select("a");
      ed.toggleSelect("b");
      ed.select("s1");
      expect(ed.selectedIds()).toEqual(["s1"]);
    });
  });

  it("removes the selection in one edit, without double-removing nested blocks", () => {
    withEditor({ initial: { blocks: tree(), properties: {} } }, (ed) => {
      ed.select("s");
      ed.toggleSelect("s1");
      ed.toggleSelect("b");
      ed.removeSelected();
      expect(ed.snapshot().blocks.map((b: BaseBlock) => b.id)).toEqual(["a"]);
      expect(ed.selectedIds()).toEqual([]);
      ed.undo();
      expect(ed.snapshot().blocks.map((b: BaseBlock) => b.id)).toEqual(["a", "s", "b"]);
    });
  });

  it("skips templated blocks when removing", () => {
    const locked = { ...paragraph("b", "B"), isTemplated: true };
    withEditor({ initial: { blocks: [paragraph("a"), locked], properties: {} } }, (ed) => {
      ed.select("a");
      ed.toggleSelect("b");
      ed.removeSelected();
      expect(ed.snapshot().blocks.map((b: BaseBlock) => b.id)).toEqual(["b"]);
    });
  });

  it("duplicates each top-level selected block after itself and selects the copies", () => {
    withEditor({ initial: { blocks: tree(), properties: {} } }, (ed) => {
      ed.select("a");
      ed.toggleSelect("b");
      ed.duplicateSelected();
      const ids = ed.snapshot().blocks.map((b: BaseBlock) => b.id);
      expect(ids).toHaveLength(5);
      expect(ids[0]).toBe("a");
      expect(ids[4]).not.toBe("b");
      expect(ed.selectedIds()).toHaveLength(2);
      expect(ed.selectedIds()).not.toContain("a");
    });
  });
});
