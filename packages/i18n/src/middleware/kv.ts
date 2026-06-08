import { setKVBinding } from "../index"
import { env } from "cloudflare:workers"

export const onRequest = async (context: any, next: any) => {
  const kv = (env as any).TRANSLATIONS_KV
  if (kv) {
    setKVBinding(kv)
  }
  return next()
}
