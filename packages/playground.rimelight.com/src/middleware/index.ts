import { sequence } from "astro:middleware"
import { security } from "@rimelight/ui/middleware"
import { construction } from "@/middleware/construction"
import { auth } from "@/middleware/auth"
import { i18n } from "@rimelight/i18n/middleware"

export const onRequest = sequence(i18n, security, construction, auth)
