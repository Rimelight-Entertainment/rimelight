/**
 * Rimelight Space desktop releases (Space REL.4, decision 0047). The release workflow in the Space repo uploads the Velopack
 * installer and update feed to the R2 bucket bound as env.BLOB under "space/releases/<os>/". This route serves them
 * without sign-in, because the updater and the download link run before anyone is signed in.
 *
 *   GET /v1/releases/win/RimelightSpace-stable-Setup.exe   the installer (the download link)
 *   GET /v1/releases/win/releases.stable.json              the update feed the app reads
 *   GET /v1/releases/win/<package>.nupkg                   full and delta packages
 *   GET /v1/releases/win/min-version.stable.txt            the minimum version a running app must have
 */
import { Hono } from "hono";
import { env } from "cloudflare:workers";
import { releaseHeaders, validReleaseName } from "./releases-files.ts";

const releases = new Hono();

/** Object key prefix in the R2 bucket. */
const R2_PREFIX = "space/releases/";
/** Operating systems with a release pipeline. Others are added when their slice lands. */
const OSES = new Set(["win"]);

const blobs = (env as unknown as { BLOB: R2Bucket }).BLOB;

releases.get("/releases/:os/:name", async (c) => {
  const os = c.req.param("os");
  const name = c.req.param("name");
  if (!OSES.has(os) || !validReleaseName(name)) {
    return c.json({ error: "not_found", message: "No such file." }, 404, {
      "Cache-Control": "no-store",
    });
  }
  const object = await blobs.get(`${R2_PREFIX}${os}/${name}`);
  if (!object) {
    return c.json({ error: "not_found", message: "No such file." }, 404, {
      "Cache-Control": "no-store",
    });
  }
  const { contentType, cacheControl } = releaseHeaders(name);
  const headers = new Headers({
    "Content-Type": contentType,
    "Cache-Control": cacheControl,
    "Content-Length": String(object.size),
    ETag: object.httpEtag,
  });
  if (name.endsWith(".exe")) {
    headers.set("Content-Disposition", `attachment; filename="${name}"`);
  }
  return new Response(object.body, { status: 200, headers });
});

export default releases;
