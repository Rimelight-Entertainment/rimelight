import type { APIRoute } from "astro"
import satori, { init as initYoga } from "satori/standalone"
import { initWasm, Resvg } from "@resvg/resvg-wasm"
import yogaWasm from "satori/yoga.wasm?module"
import resvgWasm from "@resvg/resvg-wasm/index_bg.wasm?module"

let initialized = false

async function init() {
  if (initialized) return
  await initYoga(yogaWasm)
  try {
    await initWasm(resvgWasm)
  } catch {
    // Already initialized
  }
  initialized = true
}
let fontCache: { regular: ArrayBuffer; bold: ArrayBuffer } | null = null

async function getFonts(): Promise<{ regular: ArrayBuffer; bold: ArrayBuffer }> {
  if (fontCache) return fontCache
  const [regular, bold] = await Promise.all([
    fetch("https://cdn.jsdelivr.net/fontsource/fonts/noto-sans@latest/latin-400-normal.ttf").then(
      (r) => r.arrayBuffer()
    ),
    fetch("https://cdn.jsdelivr.net/fontsource/fonts/noto-sans@latest/latin-700-normal.ttf").then(
      (r) => r.arrayBuffer()
    )
  ])
  fontCache = { regular, bold }
  return fontCache
}

function buildOgJsx(
  title: string,
  description: string,
  typeDisplay: string,
  pubDate: string,
  isDocs: boolean
): any {
  if (isDocs) {
    return {
      type: "div",
      props: {
        style: {
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          padding: "56px",
          background: "linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 100%)",
          color: "#e5e5e5",
          fontFamily: "Noto Sans"
        },
        children: [
          {
            type: "div",
            props: {
              style: { display: "flex", alignItems: "center" },
              children: [
                {
                  type: "span",
                  props: {
                    style: {
                      fontSize: "28px",
                      fontWeight: 700,
                      color: "#ffffff",
                      letterSpacing: "-0.02em"
                    },
                    children: "Rimelight"
                  }
                }
              ]
            }
          },
          {
            type: "div",
            props: {
              style: {
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                flexGrow: 1,
                paddingTop: "20px"
              },
              children: [
                {
                  type: "div",
                  props: {
                    style: {
                      width: "60px",
                      height: "4px",
                      backgroundColor: "#60a5fa",
                      borderRadius: "2px",
                      marginBottom: "16px"
                    }
                  }
                },
                {
                  type: "div",
                  props: {
                    style: {
                      fontSize: "52px",
                      fontWeight: 700,
                      color: "#ffffff",
                      lineHeight: 1.15,
                      maxWidth: "950px"
                    },
                    children: title
                  }
                },
                description
                  ? {
                      type: "div",
                      props: {
                        style: {
                          fontSize: "22px",
                          fontWeight: 400,
                          color: "#94a3b8",
                          marginTop: "12px",
                          lineHeight: 1.4,
                          maxWidth: "800px"
                        },
                        children: description
                      }
                    }
                  : null
              ].filter(Boolean)
            }
          },
          {
            type: "div",
            props: {
              style: { display: "flex", alignItems: "center", gap: "12px", marginTop: "auto" },
              children: [
                {
                  type: "div",
                  props: {
                    style: {
                      padding: "6px 16px",
                      borderRadius: "9999px",
                      backgroundColor: "rgba(96, 165, 250, 0.15)",
                      border: "1px solid rgba(96, 165, 250, 0.3)",
                      fontSize: "14px",
                      fontWeight: 600,
                      color: "#93c5fd"
                    },
                    children: typeDisplay || "Documentation"
                  }
                }
              ]
            }
          }
        ]
      }
    }
  }

  return {
    type: "div",
    props: {
      style: {
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        padding: "56px",
        backgroundColor: "#0a0a0a",
        color: "#e5e5e5",
        fontFamily: "Noto Sans"
      },
      children: [
        {
          type: "div",
          props: {
            style: { display: "flex", alignItems: "center" },
            children: [
              {
                type: "span",
                props: {
                  style: {
                    fontSize: "28px",
                    fontWeight: 700,
                    color: "#ffffff",
                    letterSpacing: "-0.02em"
                  },
                  children: "Rimelight"
                }
              }
            ]
          }
        },
        {
          type: "div",
          props: {
            style: {
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              flexGrow: 1,
              paddingTop: "24px"
            },
            children: [
              {
                type: "div",
                props: {
                  style: {
                    fontSize: "56px",
                    fontWeight: 700,
                    color: "#ffffff",
                    lineHeight: 1.15,
                    maxWidth: "950px"
                  },
                  children: title
                }
              },
              description
                ? {
                    type: "div",
                    props: {
                      style: {
                        fontSize: "24px",
                        fontWeight: 400,
                        color: "#a0a0a0",
                        marginTop: "16px",
                        lineHeight: 1.4,
                        maxWidth: "850px"
                      },
                      children: description
                    }
                  }
                : null
            ].filter(Boolean)
          }
        },
        {
          type: "div",
          props: {
            style: {
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginTop: "auto"
            },
            children: [
              typeDisplay
                ? {
                    type: "div",
                    props: {
                      style: {
                        padding: "8px 20px",
                        borderRadius: "9999px",
                        border: "1px solid #333333",
                        fontSize: "16px",
                        fontWeight: 600,
                        color: "#e5e5e5"
                      },
                      children: typeDisplay
                    }
                  }
                : null,
              pubDate
                ? {
                    type: "div",
                    props: {
                      style: { fontSize: "16px", color: "#666666" },
                      children: pubDate
                    }
                  }
                : null
            ].filter(Boolean)
          }
        }
      ]
    }
  }
}

export const GET: APIRoute = async ({ request, params }) => {
  await init()
  const url = new URL(request.url)
  const routeParam = params.route ?? ""

  // Extract from query params or route
  const title = url.searchParams.get("title") || routeParam || "Rimelight Entertainment"
  const description = url.searchParams.get("description") || ""
  const type = url.searchParams.get("type") || ""
  const pubDate = url.searchParams.get("pubDate") || ""
  const isDocs = url.searchParams.get("isDocs") === "true" || routeParam.includes("docs")

  const jsx = buildOgJsx(title, description, type, pubDate, isDocs)

  const { regular, bold } = await getFonts()

  const svg = await satori(jsx, {
    width: 1200,
    height: 630,
    fonts: [
      { name: "Noto Sans", data: regular, weight: 400, style: "normal" },
      { name: "Noto Sans", data: bold, weight: 700, style: "normal" }
    ]
  })

  const resvg = new Resvg(svg, {
    fitTo: { mode: "width", value: 1200 }
  })

  const pngBuffer = resvg.render().asPng()
  const arrayBuffer = new ArrayBuffer(pngBuffer.byteLength)
  new Uint8Array(arrayBuffer).set(pngBuffer)

  return new Response(new Blob([arrayBuffer], { type: "image/png" }), {
    status: 200,
    headers: {
      "Content-Type": "image/png",
      "Cache-Control": "public, max-age=31536000, immutable",
      "CDN-Cache-Control": "public, max-age=31536000"
    }
  })
}
