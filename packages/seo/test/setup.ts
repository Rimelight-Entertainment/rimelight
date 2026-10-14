import { vi } from "vite-plus/test";

vi.mock("virtual:rimelight-seo", () => ({
  siteConfig: {
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
  },
  SEO_LOCALES: {},
  PRIVATE_PATH_PREFIXES: [],
  seoConfig: { SEO_LOCALES: {}, PRIVATE_PATH_PREFIXES: [] },
  createHead: () => [],
  createSeoHead: () => [],
  defineSeoConfig: () => () => [],
  default: {
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
  },
}));

vi.mock("virtual:rimelight-seo/server", () => ({
  masterIconBuffer: null,
  isSvg: false,
  backgroundColor: "#000000",
  db: null,
  corpusPages: [],
  default: {
    masterIconBuffer: null,
    isSvg: false,
    backgroundColor: "#000000",
    db: null,
    corpusPages: [],
  },
}));
