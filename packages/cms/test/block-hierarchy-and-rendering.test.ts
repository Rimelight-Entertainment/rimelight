import { describe, expect, it } from "vite-plus/test"
import { ALLOWED_CHILDREN_MAP } from "../src/core/types/blocks"

describe("block-hierarchy-and-rules", () => {
  it("enforces allowed children rules for ScriptBlock", () => {
    const allowedInScript = ALLOWED_CHILDREN_MAP["ScriptBlock"]
    expect(allowedInScript).toEqual(["SceneBlock"])
  })

  it("enforces allowed children rules for SceneBlock", () => {
    const allowedInScene = ALLOWED_CHILDREN_MAP["SceneBlock"]
    expect(allowedInScene).toEqual(["ParagraphBlock", "CalloutBlock", "DialogueBlock"])
  })

  it("enforces allowed children rules for CalloutBlock", () => {
    const allowedInCallout = ALLOWED_CHILDREN_MAP["CalloutBlock"]
    expect(allowedInCallout).toEqual(["ParagraphBlock", "CalloutBlock", "ImageBlock", "CodeBlock"])
  })

  it("enforces allowed children rules for SectionBlock", () => {
    const allowedInSection = ALLOWED_CHILDREN_MAP["SectionBlock"]
    expect(allowedInSection).toEqual([
      "SectionBlock",
      "ParagraphBlock",
      "CalloutBlock",
      "ImageBlock",
      "CodeBlock",
      "ScriptBlock"
    ])
  })

  it("allows all primary blocks at root level", () => {
    const allowedAtRoot = ALLOWED_CHILDREN_MAP["Root"]
    expect(allowedAtRoot).toContain("ParagraphBlock")
    expect(allowedAtRoot).toContain("SectionBlock")
    expect(allowedAtRoot).toContain("ImageBlock")
    expect(allowedAtRoot).toContain("CalloutBlock")
    expect(allowedAtRoot).toContain("CodeBlock")
    expect(allowedAtRoot).toContain("ScriptBlock")
    expect(allowedAtRoot).toContain("SceneBlock")
    expect(allowedAtRoot).toContain("DialogueBlock")
  })
})
