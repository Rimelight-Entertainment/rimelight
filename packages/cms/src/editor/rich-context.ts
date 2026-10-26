import { createContext, useContext } from "solid-js";
import { collectionColor } from "../core/collections/color";

/** An entry offered in the "@" mention picker. */
export interface MentionCandidate {
  entryId: string;
  collection: string;
  slug: string;
  title: string;
}

/**
 * What rich text editing needs from the host (the dashboard): entry search for "@" mentions
 * and each collection's colour / icon / label, so mentions look the same as on the site.
 */
export interface RichEditing {
  searchMentions?: (query: string) => Promise<MentionCandidate[]>;
  mentionColor: (collection: string) => string;
  mentionIcon: (collection: string) => string | undefined;
  collectionLabel: (collection: string) => string;
  /** Current titles of mentioned entries by id, in the editor locale. Read reactively. */
  mentionTitles?: () => Record<string, string>;
}

export const RichEditingContext = createContext<RichEditing>({
  mentionColor: (c) => collectionColor(c),
  mentionIcon: () => undefined,
  collectionLabel: (c) => c,
});

export const useRichEditing = () => useContext(RichEditingContext);
