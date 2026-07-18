import { defineDocsConfig } from "@rimelight/docs"

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
          {
            label: "Getting Started",
            href: "/{locale}/company/docs/overview/getting-started/",
            badge: {
              text: "Slop",
              variant: "error"
            }
          },
          {
            label: "Contributing",
            href: "/{locale}/company/docs/overview/contributing/",
            badge: {
              text: "Slop",
              variant: "error"
            }
          },
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
                href: "/{locale}/company/docs/website/overview/introduction/",
                badge: {
                  text: "Slop",
                  variant: "error"
                }
              },
              {
                label: "Structure",
                href: "/{locale}/company/docs/website/overview/structure/",
                badge: {
                  text: "Slop",
                  variant: "error"
                }
              },
              {
                label: "Localization",
                href: "/{locale}/company/docs/website/overview/localization/",
                badge: {
                  text: "Slop",
                  variant: "error"
                }
              },
              {
                label: "Internationalization",
                href: "/{locale}/company/docs/website/overview/internationalization/",
                badge: {
                  text: "Slop",
                  variant: "error"
                }
              },
              {
                label: "Deployment",
                href: "/{locale}/company/docs/website/overview/deployment/",
                badge: {
                  text: "Slop",
                  variant: "error"
                }
              }
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
                href: "/{locale}/company/docs/products/overview/introduction/",
                badge: {
                  text: "Slop",
                  variant: "error"
                }
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
                    href: "/{locale}/company/docs/products/grand-tale/overview/introduction/",
                    badge: {
                      text: "Slop",
                      variant: "error"
                    }
                  }
                ]
              },
              {
                label: "Core",
                collapsed: true,
                items: [
                  {
                    label: "Control Scheme",
                    href: "/{locale}/company/docs/products/grand-tale/core/control-scheme/",
                    badge: {
                      text: "Slop",
                      variant: "error"
                    }
                  }
                ]
              },
              {
                label: "Code",
                collapsed: true,
                items: [
                  {
                    label: "Overview",
                    href: "/{locale}/company/docs/products/grand-tale/code/overview/",
                    badge: {
                      text: "Slop",
                      variant: "error"
                    }
                  }
                ]
              },
              {
                label: "Writing",
                collapsed: true,
                items: [
                  {
                    label: "Overview",
                    href: "/{locale}/company/docs/products/grand-tale/writing/overview/",
                    badge: {
                      text: "Slop",
                      variant: "error"
                    }
                  }
                ]
              },
              {
                label: "Art",
                collapsed: true,
                items: [
                  {
                    label: "Overview",
                    href: "/{locale}/company/docs/products/grand-tale/art/overview/",
                    badge: {
                      text: "Slop",
                      variant: "error"
                    }
                  },
                  {
                    label: "File Specifications",
                    href: "/{locale}/company/docs/products/grand-tale/art/file-specifications/",
                    badge: {
                      text: "Slop",
                      variant: "error"
                    }
                  },
                  {
                    label: "References",
                    href: "/{locale}/company/docs/products/grand-tale/art/references/",
                    badge: {
                      text: "Slop",
                      variant: "error"
                    }
                  }
                ]
              },
              {
                label: "Sound",
                collapsed: true,
                items: [
                  {
                    label: "Overview",
                    href: "/{locale}/company/docs/products/grand-tale/sound/overview/",
                    badge: {
                      text: "Slop",
                      variant: "error"
                    }
                  },
                  {
                    label: "File Specifications",
                    href: "/{locale}/company/docs/products/grand-tale/sound/file-specifications/",
                    badge: {
                      text: "Slop",
                      variant: "error"
                    }
                  },
                  {
                    label: "References",
                    href: "/{locale}/company/docs/products/grand-tale/sound/references/",
                    badge: {
                      text: "Slop",
                      variant: "error"
                    }
                  }
                ]
              },
              {
                label: "Internationalization",
                collapsed: true,
                items: [
                  {
                    label: "Overview",
                    href: "/{locale}/company/docs/products/grand-tale/internationalization/overview/",
                    badge: {
                      text: "Slop",
                      variant: "error"
                    }
                  },
                  {
                    label: "English",
                    href: "/{locale}/company/docs/products/grand-tale/internationalization/en/",
                    badge: {
                      text: "Slop",
                      variant: "error"
                    }
                  },
                  {
                    label: "Arabic",
                    href: "/{locale}/company/docs/products/grand-tale/internationalization/ar/",
                    badge: {
                      text: "Slop",
                      variant: "error"
                    }
                  },
                  {
                    label: "Spanish",
                    href: "/{locale}/company/docs/products/grand-tale/internationalization/es/",
                    badge: {
                      text: "Slop",
                      variant: "error"
                    }
                  },
                  {
                    label: "French",
                    href: "/{locale}/company/docs/products/grand-tale/internationalization/fr/",
                    badge: {
                      text: "Slop",
                      variant: "error"
                    }
                  },
                  {
                    label: "Japanese",
                    href: "/{locale}/company/docs/products/grand-tale/internationalization/ja/",
                    badge: {
                      text: "Slop",
                      variant: "error"
                    }
                  },
                  {
                    label: "Korean",
                    href: "/{locale}/company/docs/products/grand-tale/internationalization/ko/",
                    badge: {
                      text: "Slop",
                      variant: "error"
                    }
                  },
                  {
                    label: "Portuguese",
                    href: "/{locale}/company/docs/products/grand-tale/internationalization/pt/",
                    badge: {
                      text: "Slop",
                      variant: "error"
                    }
                  },
                  {
                    label: "Romanian",
                    href: "/{locale}/company/docs/products/grand-tale/internationalization/ro/",
                    badge: {
                      text: "Slop",
                      variant: "error"
                    }
                  },
                  {
                    label: "Chinese",
                    href: "/{locale}/company/docs/products/grand-tale/internationalization/zh_cn/",
                    badge: {
                      text: "Slop",
                      variant: "error"
                    }
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
                href: "/{locale}/company/docs/packages/overview/introduction/",
                badge: {
                  text: "Slop",
                  variant: "error"
                }
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
                    href: "/{locale}/company/docs/packages/rimelight-ui/overview/introduction/",
                    badge: {
                      text: "Slop",
                      variant: "error"
                    }
                  },
                  {
                    label: "Installation",
                    href: "/{locale}/company/docs/packages/rimelight-ui/overview/installation/",
                    badge: {
                      text: "Slop",
                      variant: "error"
                    }
                  }
                ]
              },
              {
                label: "Architecture",
                collapsed: true,
                items: [
                  {
                    label: "Design System",
                    href: "/{locale}/company/docs/packages/rimelight-ui/architecture/design-system/",
                    badge: {
                      text: "Slop",
                      variant: "error"
                    }
                  },
                  {
                    label: "Color Mode",
                    href: "/{locale}/company/docs/packages/rimelight-ui/architecture/color-mode/",
                    badge: {
                      text: "Slop",
                      variant: "error"
                    }
                  },
                  {
                    label: "Colors",
                    href: "/{locale}/company/docs/packages/rimelight-ui/architecture/colors/",
                    badge: {
                      text: "Slop",
                      variant: "error"
                    }
                  },
                  {
                    label: "Icons",
                    href: "/{locale}/company/docs/packages/rimelight-ui/architecture/icons/",
                    badge: {
                      text: "Slop",
                      variant: "error"
                    }
                  },
                  {
                    label: "Variants",
                    href: "/{locale}/company/docs/packages/rimelight-ui/architecture/variants/",
                    badge: {
                      text: "Slop",
                      variant: "error"
                    }
                  },
                  {
                    label: "Shortcuts",
                    href: "/{locale}/company/docs/packages/rimelight-ui/architecture/shortcuts/",
                    badge: {
                      text: "Slop",
                      variant: "error"
                    }
                  },
                  {
                    label: "Internationalization (i18n)",
                    href: "/{locale}/company/docs/packages/rimelight-ui/architecture/i18n/",
                    badge: {
                      text: "Slop",
                      variant: "error"
                    }
                  }
                ]
              },
              {
                label: "Components",
                collapsed: true,
                items: [
                  {
                    label: "Overview",
                    href: "/{locale}/company/docs/packages/rimelight-ui/components/",
                    badge: {
                      text: "Slop",
                      variant: "error"
                    }
                  },
                  {
                    label: "App",
                    collapsed: true,
                    items: [
                      {
                        label: "App",
                        href: "/{locale}/company/docs/packages/rimelight-ui/components/app/app/",
                        badge: {
                          text: "Slop",
                          variant: "error"
                        }
                      },
                      {
                        label: "Error",
                        href: "/{locale}/company/docs/packages/rimelight-ui/components/app/error/",
                        badge: {
                          text: "Slop",
                          variant: "error"
                        }
                      },
                      {
                        label: "Footer",
                        href: "/{locale}/company/docs/packages/rimelight-ui/components/app/footer/",
                        badge: {
                          text: "Slop",
                          variant: "error"
                        }
                      },
                      {
                        label: "Head",
                        href: "/{locale}/company/docs/packages/rimelight-ui/components/app/head/",
                        badge: {
                          text: "Slop",
                          variant: "error"
                        }
                      },
                      {
                        label: "Header",
                        href: "/{locale}/company/docs/packages/rimelight-ui/components/app/header/",
                        badge: {
                          text: "Slop",
                          variant: "error"
                        }
                      },
                      {
                        label: "Main",
                        href: "/{locale}/company/docs/packages/rimelight-ui/components/app/main/",
                        badge: {
                          text: "Slop",
                          variant: "error"
                        }
                      }
                    ]
                  },
                  {
                    label: "Layout",
                    collapsed: true,
                    items: [
                      {
                        label: "Container",
                        href: "/{locale}/company/docs/packages/rimelight-ui/components/layout/container/",
                        badge: {
                          text: "Slop",
                          variant: "error"
                        }
                      },
                      {
                        label: "Sidebar",
                        href: "/{locale}/company/docs/packages/rimelight-ui/components/layout/sidebar/",
                        badge: {
                          text: "Slop",
                          variant: "error"
                        }
                      },
                      {
                        label: "Splitter",
                        href: "/{locale}/company/docs/packages/rimelight-ui/components/layout/splitter/",
                        badge: {
                          text: "Slop",
                          variant: "error"
                        }
                      }
                    ]
                  },
                  {
                    label: "Element",
                    collapsed: true,
                    items: [
                      {
                        label: "Callout",
                        href: "/{locale}/company/docs/packages/rimelight-ui/components/element/callout/",
                        badge: {
                          text: "Slop",
                          variant: "error"
                        }
                      },
                      {
                        label: "Avatar",
                        href: "/{locale}/company/docs/packages/rimelight-ui/components/element/avatar/",
                        badge: {
                          text: "Slop",
                          variant: "error"
                        }
                      },
                      {
                        label: "AvatarGroup",
                        href: "/{locale}/company/docs/packages/rimelight-ui/components/element/avatar-group/",
                        badge: {
                          text: "Slop",
                          variant: "error"
                        }
                      },
                      {
                        label: "Badge",
                        href: "/{locale}/company/docs/packages/rimelight-ui/components/element/badge/",
                        badge: {
                          text: "Slop",
                          variant: "error"
                        }
                      },
                      {
                        label: "Banner",
                        href: "/{locale}/company/docs/packages/rimelight-ui/components/element/banner/",
                        badge: {
                          text: "Slop",
                          variant: "error"
                        }
                      },
                      {
                        label: "Button",
                        href: "/{locale}/company/docs/packages/rimelight-ui/components/element/button/",
                        badge: {
                          text: "Slop",
                          variant: "error"
                        }
                      },
                      {
                        label: "Calendar",
                        href: "/{locale}/company/docs/packages/rimelight-ui/components/element/calendar/",
                        badge: {
                          text: "Slop",
                          variant: "error"
                        }
                      },
                      {
                        label: "Card",
                        href: "/{locale}/company/docs/packages/rimelight-ui/components/element/card/",
                        badge: {
                          text: "Slop",
                          variant: "error"
                        }
                      },
                      {
                        label: "Chip",
                        href: "/{locale}/company/docs/packages/rimelight-ui/components/element/chip/",
                        badge: {
                          text: "Slop",
                          variant: "error"
                        }
                      },
                      {
                        label: "Collapsible",
                        href: "/{locale}/company/docs/packages/rimelight-ui/components/element/collapsible/",
                        badge: {
                          text: "Slop",
                          variant: "error"
                        }
                      },
                      {
                        label: "FieldGroup",
                        href: "/{locale}/company/docs/packages/rimelight-ui/components/element/field-group/",
                        badge: {
                          text: "Slop",
                          variant: "error"
                        }
                      },
                      {
                        label: "Fieldset",
                        href: "/{locale}/company/docs/packages/rimelight-ui/components/element/fieldset/",
                        badge: {
                          text: "Slop",
                          variant: "error"
                        }
                      },
                      {
                        label: "Kbd",
                        href: "/{locale}/company/docs/packages/rimelight-ui/components/element/kbd/",
                        badge: {
                          text: "Slop",
                          variant: "error"
                        }
                      },
                      {
                        label: "Label",
                        href: "/{locale}/company/docs/packages/rimelight-ui/components/element/label/",
                        badge: {
                          text: "Slop",
                          variant: "error"
                        }
                      },
                      {
                        label: "Logo",
                        href: "/{locale}/company/docs/packages/rimelight-ui/components/element/logo/",
                        badge: {
                          text: "Slop",
                          variant: "error"
                        }
                      },
                      {
                        label: "Separator",
                        href: "/{locale}/company/docs/packages/rimelight-ui/components/element/separator/",
                        badge: {
                          text: "Slop",
                          variant: "error"
                        }
                      },
                      {
                        label: "SpeedDial",
                        href: "/{locale}/company/docs/packages/rimelight-ui/components/element/speed-dial/",
                        badge: {
                          text: "Slop",
                          variant: "error"
                        }
                      }
                    ]
                  },
                  {
                    label: "Media",
                    collapsed: true,
                    items: [
                      {
                        label: "Audio",
                        href: "/{locale}/company/docs/packages/rimelight-ui/components/media/audio/",
                        badge: {
                          text: "Slop",
                          variant: "error"
                        }
                      },
                      {
                        label: "Icon",
                        href: "/{locale}/company/docs/packages/rimelight-ui/components/media/icon/",
                        badge: {
                          text: "Slop",
                          variant: "error"
                        }
                      },
                      {
                        label: "Image",
                        href: "/{locale}/company/docs/packages/rimelight-ui/components/media/image/",
                        badge: {
                          text: "Slop",
                          variant: "error"
                        }
                      },
                      {
                        label: "Video",
                        href: "/{locale}/company/docs/packages/rimelight-ui/components/media/video/",
                        badge: {
                          text: "Slop",
                          variant: "error"
                        }
                      }
                    ]
                  },
                  {
                    label: "Form",
                    collapsed: true,
                    items: [
                      {
                        label: "Checkbox",
                        href: "/{locale}/company/docs/packages/rimelight-ui/components/form/checkbox/",
                        badge: {
                          text: "Slop",
                          variant: "error"
                        }
                      },
                      {
                        label: "ColorPicker",
                        href: "/{locale}/company/docs/packages/rimelight-ui/components/form/color-picker/",
                        badge: {
                          text: "Slop",
                          variant: "error"
                        }
                      },
                      {
                        label: "FileUpload",
                        href: "/{locale}/company/docs/packages/rimelight-ui/components/form/file-upload/",
                        badge: {
                          text: "Slop",
                          variant: "error"
                        }
                      },
                      {
                        label: "Form",
                        href: "/{locale}/company/docs/packages/rimelight-ui/components/form/form/",
                        badge: {
                          text: "Slop",
                          variant: "error"
                        }
                      },
                      {
                        label: "FormField",
                        href: "/{locale}/company/docs/packages/rimelight-ui/components/form/form-field/",
                        badge: {
                          text: "Slop",
                          variant: "error"
                        }
                      },
                      {
                        label: "Input",
                        href: "/{locale}/company/docs/packages/rimelight-ui/components/form/input/",
                        badge: {
                          text: "Slop",
                          variant: "error"
                        }
                      },
                      {
                        label: "InputDate",
                        href: "/{locale}/company/docs/packages/rimelight-ui/components/form/input-date/",
                        badge: {
                          text: "Slop",
                          variant: "error"
                        }
                      },
                      {
                        label: "InputMenu",
                        href: "/{locale}/company/docs/packages/rimelight-ui/components/form/input-menu/",
                        badge: {
                          text: "Slop",
                          variant: "error"
                        }
                      },
                      {
                        label: "InputNumber",
                        href: "/{locale}/company/docs/packages/rimelight-ui/components/form/input-number/",
                        badge: {
                          text: "Slop",
                          variant: "error"
                        }
                      },
                      {
                        label: "InputPin",
                        href: "/{locale}/company/docs/packages/rimelight-ui/components/form/input-pin/",
                        badge: {
                          text: "Slop",
                          variant: "error"
                        }
                      },

                      {
                        label: "InputRating",
                        href: "/{locale}/company/docs/packages/rimelight-ui/components/form/input-rating/",
                        badge: {
                          text: "Slop",
                          variant: "error"
                        }
                      },
                      {
                        label: "InputTags",
                        href: "/{locale}/company/docs/packages/rimelight-ui/components/form/input-tags/",
                        badge: {
                          text: "Slop",
                          variant: "error"
                        }
                      },
                      {
                        label: "InputTime",
                        href: "/{locale}/company/docs/packages/rimelight-ui/components/form/input-time/",
                        badge: {
                          text: "Slop",
                          variant: "error"
                        }
                      },
                      {
                        label: "Knob",
                        href: "/{locale}/company/docs/packages/rimelight-ui/components/form/knob/",
                        badge: {
                          text: "Slop",
                          variant: "error"
                        }
                      },
                      {
                        label: "Listbox",
                        href: "/{locale}/company/docs/packages/rimelight-ui/components/form/listbox/",
                        badge: {
                          text: "Slop",
                          variant: "error"
                        }
                      },
                      {
                        label: "Password",
                        href: "/{locale}/company/docs/packages/rimelight-ui/components/form/password/",
                        badge: {
                          text: "Slop",
                          variant: "error"
                        }
                      },
                      {
                        label: "RadioGroup",
                        href: "/{locale}/company/docs/packages/rimelight-ui/components/form/radio-group/",
                        badge: {
                          text: "Slop",
                          variant: "error"
                        }
                      },
                      {
                        label: "Select",
                        href: "/{locale}/company/docs/packages/rimelight-ui/components/form/select/",
                        badge: {
                          text: "Slop",
                          variant: "error"
                        }
                      },
                      {
                        label: "Slider",
                        href: "/{locale}/company/docs/packages/rimelight-ui/components/form/slider/",
                        badge: {
                          text: "Slop",
                          variant: "error"
                        }
                      },
                      {
                        label: "Switch",
                        href: "/{locale}/company/docs/packages/rimelight-ui/components/form/switch/",
                        badge: {
                          text: "Slop",
                          variant: "error"
                        }
                      },
                      {
                        label: "Textarea",
                        href: "/{locale}/company/docs/packages/rimelight-ui/components/form/textarea/",
                        badge: {
                          text: "Slop",
                          variant: "error"
                        }
                      },
                      {
                        label: "ColorArea",
                        href: "/{locale}/company/docs/packages/rimelight-ui/components/form/color-area/",
                        badge: {
                          text: "Slop",
                          variant: "error"
                        }
                      },
                      {
                        label: "ColorField",
                        href: "/{locale}/company/docs/packages/rimelight-ui/components/form/color-field/",
                        badge: {
                          text: "Slop",
                          variant: "error"
                        }
                      },
                      {
                        label: "ColorSlider",
                        href: "/{locale}/company/docs/packages/rimelight-ui/components/form/color-slider/",
                        badge: {
                          text: "Slop",
                          variant: "error"
                        }
                      }
                    ]
                  },
                  {
                    label: "Data",
                    collapsed: true,
                    items: [
                      {
                        label: "Accordion",
                        href: "/{locale}/company/docs/packages/rimelight-ui/components/data/accordion/",
                        badge: {
                          text: "Slop",
                          variant: "error"
                        }
                      },
                      {
                        label: "Carousel",
                        href: "/{locale}/company/docs/packages/rimelight-ui/components/data/carousel/",
                        badge: {
                          text: "Slop",
                          variant: "error"
                        }
                      },
                      {
                        label: "Chart",
                        href: "/{locale}/company/docs/packages/rimelight-ui/components/data/chart/",
                        badge: {
                          text: "Slop",
                          variant: "error"
                        }
                      },
                      {
                        label: "Empty",
                        href: "/{locale}/company/docs/packages/rimelight-ui/components/data/empty/",
                        badge: {
                          text: "Slop",
                          variant: "error"
                        }
                      },
                      {
                        label: "Gallery",
                        href: "/{locale}/company/docs/packages/rimelight-ui/components/data/gallery/",
                        badge: {
                          text: "Slop",
                          variant: "error"
                        }
                      },
                      {
                        label: "Marquee",
                        href: "/{locale}/company/docs/packages/rimelight-ui/components/data/marquee/",
                        badge: {
                          text: "Slop",
                          variant: "error"
                        }
                      },
                      {
                        label: "Meter",
                        href: "/{locale}/company/docs/packages/rimelight-ui/components/data/meter/",
                        badge: {
                          text: "Slop",
                          variant: "error"
                        }
                      },
                      {
                        label: "Progress",
                        href: "/{locale}/company/docs/packages/rimelight-ui/components/data/progress/",
                        badge: {
                          text: "Slop",
                          variant: "error"
                        }
                      },
                      {
                        label: "Quote",
                        href: "/{locale}/company/docs/packages/rimelight-ui/components/data/quote/",
                        badge: {
                          text: "Slop",
                          variant: "error"
                        }
                      },
                      {
                        label: "Rating",
                        href: "/{locale}/company/docs/packages/rimelight-ui/components/data/rating/",
                        badge: {
                          text: "Slop",
                          variant: "error"
                        }
                      },
                      {
                        label: "ScrollArea",
                        href: "/{locale}/company/docs/packages/rimelight-ui/components/data/scroll-area/",
                        badge: {
                          text: "Slop",
                          variant: "error"
                        }
                      },
                      {
                        label: "Skeleton",
                        href: "/{locale}/company/docs/packages/rimelight-ui/components/data/skeleton/",
                        badge: {
                          text: "Slop",
                          variant: "error"
                        }
                      },
                      {
                        label: "Spinner",
                        href: "/{locale}/company/docs/packages/rimelight-ui/components/data/spinner/",
                        badge: {
                          text: "Slop",
                          variant: "error"
                        }
                      },
                      {
                        label: "Spoiler",
                        href: "/{locale}/company/docs/packages/rimelight-ui/components/data/spoiler/",
                        badge: {
                          text: "Slop",
                          variant: "error"
                        }
                      },
                      {
                        label: "Table",
                        href: "/{locale}/company/docs/packages/rimelight-ui/components/data/table/",
                        badge: {
                          text: "Slop",
                          variant: "error"
                        }
                      },
                      {
                        label: "Timeline",
                        href: "/{locale}/company/docs/packages/rimelight-ui/components/data/timeline/",
                        badge: {
                          text: "Slop",
                          variant: "error"
                        }
                      },
                      {
                        label: "Tree",
                        href: "/{locale}/company/docs/packages/rimelight-ui/components/data/tree/",
                        badge: {
                          text: "Slop",
                          variant: "error"
                        }
                      },
                      {
                        label: "User",
                        href: "/{locale}/company/docs/packages/rimelight-ui/components/data/user/",
                        badge: {
                          text: "Slop",
                          variant: "error"
                        }
                      }
                    ]
                  },
                  {
                    label: "Navigation",
                    collapsed: true,
                    items: [
                      {
                        label: "Breadcrumb",
                        href: "/{locale}/company/docs/packages/rimelight-ui/components/navigation/breadcrumb/",
                        badge: {
                          text: "Slop",
                          variant: "error"
                        }
                      },
                      {
                        label: "Link",
                        href: "/{locale}/company/docs/packages/rimelight-ui/components/navigation/link/",
                        badge: {
                          text: "Slop",
                          variant: "error"
                        }
                      },
                      {
                        label: "Link Group",
                        href: "/{locale}/company/docs/packages/rimelight-ui/components/navigation/link-group/",
                        badge: {
                          text: "Slop",
                          variant: "error"
                        }
                      },
                      {
                        label: "NavigationMenu",
                        href: "/{locale}/company/docs/packages/rimelight-ui/components/navigation/navigation-menu/",
                        badge: {
                          text: "Slop",
                          variant: "error"
                        }
                      },
                      {
                        label: "Pagination",
                        href: "/{locale}/company/docs/packages/rimelight-ui/components/navigation/pagination/",
                        badge: {
                          text: "Slop",
                          variant: "error"
                        }
                      },
                      {
                        label: "Stepper",
                        href: "/{locale}/company/docs/packages/rimelight-ui/components/navigation/stepper/",
                        badge: {
                          text: "Slop",
                          variant: "error"
                        }
                      },
                      {
                        label: "Steps",
                        href: "/{locale}/company/docs/packages/rimelight-ui/components/navigation/steps/",
                        badge: {
                          text: "Slop",
                          variant: "error"
                        }
                      },
                      {
                        label: "Surround",
                        href: "/{locale}/company/docs/packages/rimelight-ui/components/navigation/table-of-contents/",
                        badge: {
                          text: "Slop",
                          variant: "error"
                        }
                      },
                      {
                        label: "Tabs",
                        href: "/{locale}/company/docs/packages/rimelight-ui/components/navigation/tabs/",
                        badge: {
                          text: "Slop",
                          variant: "error"
                        }
                      }
                    ]
                  },
                  {
                    label: "Overlay",
                    collapsed: true,
                    items: [
                      {
                        label: "Confirm",
                        href: "/{locale}/company/docs/packages/rimelight-ui/components/overlay/confirm/",
                        badge: {
                          text: "Slop",
                          variant: "error"
                        }
                      },
                      {
                        label: "ContextMenu",
                        href: "/{locale}/company/docs/packages/rimelight-ui/components/overlay/context-menu/",
                        badge: {
                          text: "Slop",
                          variant: "error"
                        }
                      },
                      {
                        label: "CommandPalette",
                        href: "/{locale}/company/docs/packages/rimelight-ui/components/overlay/command-palette/",
                        badge: {
                          text: "Slop",
                          variant: "error"
                        }
                      },
                      {
                        label: "Dock",
                        href: "/{locale}/company/docs/packages/rimelight-ui/components/overlay/dock/",
                        badge: {
                          text: "Slop",
                          variant: "error"
                        }
                      },
                      {
                        label: "Drawer",
                        href: "/{locale}/company/docs/packages/rimelight-ui/components/overlay/drawer/",
                        badge: {
                          text: "Slop",
                          variant: "error"
                        }
                      },
                      {
                        label: "DropdownMenu",
                        href: "/{locale}/company/docs/packages/rimelight-ui/components/overlay/dropdown-menu/",
                        badge: {
                          text: "Slop",
                          variant: "error"
                        }
                      },
                      {
                        label: "Floating Action",
                        href: "/{locale}/company/docs/packages/rimelight-ui/components/overlay/floating-action/",
                        badge: {
                          text: "Slop",
                          variant: "error"
                        }
                      },
                      {
                        label: "Hover Card",
                        href: "/{locale}/company/docs/packages/rimelight-ui/components/overlay/hover-card/",
                        badge: {
                          text: "Slop",
                          variant: "error"
                        }
                      },
                      {
                        label: "Modal",
                        href: "/{locale}/company/docs/packages/rimelight-ui/components/overlay/modal/",
                        badge: {
                          text: "Slop",
                          variant: "error"
                        }
                      },
                      {
                        label: "Popover",
                        href: "/{locale}/company/docs/packages/rimelight-ui/components/overlay/popover/",
                        badge: {
                          text: "Slop",
                          variant: "error"
                        }
                      },
                      {
                        label: "Slideover",
                        href: "/{locale}/company/docs/packages/rimelight-ui/components/overlay/slideover/",
                        badge: {
                          text: "Slop",
                          variant: "error"
                        }
                      },
                      {
                        label: "Toast",
                        href: "/{locale}/company/docs/packages/rimelight-ui/components/overlay/toast/",
                        badge: {
                          text: "Slop",
                          variant: "error"
                        }
                      },
                      {
                        label: "Tooltip",
                        href: "/{locale}/company/docs/packages/rimelight-ui/components/overlay/tooltip/",
                        badge: {
                          text: "Slop",
                          variant: "error"
                        }
                      }
                    ]
                  },
                  {
                    label: "Page",
                    collapsed: true,
                    items: [
                      {
                        label: "Page",
                        href: "/{locale}/company/docs/packages/rimelight-ui/components/page/page/",
                        badge: {
                          text: "Slop",
                          variant: "error"
                        }
                      },
                      {
                        label: "PageAside",
                        href: "/{locale}/company/docs/packages/rimelight-ui/components/page/page-aside/",
                        badge: {
                          text: "Slop",
                          variant: "error"
                        }
                      },
                      {
                        label: "PageBody",
                        href: "/{locale}/company/docs/packages/rimelight-ui/components/page/page-body/",
                        badge: {
                          text: "Slop",
                          variant: "error"
                        }
                      },
                      {
                        label: "PageHeader",
                        href: "/{locale}/company/docs/packages/rimelight-ui/components/page/page-header/",
                        badge: {
                          text: "Slop",
                          variant: "error"
                        }
                      },
                      {
                        label: "PageSection",
                        href: "/{locale}/company/docs/packages/rimelight-ui/components/page/page-section/",
                        badge: {
                          text: "Slop",
                          variant: "error"
                        }
                      },
                      {
                        label: "Post",
                        href: "/{locale}/company/docs/packages/rimelight-ui/components/page/post/",
                        badge: {
                          text: "Slop",
                          variant: "error"
                        }
                      },
                      {
                        label: "PricingPlan",
                        href: "/{locale}/company/docs/packages/rimelight-ui/components/page/pricing-plan/",
                        badge: {
                          text: "Slop",
                          variant: "error"
                        }
                      },
                      {
                        label: "PricingTable",
                        href: "/{locale}/company/docs/packages/rimelight-ui/components/page/pricing-table/",
                        badge: {
                          text: "Slop",
                          variant: "error"
                        }
                      },
                      {
                        label: "Prose",
                        href: "/{locale}/company/docs/packages/rimelight-ui/components/page/prose/",
                        badge: {
                          text: "Slop",
                          variant: "error"
                        }
                      }
                    ]
                  },
                  {
                    label: "Dashboard",
                    collapsed: true,
                    items: [
                      {
                        label: "DashboardGroup",
                        href: "/{locale}/company/docs/packages/rimelight-ui/components/dashboard/dashboard-group/",
                        badge: {
                          text: "Slop",
                          variant: "error"
                        }
                      },
                      {
                        label: "DashboardNavbar",
                        href: "/{locale}/company/docs/packages/rimelight-ui/components/dashboard/dashboard-navbar/",
                        badge: {
                          text: "Slop",
                          variant: "error"
                        }
                      },
                      {
                        label: "DashboardPanel",
                        href: "/{locale}/company/docs/packages/rimelight-ui/components/dashboard/dashboard-panel/",
                        badge: {
                          text: "Slop",
                          variant: "error"
                        }
                      },
                      {
                        label: "DashboardResizeHandle",
                        href: "/{locale}/company/docs/packages/rimelight-ui/components/dashboard/dashboard-resize-handle/",
                        badge: {
                          text: "Slop",
                          variant: "error"
                        }
                      },
                      {
                        label: "DashboardSearch",
                        href: "/{locale}/company/docs/packages/rimelight-ui/components/dashboard/dashboard-search/",
                        badge: {
                          text: "Slop",
                          variant: "error"
                        }
                      },
                      {
                        label: "DashboardSearchButton",
                        href: "/{locale}/company/docs/packages/rimelight-ui/components/dashboard/dashboard-search-button/",
                        badge: {
                          text: "Slop",
                          variant: "error"
                        }
                      },
                      {
                        label: "DashboardSidebar",
                        href: "/{locale}/company/docs/packages/rimelight-ui/components/dashboard/dashboard-sidebar/",
                        badge: {
                          text: "Slop",
                          variant: "error"
                        }
                      },
                      {
                        label: "DashboardSidebarCollapse",
                        href: "/{locale}/company/docs/packages/rimelight-ui/components/dashboard/dashboard-sidebar-collapse/",
                        badge: {
                          text: "Slop",
                          variant: "error"
                        }
                      },
                      {
                        label: "DashboardSidebarToggle",
                        href: "/{locale}/company/docs/packages/rimelight-ui/components/dashboard/dashboard-sidebar-toggle/",
                        badge: {
                          text: "Slop",
                          variant: "error"
                        }
                      },
                      {
                        label: "DashboardToolbar",
                        href: "/{locale}/company/docs/packages/rimelight-ui/components/dashboard/dashboard-toolbar/",
                        badge: {
                          text: "Slop",
                          variant: "error"
                        }
                      }
                    ]
                  },
                  {
                    label: "Editor",
                    collapsed: true,
                    items: [
                      {
                        label: "Editor",
                        href: "/{locale}/company/docs/packages/rimelight-ui/components/editor/editor/",
                        badge: {
                          text: "Slop",
                          variant: "error"
                        }
                      }
                    ]
                  },
                  {
                    label: "AI",
                    collapsed: true,
                    items: [
                      {
                        label: "Chat",
                        href: "/{locale}/company/docs/packages/rimelight-ui/components/ai/chat/",
                        badge: {
                          text: "Slop",
                          variant: "error"
                        }
                      },
                      {
                        label: "ChatMessage",
                        href: "/{locale}/company/docs/packages/rimelight-ui/components/ai/chat-message/",
                        badge: {
                          text: "Slop",
                          variant: "error"
                        }
                      },
                      {
                        label: "ChatMessages",
                        href: "/{locale}/company/docs/packages/rimelight-ui/components/ai/chat-messages/",
                        badge: {
                          text: "Slop",
                          variant: "error"
                        }
                      },
                      {
                        label: "ChatPalette",
                        href: "/{locale}/company/docs/packages/rimelight-ui/components/ai/chat-palette/",
                        badge: {
                          text: "Slop",
                          variant: "error"
                        }
                      },
                      {
                        label: "ChatPrompt",
                        href: "/{locale}/company/docs/packages/rimelight-ui/components/ai/chat-prompt/",
                        badge: {
                          text: "Slop",
                          variant: "error"
                        }
                      },
                      {
                        label: "ChatPromptSubmit",
                        href: "/{locale}/company/docs/packages/rimelight-ui/components/ai/chat-prompt-submit/",
                        badge: {
                          text: "Slop",
                          variant: "error"
                        }
                      },
                      {
                        label: "ChatReasoning",
                        href: "/{locale}/company/docs/packages/rimelight-ui/components/ai/chat-reasoning/",
                        badge: {
                          text: "Slop",
                          variant: "error"
                        }
                      },
                      {
                        label: "ChatShimmer",
                        href: "/{locale}/company/docs/packages/rimelight-ui/components/ai/chat-shimmer/",
                        badge: {
                          text: "Slop",
                          variant: "error"
                        }
                      },
                      {
                        label: "ChatTool",
                        href: "/{locale}/company/docs/packages/rimelight-ui/components/ai/chat-tool/",
                        badge: {
                          text: "Slop",
                          variant: "error"
                        }
                      }
                    ]
                  },
                  {
                    label: "Effect",
                    collapsed: true,
                    items: [
                      {
                        label: "3D Hover",
                        href: "/{locale}/company/docs/packages/rimelight-ui/components/effect/3d-hover/",
                        badge: {
                          text: "Slop",
                          variant: "error"
                        }
                      }
                    ]
                  },
                  {
                    label: "Mockup",
                    collapsed: true,
                    items: [
                      {
                        label: "Browser Mockup",
                        href: "/{locale}/company/docs/packages/rimelight-ui/components/mockup/browser-mockup/",
                        badge: {
                          text: "Slop",
                          variant: "error"
                        }
                      },
                      {
                        label: "Phone Mockup",
                        href: "/{locale}/company/docs/packages/rimelight-ui/components/mockup/phone-mockup/",
                        badge: {
                          text: "Slop",
                          variant: "error"
                        }
                      },
                      {
                        label: "Window Mockup",
                        href: "/{locale}/company/docs/packages/rimelight-ui/components/mockup/window-mockup/",
                        badge: {
                          text: "Slop",
                          variant: "error"
                        }
                      }
                    ]
                  },
                  {
                    label: "Utility",
                    collapsed: true,
                    items: [
                      {
                        label: "AspectRatio",
                        href: "/{locale}/company/docs/packages/rimelight-ui/components/utility/aspect-ratio/",
                        badge: {
                          text: "Slop",
                          variant: "error"
                        }
                      },
                      {
                        label: "Compare",
                        href: "/{locale}/company/docs/packages/rimelight-ui/components/utility/compare/",
                        badge: {
                          text: "Slop",
                          variant: "error"
                        }
                      },
                      {
                        label: "LocaleSelector",
                        href: "/{locale}/company/docs/packages/rimelight-ui/components/utility/locale-selector/",
                        badge: {
                          text: "Slop",
                          variant: "error"
                        }
                      },
                      {
                        label: "Placeholder",
                        href: "/{locale}/company/docs/packages/rimelight-ui/components/utility/placeholder/",
                        badge: {
                          text: "Slop",
                          variant: "error"
                        }
                      },
                      {
                        label: "QR Code",
                        href: "/{locale}/company/docs/packages/rimelight-ui/components/utility/qr-code/",
                        badge: {
                          text: "Slop",
                          variant: "error"
                        }
                      },
                      {
                        label: "ScrollToTop",
                        href: "/{locale}/company/docs/packages/rimelight-ui/components/utility/scroll-to-top/",
                        badge: {
                          text: "Slop",
                          variant: "error"
                        }
                      },
                      {
                        label: "Sticky Surface",
                        href: "/{locale}/company/docs/packages/rimelight-ui/components/utility/sticky-surface/",
                        badge: {
                          text: "Slop",
                          variant: "error"
                        }
                      },
                      {
                        label: "ThemeSelector",
                        href: "/{locale}/company/docs/packages/rimelight-ui/components/utility/theme-selector/",
                        badge: {
                          text: "Slop",
                          variant: "error"
                        }
                      },
                      {
                        label: "Tour",
                        href: "/{locale}/company/docs/packages/rimelight-ui/components/utility/tour/",
                        badge: {
                          text: "Slop",
                          variant: "error"
                        }
                      },
                      {
                        label: "Watermark",
                        href: "/{locale}/company/docs/packages/rimelight-ui/components/utility/watermark/",
                        badge: {
                          text: "Slop",
                          variant: "error"
                        }
                      }
                    ]
                  }
                ]
              },
              {
                label: "Agents",
                collapsed: true,
                items: [
                  {
                    label: "LLMs.txt",
                    href: "/{locale}/company/docs/packages/rimelight-ui/agents/llms-txt/",
                    badge: {
                      text: "Slop",
                      variant: "error"
                    }
                  },
                  {
                    label: "MCP Server",
                    href: "/{locale}/company/docs/packages/rimelight-ui/agents/mcp-server/",
                    badge: {
                      text: "Slop",
                      variant: "error"
                    }
                  },
                  {
                    label: "Skills",
                    href: "/{locale}/company/docs/packages/rimelight-ui/agents/skills/",
                    badge: {
                      text: "Slop",
                      variant: "error"
                    }
                  }
                ]
              }
            ]
          },
          {
            label: "i18n",
            collapsed: true,
            items: [
              {
                label: "Overview",
                items: [
                  {
                    label: "Introduction",
                    href: "/{locale}/company/docs/packages/rimelight-i18n/overview/introduction/",
                    badge: {
                      text: "Slop",
                      variant: "error"
                    }
                  },
                  {
                    label: "Installation",
                    href: "/{locale}/company/docs/packages/rimelight-i18n/overview/installation/",
                    badge: {
                      text: "Slop",
                      variant: "error"
                    }
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
              {
                label: "Introduction",
                href: "/{locale}/company/docs/api/overview/introduction/"
              }
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
              {
                label: "Grand Tale",
                href: "/{locale}/company/docs/api/reference/grand-tale/"
              }
            ]
          }
        ]
      }
    ]
  }
})
