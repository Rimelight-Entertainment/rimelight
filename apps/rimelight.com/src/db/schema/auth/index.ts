import {
  boolean,
  foreignKey,
  pgTable,
  primaryKey,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";

export const todo = pgTable("todo", {
  id: uuid("id").defaultRandom().notNull().primaryKey(),
  userId: text("user_id").notNull(),
  title: text("title").notNull(),
  description: text("description"),
  completed: boolean("completed").default(false).notNull(),
  completedAt: timestamp("completed_at"),
  isArchived: boolean("is_archived").default(false).notNull(),
  updatedAt: timestamp("updated_at", {
    withTimezone: true,
  }).$onUpdate(() => new Date()),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  deletedAt: timestamp("deleted_at", { withTimezone: true }),
});

export const note = pgTable("note", {
  id: uuid("id").defaultRandom().notNull().primaryKey(),
  userId: text("user_id").notNull(),
  title: text("title"),
  content: text("content"),
  isPinned: boolean("is_pinned").default(false).notNull(),
  isArchived: boolean("is_archived").default(false).notNull(),
  updatedAt: timestamp("updated_at", {
    withTimezone: true,
  }).$onUpdate(() => new Date()),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  deletedAt: timestamp("deleted_at", { withTimezone: true }),
});

export const noteLabel = pgTable("noteLabel", {
  id: uuid("id").defaultRandom().notNull().primaryKey(),
  userId: text("user_id").notNull(),
  name: text("name").notNull(),
  updatedAt: timestamp("updated_at", {
    withTimezone: true,
  }).$onUpdate(() => new Date()),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  deletedAt: timestamp("deleted_at", { withTimezone: true }),
});

export const note_noteLabel = pgTable(
  "note_noteLabel",
  {
    noteId: uuid("note_id").notNull(),
    labelId: uuid("label_id").notNull(),
  },
  (t) => [
    // Names match the constraints in the database, so drizzle-kit does not see renames.
    primaryKey({ name: "note_noteLabel_note_id_label_id_pk", columns: [t.noteId, t.labelId] }),
    foreignKey({
      name: "note_noteLabel_note_id_note_id_fk",
      columns: [t.noteId],
      foreignColumns: [note.id],
    }).onDelete("cascade"),
    foreignKey({
      name: "note_noteLabel_label_id_noteLabel_id_fk",
      columns: [t.labelId],
      foreignColumns: [noteLabel.id],
    }).onDelete("cascade"),
  ],
);

export type Note = typeof note.$inferSelect & {
  labels: Array<
    typeof note_noteLabel.$inferSelect & {
      label: typeof noteLabel.$inferSelect;
    }
  >;
};
export type Label = typeof noteLabel.$inferSelect;
export type Todo = typeof todo.$inferSelect;
