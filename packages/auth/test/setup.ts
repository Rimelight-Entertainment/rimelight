import { vi } from "vite-plus/test";

vi.mock("virtual:rimelight-auth", () => ({
  config: {},
  default: {},
}));
