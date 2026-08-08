import { relations } from "drizzle-orm"
import { boolean, pgTable, primaryKey, text, timestamp, uuid } from "drizzle-orm/pg-core"

export * from "@rimelight/auth/schema/drizzle"
import { user } from "@rimelight/auth/schema/drizzle"

// ============================================================================
// Note & Todo Tables (rimelight.com app feature)
// ============================================================================

export const todo = pgTable("todo", {
  id: uuid("id").defaultRandom().notNull().primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  description: text("description"),
  completed: boolean("completed").default(false).notNull(),
  completedAt: timestamp("completed_at"),
  isArchived: boolean("is_archived").default(false).notNull(),
  updatedAt: timestamp("updated_at", {
    withTimezone: true
  }).$onUpdate(() => new Date()),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  deletedAt: timestamp("deleted_at", { withTimezone: true })
})

export const note = pgTable("note", {
  id: uuid("id").defaultRandom().notNull().primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  title: text("title"),
  content: text("content"),
  isPinned: boolean("is_pinned").default(false).notNull(),
  isArchived: boolean("is_archived").default(false).notNull(),
  updatedAt: timestamp("updated_at", {
    withTimezone: true
  }).$onUpdate(() => new Date()),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  deletedAt: timestamp("deleted_at", { withTimezone: true })
})

export const noteLabel = pgTable("noteLabel", {
  id: uuid("id").defaultRandom().notNull().primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  updatedAt: timestamp("updated_at", {
    withTimezone: true
  }).$onUpdate(() => new Date()),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  deletedAt: timestamp("deleted_at", { withTimezone: true })
})

export const note_noteLabel = pgTable(
  "note_noteLabel",
  {
    noteId: uuid("note_id")
      .notNull()
      .references(() => note.id, { onDelete: "cascade" }),
    labelId: uuid("label_id")
      .notNull()
      .references(() => noteLabel.id, { onDelete: "cascade" })
  },
  (t) => [primaryKey({ columns: [t.noteId, t.labelId] })]
)

// ============================================================================
// Relations for Note & Todo
// ============================================================================

export const noteRelations = relations(note, ({ one, many }) => ({
  user: one(user, {
    fields: [note.userId],
    references: [user.id]
  }),
  noteLabels: many(note_noteLabel)
}))

export const noteLabelRelations = relations(noteLabel, ({ one, many }) => ({
  user: one(user, {
    fields: [noteLabel.userId],
    references: [user.id]
  }),
  noteLabels: many(note_noteLabel)
}))

export const note_noteLabelRelations = relations(note_noteLabel, ({ one }) => ({
  note: one(note, {
    fields: [note_noteLabel.noteId],
    references: [note.id]
  }),
  label: one(noteLabel, {
    fields: [note_noteLabel.labelId],
    references: [noteLabel.id]
  })
}))

export const todoRelations = relations(todo, ({ one }) => ({
  user: one(user, {
    fields: [todo.userId],
    references: [user.id]
  })
}))

// ============================================================================
// Type Exports for Note & Todo
// ============================================================================

export type Note = typeof note.$inferSelect & {
  labels: Array<
    typeof note_noteLabel.$inferSelect & {
      label: typeof noteLabel.$inferSelect
    }
  >
}
export type Label = typeof noteLabel.$inferSelect
export type Todo = typeof todo.$inferSelect
