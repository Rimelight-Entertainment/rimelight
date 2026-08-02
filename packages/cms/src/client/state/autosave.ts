export type AutosaveStatus = "saved" | "unsaved" | "saving" | "error"

export interface AutosaveOptions {
  pageId: string
  saveEndpoint?: string
  debounceMs?: number
  onStatusChange?: ((status: AutosaveStatus, errorMsg?: string) => void) | undefined
}

export class AutosaveController {
  private pageId: string
  private saveEndpoint: string
  private debounceMs: number
  private timer: number | null = null
  private status: AutosaveStatus = "saved"
  private onStatusChange?: ((status: AutosaveStatus, errorMsg?: string) => void) | undefined

  constructor(options: AutosaveOptions) {
    this.pageId = options.pageId
    this.saveEndpoint = options.saveEndpoint || `/api/cms/pages/${this.pageId}/draft`
    this.debounceMs = options.debounceMs || 2000
    this.onStatusChange = options.onStatusChange
  }

  getPageId(): string {
    return this.pageId
  }

  notifyChange(content: any): void {
    this.setStatus("unsaved")
    if (this.timer !== null) {
      clearTimeout(this.timer)
    }

    this.timer = window.setTimeout(() => {
      void this.save(content)
    }, this.debounceMs)
  }

  async save(content: any): Promise<boolean> {
    this.setStatus("saving")
    try {
      const res = await fetch(this.saveEndpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content })
      })

      if (res.ok) {
        this.setStatus("saved")
        return true
      } else {
        const data = await res.json().catch(() => ({}))
        this.setStatus("error", data.message || "Failed to save draft")
        return false
      }
    } catch (err: any) {
      this.setStatus("error", err?.message || "Network error")
      return false
    }
  }

  getStatus(): AutosaveStatus {
    return this.status
  }

  private setStatus(status: AutosaveStatus, errorMsg?: string) {
    this.status = status
    if (this.onStatusChange) {
      this.onStatusChange(status, errorMsg)
    }
  }
}
