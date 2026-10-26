import { describe, expect, it } from "vite-plus/test";
import { isTrueColumn } from "../src/services/taxonomies";

describe("boolean column values", () => {
  it("reads Postgres text booleans, SQLite integers and real booleans the same way", () => {
    expect(isTrueColumn(true)).toBe(true);
    expect(isTrueColumn("t")).toBe(true);
    expect(isTrueColumn(1)).toBe(true);
    expect(isTrueColumn(false)).toBe(false);
    expect(isTrueColumn("f")).toBe(false); // !!"f" is true, which is the bug this guards against
    expect(isTrueColumn(0)).toBe(false);
    expect(isTrueColumn(null)).toBe(false);
  });
});
