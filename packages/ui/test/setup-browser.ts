import { afterEach } from "vite-plus/test";

// Mirror the same mock used in unit tests

afterEach(() => {
  // Clean up any components mounted to the body between tests
  document.querySelectorAll("[data-test-root]").forEach((el) => el.remove());
});
