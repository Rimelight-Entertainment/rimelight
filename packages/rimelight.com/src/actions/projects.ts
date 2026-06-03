import { defineAction, ActionError } from "astro:actions"
import { z } from "astro/zod"
import { db } from "@/db"
import { board } from "@/db/schema/projects/boards"
import { list } from "@/db/schema/projects/lists"
import { card } from "@/db/schema/projects/cards"
import { customFieldDefinition } from "@/db/schema/projects/custom_fields"
import { and, asc, desc, eq, isNull } from "drizzle-orm"

function checkAuth(context: any) {
  const user = context.locals.user
  if (!user) {
    throw new ActionError({
      code: "UNAUTHORIZED",
      message: "Authentication required."
    })
  }
  return user
}

export const projects = {
  getBoards: defineAction({
    handler: async (_input, context) => {
      const user = checkAuth(context)
      try {
        return await db.query.board.findMany({
          where: and(
            eq(board.userId, user.id),
            eq(board.isArchived, false),
            isNull(board.deletedAt)
          ),
          orderBy: [desc(board.createdAt)]
        })
      } catch (error) {
        console.error("Failed to fetch boards:", error)
        throw new ActionError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Could not fetch boards."
        })
      }
    }
  }),

  getBoardById: defineAction({
    input: z.object({
      id: z.string()
    }),
    handler: async (input, context) => {
      const user = checkAuth(context)
      try {
        const result = await db.query.board.findFirst({
          where: and(eq(board.id, input.id), eq(board.userId, user.id), isNull(board.deletedAt)),
          with: {
            lists: {
              where: isNull(list.deletedAt),
              orderBy: [asc(list.order)],
              with: {
                cards: {
                  where: isNull(card.deletedAt),
                  orderBy: [asc(card.order)]
                }
              }
            },
            customFields: {
              where: isNull(customFieldDefinition.deletedAt)
            }
          }
        })

        if (!result) {
          throw new ActionError({
            code: "NOT_FOUND",
            message: "Board not found"
          })
        }

        return result
      } catch (error: any) {
        console.error("Failed to fetch board:", error)
        throw new ActionError({
          code: error.code || "INTERNAL_SERVER_ERROR",
          message: error.message || "Could not fetch board."
        })
      }
    }
  }),

  createBoard: defineAction({
    input: z.object({
      title: z.string().min(1),
      description: z.string().optional()
    }),
    handler: async (input, context) => {
      const user = checkAuth(context)
      try {
        const [newBoard] = await db
          .insert(board)
          .values({
            userId: user.id,
            title: input.title,
            description: input.description,
            isArchived: false
          })
          .returning()

        return newBoard
      } catch (error) {
        console.error("Failed to create board:", error)
        throw new ActionError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Could not create board."
        })
      }
    }
  }),

  updateBoard: defineAction({
    input: z.object({
      id: z.string(),
      title: z.string().optional(),
      description: z.string().optional(),
      isArchived: z.boolean().optional()
    }),
    handler: async (input, context) => {
      const user = checkAuth(context)
      const { id, ...data } = input
      try {
        const [updatedBoard] = await db
          .update(board)
          .set(data)
          .where(and(eq(board.id, id), eq(board.userId, user.id)))
          .returning()

        if (!updatedBoard) {
          throw new ActionError({
            code: "NOT_FOUND",
            message: "Board not found."
          })
        }

        return updatedBoard
      } catch (error: any) {
        throw new ActionError({
          code: error.code || "INTERNAL_SERVER_ERROR",
          message: error.message || "Failed to update board."
        })
      }
    }
  }),

  deleteBoard: defineAction({
    input: z.object({
      id: z.string()
    }),
    handler: async (input, context) => {
      const user = checkAuth(context)
      try {
        const [deletedBoard] = await db
          .update(board)
          .set({ deletedAt: new Date() })
          .where(and(eq(board.id, input.id), eq(board.userId, user.id)))
          .returning()

        if (!deletedBoard) {
          throw new ActionError({
            code: "NOT_FOUND",
            message: "Board not found."
          })
        }

        return { success: true }
      } catch (error: any) {
        throw new ActionError({
          code: error.code || "INTERNAL_SERVER_ERROR",
          message: error.message || "Failed to delete board."
        })
      }
    }
  }),

  createList: defineAction({
    input: z.object({
      boardId: z.string(),
      title: z.string().min(1),
      order: z.number().optional().default(0)
    }),
    handler: async (input, context) => {
      checkAuth(context)
      try {
        const [newList] = await db
          .insert(list)
          .values({
            boardId: input.boardId,
            title: input.title,
            order: input.order
          })
          .returning()

        return newList
      } catch {
        throw new ActionError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Could not create list."
        })
      }
    }
  }),

  updateList: defineAction({
    input: z.object({
      id: z.string(),
      title: z.string().optional(),
      order: z.number().optional()
    }),
    handler: async (input, context) => {
      checkAuth(context)
      const { id, ...data } = input
      try {
        const [updatedList] = await db.update(list).set(data).where(eq(list.id, id)).returning()

        if (!updatedList) {
          throw new ActionError({
            code: "NOT_FOUND",
            message: "List not found."
          })
        }

        return updatedList
      } catch (error: any) {
        throw new ActionError({
          code: error.code || "INTERNAL_SERVER_ERROR",
          message: error.message || "Failed to update list."
        })
      }
    }
  }),

  deleteList: defineAction({
    input: z.object({
      id: z.string()
    }),
    handler: async (input, context) => {
      checkAuth(context)
      try {
        const [deletedList] = await db
          .update(list)
          .set({ deletedAt: new Date() })
          .where(eq(list.id, input.id))
          .returning()

        if (!deletedList) {
          throw new ActionError({
            code: "NOT_FOUND",
            message: "List not found."
          })
        }

        return { success: true }
      } catch (error: any) {
        throw new ActionError({
          code: error.code || "INTERNAL_SERVER_ERROR",
          message: error.message || "Failed to delete list."
        })
      }
    }
  }),

  createCard: defineAction({
    input: z.object({
      listId: z.string(),
      title: z.string().min(1),
      description: z.string().optional(),
      order: z.number().optional().default(0)
    }),
    handler: async (input, context) => {
      checkAuth(context)
      try {
        const [newCard] = await db
          .insert(card)
          .values({
            listId: input.listId,
            title: input.title,
            description: input.description,
            order: input.order,
            customFields: {}
          })
          .returning()

        return newCard
      } catch {
        throw new ActionError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Could not create card."
        })
      }
    }
  }),

  updateCard: defineAction({
    input: z.object({
      id: z.string(),
      title: z.string().optional(),
      description: z.string().optional(),
      order: z.number().optional(),
      dueDate: z.string().nullable().optional(),
      customFields: z.record(z.string(), z.any()).optional()
    }),
    handler: async (input, context) => {
      checkAuth(context)
      const { id, dueDate, ...data } = input
      try {
        const [updatedCard] = await db
          .update(card)
          .set({
            ...data,
            ...(dueDate !== undefined && {
              dueDate: dueDate ? new Date(dueDate) : null
            })
          })
          .where(eq(card.id, id))
          .returning()

        if (!updatedCard) {
          throw new ActionError({
            code: "NOT_FOUND",
            message: "Card not found."
          })
        }

        return updatedCard
      } catch (error: any) {
        throw new ActionError({
          code: error.code || "INTERNAL_SERVER_ERROR",
          message: error.message || "Failed to update card."
        })
      }
    }
  }),

  deleteCard: defineAction({
    input: z.object({
      id: z.string()
    }),
    handler: async (input, context) => {
      checkAuth(context)
      try {
        const [deletedCard] = await db
          .update(card)
          .set({ deletedAt: new Date() })
          .where(eq(card.id, input.id))
          .returning()

        if (!deletedCard) {
          throw new ActionError({
            code: "NOT_FOUND",
            message: "Card not found."
          })
        }

        return { success: true }
      } catch (error: unknown) {
        const message = error instanceof Error ? error.message : "Failed to delete card."
        throw new ActionError({
          code: "INTERNAL_SERVER_ERROR",
          message
        })
      }
    }
  }),

  createCustomField: defineAction({
    input: z.object({
      boardId: z.string(),
      name: z.string().min(1),
      type: z.enum(["TEXT", "NUMBER", "DATE", "SELECT", "CHECKBOX", "URL"]),
      options: z
        .array(
          z.object({
            label: z.string(),
            value: z.string(),
            color: z.string().optional()
          })
        )
        .optional()
        .default([])
    }),
    handler: async (input, context) => {
      checkAuth(context)
      try {
        const values: typeof customFieldDefinition.$inferInsert = {
          boardId: input.boardId,
          name: input.name,
          type: input.type,
          options: input.options.map((o) => ({
            label: o.label,
            value: o.value,
            ...(o.color ? { color: o.color } : {})
          }))
        }
        const [newField] = await db.insert(customFieldDefinition).values(values).returning()

        return newField
      } catch {
        throw new ActionError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Could not create custom field."
        })
      }
    }
  }),

  deleteCustomField: defineAction({
    input: z.object({
      id: z.string()
    }),
    handler: async (input, context) => {
      checkAuth(context)
      try {
        const [deletedField] = await db
          .update(customFieldDefinition)
          .set({ deletedAt: new Date() })
          .where(eq(customFieldDefinition.id, input.id))
          .returning()

        if (!deletedField) {
          throw new ActionError({
            code: "NOT_FOUND",
            message: "Custom field not found."
          })
        }

        return { success: true }
      } catch (error: any) {
        throw new ActionError({
          code: error.code || "INTERNAL_SERVER_ERROR",
          message: error.message || "Failed to delete custom field."
        })
      }
    }
  })
}
