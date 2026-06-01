import type { APIRoute } from "astro";

export const GET: APIRoute = async (context) => {
  const user = context.locals.user;
  if (!user) {
    return new Response("Unauthorized", { status: 401 });
  }

  const { key } = context.params;
  if (!key) {
    return new Response("Bad Request", { status: 400 });
  }

  const cloudflareEnv = (context.locals as any).runtime?.env;
  const BLOB = cloudflareEnv?.BLOB;
  if (!BLOB) {
    // Return mock data/warning in local development so it doesn't break
    console.warn("[R2 Assets] Cloudflare R2 bucket (BLOB) not bound for GET.");
    return new Response("R2 not bound in local environment", { status: 503 });
  }

  const obj = await BLOB.get(key);
  if (!obj) {
    return new Response("Not Found", { status: 404 });
  }

  return new Response(obj.body, {
    headers: {
      "Content-Type": obj.httpMetadata?.contentType || "application/octet-stream",
    },
  });
};

export const PUT: APIRoute = async (context) => {
  const user = context.locals.user;
  if (!user) {
    return new Response("Unauthorized", { status: 401 });
  }

  const { key } = context.params;
  if (!key) {
    return new Response("Bad Request", { status: 400 });
  }

  const cloudflareEnv = (context.locals as any).runtime?.env;
  const BLOB = cloudflareEnv?.BLOB;
  if (!BLOB) {
    console.warn("[R2 Assets] Cloudflare R2 bucket (BLOB) not bound for PUT. Simulating success locally.");
    return new Response(JSON.stringify({ success: true, localMock: true }), {
      headers: { "Content-Type": "application/json" },
    });
  }

  const contentType = context.request.headers.get("content-type") || "application/octet-stream";
  const body = await context.request.arrayBuffer();

  await BLOB.put(key, body, {
    httpMetadata: { contentType },
  });

  return new Response(JSON.stringify({ success: true }), {
    headers: { "Content-Type": "application/json" },
  });
};

export const DELETE: APIRoute = async (context) => {
  const user = context.locals.user;
  if (!user) {
    return new Response("Unauthorized", { status: 401 });
  }

  const { key } = context.params;
  if (!key) {
    return new Response("Bad Request", { status: 400 });
  }

  const cloudflareEnv = (context.locals as any).runtime?.env;
  const BLOB = cloudflareEnv?.BLOB;
  if (!BLOB) {
    console.warn("[R2 Assets] Cloudflare R2 bucket (BLOB) not bound for DELETE. Simulating success locally.");
    return new Response(JSON.stringify({ success: true, localMock: true }), {
      headers: { "Content-Type": "application/json" },
    });
  }

  await BLOB.delete(key);

  return new Response(JSON.stringify({ success: true }), {
    headers: { "Content-Type": "application/json" },
  });
};

export const POST: APIRoute = async (context) => {
  // Move/Rename operation
  const user = context.locals.user;
  if (!user) {
    return new Response("Unauthorized", { status: 401 });
  }

  const { key } = context.params;
  if (!key) {
    return new Response("Bad Request", { status: 400 });
  }

  const cloudflareEnv = (context.locals as any).runtime?.env;
  const BLOB = cloudflareEnv?.BLOB;
  if (!BLOB) {
    console.warn("[R2 Assets] Cloudflare R2 bucket (BLOB) not bound for POST. Simulating success locally.");
    return new Response(JSON.stringify({ success: true, localMock: true }), {
      headers: { "Content-Type": "application/json" },
    });
  }

  const body = (await context.request.json()) as any;
  const { to: newKey } = body;
  if (!newKey) {
    return new Response("Missing target key ('to')", { status: 400 });
  }

  const obj = await BLOB.get(key);
  if (!obj) {
    return new Response("Source object not found", { status: 404 });
  }

  await BLOB.put(newKey, obj.body, {
    httpMetadata: {
      contentType: obj.httpMetadata?.contentType || "application/octet-stream",
    },
  });

  await BLOB.delete(key);

  return new Response(JSON.stringify({ success: true }), {
    headers: { "Content-Type": "application/json" },
  });
};
