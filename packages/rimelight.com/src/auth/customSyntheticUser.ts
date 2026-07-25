// src/auth/customSyntheticUser.ts

export interface CoreFields {
  name: string
  email: string
  emailVerified: boolean | null
  image: string | null
  createdAt: Date
  updatedAt: Date
}

export interface AdditionalFields {
  tag?: string
  firstName: string
  lastName: string
  role?: string
  availability?: string
  status?: string
  publicKey?: string
}

export interface SyntheticUserData {
  coreFields: CoreFields
  additionalFields: AdditionalFields
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
    tag: additionalFields.tag ?? "0000",
    firstName: additionalFields.firstName ?? "",
    lastName: additionalFields.lastName ?? "",
    availability: additionalFields.availability ?? "available",
    status: additionalFields.status ?? "",
    publicKey: additionalFields.publicKey,
    id
  }
}
