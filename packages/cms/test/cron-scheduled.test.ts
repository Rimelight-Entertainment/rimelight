import { describe, it, expect } from "vite-plus/test";
import { handleCmsCron } from "../src/cron/scheduled";

describe("@rimelight/cms cron scheduled tasks", () => {
  it("should handle null db gracefully", async () => {
    const result = await handleCmsCron({}, {}, {}, null);
    expect(result.expiredLocksCleaned).toBe(0);
    expect(result.scheduledPagesActive).toBe(0);
    expect(result.timestamp).toBeDefined();
  });

  it("should purge expired locks and report active scheduled pages", async () => {
    const mockDb = {
      delete: () => ({
        where: () => ({
          returning: async () => [{ pageId: "page-1" }, { pageId: "page-2" }],
        }),
      }),
      select: () => ({
        from: () => ({
          where: () => ({
            limit: async () => [{ id: "page-100", slug: "published-post" }],
          }),
        }),
      }),
    };

    const result = await handleCmsCron({}, {}, {}, mockDb);
    expect(result.expiredLocksCleaned).toBe(2);
    expect(result.scheduledPagesActive).toBe(1);
  });
});
