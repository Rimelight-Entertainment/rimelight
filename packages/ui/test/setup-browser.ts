import { vi, afterEach } from "vite-plus/test";

// Mirror the same mock used in unit tests
vi.mock("virtual:rimelight/ui", () => ({
  default: {
    unstyled: false,
    components: { themes: {} },
    icons: {},
  },
}));

afterEach(() => {
  // Clean up any components mounted to the body between tests
  document.querySelectorAll("[data-test-root]").forEach((el) => el.remove());
});
