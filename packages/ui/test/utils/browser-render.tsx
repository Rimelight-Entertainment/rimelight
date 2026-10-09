import { renderToString } from "@solidjs/web";

/**
 * Renders a Solid component into a DOM container in happy-dom.
 * Automatically cleaned up between tests by afterEach in setup.ts.
 */
export function mountComponent(component: () => any): HTMLElement {
  const container = document.createElement("div");
  container.setAttribute("data-test-root", "");
  document.body.appendChild(container);
  container.innerHTML = renderToString(component);
  return container;
}
