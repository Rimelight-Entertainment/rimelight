import { notes } from "./notes"
import { todos } from "./todos"
import { pageActions as pages } from "./pages"
import { projects } from "./projects"
import { admin } from "./admin"
import { mails } from "./mails"
import { notifications } from "./notifications"
import { assets } from "./assets"
import { signUp } from "./auth/signUp"
import { signIn } from "./auth/signIn"
import { signOut } from "./auth/signOut"

export const server = {
  notes,
  todos,
  pages,
  projects,
  admin,
  mails,
  notifications,
  assets,
  signUp,
  signIn,
  signOut
}
