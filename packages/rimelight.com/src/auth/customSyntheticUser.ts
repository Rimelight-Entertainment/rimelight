// src/auth/customSyntheticUser.ts

export interface CoreFields {
  name: string
  email: string
  emailVerified: boolean | null
  image: string | null
  createdAt: Date
  updatedAt: Date
}

export interface SyntheticUserData {
  coreFields: CoreFields
  additionalFields: Record<string, unknown>
  id: string
}

/**
 * Builds a synthetic user object for sign-up enumeration protection. Matches the exact field order
 * and defaults of a real database record.
 */
export function createSyntheticUser({ coreFields, additionalFields, id }: SyntheticUserData) {
  return {
    ...coreFields,
    role: "user",
    banned: false,
    banReason: null,
    banExpires: null,
    tag: (additionalFields.tag as string | undefined) ?? "0000",
    firstName: (additionalFields.firstName as string | undefined) ?? "",
    lastName: (additionalFields.lastName as string | undefined) ?? "",
    availability: (additionalFields.availability as string | undefined) ?? "available",
    status: (additionalFields.status as string | undefined) ?? "",
    publicKey: additionalFields.publicKey as string | undefined,
    id
  }
}
