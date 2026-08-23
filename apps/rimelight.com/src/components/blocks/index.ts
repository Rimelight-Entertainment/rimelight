import ScriptBlock from "./ScriptBlock.astro"
import SceneBlock from "./SceneBlock.astro"
import DialogueBlock from "./DialogueBlock.astro"
import ApiDocumentationBlock from "./ApiDocumentationBlock.astro"
import LivePreviewBlock from "./LivePreviewBlock.astro"

export const rimelightCustomBlocks: Record<string, any> = {
  ScriptBlock,
  SceneBlock,
  DialogueBlock,
  ApiDocumentationBlock,
  LivePreviewBlock
}

export { ScriptBlock, SceneBlock, DialogueBlock, ApiDocumentationBlock, LivePreviewBlock }
