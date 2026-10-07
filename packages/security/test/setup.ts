import { vi } from "vite-plus/test";

const sriManifest: Record<string, string> = {};
const securityConfig = {};

vi.mock("virtual:sri-manifest", () => ({
  manifest: sriManifest,
  default: sriManifest,
}));

vi.mock("virtual:rimelight-security-config", () => ({
  config: securityConfig,
  default: securityConfig,
}));
