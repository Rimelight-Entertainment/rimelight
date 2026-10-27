import { afterEach, describe, expect, it, vi } from "vite-plus/test";
import { activeConfig, t } from "../src/runtime";

describe("dev warning for unloaded locales", () => {
  afterEach(() => {
    activeConfig.devServer = false;
    vi.restoreAllMocks();
  });

  it("warns once when a key is read in a locale that was never loaded", () => {
    activeConfig.devServer = true;
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    t.raw("some.unloaded.key", undefined, "de");
    t.raw("some.unloaded.key", undefined, "de");
    expect(warn).toHaveBeenCalledTimes(1);
    expect(warn.mock.calls[0]?.[0]).toContain('loadLocale("de")');
  });

  it("stays silent outside dev", () => {
    activeConfig.devServer = false;
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    t.raw("another.unloaded.key", undefined, "de");
    expect(warn).not.toHaveBeenCalled();
  });
});
