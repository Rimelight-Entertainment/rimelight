import { defineAction, ActionError } from "astro:actions"
import { z } from "astro/zod"
import { db } from "#db"
import { todo } from "#db/schema/auth"
import { and, desc, eq } from "drizzle-orm"

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

export const todos = {
  getTodos: defineAction({
    input: z.object({
      archived: z.boolean().optional().default(false)
    }),
    handler: async (input, context) => {
      const user = checkAuth(context)
      const { archived } = input

      try {
        const filters = [eq(todo.userId, user.id), eq(todo.isArchived, archived)]

        return await db.query.todo.findMany({
          where: and(...filters),
          orderBy: [desc(todo.createdAt)]
        })
      } catch (error) {
        console.error("Failed to fetch todos:", error)
        throw new ActionError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Could not fetch todos."
        })
      }
    }
  }),

  getArchivedTodos: defineAction({
    handler: async (_input, context) => {
      const user = checkAuth(context)

      try {
        return await db.query.todo.findMany({
          where: and(eq(todo.userId, user.id), eq(todo.isArchived, true)),
          orderBy: [desc(todo.completedAt), desc(todo.createdAt)]
        })
      } catch (error) {
        console.error("Failed to fetch archived todos:", error)
        throw new ActionError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Could not fetch archived todos."
        })
      }
    }
  }),

  createTodo: defineAction({
    input: z.object({
      title: z.string().min(1),
      description: z.string().optional()
    }),
    handler: async (input, context) => {
      const user = checkAuth(context)
      const { title, description } = input

      try {
        const newTodo = await db
          .insert(todo)
          .values({
            userId: user.id,
            title,
            description,
            completed: false,
            isArchived: false
          })
          .returning()

        return newTodo[0]
      } catch (error) {
        console.error("Failed to create todo:", error)
        throw new ActionError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to create todo."
        })
      }
    }
  }),

  updateTodo: defineAction({
    input: z.object({
      id: z.string(),
      title: z.string().optional(),
      completed: z.boolean().optional(),
      completedAt: z.string().nullable().optional(),
      isArchived: z.boolean().optional()
    }),
    handler: async (input, context) => {
      const user = checkAuth(context)
      const { id, title, completed, completedAt, isArchived } = input

      try {
        const updatedTodo = await db
          .update(todo)
          .set({
            ...(title !== undefined && { title }),
            ...(completed !== undefined && { completed }),
            ...(completedAt !== undefined && {
              completedAt: completedAt ? new Date(completedAt) : null
            }),
            ...(isArchived !== undefined && { isArchived })
          })
          .where(and(eq(todo.id, id), eq(todo.userId, user.id)))
          .returning()

        if (!updatedTodo.length) {
          throw new ActionError({
            code: "NOT_FOUND",
            message: "Todo not found."
          })
        }

        return updatedTodo[0]
      } catch (error) {
        console.error("Failed to update todo:", error)
        throw new ActionError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to update todo."
        })
      }
    }
  }),

  deleteTodo: defineAction({
    input: z.object({
      id: z.string()
    }),
    handler: async (input, context) => {
      const user = checkAuth(context)
      const { id } = input

      try {
        const deleted = await db
          .delete(todo)
          .where(and(eq(todo.id, id), eq(todo.userId, user.id)))
          .returning()

        if (!deleted.length) {
          throw new ActionError({
            code: "NOT_FOUND",
            message: "Todo not found."
          })
        }

        return { success: true }
      } catch (error) {
        console.error("Failed to delete todo:", error)
        throw new ActionError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to delete todo."
        })
      }
    }
  }),

  clearCompleted: defineAction({
    handler: async (_input, context) => {
      const user = checkAuth(context)

      try {
        await db.delete(todo).where(and(eq(todo.userId, user.id), eq(todo.completed, true)))
        return { success: true }
      } catch (error) {
        console.error("Failed to clear completed todos:", error)
        throw new ActionError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to clear completed todos."
        })
      }
    }
  })
}
