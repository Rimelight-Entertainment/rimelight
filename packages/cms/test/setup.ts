import { vi } from "vite-plus/test";

vi.mock("virtual:rimelight-cms", () => ({
  config: {},
  options: { apiPath: "/api/cms" },
}));
