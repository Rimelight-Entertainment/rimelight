import { defineAction, ActionError } from "astro:actions"
import { z } from "astro/zod"
import { db } from "@/db"
import {
  user as userTable,
  member as memberTable,
  organization as organizationTable,
  team as teamTable,
  teamMember as teamMemberTable,
  session as sessionTable
} from "@/db/schema/auth"
import { desc, eq, count, or, ilike, inArray } from "drizzle-orm"

function checkAdmin(context: any) {
  const user = context.locals.user
  const isAuthorized = user?.role === "owner" || user?.role === "admin"
  if (!isAuthorized) {
    throw new ActionError({
      code: "UNAUTHORIZED",
      message: "Admin or owner authorization required."
    })
  }
  return user
}

export const admin = {
  getUsers: defineAction({
    input: z.object({
      limit: z.number().optional().default(50),
      offset: z.number().optional().default(0),
      search: z.string().optional()
    }),
    handler: async (input, context) => {
      checkAdmin(context)
      const { limit, offset, search } = input

      const filters = search
        ? or(ilike(userTable.name, `%${search}%`), ilike(userTable.email, `%${search}%`))
        : undefined

      try {
        const users = await db
          .select()
          .from(userTable)
          .where(filters)
          .orderBy(desc(userTable.createdAt))
          .limit(limit)
          .offset(offset)

        if (users.length === 0) {
          return { users: [], total: 0 }
        }

        const userIds = users.map((u) => u.id)

        const [allMemberships, allTeamMemberships] = await Promise.all([
          db
            .select({
              userId: memberTable.userId,
              memberId: memberTable.id,
              role: memberTable.role,
              org: {
                id: organizationTable.id,
                name: organizationTable.name,
                slug: organizationTable.slug,
                logo: organizationTable.logo
              }
            })
            .from(memberTable)
            .innerJoin(organizationTable, eq(memberTable.organizationId, organizationTable.id))
            .where(inArray(memberTable.userId, userIds)),

          db
            .select({
              userId: teamMemberTable.userId,
              tm: {
                id: teamTable.id,
                name: teamTable.name,
                organizationId: teamTable.organizationId
              }
            })
            .from(teamMemberTable)
            .innerJoin(teamTable, eq(teamMemberTable.teamId, teamTable.id))
            .where(inArray(teamMemberTable.userId, userIds))
        ])

        return {
          users: users.map((u) => ({
            ...u,
            organizations: allMemberships
              .filter((m) => m.userId === u.id)
              .map((m) => ({
                ...m.org,
                memberId: m.memberId,
                role: m.role
              })),
            teams: allTeamMemberships.filter((m) => m.userId === u.id).map((m) => m.tm)
          }))
        }
      } catch (error) {
        console.error("Failed to fetch users:", error)
        throw new ActionError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to list users."
        })
      }
    }
  }),

  getUsersCount: defineAction({
    handler: async (_input, context) => {
      checkAdmin(context)
      const res = await db.select({ count: count() }).from(userTable)
      return res[0]?.count ?? 0
    }
  }),

  getOrganizations: defineAction({
    input: z.object({
      limit: z.number().optional().default(50),
      offset: z.number().optional().default(0)
    }),
    handler: async (input, context) => {
      checkAdmin(context)
      return db
        .select()
        .from(organizationTable)
        .orderBy(desc(organizationTable.createdAt))
        .limit(input.limit)
        .offset(input.offset)
    }
  }),

  getOrganizationsCount: defineAction({
    handler: async (_input, context) => {
      checkAdmin(context)
      const res = await db.select({ count: count() }).from(organizationTable)
      return res[0]?.count ?? 0
    }
  }),

  getSessions: defineAction({
    input: z.object({
      limit: z.number().optional().default(50),
      offset: z.number().optional().default(0)
    }),
    handler: async (input, context) => {
      checkAdmin(context)
      return db
        .select()
        .from(sessionTable)
        .orderBy(desc(sessionTable.createdAt))
        .limit(input.limit)
        .offset(input.offset)
    }
  }),

  getSessionsCount: defineAction({
    handler: async (_input, context) => {
      checkAdmin(context)
      const res = await db.select({ count: count() }).from(sessionTable)
      return res[0]?.count ?? 0
    }
  }),

  getTeams: defineAction({
    input: z.object({
      limit: z.number().optional().default(50),
      offset: z.number().optional().default(0)
    }),
    handler: async (input, context) => {
      checkAdmin(context)
      return db
        .select()
        .from(teamTable)
        .orderBy(desc(teamTable.createdAt))
        .limit(input.limit)
        .offset(input.offset)
    }
  }),

  getTeamsCount: defineAction({
    handler: async (_input, context) => {
      checkAdmin(context)
      const res = await db.select({ count: count() }).from(teamTable)
      return res[0]?.count ?? 0
    }
  })
}
