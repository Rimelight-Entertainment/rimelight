/**
 * Showcase Preview Custom Elements
 *
 * This module defines all the custom elements used in the component showcase. It must be imported
 * client-side before the showcase renderers run.
 */

// Hero Preview Custom Element
export class HeroPreviewElement extends HTMLElement {
  innerEl: HTMLElement | null = null
  contentWrapper: HTMLElement | null = null
  titleEl: HTMLElement | null = null
  descEl: HTMLElement | null = null

  static get observedAttributes() {
    return ["data-orientation", "data-alignment", "data-inverted"]
  }

  connectedCallback() {
    this.innerEl = this.querySelector<HTMLElement>(".hero-preview-inner")
    this.contentWrapper = this.querySelector<HTMLElement>(".hero-content-wrapper")
    this.titleEl = this.querySelector<HTMLElement>("[data-hero-title]")
    this.descEl = this.querySelector<HTMLElement>("[data-hero-description]")
    if (!this.innerEl || !this.contentWrapper) return
    this.updateClasses()
  }

  attributeChangedCallback(_name: string, _oldValue: string, newValue: string) {
    if (_oldValue !== newValue) {
      this.updateClasses()
    }
  }

  updateClasses() {
    if (!this.innerEl || !this.contentWrapper) return

    const orientation = this.dataset.orientation || "vertical"
    const alignment = this.dataset.alignment || "center"
    const inverted = this.dataset.inverted === "true"

    const effectiveAlignment = orientation === "horizontal" ? "left" : alignment

    // Reset inner container classes
    this.innerEl.className = "hero-preview-inner w-full"

    // Apply orientation classes
    if (orientation === "horizontal") {
      this.innerEl.classList.add(
        "flex",
        "flex-col",
        "gap-8",
        "items-center",
        "lg:grid",
        "lg:grid-cols-2",
        "lg:items-center",
        "lg:gap-16"
      )
    } else {
      this.innerEl.classList.add("flex", "flex-col", "gap-8", "items-center")
      if (!inverted) {
        this.innerEl.classList.add("flex-col-reverse")
      }
    }

    // Apply alignment classes
    this.innerEl.classList.remove(
      "text-start",
      "text-center",
      "text-end",
      "items-start",
      "items-end"
    )
    if (effectiveAlignment === "left") {
      this.innerEl.classList.add("text-start", "items-start")
    } else if (effectiveAlignment === "right") {
      this.innerEl.classList.add("text-end", "items-end")
    } else {
      this.innerEl.classList.add("text-center", "items-center")
    }

    // Update content wrapper
    this.contentWrapper.classList.remove(
      "text-center",
      "items-center",
      "text-start",
      "items-start",
      "text-end",
      "items-end"
    )
    if (effectiveAlignment === "left") {
      this.contentWrapper.classList.add("text-start", "items-start")
    } else if (effectiveAlignment === "right") {
      this.contentWrapper.classList.add("text-end", "items-end")
    } else {
      this.contentWrapper.classList.add("text-center", "items-center")
    }
  }
}

// Section Preview Custom Element
export class SectionPreviewElement extends HTMLElement {
  innerEl: HTMLElement | null = null
  contentEl: HTMLElement | null = null
  titleEl: HTMLElement | null = null
  descEl: HTMLElement | null = null

  static get observedAttributes() {
    return ["data-orientation", "data-alignment", "data-inverted"]
  }

  connectedCallback() {
    this.innerEl = this.querySelector<HTMLElement>(".section-preview-inner")
    this.contentEl = this.querySelector<HTMLElement>(".section-content")
    this.titleEl = this.querySelector<HTMLElement>("[data-section-title]")
    this.descEl = this.querySelector<HTMLElement>("[data-section-description]")
    if (!this.innerEl || !this.contentEl) return
    this.updateClasses()
  }

  attributeChangedCallback(_name: string, _oldValue: string, newValue: string) {
    if (_oldValue !== newValue) {
      this.updateClasses()
    }
  }

  updateClasses() {
    if (!this.innerEl || !this.contentEl) return

    const orientation = this.dataset.orientation || "vertical"
    const alignment = this.dataset.alignment || "center"
    const inverted = this.dataset.inverted === "true"

    const effectiveAlignment = orientation === "horizontal" ? "left" : alignment

    // Reset inner container classes
    this.innerEl.className = "section-preview-inner w-full"
    this.innerEl.classList.add("container", "py-24")

    // Apply orientation classes
    if (orientation === "horizontal") {
      this.innerEl.classList.add("lg:grid", "lg:grid-cols-2", "lg:items-center", "lg:gap-16")
    } else {
      this.innerEl.classList.add("flex", "flex-col", "gap-12")
      if (inverted) {
        this.innerEl.classList.add("flex-col-reverse")
      }
    }

    // Apply alignment classes
    this.innerEl.classList.remove(
      "text-start",
      "text-center",
      "text-end",
      "items-start",
      "items-end"
    )
    if (effectiveAlignment === "left") {
      this.innerEl.classList.add("text-start", "items-start")
    } else if (effectiveAlignment === "right") {
      this.innerEl.classList.add("text-end", "items-end")
    } else {
      this.innerEl.classList.add("text-center", "items-center")
    }

    // Update content element
    this.contentEl.classList.remove(
      "text-center",
      "items-center",
      "text-start",
      "items-start",
      "text-end",
      "items-end"
    )
    if (effectiveAlignment === "left") {
      this.contentEl.classList.add("text-start", "items-start")
    } else if (effectiveAlignment === "right") {
      this.contentEl.classList.add("text-end", "items-end")
    } else {
      this.contentEl.classList.add("text-center", "items-center")
    }
  }
}

// Button Preview Custom Element
export class ButtonPreviewElement extends HTMLElement {
  button: HTMLElement | null = null

  static get observedAttributes() {
    return ["data-variant", "data-size", "data-children"]
  }

  connectedCallback() {
    this.button = this.querySelector<HTMLElement>("[data-preview-button]")
    if (!this.button) return
    this.updateButton()
  }

  attributeChangedCallback(_name: string, oldValue: string, newValue: string) {
    if (oldValue !== newValue && this.button) {
      this.updateButton()
    }
  }

  updateButton() {
    if (!this.button) return

    const variant = this.dataset.variant || "default"
    const size = this.dataset.size || "md"
    const children = this.dataset.children || "Button"

    // Remove all variant classes
    this.button.classList.remove(
      "bg-input",
      "hover:bg-input/90",
      "text-foreground",
      "bg-primary",
      "text-primary-foreground",
      "hover:bg-primary/90",
      "bg-secondary",
      "text-secondary-foreground",
      "hover:bg-secondary/90",
      "border",
      "border-input",
      "bg-background",
      "hover:bg-accent",
      "hover:text-accent-foreground",
      "bg-info",
      "text-info-foreground",
      "hover:bg-info/90",
      "bg-success",
      "text-success-foreground",
      "hover:bg-success/90",
      "bg-warning",
      "text-warning-foreground",
      "hover:bg-warning/90",
      "bg-error",
      "text-error-foreground",
      "hover:bg-error/90"
    )

    // Add new variant classes
    const variantClasses: Record<string, string[]> = {
      default: ["bg-input", "hover:bg-input/90", "text-foreground"],
      primary: ["bg-primary", "text-primary-foreground", "hover:bg-primary/90"],
      secondary: ["bg-secondary", "text-secondary-foreground", "hover:bg-secondary/90"],
      outline: [
        "border",
        "border-input",
        "bg-background",
        "hover:bg-accent",
        "hover:text-accent-foreground"
      ],
      ghost: ["hover:bg-accent", "hover:text-accent-foreground"],
      info: ["bg-info", "text-info-foreground", "hover:bg-info/90"],
      success: ["bg-success", "text-success-foreground", "hover:bg-success/90"],
      warning: ["bg-warning", "text-warning-foreground", "hover:bg-warning/90"],
      error: ["bg-error", "text-error-foreground", "hover:bg-error/90"]
    }

    variantClasses[variant]?.forEach((cls: string) => this.button?.classList.add(cls))

    // Remove all size classes
    this.button.classList.remove(
      "h-9",
      "px-3",
      "text-sm",
      "h-11",
      "px-4",
      "text-base",
      "h-12",
      "px-6",
      "text-lg"
    )

    // Add new size classes
    const sizeClasses: Record<string, string[]> = {
      sm: ["h-9", "px-3", "text-sm"],
      md: ["h-11", "px-4", "text-base"],
      lg: ["h-12", "px-6", "text-lg"]
    }

    sizeClasses[size]?.forEach((cls: string) => this.button?.classList.add(cls))

    // Update text
    this.button.textContent = children
  }
}

// Testimonials Preview Custom Element
export class TestimonialsPreviewElement extends HTMLElement {
  card: HTMLElement | null = null
  quoteEl: HTMLElement | null = null
  personEl: HTMLElement | null = null
  metaEl: HTMLElement | null = null

  static get observedAttributes() {
    return ["data-alignment"]
  }

  connectedCallback() {
    this.card = this.querySelector<HTMLElement>(".testimonial-card")
    this.quoteEl = this.querySelector<HTMLElement>("[data-testimonials-quote]")
    this.personEl = this.querySelector<HTMLElement>(".testimonial-person")
    this.metaEl = this.querySelector<HTMLElement>(".testimonial-meta")
    if (!this.card || !this.quoteEl || !this.personEl || !this.metaEl) return
    this.updateClasses()
  }

  attributeChangedCallback(_name: string, oldValue: string, newValue: string) {
    if (oldValue !== newValue) {
      this.updateClasses()
    }
  }

  updateClasses() {
    if (!this.card || !this.quoteEl || !this.personEl || !this.metaEl) return

    const alignment = this.dataset.alignment || "center"

    // Reset all alignment classes
    this.quoteEl.classList.remove("text-left", "text-center", "text-right")
    this.personEl.classList.remove(
      "flex-row",
      "flex-row-reverse",
      "items-center",
      "justify-start",
      "justify-end",
      "flex-col",
      "text-center"
    )
    this.metaEl.classList.remove(
      "text-left",
      "text-right",
      "items-start",
      "items-end",
      "items-center"
    )

    if (alignment === "left") {
      this.quoteEl.classList.add("text-left")
      this.personEl.classList.add("flex-row", "items-center", "justify-start")
      this.metaEl.classList.add("text-left", "items-start")
    } else if (alignment === "right") {
      this.quoteEl.classList.add("text-right")
      this.personEl.classList.add("flex-row-reverse", "items-center", "justify-end")
      this.metaEl.classList.add("text-right", "items-end")
    } else {
      // center
      this.quoteEl.classList.add("text-center")
      this.personEl.classList.add("flex-col", "items-center", "justify-center", "text-center")
      this.metaEl.classList.add("items-center")
    }
  }
}

// Language Switcher Preview Custom Element
export class LanguageSwitcherPreviewElement extends HTMLElement {
  static get observedAttributes() {
    return ["data-variant"]
  }

  connectedCallback() {
    this.updateVariant()
  }

  attributeChangedCallback(_name: string, oldValue: string, newValue: string) {
    if (oldValue !== newValue) {
      this.updateVariant()
    }
  }

  updateVariant() {
    // Dispatch event for the actual component to handle
    this.dispatchEvent(
      new CustomEvent("language-switcher:variant-change", {
        detail: { variant: this.dataset.variant },
        bubbles: true
      })
    )
  }
}

// Register all custom elements
export function registerShowcasePreviewElements() {
  if (!customElements.get("hero-preview")) {
    customElements.define("hero-preview", HeroPreviewElement)
  }
  if (!customElements.get("section-preview")) {
    customElements.define("section-preview", SectionPreviewElement)
  }
  if (!customElements.get("button-preview")) {
    customElements.define("button-preview", ButtonPreviewElement)
  }
  if (!customElements.get("testimonials-preview")) {
    customElements.define("testimonials-preview", TestimonialsPreviewElement)
  }
  if (!customElements.get("language-switcher-preview")) {
    customElements.define("language-switcher-preview", LanguageSwitcherPreviewElement)
  }
}

// Auto-register when module is imported
if (typeof window !== "undefined") {
  registerShowcasePreviewElements()
}
