import { describe, expect, it } from "vite-plus/test";
import { filterBlocksForReader } from "../src/auth/filter-blocks";
import type { BaseBlock } from "../src/core/types/blocks";

describe("filterBlocksForReader", () => {
  it("omits unauthorized blocks completely from reader payload", () => {
    const blocks: BaseBlock[] = [
      {
        id: "11111111-1111-4111-8111-111111111111",
        type: "ParagraphBlock",
        props: { text: { en: "Public" } }
      },
      {
        id: "22222222-2222-4222-8222-222222222222",
        type: "ParagraphBlock",
        allowedRoles: ["admin"],
        props: { text: { en: "Classified" } }
      }
    ];

    const readerSession = { userId: "user-1", roles: ["member"], permissions: [] };
    const result = filterBlocksForReader(blocks, readerSession);

    expect(result).toHaveLength(1);
    expect(result[0]?.id).toBe("11111111-1111-4111-8111-111111111111");
  });

  it("includes role-restricted blocks if user session possesses role", () => {
    const blocks: BaseBlock[] = [
      {
        id: "22222222-2222-4222-8222-222222222222",
        type: "ParagraphBlock",
        allowedRoles: ["admin"],
        props: { text: { en: "Admin Secret" } }
      }
    ];

    const adminSession = { userId: "admin-1", roles: ["admin"], permissions: [] };
    const result = filterBlocksForReader(blocks, adminSession);

    expect(result).toHaveLength(1);
    expect(result[0]?.id).toBe("22222222-2222-4222-8222-222222222222");
  });
});
