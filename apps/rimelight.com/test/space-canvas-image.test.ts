import { describe, expect, it } from "vite-plus/test";
import {
  assetObjectKey,
  checkImportUrl,
  inspectImage,
  parseThumbSize,
  quotaRefusal,
  sha256Hex,
  thumbObjectKey,
} from "../src/space/canvas-image";

const ascii = (s: string): number[] => Array.from(s, (c) => c.charCodeAt(0));
const zeros = (n: number): number[] => new Array<number>(n).fill(0);
const u16le = (n: number): number[] => [n & 0xff, (n >> 8) & 0xff];
const u16be = (n: number): number[] => [(n >> 8) & 0xff, n & 0xff];
const u24le = (n: number): number[] => [n & 0xff, (n >> 8) & 0xff, (n >> 16) & 0xff];
const u32le = (n: number): number[] => [
  n & 0xff,
  (n >> 8) & 0xff,
  (n >> 16) & 0xff,
  (n >>> 24) & 0xff,
];
const u32be = (n: number): number[] => [
  (n >>> 24) & 0xff,
  (n >> 16) & 0xff,
  (n >> 8) & 0xff,
  n & 0xff,
];
const bytes = (...parts: number[][]): Uint8Array => new Uint8Array(parts.flat());

const PNG_SIGNATURE = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];
const ANMF_CHUNK = [...ascii("ANMF"), ...u32le(4), ...zeros(4)];

describe("inspectImage", () => {
  it("reads a PNG's size from the IHDR chunk", () => {
    const png = bytes(PNG_SIGNATURE, u32be(13), ascii("IHDR"), u32be(640), u32be(480));
    expect(inspectImage(png)).toEqual({
      mime: "image/png",
      ext: "png",
      width: 640,
      height: 480,
      frameCount: 1,
    });
  });

  it("walks past an APP0 segment to a JPEG start-of-frame marker", () => {
    const jpeg = bytes(
      [0xff, 0xd8],
      [0xff, 0xe0],
      u16be(0x0010),
      zeros(14),
      [0xff, 0xc0],
      u16be(0x0011),
      [8],
      u16be(300),
      u16be(200),
      zeros(3),
    );
    expect(inspectImage(jpeg)).toEqual({
      mime: "image/jpeg",
      ext: "jpg",
      width: 200,
      height: 300,
      frameCount: 1,
    });
  });

  it("counts the image descriptors of a GIF", () => {
    const descriptor = [0x2c, ...zeros(8), 0, 2, 1, 0x44, 0];
    const gif = bytes(
      ascii("GIF89a"),
      u16le(10),
      u16le(20),
      [0],
      [0],
      [0],
      descriptor,
      descriptor,
      [0x3b],
    );
    expect(inspectImage(gif)).toEqual({
      mime: "image/gif",
      ext: "gif",
      width: 10,
      height: 20,
      frameCount: 2,
    });
  });

  it("counts the ANMF chunks of an animated WebP", () => {
    const webp = bytes(
      ascii("RIFF"),
      u32le(0),
      ascii("WEBP"),
      ascii("VP8X"),
      u32le(10),
      [0x02],
      zeros(3),
      u24le(99),
      u24le(49),
      ANMF_CHUNK,
      ANMF_CHUNK,
    );
    expect(inspectImage(webp)).toEqual({
      mime: "image/webp",
      ext: "webp",
      width: 100,
      height: 50,
      frameCount: 2,
    });
  });

  it("reads a lossless WebP's size as 1x1 from all-zero bits", () => {
    const webp = bytes(
      ascii("RIFF"),
      u32le(0),
      ascii("WEBP"),
      ascii("VP8L"),
      u32le(5),
      [0x2f],
      zeros(4),
    );
    expect(inspectImage(webp)).toEqual({
      mime: "image/webp",
      ext: "webp",
      width: 1,
      height: 1,
      frameCount: 1,
    });
  });

  it("returns null for random bytes", () => {
    expect(inspectImage(bytes([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16]))).toBeNull();
  });

  it("returns null for an empty array", () => {
    expect(inspectImage(new Uint8Array([]))).toBeNull();
  });

  it("returns null for a PNG with width 0", () => {
    const png = bytes(PNG_SIGNATURE, u32be(13), ascii("IHDR"), u32be(0), u32be(480));
    expect(inspectImage(png)).toBeNull();
  });
});

describe("sha256Hex", () => {
  it("hashes the ASCII bytes of abc", async () => {
    expect(await sha256Hex(new Uint8Array(ascii("abc")))).toBe(
      "ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad",
    );
  });
});

describe("object keys and thumbnail sizes", () => {
  it("builds the asset key", () => {
    expect(assetObjectKey("c1", "ab", "png")).toBe("space/canvases/c1/assets/ab.png");
  });

  it("builds the thumbnail key", () => {
    expect(thumbObjectKey("c1", "ab", 256)).toBe("space/canvases/c1/thumbs/ab-256.webp");
  });

  it("parses a known thumbnail size and rejects others", () => {
    expect(parseThumbSize("256")).toBe(256);
    expect(parseThumbSize("512")).toBeNull();
  });
});

describe("quotaRefusal", () => {
  it("allows an upload into an empty quota", () => {
    expect(quotaRefusal(0, 100, 50)).toBeNull();
  });

  it("refuses an upload that does not fit, with a message", () => {
    expect(quotaRefusal(90, 100, 50)).toEqual(expect.any(String));
  });

  it("allows an upload that fills the quota exactly", () => {
    expect(quotaRefusal(50, 100, 50)).toBeNull();
  });
});

describe("checkImportUrl", () => {
  it("allows a plain https link", () => {
    expect(checkImportUrl("https://example.com/a.png").ok).toBe(true);
  });

  const refused = [
    "http://example.com/a.png",
    "https://localhost/a.png",
    "https://127.0.0.1/a.png",
    "https://10.1.2.3/a.png",
    "https://192.168.0.5/x",
    "https://172.20.0.1/x",
    "https://[::1]/x",
    "https://user:pw@example.com/x",
    "https://example.com:8443/x",
    "not a url",
  ];
  for (const raw of refused) {
    it(`refuses ${raw}`, () => {
      expect(checkImportUrl(raw).ok).toBe(false);
    });
  }
});
