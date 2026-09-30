import { describe, expect, it } from "vite-plus/test";
import { hasLockedDescendants } from "../src/auth/editor-guards";
import type { BaseBlock } from "../src/core/types/blocks";

describe("editor-guards", () => {
  it("detects when a block has locked descendants", () => {
    const parentBlock: BaseBlock = {
      id: "11111111-1111-4111-8111-111111111111",
      type: "SectionBlock",
      props: {},
      children: [
        {
          id: "22222222-2222-4222-8222-222222222222",
          type: "ParagraphBlock",
          allowedRoles: ["admin"],
          props: { text: "Restricted" }
        }
      ]
    };

    const memberSession = { userId: "m1", roles: ["member"], permissions: [] };
    expect(hasLockedDescendants(parentBlock, memberSession)).toBe(true);
  });

  it("permits editing when all descendants pass authorization", () => {
    const parentBlock: BaseBlock = {
      id: "11111111-1111-4111-8111-111111111111",
      type: "SectionBlock",
      props: {},
      children: [
        {
          id: "22222222-2222-4222-8222-222222222222",
          type: "ParagraphBlock",
          props: { text: "Public" }
        }
      ]
    };

    const memberSession = { userId: "m1", roles: ["member"], permissions: [] };
    expect(hasLockedDescendants(parentBlock, memberSession)).toBe(false);
  });
});
