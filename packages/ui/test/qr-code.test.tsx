import { describe, it, expect } from "vite-plus/test";
import { renderToString } from "@solidjs/web";
import { RLQrCode } from "../src/components/qr-code/RLQrCode";
import { cleanHtml } from "./utils/normalize";

function render(fn: () => any): string {
  return cleanHtml(renderToString(fn));
}

describe("RLQrCode", () => {
  it("renders children inside the root", () => {
    const html = render(() => <RLQrCode>payload</RLQrCode>);
    expect(html).toContain('data-slot="root"');
    expect(html).toContain("payload");
  });

  it("renders the root as the as prop element", () => {
    const html = render(() => <RLQrCode as="section">payload</RLQrCode>);
    expect(html.startsWith("<section")).toBe(true);
  });

  it("forwards extra attributes to the root", () => {
    const html = render(() => <RLQrCode id="qr-1">payload</RLQrCode>);
    expect(html).toContain('id="qr-1"');
  });
});
