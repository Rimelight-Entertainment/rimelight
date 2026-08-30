import { createRimelightAuth } from "@rimelight/auth/server"
import { drizzleAdapter } from "better-auth/adapters/drizzle"
import { db } from "@/db"
import { admin as adminPlugin, organization as organizationPlugin } from "better-auth/plugins"
import { ac, owner, admin, member, user as userRole } from "@/auth/permissions"
import { cmsStatements } from "@rimelight/cms"
import { user as userTable } from "@/db/schema/auth"
import { sendVerificationEmail } from "./email/verification"
import { sendPasswordResetEmail } from "./email/password-reset"
import { sendExistingUserSignUpNotification } from "./email/notifications"

export const auth = createRimelightAuth({
  database: drizzleAdapter(db, {
    provider: "sqlite"
  }),
  db,
  userTable,
  emailHandlers: {
    sendVerificationEmail,
    sendPasswordResetEmail,
    sendExistingUserSignUpNotification: async (existingUser: any) => {
      await sendExistingUserSignUpNotification({ user: { email: existingUser.email } })
    }
  },
  statements: cmsStatements,
  plugins: [
    adminPlugin(),
    organizationPlugin({
      teams: {
        enabled: true
      },
      ac,
      roles: {
        owner,
        admin,
        member,
        user: userRole
      }
    })
  ]
})
