import { describe, it, expect } from "vite-plus/test";
import { renderToString } from "@solidjs/web";
import { RLPassword } from "../src/components/password/RLPassword";
import { cleanHtml } from "./utils/normalize";

function render(fn: () => any): string {
  return cleanHtml(renderToString(fn));
}

describe("RLPassword", () => {
  it("renders children inside the root", () => {
    const html = render(() => <RLPassword>field</RLPassword>);
    expect(html).toContain('data-slot="root"');
    expect(html).toContain("field");
  });

  it("renders the root as the as prop element", () => {
    const html = render(() => <RLPassword as="div">field</RLPassword>);
    expect(html.startsWith("<div")).toBe(true);
  });

  it("forwards extra attributes to the root", () => {
    const html = render(() => <RLPassword id="password-1">field</RLPassword>);
    expect(html).toContain('id="password-1"');
  });
});
