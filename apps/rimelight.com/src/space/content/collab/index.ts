export { textKind } from "./registry";
export { normalizePage, normalizeRich } from "./normalize";
export { importRich, exportRich } from "./richtext";
export {
  configure,
  importPage,
  exportPage,
  forkDraft,
  mergeDraft,
  catchUp,
  replaceContent,
} from "./doc";
export type {
  Block,
  InlineNode,
  InlineText,
  InlineLink,
  InlineMention,
  InlineEmoji,
  InlineIcon,
  Locale,
  Page,
  PageContent,
  PageMeta,
} from "./types";
export type { TextKind } from "./registry";
