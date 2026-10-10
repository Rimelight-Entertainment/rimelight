import { vi } from "vite-plus/test";

vi.mock("virtual:rimelight-cms", () => ({
  routePrefix: "/[locale]/cms",
  storageConfig: {
    provider: "r2",
    binding: "BLOB",
    prefix: "media/",
  },
  cmsOptions: {
    routePrefix: "/[locale]/cms",
    storage: {
      provider: "r2",
      binding: "BLOB",
      prefix: "media/",
    },
  },
  default: {
    routePrefix: "/[locale]/cms",
    storage: {
      provider: "r2",
      binding: "BLOB",
      prefix: "media/",
    },
  },
}));

vi.mock("virtual:rimelight-cms/db", () => ({
  db: null,
  default: null,
}));
