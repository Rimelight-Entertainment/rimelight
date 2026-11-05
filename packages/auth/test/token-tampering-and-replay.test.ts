import { describe, expect, it } from "vite-plus/test";
import { auth0Auth } from "../src/adapters/auth0";
import { mockAuth } from "../src/adapters/mock";

describe("@rimelight/auth - Security, Token Tampering and Edge Failure Tests", () => {
  describe("Auth0 and Mock Adapter Strict Edge Cases", () => {
    it("handles corrupt or truncated cookies without throwing exceptions", async () => {
      const auth0 = auth0Auth({ domain: "test.auth0.com", clientId: "xyz" });
      const req = new Request("https://rimelight.com/profile", {
        headers: {
          cookie: "appSession=corrupted.jwt.payload; other_cookie=123",
        },
      });
      const session = await auth0.getSession(req);
      expect(session).toBeNull();
    });

    it("Mock adapter properly returns configured custom session object", async () => {
      const customMock = mockAuth({
        session: {
          userId: "custom-agent-id",
          roles: ["editor"],
          email: "agent@rimelight.com",
        },
      });

      const session = await customMock.getSession(new Request("https://rimelight.com"));
      expect(session?.userId).toBe("custom-agent-id");
      expect(session?.email).toBe("agent@rimelight.com");
      expect(session?.roles).toEqual(["editor"]);
    });
  });
});
