export {
  BlockRenderer,
  BlockRegistryContext,
  useBlockRegistry,
  type BlockRendererProps,
} from "./BlockRenderer";
export { PageRenderer, type PageRendererProps } from "./PageRenderer";
export * from "./blocks/index";
export { createContentClient, content, type PublicEntry, type PublicTerm } from "./content";

// Pure helpers re-exported here so site code gets them from source (no package rebuild needed).
export {
  buildDocsNav,
  docsVersions,
  parseDocsPath,
  switchDocsVersion,
  humanizeSegment,
  type DocsNav,
  type DocsNavItem,
  type DocsScope,
  type DocsEntryRef,
} from "../docs/versions";
export { extractHeadingsFromBlocks, slugifyHeading, type TableOfContentsHeading } from "../docs/toc";
export { blocksToMarkdown, inlinesToMarkdown } from "../markdown/serializer";
export { richTextToPlain, resolveRichText } from "../core/richtext";
