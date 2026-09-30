import { describe, expect, it } from "vite-plus/test";
import { mockAuth } from "../src/adapters/mock";

describe("mockAuth Adapter", () => {
  it("returns default mock session when no custom options provided", async () => {
    const adapter = mockAuth();
    const session = await adapter.getSession(new Request("https://rimelight.com"));

    expect(session).not.toBeNull();
    expect(session?.userId).toBe("mock-user-id");
    expect(session?.email).toBe("dev@rimelight.com");
    expect(session?.roles).toContain("admin");
    expect(session?.userType).toBe("employee");
  });

  it("allows custom overrides for mock session", async () => {
    const adapter = mockAuth({
      userId: "custom-123",
      email: "custom@example.com",
      roles: ["editor"],
      userType: "user"
    });
    const session = await adapter.getSession(new Request("https://rimelight.com"));

    expect(session).not.toBeNull();
    expect(session?.userId).toBe("custom-123");
    expect(session?.email).toBe("custom@example.com");
    expect(session?.roles).toEqual(["editor"]);
    expect(session?.userType).toBe("user");
  });

  it("returns null when session option is null", async () => {
    const adapter = mockAuth({ session: null });
    const session = await adapter.getSession(new Request("https://rimelight.com"));
    expect(session).toBeNull();
  });

  it("handles unauthorized requests", () => {
    const adapter = mockAuth();
    const response = adapter.handleUnauthorized?.(new Request("https://rimelight.com")) as Response;
    expect(response.status).toBe(401);
  });
});
