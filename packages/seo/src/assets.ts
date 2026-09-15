import sharp from "sharp"

export interface GeneratePngOptions {
  width: number
  height: number
  background?: string
}

export interface GenerateMaskableOptions {
  size?: number
  background?: string
  paddingRatio?: number
}

export interface GenerateOgCardOptions {
  width?: number
  height?: number
  background?: string
  logoBuffer?: Buffer | Uint8Array | string | null
}

/**
 * Generate a PNG buffer resized to specific dimensions from an SVG or image buffer.
 */
export async function generatePng(
  source: Buffer | Uint8Array | string,
  options: { width: number; height: number }
): Promise<Buffer> {
  return sharp(source)
    .resize(options.width, options.height, {
      fit: "contain",
      background: { r: 0, g: 0, b: 0, alpha: 0 }
    })
    .png()
    .toBuffer()
}

/**
 * Generate a maskable PWA PNG icon with safe-zone padding and solid background. The standard
 * recommendation is to place the master icon in the inner 80% safe zone.
 */
export async function generateMaskablePng(
  source: Buffer | Uint8Array | string,
  options: GenerateMaskableOptions = {}
): Promise<Buffer> {
  const { size = 512, background = "#ffffff", paddingRatio = 0.15 } = options
  const innerSize = Math.round(size * (1 - paddingRatio * 2))
  const pad = Math.floor((size - innerSize) / 2)

  const innerPng = await sharp(source)
    .resize(innerSize, innerSize, {
      fit: "contain",
      background: { r: 0, g: 0, b: 0, alpha: 0 }
    })
    .png()
    .toBuffer()

  return sharp(innerPng)
    .extend({
      top: pad,
      bottom: size - innerSize - pad,
      left: pad,
      right: size - innerSize - pad,
      background
    })
    .png()
    .toBuffer()
}

/**
 * Generate a valid .ico buffer containing a 32x32 PNG image according to the Windows ICO
 * specification.
 */
export async function generateIco(
  source: Buffer | Uint8Array | string,
  size = 32
): Promise<Buffer> {
  const pngBuffer = await generatePng(source, { width: size, height: size })

  const header = Buffer.alloc(22)
  // Reserved (2 bytes)
  header.writeUInt16LE(0, 0)
  // Image type (1 = ICO) (2 bytes)
  header.writeUInt16LE(1, 2)
  // Number of images (2 bytes)
  header.writeUInt16LE(1, 4)

  // Directory entry (16 bytes)
  header.writeUInt8(size === 256 ? 0 : size, 6) // Width
  header.writeUInt8(size === 256 ? 0 : size, 7) // Height
  header.writeUInt8(0, 8) // Palette size (0 = no palette)
  header.writeUInt8(0, 9) // Reserved
  header.writeUInt16LE(1, 10) // Color planes
  header.writeUInt16LE(32, 12) // Bits per pixel (32bpp)
  header.writeUInt32LE(pngBuffer.length, 14) // Image size in bytes
  header.writeUInt32LE(22, 18) // Offset of image data (header size = 22)

  return Buffer.concat([header, pngBuffer])
}

/**
 * Generate a standard 1200x630 branded Open Graph card from a master logo and background color.
 */
export async function generateOgCard(options: GenerateOgCardOptions = {}): Promise<Buffer> {
  const { width = 1200, height = 630, background = "#0a0a0a", logoBuffer } = options

  if (logoBuffer) {
    const logoSize = Math.min(Math.round(height * 0.45), 280)
    const logoPng = await generatePng(logoBuffer, { width: logoSize, height: logoSize })
    const topPad = Math.floor((height - logoSize) / 2)
    const bottomPad = height - logoSize - topPad
    const leftPad = Math.floor((width - logoSize) / 2)
    const rightPad = width - logoSize - leftPad

    return sharp(logoPng)
      .extend({
        top: topPad,
        bottom: bottomPad,
        left: leftPad,
        right: rightPad,
        background
      })
      .png()
      .toBuffer()
  }

  return sharp({
    create: {
      width,
      height,
      channels: 4,
      background
    }
  })
    .png()
    .toBuffer()
}
