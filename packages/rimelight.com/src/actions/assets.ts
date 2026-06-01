import { defineAction, ActionError } from "astro:actions"

export const assets = {
  getAssets: defineAction({
    handler: async (_input, context) => {
      const user = context.locals.user;
      if (!user) {
        throw new ActionError({
          code: "UNAUTHORIZED",
          message: "Authentication required."
        });
      }

      const cloudflareEnv = (context.locals as any).runtime?.env;
      const BLOB = cloudflareEnv?.BLOB;

      if (!BLOB) {
        // Safe fallback for local development or non-Cloudflare platforms
        console.warn("[R2 Assets] Cloudflare R2 bucket (BLOB) not bound. Returning empty list.");
        return [];
      }

      try {
        let allObjects: any[] = [];
        let truncated = true;
        let cursor: string | undefined;

        while (truncated) {
          const list: any = await BLOB.list({ cursor });
          allObjects.push(...list.objects);
          truncated = list.truncated;
          cursor = list.cursor;
        }

        const uniqueObjectsMap = new Map();
        allObjects.forEach((obj) => {
          uniqueObjectsMap.set(obj.key, obj);
        });

        return Array.from(uniqueObjectsMap.values()).map((obj: any) => ({
          key: obj.key,
          size: obj.size,
          uploaded: obj.uploaded,
          contentType: obj.httpMetadata?.contentType,
          etag: obj.httpEtag
        }));
      } catch (error) {
        console.error("Failed to fetch R2 assets:", error);
        throw new ActionError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to list R2 assets."
        });
      }
    }
  })
}
