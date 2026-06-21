export function hexToRgb(hex: string): [number, number, number] {
  const shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i
  const fullHex = hex.replace(shorthandRegex, (_, r, g, b) => r + r + g + g + b + b)
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(fullHex)
  return result
    ? [parseInt(result[1]!, 16), parseInt(result[2]!, 16), parseInt(result[3]!, 16)]
    : [0, 0, 0]
}

export function rgbToHex(r: number, g: number, b: number): string {
  const toHex = (c: number) => {
    const hex = Math.max(0, Math.min(255, c)).toString(16)
    return hex.length === 1 ? "0" + hex : hex
  }
  return "#" + toHex(r) + toHex(g) + toHex(b)
}

export function rgbToHsl(r: number, g: number, b: number): [number, number, number] {
  r /= 255
  g /= 255
  b /= 255
  const max = Math.max(r, g, b),
    min = Math.min(r, g, b)
  let h = 0,
    s = 0,
    l = (max + min) / 2
  if (max !== min) {
    const d = max - min
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0)
        break
      case g:
        h = (b - r) / d + 2
        break
      case b:
        h = (r - g) / d + 4
        break
    }
    h /= 6
  }
  return [Math.round(h * 360), Math.round(s * 100), Math.round(l * 100)]
}

export function hslToRgb(h: number, s: number, l: number): [number, number, number] {
  h /= 360
  s /= 100
  l /= 100
  let r = l,
    g = l,
    b = l
  if (s !== 0) {
    const hue2rgb = (p: number, q: number, t: number) => {
      if (t < 0) t += 1
      if (t > 1) t -= 1
      if (t < 1 / 6) return p + (q - p) * 6 * t
      if (t < 1 / 2) return q
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6
      return p
    }
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s
    const p = 2 * l - q
    r = hue2rgb(p, q, h + 1 / 3)
    g = hue2rgb(p, q, h)
    b = hue2rgb(p, q, h - 1 / 3)
  }
  return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)]
}

export function rgbToHsb(r: number, g: number, b: number): [number, number, number] {
  r /= 255
  g /= 255
  b /= 255
  const max = Math.max(r, g, b),
    min = Math.min(r, g, b)
  let h = 0,
    s = 0,
    v = max
  const d = max - min
  s = max === 0 ? 0 : d / max
  if (max !== min) {
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0)
        break
      case g:
        h = (b - r) / d + 2
        break
      case b:
        h = (r - g) / d + 4
        break
    }
    h /= 6
  }
  return [Math.round(h * 360), Math.round(s * 100), Math.round(v * 100)]
}

export function hsbToRgb(h: number, s: number, b: number): [number, number, number] {
  h /= 360
  s /= 100
  b /= 100
  let r = 0,
    g = 0,
    bl = 0
  const i = Math.floor(h * 6)
  const f = h * 6 - i
  const p = b * (1 - s)
  const q = b * (1 - f * s)
  const t = b * (1 - (1 - f) * s)
  switch (i % 6) {
    case 0:
      r = b
      g = t
      bl = p
      break
    case 1:
      r = q
      g = b
      bl = p
      break
    case 2:
      r = p
      g = b
      bl = t
      break
    case 3:
      r = p
      g = q
      bl = b
      break
    case 4:
      r = t
      g = p
      bl = b
      break
    case 5:
      r = b
      g = p
      bl = q
      break
  }
  return [Math.round(r * 255), Math.round(g * 255), Math.round(bl * 255)]
}

export function getChannelRange(channel: string): { min: number; max: number } {
  switch (channel) {
    case "hue":
      return { min: 0, max: 360 }
    case "alpha":
      return { min: 0, max: 100 }
    case "red":
    case "green":
    case "blue":
      return { min: 0, max: 255 }
    default:
      return { min: 0, max: 100 }
  }
}

export function clamp(val: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, val))
}
