import { ScriptBlock } from "./ScriptBlock";
import { SceneBlock } from "./SceneBlock";
import { DialogueBlock } from "./DialogueBlock";
import { ApiDocumentationBlock } from "./ApiDocumentationBlock";
import { LivePreviewBlock } from "./LivePreviewBlock";

export const rimelightCustomBlocks: Record<string, any> = {
  ScriptBlock,
  SceneBlock,
  DialogueBlock,
  ApiDocumentationBlock,
  LivePreviewBlock,
};

export { ScriptBlock, SceneBlock, DialogueBlock, ApiDocumentationBlock, LivePreviewBlock };
