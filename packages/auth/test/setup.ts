import { vi } from "vite-plus/test";

vi.mock("virtual:rimelight-auth", () => ({
  config: {},
  default: {},
}));

vi.mock("virtual:rimelight-auth/server", () => ({
  auth: null,
  authAdapter: null,
  default: null,
}));
