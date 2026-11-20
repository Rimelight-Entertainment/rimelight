import { describe, expect, it } from "vite-plus/test";
import { releaseHeaders, validReleaseName } from "../src/space/releases-files.ts";

describe("validReleaseName", () => {
  it("accepts Velopack file names", () => {
    expect(validReleaseName("RimelightSpace-stable-Setup.exe")).toBe(true);
    expect(validReleaseName("RimelightSpace-0.2.0-stable-delta.nupkg")).toBe(true);
    expect(validReleaseName("releases.stable.json")).toBe(true);
    expect(validReleaseName("RELEASES-stable")).toBe(true);
    expect(validReleaseName("min-version.stable.txt")).toBe(true);
  });

  it("refuses paths and odd names", () => {
    expect(validReleaseName("")).toBe(false);
    expect(validReleaseName(".hidden")).toBe(false);
    expect(validReleaseName("a..b")).toBe(false);
    expect(validReleaseName("a/b")).toBe(false);
    expect(validReleaseName("a b")).toBe(false);
    expect(validReleaseName("x".repeat(161))).toBe(false);
  });
});

describe("releaseHeaders", () => {
  it("caches packages for a year and the rest briefly", () => {
    expect(releaseHeaders("RimelightSpace-0.2.0-stable-full.nupkg").cacheControl).toContain(
      "immutable",
    );
    expect(releaseHeaders("RimelightSpace-stable-Setup.exe").cacheControl).toBe(
      "public, max-age=300",
    );
    expect(releaseHeaders("releases.stable.json")).toEqual({
      contentType: "application/json",
      cacheControl: "public, max-age=30",
    });
    expect(releaseHeaders("min-version.stable.txt").contentType).toContain("text/plain");
  });
});
