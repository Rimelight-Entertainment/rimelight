import { defineDocsConfig } from "@rimelight/ui/utils"

export default defineDocsConfig({
  editLink: {
    baseUrl: "https://github.com/Rimelight-Entertainment/rimelight.com/edit/main/src/content/docs/"
  },
  sidebar: {
    scopes: [
      {
        label: "docs_sidebar_scopes_overview",
        icon: "i-lucide-book-open",
        collapsed: false,
        items: [
          {
            label: "docs_sidebar_page_getting-started",
            href: "/{locale}/company/docs/overview/getting-started/"
          },
          {
            label: "docs_sidebar_page_contributing",
            href: "/{locale}/company/docs/overview/contributing/"
          },
          {
            label: "docs_sidebar_group_coding-style-guide",
            collapsed: true,
            items: [
              {
                autogenerate: { directory: "company/docs/overview/contributing/coding-style-guide" }
              }
            ]
          }
        ]
      },
      {
        label: "docs_sidebar_scopes_website",
        icon: "i-lucide-globe",
        collapsed: true,
        items: [
          {
            label: "docs_sidebar_group_overview",
            collapsed: false,
            items: [{ autogenerate: { directory: "company/docs/website/overview" } }]
          }
        ]
      },
      {
        label: "docs_sidebar_scopes_products",
        icon: "i-lucide-box",
        collapsed: true,
        items: [
          {
            label: "docs_sidebar_group_overview",
            collapsed: false,
            items: [{ autogenerate: { directory: "company/docs/products/overview" } }]
          },
          {
            label: "docs_sidebar_group_grand-tale",
            collapsed: true,
            items: [
              {
                label: "docs_sidebar_group_overview",
                collapsed: false,
                items: [
                  { autogenerate: { directory: "company/docs/products/grand-tale/overview" } }
                ]
              },
              {
                label: "docs_sidebar_group_core",
                collapsed: true,
                items: [{ autogenerate: { directory: "company/docs/products/grand-tale/core" } }]
              },
              {
                label: "docs_sidebar_group_code",
                collapsed: true,
                items: [{ autogenerate: { directory: "company/docs/products/grand-tale/code" } }]
              },
              {
                label: "docs_sidebar_group_writing",
                collapsed: true,
                items: [{ autogenerate: { directory: "company/docs/products/grand-tale/writing" } }]
              },
              {
                label: "docs_sidebar_group_art",
                collapsed: true,
                items: [{ autogenerate: { directory: "company/docs/products/grand-tale/art" } }]
              },
              {
                label: "docs_sidebar_group_sound",
                collapsed: true,
                items: [{ autogenerate: { directory: "company/docs/products/grand-tale/sound" } }]
              },
              {
                label: "docs_sidebar_group_internationalization",
                collapsed: true,
                items: [
                  {
                    autogenerate: {
                      directory: "company/docs/products/grand-tale/internationalization"
                    }
                  }
                ]
              }
            ]
          }
        ]
      },
      {
        label: "docs_sidebar_scopes_packages",
        icon: "i-lucide-layers",
        collapsed: true,
        items: [
          {
            label: "docs_sidebar_group_overview",
            collapsed: false,
            items: [{ autogenerate: { directory: "company/docs/packages/overview" } }]
          },
          {
            label: "docs_sidebar_group_rimelight-ui",
            collapsed: true,
            items: [
              {
                label: "docs_sidebar_group_overview",
                collapsed: false,
                items: [
                  { autogenerate: { directory: "company/docs/packages/rimelight-ui/overview" } }
                ]
              },
              {
                label: "docs_sidebar_group_architecture",
                collapsed: true,
                items: [
                  {
                    autogenerate: { directory: "company/docs/packages/rimelight-ui/architecture" }
                  }
                ]
              },
              {
                label: "docs_sidebar_group_components",
                collapsed: true,
                items: [
                  {
                    label: "docs_sidebar_group_component_app",
                    collapsed: true,
                    items: [
                      {
                        autogenerate: {
                          directory: "company/docs/packages/rimelight-ui/components/app"
                        }
                      }
                    ]
                  },
                  {
                    label: "docs_sidebar_group_component_utility",
                    collapsed: true,
                    items: [
                      {
                        autogenerate: {
                          directory: "company/docs/packages/rimelight-ui/components/utility"
                        }
                      }
                    ]
                  },
                  {
                    label: "docs_sidebar_group_component_layout",
                    collapsed: true,
                    items: [
                      {
                        autogenerate: {
                          directory: "company/docs/packages/rimelight-ui/components/layout"
                        }
                      }
                    ]
                  },
                  {
                    label: "docs_sidebar_group_component_elements",
                    collapsed: true,
                    items: [
                      {
                        autogenerate: {
                          directory: "company/docs/packages/rimelight-ui/components/elements"
                        }
                      }
                    ]
                  },
                  {
                    label: "docs_sidebar_group_component_media",
                    collapsed: true,
                    items: [
                      {
                        autogenerate: {
                          directory: "company/docs/packages/rimelight-ui/components/media"
                        }
                      }
                    ]
                  },
                  {
                    label: "docs_sidebar_group_component_form",
                    collapsed: true,
                    items: [
                      {
                        autogenerate: {
                          directory: "company/docs/packages/rimelight-ui/components/form"
                        }
                      }
                    ]
                  },
                  {
                    label: "docs_sidebar_group_component_data",
                    collapsed: true,
                    items: [
                      {
                        autogenerate: {
                          directory: "company/docs/packages/rimelight-ui/components/data"
                        }
                      }
                    ]
                  },
                  {
                    label: "docs_sidebar_group_component_navigation",
                    collapsed: true,
                    items: [
                      {
                        autogenerate: {
                          directory: "company/docs/packages/rimelight-ui/components/navigation"
                        }
                      }
                    ]
                  },
                  {
                    label: "docs_sidebar_group_component_overlay",
                    collapsed: true,
                    items: [
                      {
                        autogenerate: {
                          directory: "company/docs/packages/rimelight-ui/components/overlay"
                        }
                      }
                    ]
                  },
                  {
                    label: "docs_sidebar_group_component_page",
                    collapsed: true,
                    items: [
                      {
                        autogenerate: {
                          directory: "company/docs/packages/rimelight-ui/components/page"
                        }
                      }
                    ]
                  },
                  {
                    label: "docs_sidebar_group_component_dashboard",
                    collapsed: true,
                    items: [
                      {
                        autogenerate: {
                          directory: "company/docs/packages/rimelight-ui/components/dashboard"
                        }
                      }
                    ]
                  },
                  {
                    label: "docs_sidebar_group_component_editor",
                    collapsed: true,
                    items: [
                      {
                        autogenerate: {
                          directory: "company/docs/packages/rimelight-ui/components/editor"
                        }
                      }
                    ]
                  },
                  {
                    label: "docs_sidebar_group_component_ai",
                    collapsed: true,
                    items: [
                      {
                        autogenerate: {
                          directory: "company/docs/packages/rimelight-ui/components/ai"
                        }
                      }
                    ]
                  },
                  {
                    label: "docs_sidebar_group_component_effects",
                    collapsed: true,
                    items: [
                      {
                        autogenerate: {
                          directory: "company/docs/packages/rimelight-ui/components/effect"
                        }
                      }
                    ]
                  },
                  {
                    label: "docs_sidebar_group_component_mockup",
                    collapsed: true,
                    items: [
                      {
                        autogenerate: {
                          directory: "company/docs/packages/rimelight-ui/components/mockup"
                        }
                      }
                    ]
                  }
                ]
              },
              {
                label: "docs_sidebar_group_composables",
                collapsed: true,
                items: [
                  {
                    autogenerate: { directory: "company/docs/packages/rimelight-ui/composables" }
                  }
                ]
              },
              {
                label: "docs_sidebar_group_plugins",
                collapsed: true,
                items: [
                  { autogenerate: { directory: "company/docs/packages/rimelight-ui/plugins" } }
                ]
              },
              {
                label: "docs_sidebar_group_agents",
                collapsed: true,
                items: [
                  { autogenerate: { directory: "company/docs/packages/rimelight-ui/agents" } }
                ]
              }
            ]
          },
          {
            label: "docs_sidebar_group_rimelight-unreal",
            collapsed: true,
            items: [
              {
                label: "docs_sidebar_group_overview",
                items: [
                  {
                    autogenerate: { directory: "company/docs/packages/rimelight-unreal/overview" }
                  }
                ]
              }
            ]
          }
        ]
      },
      {
        label: "docs_sidebar_scopes_api",
        icon: "i-lucide-code",
        collapsed: true,
        items: [
          {
            label: "docs_sidebar_group_overview",
            collapsed: false,
            items: [{ autogenerate: { directory: "company/docs/api/overview" } }]
          },
          {
            label: "docs_sidebar_group_reference",
            collapsed: true,
            items: [{ autogenerate: { directory: "company/docs/api/reference" } }]
          }
        ]
      }
    ]
  }
})
