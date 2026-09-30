import { Hono } from "hono";
import { db } from "#db";
import { componentMetadata } from "#db/schema";
import { eq, desc } from "drizzle-orm";

const docs = new Hono();

docs.get("/metadata/:componentName", async (c) => {
  try {
    const componentName = c.req.param("componentName");
    const result = await db
      .select()
      .from(componentMetadata)
      .where(eq(componentMetadata.componentName, componentName))
      .orderBy(desc(componentMetadata.extractedAt))
      .limit(1);

    if (!result[0]) return c.json({ error: "Component not found" }, 404);

    return c.json({ metadata: result[0] });
  } catch (err: any) {
    return c.json({ error: err.message }, 500);
  }
});

docs.post("/metadata/extract", async (c) => {
  try {
    const body = await c.req.json();
    const componentPath = body.componentPath;
    if (!componentPath || typeof componentPath !== "string" || componentPath.length === 0) {
      return c.json({ error: "componentPath is required" }, 400);
    }

    const fs = await import("fs");
    let content = "";
    try {
      content = fs.readFileSync(componentPath, "utf-8");
    } catch {
      return c.json({ error: "Failed to read component file" }, 400);
    }

    const componentName =
      componentPath
        .split("/")
        .pop()
        ?.replace(/\.[^/.]+$/, "") || "unknown";
    const props: Record<string, any> = { raw: content, extractedAt: new Date().toISOString() };
    const slots: Record<string, any> = {};
    const emits: Record<string, any> = {};

    const record = {
      componentName,
      version: "latest",
      framework: "astro",
      filePath: componentPath,
      props,
      slots,
      emits,
      theme: {}
    };

    const result = await db
      .insert(componentMetadata)
      .values(record)
      .onConflictDoUpdate({
        target: [componentMetadata.componentName, componentMetadata.version],
        set: {
          framework: record.framework,
          filePath: record.filePath,
          props: record.props,
          slots: record.slots,
          emits: record.emits,
          theme: record.theme,
          updatedAt: new Date()
        }
      })
      .returning();

    return c.json({ metadata: result[0] });
  } catch (err: any) {
    return c.json({ error: err.message }, 500);
  }
});

docs.put("/metadata/:componentName", async (c) => {
  try {
    const componentName = c.req.param("componentName");
    const body = await c.req.json();

    const existing = await db
      .select()
      .from(componentMetadata)
      .where(eq(componentMetadata.componentName, componentName))
      .limit(1);
    if (!existing[0]) return c.json({ error: "Component not found" }, 404);

    const allowedKeys = ["version", "props", "slots", "emits", "theme"];
    const updateData: Record<string, any> = { updatedAt: new Date() };
    for (const key of allowedKeys) {
      if (body[key] !== undefined) {
        updateData[key] = body[key];
      }
    }

    const result = await db
      .update(componentMetadata)
      .set(updateData)
      .where(eq(componentMetadata.componentName, componentName))
      .returning();

    return c.json({ metadata: result[0] });
  } catch (err: any) {
    return c.json({ error: err.message }, 500);
  }
});

docs.delete("/metadata/:componentName", async (c) => {
  try {
    const componentName = c.req.param("componentName");
    await db.delete(componentMetadata).where(eq(componentMetadata.componentName, componentName));
    return c.json({ success: true });
  } catch (err: any) {
    return c.json({ error: err.message }, 500);
  }
});

docs.post("/render", async (c) => {
  try {
    const body = await c.req.json();
    const componentCode = body.componentCode;
    const framework = body.framework || "astro";
    const height = body.height || "300px";
    const width = body.width || "100%";

    if (!componentCode || typeof componentCode !== "string") {
      return c.json({ error: "componentCode is required" }, 400);
    }

    return c.json({
      rendered: {
        html: componentCode,
        framework,
        height,
        width,
        error: null
      }
    });
  } catch (err: any) {
    return c.json({ error: err.message }, 500);
  }
});

docs.post("/validate-props", async (c) => {
  try {
    const body = await c.req.json();
    const componentName = body.componentName;
    const props = body.props;

    if (!componentName || typeof componentName !== "string") {
      return c.json({ error: "componentName is required" }, 400);
    }

    const metadata = await db
      .select()
      .from(componentMetadata)
      .where(eq(componentMetadata.componentName, componentName))
      .limit(1);

    if (!metadata[0]) {
      return c.json({ valid: true, warnings: [`No metadata found for ${componentName}`] });
    }

    const errors: string[] = [];
    const warnings: string[] = [];

    const knownProps = metadata[0].props || {};
    if (props && typeof props === "object") {
      for (const key of Object.keys(props)) {
        if (!knownProps[key] && key !== "class" && key !== "id") {
          warnings.push(`Unknown prop: ${key}`);
        }
      }
    }

    return c.json({ valid: errors.length === 0, errors, warnings });
  } catch (err: any) {
    return c.json({ error: err.message }, 500);
  }
});

docs.get("/content/:pageId", async (c) => {
  try {
    const pageId = c.req.param("pageId");
    const [page] = await db
      .select()
      .from(componentMetadata)
      .where(eq(componentMetadata.id, pageId))
      .limit(1);
    if (!page) return c.json({ error: "Content not found" }, 404);
    return c.json({ content: page });
  } catch (err: any) {
    return c.json({ error: err.message }, 500);
  }
});

docs.put("/content/:pageId", async (c) => {
  try {
    const pageId = c.req.param("pageId");
    const body = await c.req.json();
    const result = await db
      .update(componentMetadata)
      .set({ ...body, updatedAt: new Date() })
      .where(eq(componentMetadata.id, pageId))
      .returning();
    return c.json({ content: result[0] });
  } catch (err: any) {
    return c.json({ error: err.message }, 500);
  }
});

docs.post("/content", async (c) => {
  try {
    const body = await c.req.json();
    const result = await db.insert(componentMetadata).values(body).returning();
    return c.json({ content: result[0] });
  } catch (err: any) {
    return c.json({ error: err.message }, 500);
  }
});

export default docs;
