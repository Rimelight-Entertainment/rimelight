import { defineAction, ActionError } from "astro:actions"
import { z } from "astro/zod"
import { db } from "@/db"
import { note, noteLabel, note_noteLabel } from "@/db/schema/auth"
import { and, desc, eq, asc, isNotNull, isNull, inArray } from "drizzle-orm"

function checkAuth(context: any) {
  const user = context.locals.user;
  if (!user) {
    throw new ActionError({
      code: "UNAUTHORIZED",
      message: "Authentication required."
    });
  }
  return user;
}

export const notes = {
  getNotes: defineAction({
    input: z.object({
      archived: z.boolean().optional().default(false),
      trash: z.boolean().optional().default(false)
    }),
    handler: async (input, context) => {
      const user = checkAuth(context);
      const { archived, trash } = input;

      try {
        const filters = [eq(note.userId, user.id)];

        if (trash) {
          filters.push(isNotNull(note.deletedAt));
        } else if (archived) {
          filters.push(eq(note.isArchived, true));
          filters.push(isNull(note.deletedAt));
        } else {
          filters.push(eq(note.isArchived, false));
          filters.push(isNull(note.deletedAt));
        }

        const notesList = await db.query.note.findMany({
          where: and(...filters),
          with: {
            noteLabels: {
              with: {
                label: true
              }
            }
          },
          orderBy: [desc(note.createdAt)]
        });

        return notesList.map((n) => ({
          ...n,
          labels: n.noteLabels.map((nl) => nl.label)
        }));
      } catch (error) {
        console.error("Failed to fetch notes:", error);
        throw new ActionError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Could not fetch notes."
        });
      }
    }
  }),

  createNote: defineAction({
    input: z.object({
      title: z.string().optional(),
      content: z.string().optional(),
      isPinned: z.boolean().optional(),
      isArchived: z.boolean().optional(),
      labels: z.array(z.string()).optional()
    }),
    handler: async (input, context) => {
      const user = checkAuth(context);
      const { labels, ...noteData } = input;

      const [newNote] = await db
        .insert(note)
        .values({
          userId: user.id,
          ...noteData
        })
        .returning();

      if (!newNote) {
        throw new ActionError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to create note record."
        });
      }

      if (labels && labels.length > 0) {
        try {
          await db.insert(note_noteLabel).values(
            labels.map((labelId) => ({
              noteId: newNote.id,
              labelId
            }))
          );
        } catch (error) {
          await db.delete(note).where(eq(note.id, newNote.id));
          throw new ActionError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to assign labels. Note creation rolled back."
          });
        }
      }

      const noteWithLabels = await db.query.note.findFirst({
        where: eq(note.id, newNote.id),
        with: {
          noteLabels: {
            with: {
              label: true
            }
          }
        }
      });

      if (!noteWithLabels) {
        throw new ActionError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to retrieve created note."
        });
      }

      return {
        ...noteWithLabels,
        labels: noteWithLabels.noteLabels.map((nl) => nl.label) || []
      };
    }
  }),

  updateNote: defineAction({
    input: z.object({
      id: z.string(),
      title: z.string().optional(),
      content: z.string().optional(),
      isPinned: z.boolean().optional(),
      isArchived: z.boolean().optional(),
      labels: z.array(z.string()).optional()
    }),
    handler: async (input, context) => {
      const user = checkAuth(context);
      const { id, labels, ...noteData } = input;

      const [updatedNote] = await db
        .update(note)
        .set(noteData)
        .where(and(eq(note.id, id), eq(note.userId, user.id)))
        .returning();

      if (!updatedNote) {
        throw new ActionError({
          code: "NOT_FOUND",
          message: "Note not found."
        });
      }

      if (labels) {
        const uniqueLabelIds = [...new Set(labels)];
        let validLabelIds: string[] = [];

        if (uniqueLabelIds.length > 0) {
          const validLabels = await db.query.noteLabel.findMany({
            where: and(eq(noteLabel.userId, user.id), inArray(noteLabel.id, uniqueLabelIds)),
            columns: { id: true }
          });
          validLabelIds = validLabels.map((l) => l.id);
        }

        await db.delete(note_noteLabel).where(eq(note_noteLabel.noteId, id));

        if (validLabelIds.length > 0) {
          await db.insert(note_noteLabel).values(
            validLabelIds.map((labelId) => ({
              noteId: id,
              labelId
            }))
          );
        }
      }

      const noteWithLabels = await db.query.note.findFirst({
        where: eq(note.id, id),
        with: {
          noteLabels: {
            with: {
              label: true
            }
          }
        }
      });

      if (!noteWithLabels) {
        throw new ActionError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to retrieve updated note."
        });
      }

      return {
        ...noteWithLabels,
        labels: noteWithLabels.noteLabels.map((nl) => nl.label)
      };
    }
  }),

  deleteNote: defineAction({
    input: z.object({
      id: z.string(),
      permanent: z.boolean().optional().default(false)
    }),
    handler: async (input, context) => {
      const user = checkAuth(context);
      const { id, permanent } = input;

      if (permanent) {
        const [hardDeletedNote] = await db
          .delete(note)
          .where(and(eq(note.id, id), eq(note.userId, user.id)))
          .returning();

        if (!hardDeletedNote) {
          throw new ActionError({
            code: "NOT_FOUND",
            message: "Note not found."
          });
        }
        return hardDeletedNote;
      }

      const [softDeletedNote] = await db
        .update(note)
        .set({
          deletedAt: new Date(),
          isPinned: false
        })
        .where(and(eq(note.id, id), eq(note.userId, user.id)))
        .returning();

      if (!softDeletedNote) {
        throw new ActionError({
          code: "NOT_FOUND",
          message: "Note not found."
        });
      }

      return softDeletedNote;
    }
  }),

  batchAction: defineAction({
    input: z.object({
      ids: z.array(z.string()).min(1),
      action: z.enum(["delete", "archive", "unarchive", "pin", "unpin", "restore", "hard-delete"])
    }),
    handler: async (input, context) => {
      const user = checkAuth(context);
      const { ids, action } = input;

      if (action === "delete") {
        return await db
          .update(note)
          .set({
            deletedAt: new Date(),
            isPinned: false
          })
          .where(and(inArray(note.id, ids), eq(note.userId, user.id)))
          .returning();
      }

      if (action === "hard-delete") {
        return await db
          .delete(note)
          .where(and(inArray(note.id, ids), eq(note.userId, user.id)))
          .returning();
      }

      let updateData = {};
      switch (action) {
        case "archive":
          updateData = { isArchived: true, isPinned: false };
          break;
        case "unarchive":
          updateData = { isArchived: false };
          break;
        case "pin":
          updateData = { isPinned: true, isArchived: false };
          break;
        case "unpin":
          updateData = { isPinned: false };
          break;
        case "restore":
          updateData = { deletedAt: null, isArchived: false, isPinned: false };
          break;
      }

      return await db
        .update(note)
        .set(updateData)
        .where(and(inArray(note.id, ids), eq(note.userId, user.id)))
        .returning();
    }
  }),

  getTrash: defineAction({
    handler: async (_input, context) => {
      const user = checkAuth(context);

      const trashNotes = await db.query.note.findMany({
        where: and(eq(note.userId, user.id), isNotNull(note.deletedAt)),
        orderBy: [desc(note.deletedAt)],
        with: {
          noteLabels: {
            with: {
              label: true
            }
          }
        }
      });

      return trashNotes.map((n) => ({
        ...n,
        labels: n.noteLabels.map((nl) => nl.label)
      }));
    }
  }),

  getLabels: defineAction({
    handler: async (_input, context) => {
      const user = checkAuth(context);

      return db.query.noteLabel.findMany({
        where: eq(noteLabel.userId, user.id),
        orderBy: [asc(noteLabel.name)]
      });
    }
  }),

  createLabel: defineAction({
    input: z.object({
      name: z.string().min(1)
    }),
    handler: async (input, context) => {
      const user = checkAuth(context);
      const { name } = input;

      const [newLabel] = await db
        .insert(noteLabel)
        .values({
          userId: user.id,
          name
        })
        .returning();

      return newLabel;
    }
  }),

  deleteLabel: defineAction({
    input: z.object({
      id: z.string()
    }),
    handler: async (input, context) => {
      const user = checkAuth(context);
      const { id } = input;

      const [deletedLabel] = await db
        .delete(noteLabel)
        .where(and(eq(noteLabel.id, id), eq(noteLabel.userId, user.id)))
        .returning();

      if (!deletedLabel) {
        throw new ActionError({
          code: "NOT_FOUND",
          message: "Label not found."
        });
      }

      return deletedLabel;
    }
  })
}
