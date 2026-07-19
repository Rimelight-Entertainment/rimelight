import type { APIRoute } from "astro"
import api from "@/api"

export const ALL: APIRoute = (context) => {
  return api.fetch(context.request, context.locals)
}
