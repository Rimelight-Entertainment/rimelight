import type { APIRoute } from "astro"
import { getCollection } from "astro:content"
import { render } from "takumi-js"

export const prerender = true

export async function getStaticPaths() {
  const blogs = await getCollection("blog").catch(() => [])
  const docs = await getCollection("docs").catch(() => [])
  const legals = await getCollection("legal").catch(() => [])

  const paths = [
    { params: { route: "page" }, props: {}, cacheKey: "static-page" },
    {
      params: { route: "default" },
      props: {
        title: "Rimelight Entertainment",
        description: "Entertainment & Gaming",
        type: "Documentation",
        isDocs: false
      },
      cacheKey: "static-default"
    },
    {
      params: { route: "wiki-default" },
      props: {
        title: "Grand Tale Wiki",
        description: "Knowledge Base",
        type: "Wiki",
        isDocs: true
      },
      cacheKey: "static-wiki"
    },
    {
      params: { route: "forum-default" },
      props: {
        title: "Rimelight Forums",
        description: "Community Discussions",
        type: "Community",
        isDocs: false
      },
      cacheKey: "static-forum"
    },
    ...blogs.map((b: any) => ({
      params: { route: `blog/${b.id}` },
      props: {
        title: b.data.title,
        description: b.data.description || "",
        type: "Blog Post",
        isDocs: false,
        pubDate: b.data.pubDate ? new Date(b.data.pubDate).toLocaleDateString() : ""
      },
      cacheKey: b.digest || b.id
    })),
    ...docs.map((d: any) => ({
      params: { route: `docs/${d.id}` },
      props: {
        title: d.data.title,
        description: d.data.description || "",
        type: "Documentation",
        isDocs: true
      },
      cacheKey: d.digest || d.id
    })),
    ...legals.map((l: any) => ({
      params: { route: `legal/${l.id}` },
      props: {
        title: l.data.title,
        description: l.data.description || "",
        type: "Legal",
        isDocs: false
      },
      cacheKey: l.digest || l.id
    }))
  ]
  return paths
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

interface OgProps {
  title?: string
  description?: string
  type?: string
  pubDate?: string
  isDocs?: boolean
}

export const GET: APIRoute<OgProps> = async ({ request, params, props }) => {
  const url = new URL(request.url)
  const routeParam = params.route ?? ""

  // Extract from props, query params or route
  const title =
    props.title || url.searchParams.get("title") || routeParam || "Rimelight Entertainment"
  const description = props.description || url.searchParams.get("description") || ""
  const type = props.type || url.searchParams.get("type") || ""
  const pubDate = props.pubDate || url.searchParams.get("pubDate") || ""
  const isDocs =
    props.isDocs ?? (url.searchParams.get("isDocs") === "true" || routeParam.includes("docs"))

  const jsx = buildOgJsx(title, description, type, pubDate, isDocs)

  const { regular, bold } = await getFonts()

  const pngBuffer = await render(jsx, {
    width: 1200,
    height: 630,
    fonts: [
      { name: "Noto Sans", data: regular, weight: 400, style: "normal" },
      { name: "Noto Sans", data: bold, weight: 700, style: "normal" }
    ]
  })

  return new Response(new Blob([new Uint8Array(pngBuffer)], { type: "image/png" }), {
    status: 200,
    headers: {
      "Content-Type": "image/png",
      "Cache-Control": "public, max-age=31536000, immutable",
      "CDN-Cache-Control": "public, max-age=31536000"
    }
  })
}
