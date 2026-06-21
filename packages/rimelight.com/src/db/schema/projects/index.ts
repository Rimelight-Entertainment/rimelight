import { relations } from "drizzle-orm"
import { boolean, integer, jsonb, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core"
import { user } from "../auth"

// --- Boards ---
export const board = pgTable("kanban_board", {
  id: uuid("id").defaultRandom().notNull().primaryKey(),
  userId: uuid("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  description: text("description"),
  isArchived: boolean("is_archived").default(false).notNull(),
  updatedAt: timestamp("updated_at", {
    withTimezone: true
  }).$onUpdate(() => new Date()),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  deletedAt: timestamp("deleted_at", { withTimezone: true })
})

export type Board = typeof board.$inferSelect

export const boardRelations = relations(board, ({ many }) => ({
  lists: many(list),
  customFields: many(customFieldDefinition)
}))

// --- Custom Fields ---
export const customFieldDefinition = pgTable("kanban_custom_field", {
  id: uuid("id").defaultRandom().notNull().primaryKey(),
  boardId: uuid("board_id")
    .notNull()
    .references(() => board.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  type: text("type", { enum: ["TEXT", "NUMBER", "DATE", "SELECT", "CHECKBOX", "URL"] }).notNull(),
  options: jsonb("options").$type<{ label: string; value: string; color?: string }[]>().default([]),
  updatedAt: timestamp("updated_at", {
    withTimezone: true
  }).$onUpdate(() => new Date()),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  deletedAt: timestamp("deleted_at", { withTimezone: true })
})

export type CustomFieldDefinition = typeof customFieldDefinition.$inferSelect

export const customFieldDefinitionRelations = relations(customFieldDefinition, ({ one }) => ({
  board: one(board, {
    fields: [customFieldDefinition.boardId],
    references: [board.id]
  })
}))

// --- Lists ---
export const list = pgTable("kanban_list", {
  id: uuid("id").defaultRandom().notNull().primaryKey(),
  boardId: uuid("board_id")
    .notNull()
    .references(() => board.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  order: integer("order").notNull().default(0),
  updatedAt: timestamp("updated_at", {
    withTimezone: true
  }).$onUpdate(() => new Date()),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  deletedAt: timestamp("deleted_at", { withTimezone: true })
})

export type List = typeof list.$inferSelect

export const listRelations = relations(list, ({ one, many }) => ({
  board: one(board, {
    fields: [list.boardId],
    references: [board.id]
  }),
  cards: many(card)
}))

// --- Cards ---
export const card = pgTable("kanban_card", {
  id: uuid("id").defaultRandom().notNull().primaryKey(),
  listId: uuid("list_id")
    .notNull()
    .references(() => list.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  description: text("description"),
  order: integer("order").notNull().default(0),
  dueDate: timestamp("due_date"),
  customFields: jsonb("custom_fields").$type<Record<string, any>>().default({}),
  updatedAt: timestamp("updated_at", {
    withTimezone: true
  }).$onUpdate(() => new Date()),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  deletedAt: timestamp("deleted_at", { withTimezone: true })
})

export type Card = typeof card.$inferSelect

export const cardRelations = relations(card, ({ one }) => ({
  list: one(list, {
    fields: [card.listId],
    references: [list.id]
  })
}))
