import { describe, expect, it } from "vite-plus/test"
import { HistoryStack } from "../src/client/state/history"
import type { BaseBlock } from "../src/core/types/blocks"

describe("HistoryStack", () => {
  it("pushes snapshots and handles Undo / Redo", () => {
    const initial: BaseBlock[] = [
      {
        id: "11111111-1111-4111-8111-111111111111",
        type: "ParagraphBlock",
        props: { text: "Step 1" }
      }
    ]
    const history = new HistoryStack(initial)

    const step2: BaseBlock[] = [
      {
        id: "11111111-1111-4111-8111-111111111111",
        type: "ParagraphBlock",
        props: { text: "Step 2" }
      }
    ]
    history.push(step2, true)

    expect(history.canUndo()).toBe(true)
    const undone = history.undo()
    expect(undone?.[0]?.props.text).toBe("Step 1")

    expect(history.canRedo()).toBe(true)
    const redone = history.redo()
    expect(redone?.[0]?.props.text).toBe("Step 2")
  })
})
