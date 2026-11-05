import { describe, it, expect } from "vite-plus/test";
import { RLTextarea } from "../src/components/textarea/RLTextarea";
import { renderSolid } from "./utils/normalize";

describe("RLTextarea — server render", () => {
  it("renders the root and native textarea with data-slot hooks", () => {
    const html = renderSolid(RLTextarea, { theme: "dark" });
    expect(html).toContain('data-slot="root"');
    expect(html).toContain("data-theme");
    expect(html).toContain('data-slot="textarea"');
  });

  it("defaults to four visible rows", () => {
    expect(renderSolid(RLTextarea, {})).toContain('rows="4"');
  });

  it("uses the given row count", () => {
    expect(renderSolid(RLTextarea, { rows: 8 })).toContain('rows="8"');
  });

  it("omits the rows attribute when autoGrow is set", () => {
    expect(renderSolid(RLTextarea, { autoGrow: true })).not.toContain("rows=");
  });

  it("sets aria-invalid only when invalid", () => {
    expect(renderSolid(RLTextarea, { invalid: true })).toContain('aria-invalid="true"');
    expect(renderSolid(RLTextarea, {})).not.toContain("aria-invalid");
  });

  it("forwards placeholder, name, and disabled to the native textarea", () => {
    const html = renderSolid(RLTextarea, { placeholder: "Write", name: "bio", disabled: true });
    expect(html).toContain('placeholder="Write"');
    expect(html).toContain('name="bio"');
    expect(html).toContain("disabled");
  });

  it("forwards aria attributes to the native textarea rather than the root", () => {
    const html = renderSolid(RLTextarea, { "aria-label": "Bio" });
    expect(html).toMatch(/<textarea[^>]*aria-label="Bio"/);
  });
});
