import { ApiDocumentationBlock } from "./ApiDocumentationBlock";
import { LivePreviewBlock } from "./LivePreviewBlock";

/**
 * Site renderers for built-in block types whose renderer needs site-only code. Passed to
 * `defineCmsConfig({ renderers })` and to the docs renderer. Screenplay blocks are package built-ins.
 */
export const siteBlockRenderers: Record<string, any> = {
  ApiDocumentationBlock,
  LivePreviewBlock,
};

export { ApiDocumentationBlock, LivePreviewBlock };
