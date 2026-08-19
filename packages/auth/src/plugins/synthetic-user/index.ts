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

export function createSyntheticUser({ coreFields, additionalFields, id }: SyntheticUserData) {
  return {
    ...coreFields,
    role: "user",
    banned: false,
    banReason: null,
    banExpires: null,
    tag: typeof additionalFields.tag === "string" ? additionalFields.tag : "0000",
    firstName: typeof additionalFields.firstName === "string" ? additionalFields.firstName : "",
    lastName: typeof additionalFields.lastName === "string" ? additionalFields.lastName : "",
    availability:
      typeof additionalFields.availability === "string"
        ? additionalFields.availability
        : "available",
    status: typeof additionalFields.status === "string" ? additionalFields.status : "",
    publicKey:
      typeof additionalFields.publicKey === "string" ? additionalFields.publicKey : undefined,
    id
  }
}

export function createSyntheticUserWrapper(userData: any) {
  return createSyntheticUser({
    coreFields: {
      name: userData.name,
      email: userData.email,
      emailVerified: userData.emailVerified,
      image: userData.image,
      createdAt: userData.createdAt,
      updatedAt: userData.createdAt
    },
    additionalFields: userData,
    id: crypto.randomUUID()
  })
}
