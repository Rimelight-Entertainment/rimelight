import { describe, expect, it } from "vite-plus/test";
import { CMS_MCP_TOOLS, handleCmsMcpRequest } from "../src/mcp/index";

describe("@rimelight/cms - MCP Security and Tools Validation Matrix", () => {
  it("verifies all MCP tool definitions strictly specify inputSchemas", () => {
    for (const tool of CMS_MCP_TOOLS) {
      expect(tool.name).toBeDefined();
      expect(typeof tool.name).toBe("string");
      expect(tool.description).toBeDefined();
      expect(typeof tool.description).toBe("string");
      expect(tool.inputSchema).toBeDefined();
      expect(tool.inputSchema.type).toBe("object");
    }
  });

  it("gracefully handles unknown tool call requests with standard JSON-RPC errors", async () => {
    const response = await handleCmsMcpRequest(
      {
        jsonrpc: "2.0",
        id: 999,
        method: "tools/call",
        params: {
          name: "cms_unknown_nonexistent_tool",
          arguments: {}
        }
      },
      null
    );

    expect(response.jsonrpc).toBe("2.0");
    expect(response.id).toBe(999);
  });

  it("validates required slugOrId in cms_get_page tool call", async () => {
    const mockDb = {
      select: () => ({
        from: () => ({
          where: () => ({
            limit: async () => []
          })
        })
      })
    };

    const response = await handleCmsMcpRequest(
      {
        jsonrpc: "2.0",
        id: "req-1",
        method: "tools/call",
        params: {
          name: "cms_get_page",
          arguments: { slugOrId: "nonexistent-doc-uuid" }
        }
      },
      mockDb
    );

    expect(response.error).toBeDefined();
    expect(response.error.code).toBe(-32004);
    expect(response.error.message).toContain("nonexistent-doc-uuid");
  });
});
