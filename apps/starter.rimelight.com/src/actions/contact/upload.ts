import { defineAction, ActionError } from "astro:actions"
import { z } from "astro/zod"
import { env } from "cloudflare:workers"

export const upload = defineAction({
  accept: "form",
  input: z.object({
    file: z
      .instanceof(File, { message: "Please choose a file to upload." })
      .refine((f) => f.size > 0, "The selected file is empty.")
      .refine((f) => f.size <= 5 * 1024 * 1024, "File must be 5 MB or smaller.")
      .refine(
        (f) => ["image/png", "image/jpeg", "image/webp", "application/pdf"].includes(f.type),
        "Only PNG, JPEG, WEBP, or PDF files are allowed."
      )
  }),
  handler: async (input) => {
    const bucket = env.BLOB

    if (!bucket) {
      console.error("[upload action] R2 bucket binding BLOB not available")
      throw new ActionError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Storage service is unavailable."
      })
    }

    const ext = input.file.name.split(".").pop()?.toLowerCase() ?? "bin"
    const key = `uploads/${crypto.randomUUID()}.${ext}`

    try {
      await bucket.put(key, await input.file.arrayBuffer(), {
        httpMetadata: { contentType: input.file.type }
      })
      return { success: true, key, filename: input.file.name, size: input.file.size }
    } catch (err: unknown) {
      console.error("[upload action error]", err)
      throw new ActionError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to upload file to storage."
      })
    }
  }
})
