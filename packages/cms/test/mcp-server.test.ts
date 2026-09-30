import { describe, it, expect } from "vite-plus/test";
import { CMS_MCP_TOOLS, handleCmsMcpRequest } from "../src/mcp/index";

describe("@rimelight/cms Model Context Protocol (MCP) server", () => {
  it("should define all essential CMS tools for agent operations", () => {
    const toolNames = CMS_MCP_TOOLS.map((t) => t.name);
    expect(toolNames).toContain("cms_list_pages");
    expect(toolNames).toContain("cms_get_page");
    expect(toolNames).toContain("cms_create_page");
    expect(toolNames).toContain("cms_update_page");
    expect(toolNames).toContain("cms_create_draft");
    expect(toolNames).toContain("cms_publish_page");
    expect(toolNames).toContain("cms_unpublish_page");
    expect(toolNames).toContain("cms_delete_page");
    expect(toolNames).toContain("cms_list_page_versions");
    expect(toolNames).toContain("cms_rollback_page_version");
    expect(toolNames).toContain("cms_list_templates");
    expect(toolNames).toContain("cms_list_taxonomies");
    expect(toolNames).toContain("cms_search_content");
  });

  it("should handle tools/list request", async () => {
    const response = await handleCmsMcpRequest(
      {
        method: "tools/list",
        id: 123,
      },
      null,
    );

    expect(response.jsonrpc).toBe("2.0");
    expect(response.id).toBe(123);
    expect(response.result.tools).toBe(CMS_MCP_TOOLS);
  });

  it("should return error when requesting non-existent page", async () => {
    const mockDb = {
      select: () => ({
        from: () => ({
          where: () => ({
            limit: async () => [],
          }),
        }),
      }),
    };

    const response = await handleCmsMcpRequest(
      {
        method: "tools/call",
        params: {
          name: "cms_get_page",
          arguments: { slugOrId: "non-existent-page" },
        },
      },
      mockDb,
    );

    expect(response.error).toBeDefined();
    expect(response.error.code).toBe(-32004);
    expect(response.error.message).toContain("non-existent-page");
  });
});
