import { beforeEach, describe, expect, it } from "vite-plus/test";
import { drizzle } from "drizzle-orm/d1";
import { migrateCms } from "../src/migrator/index";
import { createCms, type Cms } from "../src/services/index";
import { CmsError, type CmsActor } from "../src/services/context";
import { createMockD1 } from "./helpers/d1";

const admin: CmsActor = { userId: "admin-1", name: "Ada", roles: ["admin"], permissions: [] };
const editor: CmsActor = { userId: "editor-1", name: "Eve", roles: ["editor"], permissions: [] };

let cms: Cms;

beforeEach(async () => {
  const { binding } = createMockD1();
  await migrateCms(binding);
  cms = createCms({ db: drizzle(binding), dialect: "sqlite", locales: ["en", "pt"] });
});

async function expectError(p: Promise<unknown>, status: number): Promise<CmsError> {
  try {
    await p;
  } catch (err) {
    expect(err).toBeInstanceOf(CmsError);
    expect((err as CmsError).status).toBe(status);
    return err as CmsError;
  }
  throw new Error(`expected CmsError ${status}`);
}

describe("byline field definitions", () => {
  it("derives slugs, normalizes options, and rejects invalid definitions", async () => {
    await expectError(
      cms.bylines.createBylineField(editor, { label: "Pronouns", type: "string" }),
      403,
    );

    const job = await cms.bylines.createBylineField(admin, { label: "Job title", type: "string" });
    expect(job.slug).toBe("job_title");

    const role = await cms.bylines.createBylineField(admin, {
      label: "Role",
      type: "select",
      options: ["Writer", " Editor ", "Writer"],
    });
    expect(role.options).toEqual(["Writer", "Editor"]);

    await expectError(
      cms.bylines.createBylineField(admin, {
        label: "Job again",
        slug: "job_title",
        type: "string",
      }),
      409,
    );
    await expectError(cms.bylines.createBylineField(admin, { label: "  ", type: "string" }), 422);
    await expectError(
      cms.bylines.createBylineField(admin, { label: "Bad", slug: "1st", type: "string" }),
      422,
    );
    await expectError(
      cms.bylines.createBylineField(admin, { label: "Flag", type: "boolean", translatable: true }),
      422,
    );
    await expectError(
      cms.bylines.createBylineField(admin, { label: "Size", type: "select", options: [] }),
      422,
    );
    await expectError(
      cms.bylines.createBylineField(admin, { label: "Note", type: "string", options: ["a"] }),
      422,
    );
  });

  it("locks type and translatable once a byline holds a value", async () => {
    const pronouns = await cms.bylines.createBylineField(admin, {
      label: "Pronouns",
      type: "string",
    });
    await cms.bylines.updateBylineField(admin, pronouns.id, { type: "text" });

    await cms.bylines.createByline(admin, { name: "Sam", fields: { pronouns: "they/them" } });

    await expectError(cms.bylines.updateBylineField(admin, pronouns.id, { type: "url" }), 409);
    await expectError(
      cms.bylines.updateBylineField(admin, pronouns.id, { translatable: true }),
      409,
    );

    const renamed = await cms.bylines.updateBylineField(admin, pronouns.id, { label: "Pronoun" });
    expect(renamed.label).toBe("Pronoun");
    expect(renamed.slug).toBe("pronouns");
  });

  it("removes a field's values from every byline when the field is deleted", async () => {
    const pronouns = await cms.bylines.createBylineField(admin, {
      label: "Pronouns",
      type: "string",
    });
    const sam = await cms.bylines.createByline(admin, {
      name: "Sam",
      fields: { pronouns: "they/them" },
    });

    await cms.bylines.deleteBylineField(admin, pronouns.id);

    expect(await cms.bylines.listBylineFields()).toEqual([]);
    expect((await cms.bylines.getByline(sam.id)).fields).toEqual({});
  });
});

describe("byline field values", () => {
  it("stores valid scalar values, clears blanks and nulls, and rejects bad values", async () => {
    await cms.bylines.createBylineField(admin, { label: "Homepage", type: "url" });
    await cms.bylines.createBylineField(admin, {
      label: "Role",
      type: "select",
      options: ["Writer", "Editor"],
    });
    await cms.bylines.createBylineField(admin, { label: "Verified", type: "boolean" });

    const jane = await cms.bylines.createByline(admin, {
      name: "Jane",
      fields: { homepage: "https://jane.dev", role: "Editor", verified: true },
    });
    expect((await cms.bylines.getByline(jane.id)).fields).toEqual({
      homepage: "https://jane.dev",
      role: "Editor",
      verified: true,
    });

    await expectError(
      cms.bylines.createByline(admin, { name: "A", fields: { homepage: "javascript:alert(1)" } }),
      422,
    );
    await expectError(
      cms.bylines.createByline(admin, { name: "B", fields: { role: "Writer2" } }),
      422,
    );
    await expectError(
      cms.bylines.createByline(admin, { name: "C", fields: { verified: "yes" } }),
      422,
    );
    await expectError(cms.bylines.createByline(admin, { name: "D", fields: { nope: "x" } }), 422);

    await cms.bylines.updateByline(admin, jane.id, { fields: { homepage: null, role: "  " } });
    expect((await cms.bylines.getByline(jane.id)).fields).toEqual({ verified: true });
  });

  it("requires a required field, and translatable values need the default locale", async () => {
    await cms.bylines.createBylineField(admin, {
      label: "Title",
      type: "string",
      required: true,
      translatable: true,
    });

    const missingMessage = await expectError(cms.bylines.createByline(admin, { name: "Pat" }), 422);
    expect(missingMessage.message).toBe("Title is required");

    await expectError(
      cms.bylines.createByline(admin, { name: "Pat", fields: { title: { pt: "Engenheira" } } }),
      422,
    );
    await expectError(
      cms.bylines.createByline(admin, {
        name: "Pat",
        fields: { title: { en: "Engineer", fr: "x" } },
      }),
      422,
    );

    const pat = await cms.bylines.createByline(admin, {
      name: "Pat",
      fields: { title: { en: "Engineer", pt: "Engenheira" } },
    });
    expect((await cms.bylines.getByline(pat.id)).fields).toEqual({
      title: { en: "Engineer", pt: "Engenheira" },
    });

    await expectError(
      cms.bylines.updateByline(admin, pat.id, {
        fields: { title: { en: null, pt: "Engenheira" } },
      }),
      422,
    );
  });
});

describe("byline guest flag and slug", () => {
  it("round-trips the guest flag and keeps the slug when an update sends an empty one", async () => {
    const gus = await cms.bylines.createByline(admin, { name: "Gus", isGuest: true });
    expect((await cms.bylines.getByline(gus.id)).isGuest).toBe(true);

    const updated = await cms.bylines.updateByline(admin, gus.id, { isGuest: false, slug: "" });
    expect(updated.isGuest).toBe(false);
    expect(updated.slug).toBe("gus");
  });
});
