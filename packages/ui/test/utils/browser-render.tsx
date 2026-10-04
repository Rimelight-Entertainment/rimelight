import { render } from "@solidjs/web";
import type { JSX } from "@solidjs/web";
import { page } from "vite-plus/test/browser";

/**
 * Mounts a Solid component into a real DOM container and returns a Vitest
 * locator scoped to it. Marks the container for automatic cleanup by
 * the afterEach in setup-browser.ts.
 */
export function mountComponent(
  component: () => JSX.Element,
): ReturnType<typeof page.elementLocator> {
  const container = document.createElement("div");
  container.setAttribute("data-test-root", "");
  document.body.appendChild(container);
  render(component, container);
  return page.elementLocator(container);
}
