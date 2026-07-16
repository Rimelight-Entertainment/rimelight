import { setKVBinding } from "../index"
import { env } from "cloudflare:workers"

export const onRequest = async (_context: unknown, next: () => Promise<Response>) => {
  const kv = Reflect.get(env, "TRANSLATIONS_KV")
  if (kv) {
    setKVBinding(kv)
  }
  return next()
}
