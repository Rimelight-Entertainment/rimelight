import { describe, it, expect } from "vite-plus/test";
import { renderToString } from "@solidjs/web";
import { RLFloatingAction } from "../src/components/floating-action/RLFloatingAction";
import { cleanHtml } from "./utils/normalize";

function render(fn: () => any): string {
  return cleanHtml(renderToString(fn));
}

describe("RLFloatingAction", () => {
  it("renders children inside the root", () => {
    const html = render(() => <RLFloatingAction>add</RLFloatingAction>);
    expect(html).toContain('data-slot="root"');
    expect(html).toContain("add");
  });

  it("renders the root as the as prop element", () => {
    const html = render(() => <RLFloatingAction as="button">add</RLFloatingAction>);
    expect(html.startsWith("<button")).toBe(true);
  });

  it("forwards extra attributes to the root", () => {
    const html = render(() => <RLFloatingAction id="fab-1">add</RLFloatingAction>);
    expect(html).toContain('id="fab-1"');
  });
});
