import { vi } from "vite-plus/test";

vi.mock("virtual:rimelight-cms", () => ({
  config: {
    routePrefix: "/[locale]/cms",
    storage: {
      provider: "r2",
      binding: "BLOB",
      prefix: "media/",
    },
  },
}));
