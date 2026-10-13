import { describe, it, expect } from "vite-plus/test";
import { createSecurityHead } from "../src/head";

describe("createSecurityHead generator", () => {
  it("should generate Trusted Types, CSP nonce sync, and dev reporter scripts", () => {
    const tags = createSecurityHead({ devReporter: true });
    const scripts = tags.filter((t) => t.tag === "script");
    expect(scripts.length).toBe(3);
    expect(String(scripts[0]?.props?.["children"])).toContain("trustedTypes.createPolicy");
    expect(String(scripts[1]?.props?.["children"])).toContain("initialCspNonce");
    expect(String(scripts[2]?.props?.["children"])).toContain("securitypolicyviolation");
  });

  it("should support disabling individual components", () => {
    const tags = createSecurityHead({ trustedTypes: false, devReporter: false });
    const scripts = tags.filter((t) => t.tag === "script");
    expect(scripts.length).toBe(1);
    expect(String(scripts[0]?.props?.["children"])).toContain("initialCspNonce");
  });
});
