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
                label: "C++",
                href: "/{locale}/company/docs/overview/contributing/coding-style-guide/cpp/"
              },
              {
                label: "TypeScript",
                href: "/{locale}/company/docs/overview/contributing/coding-style-guide/typescript/"
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
                    label: "Components Overview",
                    badge: { text: "Coming Soon", variant: "tip" },
                    href: "/{locale}/company/docs/packages/rimelight-ui/components/"
                  },
                  {
                    label: "App",
                    collapsed: true,
                    items: [
                      {
                        label: "App",
                        badge: { text: "Coming Soon", variant: "tip" },
                        href: "/{locale}/company/docs/packages/rimelight-ui/components/app/app/"
                      },
                      {
                        label: "Error",
                        badge: { text: "Coming Soon", variant: "tip" },
                        href: "/{locale}/company/docs/packages/rimelight-ui/components/app/error/"
                      },
                      {
                        label: "Footer",
                        badge: { text: "Coming Soon", variant: "tip" },
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
                        label: "Logo",
                        badge: { text: "New", variant: "tip" },
                        href: "/{locale}/company/docs/packages/rimelight-ui/components/app/logo/"
                      },
                      {
                        label: "Main",
                        badge: { text: "Coming Soon", variant: "tip" },
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
                        badge: { text: "Coming Soon", variant: "tip" },
                        href: "/{locale}/company/docs/packages/rimelight-ui/components/layout/container/"
                      },
                      {
                        label: "Sidebar",
                        badge: { text: "Coming Soon", variant: "tip" },
                        href: "/{locale}/company/docs/packages/rimelight-ui/components/layout/sidebar/"
                      },
                      {
                        label: "Splitter",
                        badge: { text: "Coming Soon", variant: "tip" },
                        href: "/{locale}/company/docs/packages/rimelight-ui/components/layout/splitter/"
                      }
                    ]
                  },
                  {
                    label: "Elements",
                    collapsed: true,
                    items: [
                      {
                        label: "Alert",
                        badge: { text: "Coming Soon", variant: "tip" },
                        href: "/{locale}/company/docs/packages/rimelight-ui/components/elements/alert/"
                      },
                      {
                        label: "Avatar",
                        badge: { text: "Coming Soon", variant: "tip" },
                        href: "/{locale}/company/docs/packages/rimelight-ui/components/elements/avatar/"
                      },
                      {
                        label: "AvatarGroup",
                        badge: { text: "Coming Soon", variant: "tip" },
                        href: "/{locale}/company/docs/packages/rimelight-ui/components/elements/avatar-group/"
                      },
                      {
                        label: "Badge",
                        badge: { text: "Coming Soon", variant: "tip" },
                        href: "/{locale}/company/docs/packages/rimelight-ui/components/elements/badge/"
                      },
                      {
                        label: "Banner",
                        badge: { text: "Coming Soon", variant: "tip" },
                        href: "/{locale}/company/docs/packages/rimelight-ui/components/elements/banner/"
                      },
                      {
                        label: "Button",
                        badge: { text: "New", variant: "tip" },
                        href: "/{locale}/company/docs/packages/rimelight-ui/components/elements/button/"
                      },
                      {
                        label: "Calendar",
                        badge: { text: "Coming Soon", variant: "tip" },
                        href: "/{locale}/company/docs/packages/rimelight-ui/components/elements/calendar/"
                      },
                      {
                        label: "Card",
                        badge: { text: "Coming Soon", variant: "tip" },
                        href: "/{locale}/company/docs/packages/rimelight-ui/components/elements/card/"
                      },
                      {
                        label: "Chip",
                        badge: { text: "Coming Soon", variant: "tip" },
                        href: "/{locale}/company/docs/packages/rimelight-ui/components/elements/chip/"
                      },
                      {
                        label: "Collapsible",
                        badge: { text: "Coming Soon", variant: "tip" },
                        href: "/{locale}/company/docs/packages/rimelight-ui/components/elements/collapsible/"
                      },
                      {
                        label: "FieldGroup",
                        badge: { text: "Coming Soon", variant: "tip" },
                        href: "/{locale}/company/docs/packages/rimelight-ui/components/elements/field-group/"
                      },
                      {
                        label: "Fieldset",
                        badge: { text: "Coming Soon", variant: "tip" },
                        href: "/{locale}/company/docs/packages/rimelight-ui/components/elements/fieldset/"
                      },
                      {
                        label: "Hover Card",
                        href: "/{locale}/company/docs/packages/rimelight-ui/components/elements/hover-card/"
                      },
                      {
                        label: "Kbd",
                        badge: { text: "Coming Soon", variant: "tip" },
                        href: "/{locale}/company/docs/packages/rimelight-ui/components/elements/kbd/"
                      },
                      {
                        label: "Label",
                        href: "/{locale}/company/docs/packages/rimelight-ui/components/elements/label/"
                      },
                      {
                        label: "Progress",
                        badge: { text: "Coming Soon", variant: "tip" },
                        href: "/{locale}/company/docs/packages/rimelight-ui/components/elements/progress/"
                      },
                      {
                        label: "Separator",
                        badge: { text: "Coming Soon", variant: "tip" },
                        href: "/{locale}/company/docs/packages/rimelight-ui/components/elements/separator/"
                      },
                      {
                        label: "SpeedDial",
                        badge: { text: "Coming Soon", variant: "tip" },
                        href: "/{locale}/company/docs/packages/rimelight-ui/components/elements/speed-dial/"
                      }
                    ]
                  },
                  {
                    label: "Media",
                    collapsed: true,
                    items: [
                      {
                        label: "Audio",
                        badge: { text: "Coming Soon", variant: "tip" },
                        href: "/{locale}/company/docs/packages/rimelight-ui/components/media/audio/"
                      },
                      {
                        label: "Icon",
                        href: "/{locale}/company/docs/packages/rimelight-ui/components/media/icon/"
                      },
                      {
                        label: "Image",
                        badge: { text: "Coming Soon", variant: "tip" },
                        href: "/{locale}/company/docs/packages/rimelight-ui/components/media/image/"
                      },
                      {
                        label: "Video",
                        badge: { text: "Coming Soon", variant: "tip" },
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
                        badge: { text: "Coming Soon", variant: "tip" },
                        href: "/{locale}/company/docs/packages/rimelight-ui/components/form/checkbox/"
                      },
                      {
                        label: "ColorPicker",
                        badge: { text: "Coming Soon", variant: "tip" },
                        href: "/{locale}/company/docs/packages/rimelight-ui/components/form/color-picker/"
                      },
                      {
                        label: "FileUpload",
                        badge: { text: "Coming Soon", variant: "tip" },
                        href: "/{locale}/company/docs/packages/rimelight-ui/components/form/file-upload/"
                      },
                      {
                        label: "Form",
                        badge: { text: "Coming Soon", variant: "tip" },
                        href: "/{locale}/company/docs/packages/rimelight-ui/components/form/form/"
                      },
                      {
                        label: "FormField",
                        badge: { text: "Coming Soon", variant: "tip" },
                        href: "/{locale}/company/docs/packages/rimelight-ui/components/form/form-field/"
                      },
                      {
                        label: "Input",
                        badge: { text: "Coming Soon", variant: "tip" },
                        href: "/{locale}/company/docs/packages/rimelight-ui/components/form/input/"
                      },
                      {
                        label: "InputDate",
                        badge: { text: "Coming Soon", variant: "tip" },
                        href: "/{locale}/company/docs/packages/rimelight-ui/components/form/input-date/"
                      },
                      {
                        label: "InputMenu",
                        badge: { text: "Coming Soon", variant: "tip" },
                        href: "/{locale}/company/docs/packages/rimelight-ui/components/form/input-menu/"
                      },
                      {
                        label: "InputNumber",
                        badge: { text: "Coming Soon", variant: "tip" },
                        href: "/{locale}/company/docs/packages/rimelight-ui/components/form/input-number/"
                      },
                      {
                        label: "InputOTP",
                        href: "/{locale}/company/docs/packages/rimelight-ui/components/form/pin-input/"
                      },
                      {
                        label: "InputTags",
                        badge: { text: "Coming Soon", variant: "tip" },
                        href: "/{locale}/company/docs/packages/rimelight-ui/components/form/input-tags/"
                      },
                      {
                        label: "InputTime",
                        badge: { text: "Coming Soon", variant: "tip" },
                        href: "/{locale}/company/docs/packages/rimelight-ui/components/form/input-time/"
                      },
                      {
                        label: "Knob",
                        badge: { text: "Coming Soon", variant: "tip" },
                        href: "/{locale}/company/docs/packages/rimelight-ui/components/form/knob/"
                      },
                      {
                        label: "Listbox",
                        badge: { text: "Coming Soon", variant: "tip" },
                        href: "/{locale}/company/docs/packages/rimelight-ui/components/form/listbox/"
                      },
                      {
                        label: "Password",
                        badge: { text: "Coming Soon", variant: "tip" },
                        href: "/{locale}/company/docs/packages/rimelight-ui/components/form/password/"
                      },
                      {
                        label: "RadioGroup",
                        badge: { text: "Coming Soon", variant: "tip" },
                        href: "/{locale}/company/docs/packages/rimelight-ui/components/form/radio-group/"
                      },
                      {
                        label: "Select",
                        badge: { text: "Coming Soon", variant: "tip" },
                        href: "/{locale}/company/docs/packages/rimelight-ui/components/form/select/"
                      },
                      {
                        label: "Slider",
                        badge: { text: "Coming Soon", variant: "tip" },
                        href: "/{locale}/company/docs/packages/rimelight-ui/components/form/slider/"
                      },
                      {
                        label: "Switch",
                        badge: { text: "Coming Soon", variant: "tip" },
                        href: "/{locale}/company/docs/packages/rimelight-ui/components/form/switch/"
                      },
                      {
                        label: "Textarea",
                        badge: { text: "Coming Soon", variant: "tip" },
                        href: "/{locale}/company/docs/packages/rimelight-ui/components/form/textarea/"
                      }
                    ]
                  },
                  {
                    label: "Color",
                    collapsed: true,
                    items: [
                      {
                        label: "ColorArea",
                        badge: { text: "New", variant: "tip" },
                        href: "/{locale}/company/docs/packages/rimelight-ui/components/color/color-area/"
                      },
                      {
                        label: "ColorField",
                        badge: { text: "New", variant: "tip" },
                        href: "/{locale}/company/docs/packages/rimelight-ui/components/color/color-field/"
                      },
                      {
                        label: "ColorSlider",
                        badge: { text: "New", variant: "tip" },
                        href: "/{locale}/company/docs/packages/rimelight-ui/components/color/color-slider/"
                      }
                    ]
                  },
                  {
                    label: "Data",
                    collapsed: true,
                    items: [
                      {
                        label: "Accordion",
                        badge: { text: "Coming Soon", variant: "tip" },
                        href: "/{locale}/company/docs/packages/rimelight-ui/components/data/accordion/"
                      },
                      {
                        label: "Carousel",
                        badge: { text: "Coming Soon", variant: "tip" },
                        href: "/{locale}/company/docs/packages/rimelight-ui/components/data/carousel/"
                      },
                      {
                        label: "Chart",
                        badge: { text: "Coming Soon", variant: "tip" },
                        href: "/{locale}/company/docs/packages/rimelight-ui/components/data/chart/"
                      },
                      {
                        label: "Empty",
                        badge: { text: "Coming Soon", variant: "tip" },
                        href: "/{locale}/company/docs/packages/rimelight-ui/components/data/empty/"
                      },
                      {
                        label: "Gallery",
                        badge: { text: "Coming Soon", variant: "tip" },
                        href: "/{locale}/company/docs/packages/rimelight-ui/components/data/gallery/"
                      },
                      {
                        label: "Marquee",
                        badge: { text: "Coming Soon", variant: "tip" },
                        href: "/{locale}/company/docs/packages/rimelight-ui/components/data/marquee/"
                      },
                      {
                        label: "Meter",
                        badge: { text: "Coming Soon", variant: "tip" },
                        href: "/{locale}/company/docs/packages/rimelight-ui/components/data/meter/"
                      },
                      {
                        label: "Progress",
                        badge: { text: "Coming Soon", variant: "tip" },
                        href: "/{locale}/company/docs/packages/rimelight-ui/components/data/progress/"
                      },
                      {
                        label: "Quote",
                        href: "/{locale}/company/docs/packages/rimelight-ui/components/data/quote/"
                      },
                      {
                        label: "Rating",
                        badge: { text: "Coming Soon", variant: "tip" },
                        href: "/{locale}/company/docs/packages/rimelight-ui/components/data/rating/"
                      },
                      {
                        label: "ScrollArea",
                        badge: { text: "Coming Soon", variant: "tip" },
                        href: "/{locale}/company/docs/packages/rimelight-ui/components/data/scroll-area/"
                      },
                      {
                        label: "Skeleton",
                        badge: { text: "Coming Soon", variant: "tip" },
                        href: "/{locale}/company/docs/packages/rimelight-ui/components/data/skeleton/"
                      },
                      {
                        label: "Spinner",
                        badge: { text: "Coming Soon", variant: "tip" },
                        href: "/{locale}/company/docs/packages/rimelight-ui/components/data/spinner/"
                      },
                      {
                        label: "Spoiler",
                        badge: { text: "Coming Soon", variant: "tip" },
                        href: "/{locale}/company/docs/packages/rimelight-ui/components/data/spoiler/"
                      },
                      {
                        label: "Table",
                        badge: { text: "Coming Soon", variant: "tip" },
                        href: "/{locale}/company/docs/packages/rimelight-ui/components/data/table/"
                      },
                      {
                        label: "Timeline",
                        badge: { text: "Coming Soon", variant: "tip" },
                        href: "/{locale}/company/docs/packages/rimelight-ui/components/data/timeline/"
                      },
                      {
                        label: "Tree",
                        badge: { text: "Coming Soon", variant: "tip" },
                        href: "/{locale}/company/docs/packages/rimelight-ui/components/data/tree/"
                      },
                      {
                        label: "User",
                        badge: { text: "Coming Soon", variant: "tip" },
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
                        badge: { text: "Coming Soon", variant: "tip" },
                        href: "/{locale}/company/docs/packages/rimelight-ui/components/navigation/breadcrumb/"
                      },
                      {
                        label: "CommandPalette",
                        badge: { text: "Coming Soon", variant: "tip" },
                        href: "/{locale}/company/docs/packages/rimelight-ui/components/navigation/command-palette/"
                      },
                      {
                        label: "Link",
                        badge: { text: "Coming Soon", variant: "tip" },
                        href: "/{locale}/company/docs/packages/rimelight-ui/components/navigation/link/"
                      },
                      {
                        label: "Link Group",
                        href: "/{locale}/company/docs/packages/rimelight-ui/components/navigation/link-group/"
                      },
                      {
                        label: "NavigationMenu",
                        badge: { text: "Coming Soon", variant: "tip" },
                        href: "/{locale}/company/docs/packages/rimelight-ui/components/navigation/navigation-menu/"
                      },
                      {
                        label: "Pagination",
                        badge: { text: "Coming Soon", variant: "tip" },
                        href: "/{locale}/company/docs/packages/rimelight-ui/components/navigation/pagination/"
                      },
                      {
                        label: "Stepper",
                        badge: { text: "Coming Soon", variant: "tip" },
                        href: "/{locale}/company/docs/packages/rimelight-ui/components/navigation/stepper/"
                      },
                      {
                        label: "Surround",
                        badge: { text: "Coming Soon", variant: "tip" },
                        href: "/{locale}/company/docs/packages/rimelight-ui/components/navigation/table-of-contents/"
                      },
                      {
                        label: "Tabs",
                        badge: { text: "Coming Soon", variant: "tip" },
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
                        badge: { text: "Coming Soon", variant: "tip" },
                        href: "/{locale}/company/docs/packages/rimelight-ui/components/overlay/confirm/"
                      },
                      {
                        label: "ContextMenu",
                        badge: { text: "Coming Soon", variant: "tip" },
                        href: "/{locale}/company/docs/packages/rimelight-ui/components/overlay/context-menu/"
                      },
                      {
                        label: "Dock",
                        badge: { text: "Coming Soon", variant: "tip" },
                        href: "/{locale}/company/docs/packages/rimelight-ui/components/overlay/dock/"
                      },
                      {
                        label: "Drawer",
                        badge: { text: "Coming Soon", variant: "tip" },
                        href: "/{locale}/company/docs/packages/rimelight-ui/components/overlay/drawer/"
                      },
                      {
                        label: "DropdownMenu",
                        badge: { text: "Coming Soon", variant: "tip" },
                        href: "/{locale}/company/docs/packages/rimelight-ui/components/overlay/dropdown-menu/"
                      },
                      {
                        label: "Floating Action",
                        badge: { text: "Coming Soon", variant: "tip" },
                        href: "/{locale}/company/docs/packages/rimelight-ui/components/overlay/floating-action/"
                      },
                      {
                        label: "Modal",
                        badge: { text: "Coming Soon", variant: "tip" },
                        href: "/{locale}/company/docs/packages/rimelight-ui/components/overlay/modal/"
                      },
                      {
                        label: "Popover",
                        badge: { text: "Coming Soon", variant: "tip" },
                        href: "/{locale}/company/docs/packages/rimelight-ui/components/overlay/popover/"
                      },
                      {
                        label: "Slideover",
                        badge: { text: "Coming Soon", variant: "tip" },
                        href: "/{locale}/company/docs/packages/rimelight-ui/components/overlay/slideover/"
                      },
                      {
                        label: "Toast",
                        badge: { text: "Coming Soon", variant: "tip" },
                        href: "/{locale}/company/docs/packages/rimelight-ui/components/overlay/toast/"
                      },
                      {
                        label: "Tooltip",
                        badge: { text: "Coming Soon", variant: "tip" },
                        href: "/{locale}/company/docs/packages/rimelight-ui/components/overlay/tooltip/"
                      }
                    ]
                  },
                  {
                    label: "Page",
                    collapsed: true,
                    items: [
                      {
                        label: "Changelog",
                        badge: { text: "Coming Soon", variant: "tip" },
                        href: "/{locale}/company/docs/packages/rimelight-ui/components/page/changelog/"
                      },
                      {
                        label: "Page",
                        badge: { text: "Coming Soon", variant: "tip" },
                        href: "/{locale}/company/docs/packages/rimelight-ui/components/page/page/"
                      },
                      {
                        label: "PageAside",
                        badge: { text: "Coming Soon", variant: "tip" },
                        href: "/{locale}/company/docs/packages/rimelight-ui/components/page/page-aside/"
                      },
                      {
                        label: "PageBody",
                        badge: { text: "Coming Soon", variant: "tip" },
                        href: "/{locale}/company/docs/packages/rimelight-ui/components/page/page-body/"
                      },
                      {
                        label: "PageHeader",
                        badge: { text: "Coming Soon", variant: "tip" },
                        href: "/{locale}/company/docs/packages/rimelight-ui/components/page/page-header/"
                      },
                      {
                        label: "PageSection",
                        badge: { text: "Coming Soon", variant: "tip" },
                        href: "/{locale}/company/docs/packages/rimelight-ui/components/page/page-section/"
                      },
                      {
                        label: "Post",
                        badge: { text: "Coming Soon", variant: "tip" },
                        href: "/{locale}/company/docs/packages/rimelight-ui/components/page/post/"
                      },
                      {
                        label: "PricingPlan",
                        badge: { text: "Coming Soon", variant: "tip" },
                        href: "/{locale}/company/docs/packages/rimelight-ui/components/page/pricing-plan/"
                      },
                      {
                        label: "PricingTable",
                        badge: { text: "Coming Soon", variant: "tip" },
                        href: "/{locale}/company/docs/packages/rimelight-ui/components/page/pricing-table/"
                      }
                    ]
                  },
                  {
                    label: "Dashboard",
                    collapsed: true,
                    items: [
                      {
                        label: "DashboardGroup",
                        badge: { text: "Coming Soon", variant: "tip" },
                        href: "/{locale}/company/docs/packages/rimelight-ui/components/dashboard/dashboard-group/"
                      },
                      {
                        label: "DashboardNavbar",
                        badge: { text: "Coming Soon", variant: "tip" },
                        href: "/{locale}/company/docs/packages/rimelight-ui/components/dashboard/dashboard-navbar/"
                      },
                      {
                        label: "DashboardPanel",
                        badge: { text: "Coming Soon", variant: "tip" },
                        href: "/{locale}/company/docs/packages/rimelight-ui/components/dashboard/dashboard-panel/"
                      },
                      {
                        label: "DashboardResizeHandle",
                        badge: { text: "Coming Soon", variant: "tip" },
                        href: "/{locale}/company/docs/packages/rimelight-ui/components/dashboard/dashboard-resize-handle/"
                      },
                      {
                        label: "DashboardSearch",
                        badge: { text: "Coming Soon", variant: "tip" },
                        href: "/{locale}/company/docs/packages/rimelight-ui/components/dashboard/dashboard-search/"
                      },
                      {
                        label: "DashboardSearchButton",
                        badge: { text: "Coming Soon", variant: "tip" },
                        href: "/{locale}/company/docs/packages/rimelight-ui/components/dashboard/dashboard-search-button/"
                      },
                      {
                        label: "DashboardSidebar",
                        badge: { text: "Coming Soon", variant: "tip" },
                        href: "/{locale}/company/docs/packages/rimelight-ui/components/dashboard/dashboard-sidebar/"
                      },
                      {
                        label: "DashboardSidebarCollapse",
                        badge: { text: "Coming Soon", variant: "tip" },
                        href: "/{locale}/company/docs/packages/rimelight-ui/components/dashboard/dashboard-sidebar-collapse/"
                      },
                      {
                        label: "DashboardSidebarToggle",
                        badge: { text: "Coming Soon", variant: "tip" },
                        href: "/{locale}/company/docs/packages/rimelight-ui/components/dashboard/dashboard-sidebar-toggle/"
                      },
                      {
                        label: "DashboardToolbar",
                        badge: { text: "Coming Soon", variant: "tip" },
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
                        badge: { text: "Coming Soon", variant: "tip" },
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
                        badge: { text: "Coming Soon", variant: "tip" },
                        href: "/{locale}/company/docs/packages/rimelight-ui/components/ai/chat/"
                      },
                      {
                        label: "ChatMessage",
                        badge: { text: "Coming Soon", variant: "tip" },
                        href: "/{locale}/company/docs/packages/rimelight-ui/components/ai/chat-message/"
                      },
                      {
                        label: "ChatMessages",
                        badge: { text: "Coming Soon", variant: "tip" },
                        href: "/{locale}/company/docs/packages/rimelight-ui/components/ai/chat-messages/"
                      },
                      {
                        label: "ChatPalette",
                        badge: { text: "Coming Soon", variant: "tip" },
                        href: "/{locale}/company/docs/packages/rimelight-ui/components/ai/chat-palette/"
                      },
                      {
                        label: "ChatPrompt",
                        badge: { text: "Coming Soon", variant: "tip" },
                        href: "/{locale}/company/docs/packages/rimelight-ui/components/ai/chat-prompt/"
                      },
                      {
                        label: "ChatPromptSubmit",
                        badge: { text: "Coming Soon", variant: "tip" },
                        href: "/{locale}/company/docs/packages/rimelight-ui/components/ai/chat-prompt-submit/"
                      },
                      {
                        label: "ChatReasoning",
                        badge: { text: "Coming Soon", variant: "tip" },
                        href: "/{locale}/company/docs/packages/rimelight-ui/components/ai/chat-reasoning/"
                      },
                      {
                        label: "ChatShimmer",
                        badge: { text: "Coming Soon", variant: "tip" },
                        href: "/{locale}/company/docs/packages/rimelight-ui/components/ai/chat-shimmer/"
                      },
                      {
                        label: "ChatTool",
                        badge: { text: "Coming Soon", variant: "tip" },
                        href: "/{locale}/company/docs/packages/rimelight-ui/components/ai/chat-tool/"
                      }
                    ]
                  },
                  {
                    label: "Effects",
                    collapsed: true,
                    items: [
                      {
                        label: "3D Hover",
                        badge: { text: "Coming Soon", variant: "tip" },
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
                        badge: { text: "Coming Soon", variant: "tip" },
                        href: "/{locale}/company/docs/packages/rimelight-ui/components/mockup/browser-mockup/"
                      },
                      {
                        label: "Phone Mockup",
                        badge: { text: "Coming Soon", variant: "tip" },
                        href: "/{locale}/company/docs/packages/rimelight-ui/components/mockup/phone-mockup/"
                      },
                      {
                        label: "Window Mockup",
                        badge: { text: "Coming Soon", variant: "tip" },
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
                        badge: { text: "Coming Soon", variant: "tip" },
                        href: "/{locale}/company/docs/packages/rimelight-ui/components/utility/aspect-ratio/"
                      },
                      {
                        label: "Compare",
                        badge: { text: "Coming Soon", variant: "tip" },
                        href: "/{locale}/company/docs/packages/rimelight-ui/components/utility/compare/"
                      },
                      {
                        label: "LocaleSelector",
                        badge: { text: "Coming Soon", variant: "tip" },
                        href: "/{locale}/company/docs/packages/rimelight-ui/components/utility/locale-selector/"
                      },
                      {
                        label: "Placeholder",
                        badge: { text: "Coming Soon", variant: "tip" },
                        href: "/{locale}/company/docs/packages/rimelight-ui/components/utility/placeholder/"
                      },
                      {
                        label: "Prose",
                        badge: { text: "Coming Soon", variant: "tip" },
                        href: "/{locale}/company/docs/packages/rimelight-ui/components/utility/prose/"
                      },
                      {
                        label: "QR Code",
                        badge: { text: "Coming Soon", variant: "tip" },
                        href: "/{locale}/company/docs/packages/rimelight-ui/components/utility/qr-code/"
                      },
                      {
                        label: "ScrollToTop",
                        badge: { text: "New", variant: "tip" },
                        href: "/{locale}/company/docs/packages/rimelight-ui/components/utility/scroll-to-top/"
                      },
                      {
                        label: "Sticky Surface",
                        href: "/{locale}/company/docs/packages/rimelight-ui/components/utility/sticky-surface/"
                      },
                      {
                        label: "ThemeSelector",
                        badge: { text: "Coming Soon", variant: "tip" },
                        href: "/{locale}/company/docs/packages/rimelight-ui/components/utility/theme-selector/"
                      },
                      {
                        label: "Tour",
                        badge: { text: "Coming Soon", variant: "tip" },
                        href: "/{locale}/company/docs/packages/rimelight-ui/components/utility/tour/"
                      },
                      {
                        label: "Watermark",
                        badge: { text: "Coming Soon", variant: "tip" },
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
                label: "Plugins",
                collapsed: true,
                items: [
                  {
                    label: "Starlight Addons",
                    href: "/{locale}/company/docs/packages/rimelight-ui/plugins/starlight-addons/"
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
