import { Hono } from "hono"
import { getCloudflareEnv } from "../lib/env"
import { auth, setEmailBinding } from "@/auth/auth"

const api = new Hono()

api.on(["GET", "POST"], "/auth/*", async (c) => {
  const env = await getCloudflareEnv(c)

  if (env?.EMAIL) {
    setEmailBinding(env.EMAIL)
  }

  return auth.handler(c.req.raw)
})

export default api
