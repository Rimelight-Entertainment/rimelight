import { defineDocsConfig } from "@rimelight/ui/utils"

export default defineDocsConfig({
  editLink: {
    baseUrl: "https://github.com/Rimelight-Entertainment/rimelight.com/edit/main/src/content/docs/"
  },
  sidebar: {
    scopes: [
      {
        label: "Overview",
        icon: "i-lucide-book-open",
        collapsed: false,
        items: [
          { label: "Getting Started", href: "/{locale}/company/docs/overview/getting-started/" },
          { label: "Contributing", href: "/{locale}/company/docs/overview/contributing/" },
          {
            label: "Coding Style Guide",
            collapsed: true,
            items: [
              {
                label: "Introduction",
                href: "/{locale}/company/docs/overview/contributing/coding-style-guide/"
              },
              {
                label: "TypeScript",
                href: "/{locale}/company/docs/overview/contributing/coding-style-guide/typescript/"
              },
              {
                label: "Verse",
                href: "/{locale}/company/docs/overview/contributing/coding-style-guide/verse/"
              },
              {
                label: "C++",
                href: "/{locale}/company/docs/overview/contributing/coding-style-guide/cpp/"
              }
            ]
          }
        ]
      },
      {
        label: "Website",
        icon: "i-lucide-globe",
        collapsed: true,
        items: [
          {
            label: "Overview",
            collapsed: false,
            items: [
              {
                label: "Introduction",
                href: "/{locale}/company/docs/website/overview/introduction/"
              },
              { label: "Structure", href: "/{locale}/company/docs/website/overview/structure/" },
              {
                label: "Localization",
                href: "/{locale}/company/docs/website/overview/localization/"
              },
              {
                label: "Internationalization",
                href: "/{locale}/company/docs/website/overview/internationalization/"
              },
              { label: "Deployment", href: "/{locale}/company/docs/website/overview/deployment/" }
            ]
          }
        ]
      },
      {
        label: "Products",
        icon: "i-lucide-box",
        collapsed: true,
        items: [
          {
            label: "Overview",
            collapsed: false,
            items: [
              {
                label: "Introduction",
                href: "/{locale}/company/docs/products/overview/introduction/"
              }
            ]
          },
          {
            label: "Grand Tale",
            collapsed: true,
            items: [
              {
                label: "Overview",
                collapsed: false,
                items: [
                  {
                    label: "Introduction",
                    href: "/{locale}/company/docs/products/grand-tale/overview/introduction/"
                  }
                ]
              },
              {
                label: "Core",
                collapsed: true,
                items: [
                  {
                    label: "Control Scheme",
                    href: "/{locale}/company/docs/products/grand-tale/core/control-scheme/"
                  }
                ]
              },
              {
                label: "Code",
                collapsed: true,
                items: [
                  {
                    label: "Overview",
                    href: "/{locale}/company/docs/products/grand-tale/code/overview/"
                  }
                ]
              },
              {
                label: "Writing",
                collapsed: true,
                items: [
                  {
                    label: "Overview",
                    href: "/{locale}/company/docs/products/grand-tale/writing/overview/"
                  }
                ]
              },
              {
                label: "Art",
                collapsed: true,
                items: [
                  {
                    label: "Overview",
                    href: "/{locale}/company/docs/products/grand-tale/art/overview/"
                  },
                  {
                    label: "File Specifications",
                    href: "/{locale}/company/docs/products/grand-tale/art/file-specifications/"
                  },
                  {
                    label: "References",
                    href: "/{locale}/company/docs/products/grand-tale/art/references/"
                  }
                ]
              },
              {
                label: "Sound",
                collapsed: true,
                items: [
                  {
                    label: "Overview",
                    href: "/{locale}/company/docs/products/grand-tale/sound/overview/"
                  },
                  {
                    label: "File Specifications",
                    href: "/{locale}/company/docs/products/grand-tale/sound/file-specifications/"
                  },
                  {
                    label: "References",
                    href: "/{locale}/company/docs/products/grand-tale/sound/references/"
                  }
                ]
              },
              {
                label: "Internationalization",
                collapsed: true,
                items: [
                  {
                    label: "Overview",
                    href: "/{locale}/company/docs/products/grand-tale/internationalization/overview/"
                  },
                  {
                    label: "English",
                    href: "/{locale}/company/docs/products/grand-tale/internationalization/en/"
                  },
                  {
                    label: "Arabic",
                    href: "/{locale}/company/docs/products/grand-tale/internationalization/ar/"
                  },
                  {
                    label: "Spanish",
                    href: "/{locale}/company/docs/products/grand-tale/internationalization/es/"
                  },
                  {
                    label: "French",
                    href: "/{locale}/company/docs/products/grand-tale/internationalization/fr/"
                  },
                  {
                    label: "Japanese",
                    href: "/{locale}/company/docs/products/grand-tale/internationalization/ja/"
                  },
                  {
                    label: "Korean",
                    href: "/{locale}/company/docs/products/grand-tale/internationalization/ko/"
                  },
                  {
                    label: "Portuguese",
                    href: "/{locale}/company/docs/products/grand-tale/internationalization/pt/"
                  },
                  {
                    label: "Romanian",
                    href: "/{locale}/company/docs/products/grand-tale/internationalization/ro/"
                  },
                  {
                    label: "Chinese",
                    href: "/{locale}/company/docs/products/grand-tale/internationalization/zh_cn/"
                  }
                ]
              }
            ]
          }
        ]
      },
      {
        label: "Packages",
        icon: "i-lucide-layers",
        collapsed: true,
        items: [
          {
            label: "Overview",
            collapsed: false,
            items: [
              {
                label: "Introduction",
                href: "/{locale}/company/docs/packages/overview/introduction/"
              }
            ]
          },
          {
            label: "Rimelight UI",
            collapsed: true,
            items: [
              {
                label: "Overview",
                collapsed: false,
                items: [
                  {
                    label: "Introduction",
                    href: "/{locale}/company/docs/packages/rimelight-ui/overview/introduction/"
                  },
                  {
                    label: "Installation",
                    href: "/{locale}/company/docs/packages/rimelight-ui/overview/installation/"
                  }
                ]
              },
              {
                label: "Architecture",
                collapsed: true,
                items: [
                  {
                    label: "Design System",
                    href: "/{locale}/company/docs/packages/rimelight-ui/architecture/design-system/"
                  },
                  {
                    label: "Colors",
                    href: "/{locale}/company/docs/packages/rimelight-ui/architecture/colors/"
                  },
                  {
                    label: "Color Mode",
                    href: "/{locale}/company/docs/packages/rimelight-ui/architecture/color-mode/"
                  },
                  {
                    label: "Icons",
                    href: "/{locale}/company/docs/packages/rimelight-ui/architecture/icons/"
                  },
                  {
                    label: "Internationalization (i18n)",
                    href: "/{locale}/company/docs/packages/rimelight-ui/architecture/i18n/"
                  },
                  {
                    label: "Server-Side Rendering (SSR)",
                    href: "/{locale}/company/docs/packages/rimelight-ui/architecture/ssr/"
                  },
                  {
                    label: "Shortcuts",
                    href: "/{locale}/company/docs/packages/rimelight-ui/architecture/shortcuts/"
                  },
                  {
                    label: "Variants",
                    href: "/{locale}/company/docs/packages/rimelight-ui/architecture/variants/"
                  }
                ]
              },
              {
                label: "Components",
                collapsed: true,
                items: [
                  {
                    label: "Overview",
                    href: "/{locale}/company/docs/packages/rimelight-ui/components/"
                  },
                  {
                    label: "App",
                    collapsed: true,
                    items: [
                      {
                        label: "App",
                        href: "/{locale}/company/docs/packages/rimelight-ui/components/app/app/"
                      },
                      {
                        label: "Error",
                        href: "/{locale}/company/docs/packages/rimelight-ui/components/app/error/"
                      },
                      {
                        label: "Footer",
                        href: "/{locale}/company/docs/packages/rimelight-ui/components/app/footer/"
                      },
                      {
                        label: "Head",
                        href: "/{locale}/company/docs/packages/rimelight-ui/components/app/head/"
                      },
                      {
                        label: "Header",
                        href: "/{locale}/company/docs/packages/rimelight-ui/components/app/header/"
                      },
                      {
                        label: "Main",
                        href: "/{locale}/company/docs/packages/rimelight-ui/components/app/main/"
                      }
                    ]
                  },
                  {
                    label: "Layout",
                    collapsed: true,
                    items: [
                      {
                        label: "Container",
                        href: "/{locale}/company/docs/packages/rimelight-ui/components/layout/container/"
                      },
                      {
                        label: "Sidebar",
                        href: "/{locale}/company/docs/packages/rimelight-ui/components/layout/sidebar/"
                      },
                      {
                        label: "Splitter",
                        href: "/{locale}/company/docs/packages/rimelight-ui/components/layout/splitter/"
                      }
                    ]
                  },
                  {
                    label: "Element",
                    collapsed: true,
                    items: [
                      {
                        label: "Callout",
                        href: "/{locale}/company/docs/packages/rimelight-ui/components/element/callout/"
                      },
                      {
                        label: "Avatar",
                        href: "/{locale}/company/docs/packages/rimelight-ui/components/element/avatar/"
                      },
                      {
                        label: "AvatarGroup",
                        href: "/{locale}/company/docs/packages/rimelight-ui/components/element/avatar-group/"
                      },
                      {
                        label: "Badge",
                        href: "/{locale}/company/docs/packages/rimelight-ui/components/element/badge/"
                      },
                      {
                        label: "Banner",
                        href: "/{locale}/company/docs/packages/rimelight-ui/components/element/banner/"
                      },
                      {
                        label: "Button",
                        href: "/{locale}/company/docs/packages/rimelight-ui/components/element/button/"
                      },
                      {
                        label: "Calendar",
                        href: "/{locale}/company/docs/packages/rimelight-ui/components/element/calendar/"
                      },
                      {
                        label: "Card",
                        href: "/{locale}/company/docs/packages/rimelight-ui/components/element/card/"
                      },
                      {
                        label: "Chip",
                        href: "/{locale}/company/docs/packages/rimelight-ui/components/element/chip/"
                      },
                      {
                        label: "Collapsible",
                        href: "/{locale}/company/docs/packages/rimelight-ui/components/element/collapsible/"
                      },
                      {
                        label: "FieldGroup",
                        href: "/{locale}/company/docs/packages/rimelight-ui/components/element/field-group/"
                      },
                      {
                        label: "Fieldset",
                        href: "/{locale}/company/docs/packages/rimelight-ui/components/element/fieldset/"
                      },
                      {
                        label: "Kbd",
                        href: "/{locale}/company/docs/packages/rimelight-ui/components/element/kbd/"
                      },
                      {
                        label: "Label",
                        href: "/{locale}/company/docs/packages/rimelight-ui/components/element/label/"
                      },
                      {
                        label: "Logo",
                        href: "/{locale}/company/docs/packages/rimelight-ui/components/element/logo/"
                      },
                      {
                        label: "Separator",
                        href: "/{locale}/company/docs/packages/rimelight-ui/components/element/separator/"
                      },
                      {
                        label: "SpeedDial",
                        href: "/{locale}/company/docs/packages/rimelight-ui/components/element/speed-dial/"
                      }
                    ]
                  },
                  {
                    label: "Media",
                    collapsed: true,
                    items: [
                      {
                        label: "Audio",
                        href: "/{locale}/company/docs/packages/rimelight-ui/components/media/audio/"
                      },
                      {
                        label: "Icon",
                        href: "/{locale}/company/docs/packages/rimelight-ui/components/media/icon/"
                      },
                      {
                        label: "Image",
                        href: "/{locale}/company/docs/packages/rimelight-ui/components/media/image/"
                      },
                      {
                        label: "Video",
                        href: "/{locale}/company/docs/packages/rimelight-ui/components/media/video/"
                      }
                    ]
                  },
                  {
                    label: "Form",
                    collapsed: true,
                    items: [
                      {
                        label: "Checkbox",
                        href: "/{locale}/company/docs/packages/rimelight-ui/components/form/checkbox/"
                      },
                      {
                        label: "ColorPicker",
                        href: "/{locale}/company/docs/packages/rimelight-ui/components/form/color-picker/"
                      },
                      {
                        label: "FileUpload",
                        href: "/{locale}/company/docs/packages/rimelight-ui/components/form/file-upload/"
                      },
                      {
                        label: "Form",
                        href: "/{locale}/company/docs/packages/rimelight-ui/components/form/form/"
                      },
                      {
                        label: "FormField",
                        href: "/{locale}/company/docs/packages/rimelight-ui/components/form/form-field/"
                      },
                      {
                        label: "Input",
                        href: "/{locale}/company/docs/packages/rimelight-ui/components/form/input/"
                      },
                      {
                        label: "InputDate",
                        href: "/{locale}/company/docs/packages/rimelight-ui/components/form/input-date/"
                      },
                      {
                        label: "InputMenu",
                        href: "/{locale}/company/docs/packages/rimelight-ui/components/form/input-menu/"
                      },
                      {
                        label: "InputNumber",
                        href: "/{locale}/company/docs/packages/rimelight-ui/components/form/input-number/"
                      },
                      {
                        label: "InputOTP",
                        href: "/{locale}/company/docs/packages/rimelight-ui/components/form/pin-input/"
                      },
                      {
                        label: "InputTags",
                        href: "/{locale}/company/docs/packages/rimelight-ui/components/form/input-tags/"
                      },
                      {
                        label: "InputTime",
                        href: "/{locale}/company/docs/packages/rimelight-ui/components/form/input-time/"
                      },
                      {
                        label: "Knob",
                        href: "/{locale}/company/docs/packages/rimelight-ui/components/form/knob/"
                      },
                      {
                        label: "Listbox",
                        href: "/{locale}/company/docs/packages/rimelight-ui/components/form/listbox/"
                      },
                      {
                        label: "Password",
                        href: "/{locale}/company/docs/packages/rimelight-ui/components/form/password/"
                      },
                      {
                        label: "RadioGroup",
                        href: "/{locale}/company/docs/packages/rimelight-ui/components/form/radio-group/"
                      },
                      {
                        label: "Select",
                        href: "/{locale}/company/docs/packages/rimelight-ui/components/form/select/"
                      },
                      {
                        label: "Slider",
                        href: "/{locale}/company/docs/packages/rimelight-ui/components/form/slider/"
                      },
                      {
                        label: "Switch",
                        href: "/{locale}/company/docs/packages/rimelight-ui/components/form/switch/"
                      },
                      {
                        label: "Textarea",
                        href: "/{locale}/company/docs/packages/rimelight-ui/components/form/textarea/"
                      },
                      {
                        label: "ColorArea",
                        href: "/{locale}/company/docs/packages/rimelight-ui/components/form/color-area/"
                      },
                      {
                        label: "ColorField",
                        href: "/{locale}/company/docs/packages/rimelight-ui/components/form/color-field/"
                      },
                      {
                        label: "ColorSlider",
                        href: "/{locale}/company/docs/packages/rimelight-ui/components/form/color-slider/"
                      }
                    ]
                  },
                  {
                    label: "Data",
                    collapsed: true,
                    items: [
                      {
                        label: "Accordion",
                        href: "/{locale}/company/docs/packages/rimelight-ui/components/data/accordion/"
                      },
                      {
                        label: "Carousel",
                        href: "/{locale}/company/docs/packages/rimelight-ui/components/data/carousel/"
                      },
                      {
                        label: "Chart",
                        href: "/{locale}/company/docs/packages/rimelight-ui/components/data/chart/"
                      },
                      {
                        label: "Empty",
                        href: "/{locale}/company/docs/packages/rimelight-ui/components/data/empty/"
                      },
                      {
                        label: "Gallery",
                        href: "/{locale}/company/docs/packages/rimelight-ui/components/data/gallery/"
                      },
                      {
                        label: "Marquee",
                        href: "/{locale}/company/docs/packages/rimelight-ui/components/data/marquee/"
                      },
                      {
                        label: "Meter",
                        href: "/{locale}/company/docs/packages/rimelight-ui/components/data/meter/"
                      },
                      {
                        label: "Progress",
                        href: "/{locale}/company/docs/packages/rimelight-ui/components/data/progress/"
                      },
                      {
                        label: "Quote",
                        href: "/{locale}/company/docs/packages/rimelight-ui/components/data/quote/"
                      },
                      {
                        label: "Rating",
                        href: "/{locale}/company/docs/packages/rimelight-ui/components/data/rating/"
                      },
                      {
                        label: "ScrollArea",
                        href: "/{locale}/company/docs/packages/rimelight-ui/components/data/scroll-area/"
                      },
                      {
                        label: "Skeleton",
                        href: "/{locale}/company/docs/packages/rimelight-ui/components/data/skeleton/"
                      },
                      {
                        label: "Spinner",
                        href: "/{locale}/company/docs/packages/rimelight-ui/components/data/spinner/"
                      },
                      {
                        label: "Spoiler",
                        href: "/{locale}/company/docs/packages/rimelight-ui/components/data/spoiler/"
                      },
                      {
                        label: "Table",
                        href: "/{locale}/company/docs/packages/rimelight-ui/components/data/table/"
                      },
                      {
                        label: "Timeline",
                        href: "/{locale}/company/docs/packages/rimelight-ui/components/data/timeline/"
                      },
                      {
                        label: "Tree",
                        href: "/{locale}/company/docs/packages/rimelight-ui/components/data/tree/"
                      },
                      {
                        label: "User",
                        href: "/{locale}/company/docs/packages/rimelight-ui/components/data/user/"
                      }
                    ]
                  },
                  {
                    label: "Navigation",
                    collapsed: true,
                    items: [
                      {
                        label: "Breadcrumb",
                        href: "/{locale}/company/docs/packages/rimelight-ui/components/navigation/breadcrumb/"
                      },
                      {
                        label: "Link",
                        href: "/{locale}/company/docs/packages/rimelight-ui/components/navigation/link/"
                      },
                      {
                        label: "Link Group",
                        href: "/{locale}/company/docs/packages/rimelight-ui/components/navigation/link-group/"
                      },
                      {
                        label: "NavigationMenu",
                        href: "/{locale}/company/docs/packages/rimelight-ui/components/navigation/navigation-menu/"
                      },
                      {
                        label: "Pagination",
                        href: "/{locale}/company/docs/packages/rimelight-ui/components/navigation/pagination/"
                      },
                      {
                        label: "Stepper",
                        href: "/{locale}/company/docs/packages/rimelight-ui/components/navigation/stepper/"
                      },
                      {
                        label: "Steps",
                        href: "/{locale}/company/docs/packages/rimelight-ui/components/navigation/steps/"
                      },
                      {
                        label: "Surround",
                        href: "/{locale}/company/docs/packages/rimelight-ui/components/navigation/table-of-contents/"
                      },
                      {
                        label: "Tabs",
                        href: "/{locale}/company/docs/packages/rimelight-ui/components/navigation/tabs/"
                      }
                    ]
                  },
                  {
                    label: "Overlay",
                    collapsed: true,
                    items: [
                      {
                        label: "Confirm",
                        href: "/{locale}/company/docs/packages/rimelight-ui/components/overlay/confirm/"
                      },
                      {
                        label: "ContextMenu",
                        href: "/{locale}/company/docs/packages/rimelight-ui/components/overlay/context-menu/"
                      },
                      {
                        label: "CommandPalette",
                        href: "/{locale}/company/docs/packages/rimelight-ui/components/overlay/command-palette/"
                      },
                      {
                        label: "Dock",
                        href: "/{locale}/company/docs/packages/rimelight-ui/components/overlay/dock/"
                      },
                      {
                        label: "Drawer",
                        href: "/{locale}/company/docs/packages/rimelight-ui/components/overlay/drawer/"
                      },
                      {
                        label: "DropdownMenu",
                        href: "/{locale}/company/docs/packages/rimelight-ui/components/overlay/dropdown-menu/"
                      },
                      {
                        label: "Floating Action",
                        href: "/{locale}/company/docs/packages/rimelight-ui/components/overlay/floating-action/"
                      },
                      {
                        label: "Hover Card",
                        href: "/{locale}/company/docs/packages/rimelight-ui/components/overlay/hover-card/"
                      },
                      {
                        label: "Modal",
                        href: "/{locale}/company/docs/packages/rimelight-ui/components/overlay/modal/"
                      },
                      {
                        label: "Popover",
                        href: "/{locale}/company/docs/packages/rimelight-ui/components/overlay/popover/"
                      },
                      {
                        label: "Slideover",
                        href: "/{locale}/company/docs/packages/rimelight-ui/components/overlay/slideover/"
                      },
                      {
                        label: "Toast",
                        href: "/{locale}/company/docs/packages/rimelight-ui/components/overlay/toast/"
                      },
                      {
                        label: "Tooltip",
                        href: "/{locale}/company/docs/packages/rimelight-ui/components/overlay/tooltip/"
                      }
                    ]
                  },
                  {
                    label: "Page",
                    collapsed: true,
                    items: [
                      {
                        label: "Page",
                        href: "/{locale}/company/docs/packages/rimelight-ui/components/page/page/"
                      },
                      {
                        label: "PageAside",
                        href: "/{locale}/company/docs/packages/rimelight-ui/components/page/page-aside/"
                      },
                      {
                        label: "PageBody",
                        href: "/{locale}/company/docs/packages/rimelight-ui/components/page/page-body/"
                      },
                      {
                        label: "PageHeader",
                        href: "/{locale}/company/docs/packages/rimelight-ui/components/page/page-header/"
                      },
                      {
                        label: "PageSection",
                        href: "/{locale}/company/docs/packages/rimelight-ui/components/page/page-section/"
                      },
                      {
                        label: "Post",
                        href: "/{locale}/company/docs/packages/rimelight-ui/components/page/post/"
                      },
                      {
                        label: "PricingPlan",
                        href: "/{locale}/company/docs/packages/rimelight-ui/components/page/pricing-plan/"
                      },
                      {
                        label: "PricingTable",
                        href: "/{locale}/company/docs/packages/rimelight-ui/components/page/pricing-table/"
                      },
                      {
                        label: "Prose",
                        href: "/{locale}/company/docs/packages/rimelight-ui/components/page/prose/"
                      }
                    ]
                  },
                  {
                    label: "Dashboard",
                    collapsed: true,
                    items: [
                      {
                        label: "DashboardGroup",
                        href: "/{locale}/company/docs/packages/rimelight-ui/components/dashboard/dashboard-group/"
                      },
                      {
                        label: "DashboardNavbar",
                        href: "/{locale}/company/docs/packages/rimelight-ui/components/dashboard/dashboard-navbar/"
                      },
                      {
                        label: "DashboardPanel",
                        href: "/{locale}/company/docs/packages/rimelight-ui/components/dashboard/dashboard-panel/"
                      },
                      {
                        label: "DashboardResizeHandle",
                        href: "/{locale}/company/docs/packages/rimelight-ui/components/dashboard/dashboard-resize-handle/"
                      },
                      {
                        label: "DashboardSearch",
                        href: "/{locale}/company/docs/packages/rimelight-ui/components/dashboard/dashboard-search/"
                      },
                      {
                        label: "DashboardSearchButton",
                        href: "/{locale}/company/docs/packages/rimelight-ui/components/dashboard/dashboard-search-button/"
                      },
                      {
                        label: "DashboardSidebar",
                        href: "/{locale}/company/docs/packages/rimelight-ui/components/dashboard/dashboard-sidebar/"
                      },
                      {
                        label: "DashboardSidebarCollapse",
                        href: "/{locale}/company/docs/packages/rimelight-ui/components/dashboard/dashboard-sidebar-collapse/"
                      },
                      {
                        label: "DashboardSidebarToggle",
                        href: "/{locale}/company/docs/packages/rimelight-ui/components/dashboard/dashboard-sidebar-toggle/"
                      },
                      {
                        label: "DashboardToolbar",
                        href: "/{locale}/company/docs/packages/rimelight-ui/components/dashboard/dashboard-toolbar/"
                      }
                    ]
                  },
                  {
                    label: "Editor",
                    collapsed: true,
                    items: [
                      {
                        label: "Editor",
                        href: "/{locale}/company/docs/packages/rimelight-ui/components/editor/editor/"
                      }
                    ]
                  },
                  {
                    label: "AI",
                    collapsed: true,
                    items: [
                      {
                        label: "Chat",
                        href: "/{locale}/company/docs/packages/rimelight-ui/components/ai/chat/"
                      },
                      {
                        label: "ChatMessage",
                        href: "/{locale}/company/docs/packages/rimelight-ui/components/ai/chat-message/"
                      },
                      {
                        label: "ChatMessages",
                        href: "/{locale}/company/docs/packages/rimelight-ui/components/ai/chat-messages/"
                      },
                      {
                        label: "ChatPalette",
                        href: "/{locale}/company/docs/packages/rimelight-ui/components/ai/chat-palette/"
                      },
                      {
                        label: "ChatPrompt",
                        href: "/{locale}/company/docs/packages/rimelight-ui/components/ai/chat-prompt/"
                      },
                      {
                        label: "ChatPromptSubmit",
                        href: "/{locale}/company/docs/packages/rimelight-ui/components/ai/chat-prompt-submit/"
                      },
                      {
                        label: "ChatReasoning",
                        href: "/{locale}/company/docs/packages/rimelight-ui/components/ai/chat-reasoning/"
                      },
                      {
                        label: "ChatShimmer",
                        href: "/{locale}/company/docs/packages/rimelight-ui/components/ai/chat-shimmer/"
                      },
                      {
                        label: "ChatTool",
                        href: "/{locale}/company/docs/packages/rimelight-ui/components/ai/chat-tool/"
                      }
                    ]
                  },
                  {
                    label: "Effect",
                    collapsed: true,
                    items: [
                      {
                        label: "3D Hover",
                        href: "/{locale}/company/docs/packages/rimelight-ui/components/effect/3d-hover/"
                      }
                    ]
                  },
                  {
                    label: "Mockup",
                    collapsed: true,
                    items: [
                      {
                        label: "Browser Mockup",
                        href: "/{locale}/company/docs/packages/rimelight-ui/components/mockup/browser-mockup/"
                      },
                      {
                        label: "Phone Mockup",
                        href: "/{locale}/company/docs/packages/rimelight-ui/components/mockup/phone-mockup/"
                      },
                      {
                        label: "Window Mockup",
                        href: "/{locale}/company/docs/packages/rimelight-ui/components/mockup/window-mockup/"
                      }
                    ]
                  },
                  {
                    label: "Utility",
                    collapsed: true,
                    items: [
                      {
                        label: "AspectRatio",
                        href: "/{locale}/company/docs/packages/rimelight-ui/components/utility/aspect-ratio/"
                      },
                      {
                        label: "Compare",
                        href: "/{locale}/company/docs/packages/rimelight-ui/components/utility/compare/"
                      },
                      {
                        label: "LocaleSelector",
                        href: "/{locale}/company/docs/packages/rimelight-ui/components/utility/locale-selector/"
                      },
                      {
                        label: "Placeholder",
                        href: "/{locale}/company/docs/packages/rimelight-ui/components/utility/placeholder/"
                      },
                      {
                        label: "QR Code",
                        href: "/{locale}/company/docs/packages/rimelight-ui/components/utility/qr-code/"
                      },
                      {
                        label: "ScrollToTop",
                        href: "/{locale}/company/docs/packages/rimelight-ui/components/utility/scroll-to-top/"
                      },
                      {
                        label: "Sticky Surface",
                        href: "/{locale}/company/docs/packages/rimelight-ui/components/utility/sticky-surface/"
                      },
                      {
                        label: "ThemeSelector",
                        href: "/{locale}/company/docs/packages/rimelight-ui/components/utility/theme-selector/"
                      },
                      {
                        label: "Tour",
                        href: "/{locale}/company/docs/packages/rimelight-ui/components/utility/tour/"
                      },
                      {
                        label: "Watermark",
                        href: "/{locale}/company/docs/packages/rimelight-ui/components/utility/watermark/"
                      }
                    ]
                  }
                ]
              },
              {
                label: "Composables",
                collapsed: true,
                items: [
                  {
                    label: "useHotkeys",
                    href: "/{locale}/company/docs/packages/rimelight-ui/composables/usehotkeys/"
                  },
                  {
                    label: "useOverlay",
                    href: "/{locale}/company/docs/packages/rimelight-ui/composables/useoverlay/"
                  },
                  {
                    label: "useToast",
                    href: "/{locale}/company/docs/packages/rimelight-ui/composables/usetoast/"
                  },
                  {
                    label: "useUi",
                    href: "/{locale}/company/docs/packages/rimelight-ui/composables/useui/"
                  }
                ]
              },
              {
                label: "Agents",
                collapsed: true,
                items: [
                  {
                    label: "LLMs.txt",
                    href: "/{locale}/company/docs/packages/rimelight-ui/agents/llms-txt/"
                  },
                  {
                    label: "MCP Server",
                    href: "/{locale}/company/docs/packages/rimelight-ui/agents/mcp-server/"
                  },
                  {
                    label: "Skills",
                    href: "/{locale}/company/docs/packages/rimelight-ui/agents/skills/"
                  }
                ]
              }
            ]
          },
          {
            label: "Rimelight Unreal",
            collapsed: true,
            items: [
              {
                label: "Overview",
                items: [
                  {
                    label: "Introduction",
                    href: "/{locale}/company/docs/packages/rimelight-unreal/overview/introduction/"
                  }
                ]
              }
            ]
          }
        ]
      },
      {
        label: "API",
        icon: "i-lucide-code",
        collapsed: true,
        items: [
          {
            label: "Overview",
            collapsed: false,
            items: [
              { label: "Introduction", href: "/{locale}/company/docs/api/overview/introduction/" }
            ]
          },
          {
            label: "Reference",
            collapsed: true,
            items: [
              {
                label: "Rimelight Account",
                href: "/{locale}/company/docs/api/reference/rimelight-account/"
              },
              { label: "Grand Tale", href: "/{locale}/company/docs/api/reference/grand-tale/" }
            ]
          }
        ]
      }
    ]
  }
})
