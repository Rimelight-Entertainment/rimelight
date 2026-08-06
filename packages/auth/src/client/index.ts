import { createAuthClient } from "better-auth/client"

export type RimelightAuthClientOptions = Parameters<typeof createAuthClient>[0]

export function createRimelightAuthClient(options?: RimelightAuthClientOptions) {
  return createAuthClient(options)
}
