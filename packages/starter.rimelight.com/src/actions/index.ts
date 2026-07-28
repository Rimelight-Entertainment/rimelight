import { auth } from "./auth"
import { contactActions } from "./contact"

export const server = {
  auth,
  contact: contactActions.contact,
  upload: contactActions.upload
}
