import { env } from "cloudflare:workers"
import { setKVBinding } from "./index"

export const onRequest = async (context: any, next: any) => {
  const kv = (env as any).TRANSLATIONS_KV
  if (kv) {
    setKVBinding(kv)
  }
  return next()
}

export { i18n } from "./middleware/routing"
