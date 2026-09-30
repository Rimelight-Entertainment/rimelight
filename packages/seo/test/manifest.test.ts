import { describe, it, expect } from "vite-plus/test";
import { buildWebManifest } from "../src/manifest.js";

describe("buildWebManifest", () => {
  it("generates standard web manifest with sensible defaults", () => {
    const manifest = buildWebManifest({
      name: "My Application"
    });

    expect(manifest.name).toBe("My Application");
    expect(manifest.short_name).toBe("My Application");
    expect(manifest.start_url).toBe("/");
    expect(manifest.display).toBe("standalone");
    expect(manifest.background_color).toBe("#ffffff");
    expect(manifest.theme_color).toBe("#ffffff");
    expect(manifest.icons).toHaveLength(3);
  });

  it("customizes theme, icons and shortcuts", () => {
    const manifest = buildWebManifest({
      name: "Custom App",
      shortName: "App",
      description: "A custom web application",
      themeColor: "#000000",
      backgroundColor: "#111111",
      shortcuts: [
        {
          name: "Dashboard",
          url: "/dashboard"
        }
      ]
    });

    expect(manifest.name).toBe("Custom App");
    expect(manifest.short_name).toBe("App");
    expect(manifest.description).toBe("A custom web application");
    expect(manifest.theme_color).toBe("#000000");
    expect(manifest.background_color).toBe("#111111");
    expect(manifest.shortcuts).toHaveLength(1);
  });

  it("supports remote CDN icon URLs", () => {
    const manifest = buildWebManifest({
      name: "CDN App",
      icons: [
        {
          src: "https://cdn.example.com/icons/icon-192.png",
          sizes: "192x192",
          type: "image/png",
          purpose: "any"
        },
        {
          src: "https://cdn.example.com/icons/icon-512.png",
          sizes: "512x512",
          type: "image/png",
          purpose: "maskable"
        }
      ]
    });

    expect(manifest.icons).toHaveLength(2);
    expect(manifest.icons?.[0]?.src).toBe("https://cdn.example.com/icons/icon-192.png");
    expect(manifest.icons?.[1]?.src).toBe("https://cdn.example.com/icons/icon-512.png");
  });
});
