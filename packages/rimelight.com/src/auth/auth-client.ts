import { createRimelightAuthClient } from "@rimelight/auth/client"
import { adminClient, organizationClient } from "better-auth/client/plugins"
import { ac, owner, admin, member, user } from "@/auth/permissions"

export const authClient = createRimelightAuthClient({
  plugins: [
    adminClient(),
    organizationClient({
      ac,
      roles: {
        owner,
        admin,
        member,
        user
      }
    })
  ]
})
