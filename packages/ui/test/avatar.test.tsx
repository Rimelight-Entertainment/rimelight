import { describe, it, expect, vi } from "vite-plus/test"
import { renderToString } from "@solidjs/web"

vi.mock("virtual:rimelight/ui", () => ({
  default: {
    unstyled: false,
    components: { themes: {} },
    icons: {}
  }
}))

import { RLAvatar } from "../src/components/avatar/RLAvatar"
import { RLAvatarGroup } from "../src/components/avatar-group/RLAvatarGroup"
import { renderSolid, cleanHtml } from "./utils/normalize"

describe("RLAvatar Solid Component Suite", () => {
  describe("Default Rendering & Fallback Resolution", () => {
    it("renders default fallback user icon when no props are given", () => {
      const html = renderSolid(RLAvatar, {})

      expect(html).toContain('data-slot="root"')
      expect(html).toContain('data-slot="fallback"')
      expect(html).toContain('data-slot="icon"')
    })

    it("renders alt initials as fallback when alt is provided and no src", () => {
      const html = renderSolid(RLAvatar, { alt: "Benjamin Canac" })

      expect(html).toContain('data-slot="root"')
      expect(html).toContain('data-slot="fallback"')
      expect(html).toContain("BC")
    })

    it("renders single-word alt initials correctly", () => {
      const html = renderSolid(RLAvatar, { alt: "Admin" })

      expect(html).toContain("AD")
    })

    it("renders text prop with priority over alt initials", () => {
      const html = renderSolid(RLAvatar, { alt: "Benjamin Canac", text: "+1" })

      expect(html).toContain("+1")
      expect(html).not.toContain("BC")
    })

    it("renders fallback / initials props with priority over alt", () => {
      const html = renderSolid(RLAvatar, { alt: "Benjamin Canac", initials: "JD" })

      expect(html).toContain("JD")
      expect(html).not.toContain("BC")
    })

    it("renders custom icon prop as fallback", () => {
      const html = renderSolid(RLAvatar, { icon: "star" })

      expect(html).toContain('data-slot="fallback"')
      expect(html).toContain('data-slot="icon"')
    })

    it("renders custom fallbackSlot", () => {
      const html = renderSolid(RLAvatar, { fallbackSlot: "CUSTOM_SLOT" })

      expect(html).toContain('data-slot="fallback"')
      expect(html).toContain("CUSTOM_SLOT")
    })
  })

  describe("Image Rendering & HTML Attributes Forwarding", () => {
    it("renders <img> tag when src is provided", () => {
      const html = renderSolid(RLAvatar, {
        src: "https://example.com/avatar.png",
        alt: "User Photo",
        loading: "lazy",
        decoding: "async",
        width: 40,
        height: 40
      })

      expect(html).toContain("<img")
      expect(html).toContain('src="https://example.com/avatar.png"')
      expect(html).toContain('alt="User Photo"')
      expect(html).toContain('loading="lazy"')
      expect(html).toContain('decoding="async"')
      expect(html).toContain('width="40"')
      expect(html).toContain('height="40"')
      expect(html).toContain('data-slot="image"')
    })

    it("forwards referrerpolicy and crossorigin to <img>", () => {
      const html = renderSolid(RLAvatar, {
        src: "https://example.com/avatar.png",
        referrerpolicy: "no-referrer",
        crossorigin: "anonymous"
      })

      expect(html).toContain('referrerpolicy="no-referrer"')
      expect(html).toContain('crossorigin="anonymous"')
    })
  })

  describe("Size Variants", () => {
    const sizes = [
      { size: "3xs", expected: "size-4" },
      { size: "2xs", expected: "size-5" },
      { size: "xs", expected: "size-6" },
      { size: "sm", expected: "size-7" },
      { size: "md", expected: "size-8" },
      { size: "lg", expected: "size-9" },
      { size: "xl", expected: "size-10" },
      { size: "2xl", expected: "size-11" },
      { size: "3xl", expected: "size-12" }
    ] as const

    for (const { size, expected } of sizes) {
      it(`applies correct dimension class for size="${size}"`, () => {
        const html = renderSolid(RLAvatar, { size, alt: "Test" })
        expect(html).toContain(expected)
      })
    }
  })

  describe("Color Variants & Dynamic Palette Support", () => {
    it("applies rl-color-primary class and CSS-var based root styling", () => {
      const html = renderSolid(RLAvatar, { color: "primary", alt: "John Doe" })

      expect(html).toContain("rl-color-primary")
    })

    it("applies rl-color-success class for success color", () => {
      const html = renderSolid(RLAvatar, { color: "success", alt: "John Doe" })

      expect(html).toContain("rl-color-success")
    })

    it("applies custom user palette class dynamically (e.g. brand-violet)", () => {
      const html = renderSolid(RLAvatar, { color: "brand-violet" as any, alt: "John Doe" })

      expect(html).toContain("rl-color-brand-violet")
    })

    it("applies neutral compound variant classes by default", () => {
      const html = renderSolid(RLAvatar, { alt: "John Doe" })

      expect(html).toContain("bg-elevated")
      expect(html).toContain("text-muted")
    })
  })

  describe("Badge & Chip Integration", () => {
    it("renders badge when badge prop is provided", () => {
      const html = renderSolid(RLAvatar, {
        alt: "User",
        badge: true,
        badgePosition: "bottom-right"
      })

      expect(html).toContain('data-slot="base"')
      expect(html).toContain("bottom-0")
      expect(html).toContain("right-0")
    })

    it("renders chip when chip prop is provided", () => {
      const html = renderSolid(RLAvatar, {
        src: "https://example.com/avatar.png",
        chip: { inset: true }
      })

      expect(html).toContain('data-slot="base"') // Chip slot
      expect(html).toContain('data-slot="root"') // Avatar slot
    })
  })

  describe("Profile Wrapper (Title & Subtitle)", () => {
    it("renders profile wrapper when title or subtitle is given", () => {
      const html = renderSolid(RLAvatar, {
        alt: "Daniel Marchi",
        title: "Daniel Marchi",
        subtitle: "Lead Developer"
      })

      expect(html).toContain('data-slot="profile-wrapper"')
      expect(html).toContain('data-slot="title"')
      expect(html).toContain("Daniel Marchi")
      expect(html).toContain('data-slot="subtitle"')
      expect(html).toContain("Lead Developer")
    })
  })

  describe("Polymorphic as Prop & Accessibility", () => {
    it("renders root element as div when as='div'", () => {
      const html = renderSolid(RLAvatar, { as: "div", alt: "Ben" })

      expect(html.startsWith("<div")).toBe(true)
      expect(html).toContain('data-slot="root"')
    })

    it("sets accessible role='img' and aria-label when label or alt is present without src", () => {
      const html = renderSolid(RLAvatar, { alt: "Benjamin Canac" })

      expect(html).toContain('role="img"')
      expect(html).toContain('aria-label="Benjamin Canac"')
    })
  })
})

describe("RLAvatarGroup Solid Component Suite", () => {
  describe("Default & Stacking Rendering", () => {
    it("renders container with flex-row-reverse stacking classes", () => {
      const html = cleanHtml(
        renderToString(() => (
          <RLAvatarGroup>
            <RLAvatar alt="Alex" />
            <RLAvatar alt="Sam" />
          </RLAvatarGroup>
        ))
      )

      expect(html).toContain('data-slot="avatar-group"')
      expect(html).toContain("flex-row-reverse")
      expect(html).toContain("justify-end")
      expect(html).toContain('data-slot="base"')
    })

    it("renders items array automatically", () => {
      const items = [
        { alt: "Benjamin Canac", src: "https://example.com/ben.png" },
        { alt: "Hugo Richard", src: "https://example.com/hugo.png" },
        { alt: "Sebastien Chopin", src: "https://example.com/seb.png" }
      ]

      const html = renderSolid(RLAvatarGroup, { items })

      expect(html).toContain('data-slot="avatar-group"')
      expect(html).toContain('src="https://example.com/ben.png"')
      expect(html).toContain('src="https://example.com/hugo.png"')
      expect(html).toContain('src="https://example.com/seb.png"')
    })
  })

  describe("Max Prop & More Counter", () => {
    it("limits rendered children to max and shows +X badge", () => {
      const html = cleanHtml(
        renderToString(() => (
          <RLAvatarGroup max={2}>
            <RLAvatar alt="A" />
            <RLAvatar alt="B" />
            <RLAvatar alt="C" />
            <RLAvatar alt="D" />
          </RLAvatarGroup>
        ))
      )

      expect(html).toContain('data-slot="more"')
      expect(html).toContain("+2")
    })

    it("limits rendered items array to max and shows +X badge", () => {
      const items = [{ alt: "A" }, { alt: "B" }, { alt: "C" }, { alt: "D" }, { alt: "E" }]

      const html = renderSolid(RLAvatarGroup, { items, max: 3 })

      expect(html).toContain('data-slot="more"')
      expect(html).toContain("+2")
    })
  })

  describe("Polymorphic as Prop & UI Customization", () => {
    it("renders root element as section when as='section'", () => {
      const html = renderSolid(RLAvatarGroup, { as: "section", items: [{ alt: "A" }] })

      expect(html.startsWith("<section")).toBe(true)
    })

    it("applies ui slot overrides to group", () => {
      const html = renderSolid(RLAvatarGroup, {
        items: [{ alt: "A" }],
        ui: { root: "custom-group-root", base: "custom-base" }
      })

      expect(html).toContain("custom-group-root")
      expect(html).toContain("custom-base")
    })
  })
})
