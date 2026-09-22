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

function toDataUrl(source: Buffer | Uint8Array | string): string {
  if (typeof source === "string") {
    if (source.startsWith("data:") || source.startsWith("http:") || source.startsWith("https:")) {
      return source
    }
    const trimmed = source.trim()
    if (trimmed.startsWith("<svg")) {
      return `data:image/svg+xml;base64,${Buffer.from(trimmed).toString("base64")}`
    }
    return source
  }
  const buf = Buffer.from(source)
  const isSvg = buf.subarray(0, 100).toString("utf8").includes("<svg")
  const mime = isSvg ? "image/svg+xml" : "image/png"
  return `data:${mime};base64,${buf.toString("base64")}`
}

/**
 * Generate a PNG buffer resized to specific dimensions from an SVG or image buffer.
 */
export async function generatePng(
  source: Buffer | Uint8Array | string,
  options: { width: number; height: number; background?: string }
): Promise<Buffer> {
  const { renderTakumi } = await import("./takumi.js")
  const src = toDataUrl(source)

  const vnode = {
    type: "div",
    props: {
      style: {
        display: "flex",
        width: `${options.width}px`,
        height: `${options.height}px`,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: options.background || "transparent"
      },
      children: {
        type: "img",
        props: {
          src,
          style: {
            width: "100%",
            height: "100%",
            objectFit: "contain"
          }
        }
      }
    }
  }

  const png = await renderTakumi(vnode, {
    width: options.width,
    height: options.height
  })

  return Buffer.from(png)
}

/**
 * Generate a maskable PWA PNG icon with safe-zone padding and solid background. Standard
 * recommendation is to place the master icon in the inner ~70-80% safe zone.
 */
export async function generateMaskablePng(
  source: Buffer | Uint8Array | string,
  options: GenerateMaskableOptions = {}
): Promise<Buffer> {
  const { size = 512, background = "#ffffff", paddingRatio = 0.15 } = options
  const { renderTakumi } = await import("./takumi.js")
  const src = toDataUrl(source)
  const innerPercent = `${Math.round((1 - paddingRatio * 2) * 100)}%`

  const vnode = {
    type: "div",
    props: {
      style: {
        display: "flex",
        width: `${size}px`,
        height: `${size}px`,
        backgroundColor: background,
        alignItems: "center",
        justifyContent: "center"
      },
      children: {
        type: "img",
        props: {
          src,
          style: {
            width: innerPercent,
            height: innerPercent,
            objectFit: "contain"
          }
        }
      }
    }
  }

  const png = await renderTakumi(vnode, {
    width: size,
    height: size
  })

  return Buffer.from(png)
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
  const { renderTakumi } = await import("./takumi.js")

  const bgStyle =
    background.startsWith("linear-gradient") || background.startsWith("radial-gradient")
      ? { background }
      : { backgroundColor: background }

  let children: any = null
  if (logoBuffer) {
    const src = toDataUrl(logoBuffer)
    const logoSize = Math.min(Math.round(height * 0.45), 280)
    children = {
      type: "img",
      props: {
        src,
        style: {
          width: `${logoSize}px`,
          height: `${logoSize}px`,
          objectFit: "contain"
        }
      }
    }
  }

  const vnode = {
    type: "div",
    props: {
      style: {
        display: "flex",
        width: `${width}px`,
        height: `${height}px`,
        alignItems: "center",
        justifyContent: "center",
        ...bgStyle
      },
      ...(children ? { children } : {})
    }
  }

  const png = await renderTakumi(vnode, { width, height })
  return Buffer.from(png)
}
