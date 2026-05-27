import { sequence } from "astro:middleware"
import { security } from "@rimelight/ui/middleware"
import { nonce } from "./nonce"

export const onRequest = sequence(security, nonce)
