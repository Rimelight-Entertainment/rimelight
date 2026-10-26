import { defineRelations } from "drizzle-orm";
import * as schema from "./index.ts";

export const relations = defineRelations(schema, (r) => ({
  note: {
    user: r.one.users({
      from: r.note.userId,
      to: r.users.auth0Id,
    }),
    noteLabels: r.many.note_noteLabel(),
  },
  noteLabel: {
    user: r.one.users({
      from: r.noteLabel.userId,
      to: r.users.auth0Id,
    }),
    noteLabels: r.many.note_noteLabel(),
  },
  note_noteLabel: {
    note: r.one.note({
      from: r.note_noteLabel.noteId,
      to: r.note.id,
    }),
    label: r.one.noteLabel({
      from: r.note_noteLabel.labelId,
      to: r.noteLabel.id,
    }),
  },
  todo: {
    user: r.one.users({
      from: r.todo.userId,
      to: r.users.auth0Id,
    }),
  },

  pageVersions: {
    page: (r.one.pages as any)({
      from: (r.pageVersions as any).pageId,
      to: (r.pages as any).id,
    }),
  },

  board: {
    user: r.one.users({
      from: r.board.userId,
      to: r.users.auth0Id,
    }),
    lists: r.many.list(),
    customFields: r.many.customFieldDefinition(),
  },
  customFieldDefinition: {
    board: r.one.board({
      from: r.customFieldDefinition.boardId,
      to: r.board.id,
    }),
  },
  list: {
    board: r.one.board({
      from: r.list.boardId,
      to: r.board.id,
    }),
    cards: r.many.card(),
  },
  card: {
    list: r.one.list({
      from: r.card.listId,
      to: r.list.id,
    }),
  },
  titleSettings: {
    user: r.one.users({
      from: r.titleSettings.userId,
      to: r.users.id,
    }),
  },
}));
