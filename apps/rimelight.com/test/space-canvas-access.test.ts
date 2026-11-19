import { describe, expect, it } from "vite-plus/test";
import { type AccessFacts, accessLevel, atLeast, cleanTitle } from "../src/space/canvas-access";

const base: AccessFacts = {
  userId: "u-me",
  ownerId: null,
  projectId: null,
  createdBy: "u-other",
  projectRole: null,
  shareRole: null,
  globalAdmin: false,
};

const project = { ...base, projectId: "p-1" };
const personal = { ...base, ownerId: "u-me" };

describe("accessLevel, project canvases", () => {
  it("gives a project admin manage", () => {
    expect(accessLevel({ ...project, projectRole: "admin" })).toBe("manage");
  });

  it("gives a member manage on their own canvas", () => {
    expect(accessLevel({ ...project, projectRole: "member", createdBy: "u-me" })).toBe("manage");
  });

  it("gives a member edit on someone else's canvas", () => {
    expect(accessLevel({ ...project, projectRole: "member" })).toBe("edit");
  });

  it("gives a viewer view", () => {
    expect(accessLevel({ ...project, projectRole: "viewer" })).toBe("view");
  });

  it("gives no access without a membership", () => {
    expect(accessLevel(project)).toBe("none");
  });

  it("gives a global admin manage without a membership", () => {
    expect(accessLevel({ ...project, globalAdmin: true })).toBe("manage");
  });
});

describe("accessLevel, personal canvases", () => {
  it("gives the owner manage", () => {
    expect(accessLevel(personal)).toBe("manage");
  });

  it("gives an Editor share edit", () => {
    expect(accessLevel({ ...base, ownerId: "u-other", shareRole: "Editor" })).toBe("edit");
  });

  it("gives a Viewer share view", () => {
    expect(accessLevel({ ...base, ownerId: "u-other", shareRole: "Viewer" })).toBe("view");
  });

  it("gives a stranger no access", () => {
    expect(accessLevel({ ...base, ownerId: "u-other" })).toBe("none");
  });

  it("gives a global admin no access to someone else's personal canvas", () => {
    expect(accessLevel({ ...base, ownerId: "u-other", globalAdmin: true })).toBe("none");
  });
});

describe("atLeast", () => {
  it("orders none, view, edit, manage", () => {
    expect(atLeast("manage", "edit")).toBe(true);
    expect(atLeast("edit", "edit")).toBe(true);
    expect(atLeast("view", "edit")).toBe(false);
    expect(atLeast("none", "view")).toBe(false);
    expect(atLeast("view", "view")).toBe(true);
    expect(atLeast("edit", "manage")).toBe(false);
  });
});

describe("cleanTitle", () => {
  it("gives the default title for a missing title", () => {
    expect(cleanTitle(undefined)).toBe("Untitled canvas");
  });

  it("trims the title", () => {
    expect(cleanTitle("  a  ")).toBe("a");
  });

  it("refuses an empty title", () => {
    expect(cleanTitle("")).toBeNull();
  });

  it("refuses a title over 200 characters and accepts 200", () => {
    expect(cleanTitle("a".repeat(201))).toBeNull();
    expect(cleanTitle("a".repeat(200))).toBe("a".repeat(200));
  });

  it("refuses a title that is not text", () => {
    expect(cleanTitle(5)).toBeNull();
  });
});
