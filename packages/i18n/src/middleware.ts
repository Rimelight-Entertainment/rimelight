import { env } from "cloudflare:workers"
import { setKVBinding } from "./index"

export const onRequest = async (_context: unknown, next: () => Promise<Response>) => {
  const kv = Reflect.get(env, "TRANSLATIONS_KV")
  if (kv) {
    setKVBinding(kv)
  }
  return next()
}

export { i18n } from "./middleware/routing"
