import { relations } from "drizzle-orm"
import {
  type AnyPgColumn,
  pgTable,
  text,
  uniqueIndex,
  index,
  boolean,
  timestamp,
  integer
} from "drizzle-orm/pg-core"
import type { UserAvailability } from "@/types/user"

// ============================================================================
// Core Auth Tables
// ============================================================================

export const user = pgTable(
  "user",
  {
    id: text("id")
      .$defaultFn(() => crypto.randomUUID())
      .notNull()
      .primaryKey(),
    name: text("name").notNull(),
    tag: text("tag").notNull().default("0000"),
    email: text("email").notNull().unique(),
    emailVerified: boolean("email_verified").default(false).notNull(),
    image: text("image"),
    firstName: text("first_name").notNull(),
    lastName: text("last_name").notNull(),
    availability: text("availability").$type<UserAvailability>().notNull().default("available"),
    status: text("status"),
    updatedAt: timestamp("updated_at").$onUpdate(() => new Date()),
    createdAt: timestamp("created_at")
      .$defaultFn(() => new Date())
      .notNull(),
    deletedAt: timestamp("deleted_at"),
    role: text("role"),
    banned: boolean("banned").default(false),
    banReason: text("ban_reason"),
    banExpires: timestamp("ban_expires"),
    publicKey: text("public_key"),
    encryptedPrivateKey: text("encrypted_private_key"),
    derivationSalt: text("derivation_salt")
  },
  (table) => [uniqueIndex("user_name_tag_unique").on(table.name, table.tag)]
)

export const session = pgTable(
  "session",
  {
    id: text("id")
      .$defaultFn(() => crypto.randomUUID())
      .notNull()
      .primaryKey(),
    expiresAt: timestamp("expires_at").notNull(),
    token: text("token").notNull().unique(),
    updatedAt: timestamp("updated_at").$onUpdate(() => new Date()),
    createdAt: timestamp("created_at")
      .$defaultFn(() => new Date())
      .notNull(),
    deletedAt: timestamp("deleted_at"),
    ipAddress: text("ip_address"),
    userAgent: text("user_agent"),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    impersonatedBy: text("impersonated_by"),
    activeOrganizationId: text("active_organization_id"),
    activeTeamId: text("active_team_id")
  },
  (table) => [index("session_userId_idx").on(table.userId)]
)

export const account = pgTable(
  "account",
  {
    id: text("id")
      .$defaultFn(() => crypto.randomUUID())
      .notNull()
      .primaryKey(),
    accountId: text("account_id").notNull(),
    providerId: text("provider_id").notNull(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    accessToken: text("access_token"),
    refreshToken: text("refresh_token"),
    idToken: text("id_token"),
    accessTokenExpiresAt: timestamp("access_token_expires_at"),
    refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
    scope: text("scope"),
    password: text("password"),
    updatedAt: timestamp("updated_at").$onUpdate(() => new Date()),
    createdAt: timestamp("created_at")
      .$defaultFn(() => new Date())
      .notNull(),
    deletedAt: timestamp("deleted_at")
  },
  (table) => [index("account_userId_idx").on(table.userId)]
)

export const verification = pgTable(
  "verification",
  {
    id: text("id")
      .$defaultFn(() => crypto.randomUUID())
      .notNull()
      .primaryKey(),
    identifier: text("identifier").notNull(),
    value: text("value").notNull(),
    expiresAt: timestamp("expires_at").notNull(),
    updatedAt: timestamp("updated_at").$onUpdate(() => new Date()),
    createdAt: timestamp("created_at")
      .$defaultFn(() => new Date())
      .notNull(),
    deletedAt: timestamp("deleted_at")
  },
  (table) => [index("verification_identifier_idx").on(table.identifier)]
)

export const rateLimit = pgTable("rate_limit", {
  id: text("id")
    .$defaultFn(() => crypto.randomUUID())
    .notNull()
    .primaryKey(),
  key: text("key"),
  count: integer("count"),
  lastRequest: integer("last_request")
})

// ============================================================================
// Organization Tables
// ============================================================================

export const organization = pgTable("organization", {
  id: text("id")
    .$defaultFn(() => crypto.randomUUID())
    .notNull()
    .primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  logo: text("logo"),
  updatedAt: timestamp("updated_at").$onUpdate(() => new Date()),
  createdAt: timestamp("created_at")
    .$defaultFn(() => new Date())
    .notNull(),
  deletedAt: timestamp("deleted_at"),
  metadata: text("metadata")
})

export const member = pgTable(
  "member",
  {
    id: text("id")
      .$defaultFn(() => crypto.randomUUID())
      .notNull()
      .primaryKey(),
    organizationId: text("organization_id")
      .notNull()
      .references(() => organization.id, { onDelete: "cascade" }),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    role: text("role").default("member").notNull(),
    updatedAt: timestamp("updated_at").$onUpdate(() => new Date()),
    createdAt: timestamp("created_at")
      .$defaultFn(() => new Date())
      .notNull(),
    deletedAt: timestamp("deleted_at")
  },
  (table) => [
    index("member_organizationId_idx").on(table.organizationId),
    index("member_userId_idx").on(table.userId)
  ]
)

export const invitation = pgTable(
  "invitation",
  {
    id: text("id")
      .$defaultFn(() => crypto.randomUUID())
      .notNull()
      .primaryKey(),
    organizationId: text("organization_id")
      .notNull()
      .references(() => organization.id, { onDelete: "cascade" }),
    email: text("email").notNull(),
    role: text("role"),
    status: text("status").default("pending").notNull(),
    expiresAt: timestamp("expires_at").notNull(),
    updatedAt: timestamp("updated_at").$onUpdate(() => new Date()),
    createdAt: timestamp("created_at")
      .$defaultFn(() => new Date())
      .notNull(),
    deletedAt: timestamp("deleted_at"),
    inviterId: text("inviter_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" })
  },
  (table) => [
    index("invitation_organizationId_idx").on(table.organizationId),
    index("invitation_email_idx").on(table.email)
  ]
)

export const team = pgTable(
  "team",
  {
    id: text("id")
      .$defaultFn(() => crypto.randomUUID())
      .notNull()
      .primaryKey(),
    name: text("name").notNull(),
    organizationId: text("organization_id")
      .notNull()
      .references(() => organization.id, { onDelete: "cascade" }),
    parentId: text("parent_id").references((): AnyPgColumn => team.id, {
      onDelete: "cascade"
    }),
    updatedAt: timestamp("updated_at").$onUpdate(() => new Date()),
    createdAt: timestamp("created_at")
      .$defaultFn(() => new Date())
      .notNull(),
    deletedAt: timestamp("deleted_at"),
    metadata: text("metadata")
  },
  (table) => [index("team_organizationId_idx").on(table.organizationId)]
)

export const teamMember = pgTable("team_member", {
  id: text("id")
    .$defaultFn(() => crypto.randomUUID())
    .notNull()
    .primaryKey(),
  teamId: text("team_id")
    .notNull()
    .references(() => team.id, { onDelete: "cascade" }),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  role: text("role").notNull(),
  updatedAt: timestamp("updated_at").$onUpdate(() => new Date()),
  createdAt: timestamp("created_at")
    .$defaultFn(() => new Date())
    .notNull(),
  deletedAt: timestamp("deleted_at")
})

// ============================================================================
// Relations
// ============================================================================

export const userRelations = relations(user, ({ many }) => ({
  sessions: many(session),
  accounts: many(account),
  members: many(member),
  invitations: many(invitation),
  teamMembers: many(teamMember)
}))

export const sessionRelations = relations(session, ({ one }) => ({
  user: one(user, {
    fields: [session.userId],
    references: [user.id]
  })
}))

export const accountRelations = relations(account, ({ one }) => ({
  user: one(user, {
    fields: [account.userId],
    references: [user.id]
  })
}))

export const organizationRelations = relations(organization, ({ many }) => ({
  members: many(member),
  invitations: many(invitation),
  teams: many(team)
}))

export const memberRelations = relations(member, ({ one }) => ({
  organization: one(organization, {
    fields: [member.organizationId],
    references: [organization.id]
  }),
  user: one(user, {
    fields: [member.userId],
    references: [user.id]
  })
}))

export const invitationRelations = relations(invitation, ({ one }) => ({
  organization: one(organization, {
    fields: [invitation.organizationId],
    references: [organization.id]
  }),
  user: one(user, {
    fields: [invitation.inviterId],
    references: [user.id]
  })
}))

export const teamRelations = relations(team, ({ one, many }) => ({
  organization: one(organization, {
    fields: [team.organizationId],
    references: [organization.id]
  }),
  parentTeam: one(team, {
    fields: [team.parentId],
    references: [team.id],
    relationName: "subteams"
  }),
  subteams: many(team, { relationName: "subteams" }),
  members: many(teamMember)
}))

export const teamMemberRelations = relations(teamMember, ({ one }) => ({
  team: one(team, {
    fields: [teamMember.teamId],
    references: [team.id]
  }),
  user: one(user, {
    fields: [teamMember.userId],
    references: [user.id]
  })
}))

// ============================================================================
// Roles & Permissions Tables
// ============================================================================

export const role = pgTable("role", {
  id: text("id")
    .$defaultFn(() => crypto.randomUUID())
    .notNull()
    .primaryKey(),
  name: text("name").notNull().unique(),
  displayName: text("display_name").notNull(),
  description: text("description"),
  permissions: text("permissions").$type<string[]>().notNull().default("[]"),
  updatedAt: timestamp("updated_at").$onUpdate(() => new Date()),
  createdAt: timestamp("created_at")
    .$defaultFn(() => new Date())
    .notNull(),
  deletedAt: timestamp("deleted_at")
})

export type User = typeof user.$inferSelect
export type Session = typeof session.$inferSelect
export type Account = typeof account.$inferSelect
export type Verification = typeof verification.$inferSelect
export type Organization = typeof organization.$inferSelect
export type Member = typeof member.$inferSelect
export type Invitation = typeof invitation.$inferSelect
export type Team = typeof team.$inferSelect
export type TeamMember = typeof teamMember.$inferSelect
export type Role = typeof role.$inferSelect

