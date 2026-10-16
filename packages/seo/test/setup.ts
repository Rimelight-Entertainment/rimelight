import { vi } from "vite-plus/test";

const testConfig = {
  id: "test",
  name: "Test Site",
  description: "Test Description",
  url: "https://example.com",
  branding: {
    colors: {
      themeColor: "#ffffff",
      backgroundColor: "#000000",
    },
  },
};

vi.mock("virtual:rimelight-seo", () => ({
  config: testConfig,
  siteConfig: testConfig,
  default: testConfig,
}));
