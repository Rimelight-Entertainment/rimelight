import { describe, it, expect } from "vite-plus/test";
import { generatePng, generateMaskablePng, generateIco, generateOgCard } from "../src/assets.js";

const sampleSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100">
  <circle cx="50" cy="50" r="40" fill="#ff0000" />
</svg>`;

function getPngMetadata(buf: Buffer) {
  // PNG signature: 8 bytes
  const isPng =
    buf.length >= 24 && buf[0] === 0x89 && buf[1] === 0x50 && buf[2] === 0x4e && buf[3] === 0x47;
  return {
    format: isPng ? "png" : "unknown",
    width: buf.readUInt32BE(16),
    height: buf.readUInt32BE(20),
  };
}

describe("Asset Generation", () => {
  it("generates PNG buffer with correct dimensions", async () => {
    const pngBuffer = await generatePng(Buffer.from(sampleSvg), { width: 192, height: 192 });
    expect(pngBuffer).toBeInstanceOf(Buffer);

    const meta = getPngMetadata(pngBuffer);
    expect(meta.format).toBe("png");
    expect(meta.width).toBe(192);
    expect(meta.height).toBe(192);
  });

  it("generates maskable PNG buffer with padding and background", async () => {
    const maskableBuffer = await generateMaskablePng(Buffer.from(sampleSvg), {
      size: 512,
      background: "#123456",
    });
    expect(maskableBuffer).toBeInstanceOf(Buffer);

    const meta = getPngMetadata(maskableBuffer);
    expect(meta.format).toBe("png");
    expect(meta.width).toBe(512);
    expect(meta.height).toBe(512);
  });

  it("generates valid .ico buffer containing PNG data", async () => {
    const icoBuffer = await generateIco(Buffer.from(sampleSvg), 32);
    expect(icoBuffer).toBeInstanceOf(Buffer);
    expect(icoBuffer.length).toBeGreaterThan(22);

    // Verify ICO header
    expect(icoBuffer.readUInt16LE(0)).toBe(0); // Reserved
    expect(icoBuffer.readUInt16LE(2)).toBe(1); // Type = 1 (ICO)
    expect(icoBuffer.readUInt16LE(4)).toBe(1); // 1 image

    // Verify directory entry
    expect(icoBuffer.readUInt8(6)).toBe(32); // Width
    expect(icoBuffer.readUInt8(7)).toBe(32); // Height
    expect(icoBuffer.readUInt16LE(10)).toBe(1); // Planes
    expect(icoBuffer.readUInt16LE(12)).toBe(32); // 32 bpp
    expect(icoBuffer.readUInt32LE(18)).toBe(22); // Offset = 22

    // Verify PNG payload inside ICO
    const pngSlice = icoBuffer.subarray(22);
    const meta = getPngMetadata(pngSlice);
    expect(meta.format).toBe("png");
    expect(meta.width).toBe(32);
    expect(meta.height).toBe(32);
  });

  it("generates standard 1200x630 OG card buffer", async () => {
    const ogBuffer = await generateOgCard({
      logoBuffer: Buffer.from(sampleSvg),
      background: "#0a0a0a",
    });
    expect(ogBuffer).toBeInstanceOf(Buffer);

    const meta = getPngMetadata(ogBuffer);
    expect(meta.format).toBe("png");
    expect(meta.width).toBe(1200);
    expect(meta.height).toBe(630);
  });
});
