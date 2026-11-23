import { describe, expect, it } from "vite-plus/test";
import {
  type ContentBlock,
  canOpenDraft,
  canReviewDraft,
  filterBlocks,
  type PageFacts,
  pageAccessLevel,
} from "../src/space/content/content-access.ts";

const nobody: PageFacts = {
  scopeKind: "Company",
  scopeId: null,
  globalAdmin: false,
  contentEditor: false,
  projectRole: null,
  teamId: null,
  departmentId: null,
};

const TEAM = "11111111-1111-4111-8111-111111111111";
const DEPT = "22222222-2222-4222-8222-222222222222";
const PROJECT = "33333333-3333-4333-8333-333333333333";

describe("pageAccessLevel", () => {
  const cases: [string, PageFacts, string][] = [
    [
      "project: global admin manages",
      { ...nobody, scopeKind: "Project", scopeId: PROJECT, globalAdmin: true },
      "manage",
    ],
    [
      "project: project admin manages",
      { ...nobody, scopeKind: "Project", scopeId: PROJECT, projectRole: "admin" },
      "manage",
    ],
    [
      "project: member edits",
      { ...nobody, scopeKind: "Project", scopeId: PROJECT, projectRole: "member" },
      "edit",
    ],
    [
      "project: viewer views",
      { ...nobody, scopeKind: "Project", scopeId: PROJECT, projectRole: "viewer" },
      "view",
    ],
    ["project: outsider has none", { ...nobody, scopeKind: "Project", scopeId: PROJECT }, "none"],
    [
      "project: content editor does not edit a project page",
      { ...nobody, scopeKind: "Project", scopeId: PROJECT, contentEditor: true },
      "none",
    ],
    [
      "team: member of the team edits",
      { ...nobody, scopeKind: "Team", scopeId: TEAM, teamId: TEAM },
      "edit",
    ],
    [
      "team: other employee views",
      { ...nobody, scopeKind: "Team", scopeId: TEAM, teamId: DEPT },
      "view",
    ],
    [
      "team: global admin manages",
      { ...nobody, scopeKind: "Team", scopeId: TEAM, globalAdmin: true },
      "manage",
    ],
    [
      "department: member edits",
      { ...nobody, scopeKind: "Department", scopeId: DEPT, departmentId: DEPT },
      "edit",
    ],
    [
      "department: other employee views",
      { ...nobody, scopeKind: "Department", scopeId: DEPT, departmentId: TEAM },
      "view",
    ],
    [
      "department: global admin manages",
      { ...nobody, scopeKind: "Department", scopeId: DEPT, globalAdmin: true },
      "manage",
    ],
    ["company: every employee views", { ...nobody }, "view"],
    ["company: content editor edits", { ...nobody, contentEditor: true }, "edit"],
    ["company: global admin manages", { ...nobody, globalAdmin: true }, "manage"],
  ];
  for (const [name, facts, want] of cases) {
    it(name, () => {
      expect(pageAccessLevel(facts)).toBe(want);
    });
  }
});

describe("draft access", () => {
  const draft = { authorId: "author", memberIds: ["member"], status: "Open" };

  it("lets the author and members open the draft only with edit on the page", () => {
    expect(canOpenDraft("author", draft, "edit")).toBe(true);
    expect(canOpenDraft("member", draft, "manage")).toBe(true);
    expect(canOpenDraft("author", draft, "view")).toBe(false);
    expect(canOpenDraft("stranger", draft, "manage")).toBe(false);
  });

  it("lets reviewers read an InReview draft, and nobody else", () => {
    const review = { ...draft, status: "InReview" };
    expect(canReviewDraft(review, "manage")).toBe(true);
    expect(canReviewDraft(review, "edit")).toBe(false);
    expect(canReviewDraft(draft, "manage")).toBe(false);
  });
});

describe("filterBlocks", () => {
  const blocks: ContentBlock[] = [
    { id: "open", type: "paragraph", props: {} },
    { id: "hr-only", type: "paragraph", allowedRoles: ["hr"] },
    { id: "admin-or-hr", type: "paragraph", allowedRoles: ["admin", "hr"] },
    { id: "needs-perm", type: "paragraph", requiredPermission: "admin" },
    { id: "internal", type: "paragraph", visibility: "internal" },
    {
      id: "section",
      type: "section",
      children: [
        { id: "child-hr", type: "paragraph", allowedRoles: ["hr"] },
        { id: "child-open", type: "paragraph" },
        { id: "child-internal", type: "paragraph", visibility: "internal" },
      ],
    },
  ];

  const ids = (list: ContentBlock[]): string[] => list.map((b) => b["id"] as string);

  it("drops blocks whose allowed roles the caller lacks", () => {
    expect(ids(filterBlocks(blocks, [], "employee"))).toEqual(["open", "internal", "section"]);
    expect(ids(filterBlocks(blocks, ["hr"], "employee"))).toEqual([
      "open",
      "hr-only",
      "admin-or-hr",
      "internal",
      "section",
    ]);
  });

  it("drops blocks whose required permission the caller does not hold", () => {
    expect(ids(filterBlocks(blocks, ["admin"], "employee"))).toContain("needs-perm");
    expect(ids(filterBlocks(blocks, [], "employee"))).not.toContain("needs-perm");
  });

  it("drops internal blocks for the public audience only", () => {
    expect(ids(filterBlocks(blocks, ["admin"], "public"))).not.toContain("internal");
    expect(ids(filterBlocks(blocks, ["admin"], "employee"))).toContain("internal");
  });

  it("filters children recursively", () => {
    const section = filterBlocks(blocks, [], "public").find((b) => b["id"] === "section");
    expect(section?.children?.map((b) => b["id"])).toEqual(["child-open"]);
    const withHr = filterBlocks(blocks, ["hr"], "employee").find((b) => b["id"] === "section");
    expect(withHr?.children?.map((b) => b["id"])).toEqual([
      "child-hr",
      "child-open",
      "child-internal",
    ]);
  });

  it("does not change the input", () => {
    const before = JSON.stringify(blocks);
    filterBlocks(blocks, [], "public");
    expect(JSON.stringify(blocks)).toBe(before);
  });
});
