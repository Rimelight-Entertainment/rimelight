import ScriptBlock from "./ScriptBlock.astro"
import SceneBlock from "./SceneBlock.astro"
import DialogueBlock from "./DialogueBlock.astro"

export const rimelightCustomBlocks: Record<string, any> = {
  ScriptBlock,
  SceneBlock,
  DialogueBlock
}

export { ScriptBlock, SceneBlock, DialogueBlock }
