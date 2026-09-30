export type AutosaveStatus = "saved" | "unsaved" | "saving" | "error";

export interface AutosaveOptions {
  pageId: string;
  saveEndpoint?: string;
  debounceMs?: number;
  onStatusChange?: ((status: AutosaveStatus, errorMsg?: string) => void) | undefined;
}

export class AutosaveController {
  private pageId: string;
  private saveEndpoint: string;
  private debounceMs: number;
  private timer: number | null = null;
  private status: AutosaveStatus = "saved";
  private lastContent: any = null;
  private onStatusChange?: ((status: AutosaveStatus, errorMsg?: string) => void) | undefined;

  constructor(options: AutosaveOptions) {
    this.pageId = options.pageId;
    this.saveEndpoint = options.saveEndpoint || `/api/cms/pages/${this.pageId}/draft`;
    this.debounceMs = options.debounceMs || 500;
    this.onStatusChange = options.onStatusChange;

    if (typeof window !== "undefined") {
      window.addEventListener("beforeunload", () => this.flushSync());
      document.addEventListener("visibilitychange", () => {
        if (document.visibilityState === "hidden") {
          this.flushSync();
        }
      });
    }
  }

  getPageId(): string {
    return this.pageId;
  }

  notifyChange(content: any): void {
    this.lastContent = content;
    this.saveToLocalStorage(content);
    this.setStatus("unsaved");

    if (this.timer !== null) {
      clearTimeout(this.timer);
    }

    if (typeof window === "undefined") {
      void this.save(content);
      return;
    }

    this.timer = window.setTimeout(() => {
      void this.save(content);
    }, this.debounceMs);
  }

  async saveImmediate(content: any): Promise<boolean> {
    this.lastContent = content;
    this.saveToLocalStorage(content);
    if (this.timer !== null) {
      clearTimeout(this.timer);
      this.timer = null;
    }
    return this.save(content);
  }

  async save(content: any): Promise<boolean> {
    this.setStatus("saving");
    try {
      const res = await fetch(this.saveEndpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
      });

      if (res.ok) {
        this.setStatus("saved");
        return true;
      } else {
        const data = await res.json().catch(() => ({}));
        this.setStatus("error", data.message || "Failed to save draft");
        return false;
      }
    } catch (err: any) {
      this.setStatus("error", err?.message || "Network error");
      return false;
    }
  }

  private saveToLocalStorage(content: any): void {
    if (typeof window === "undefined" || !this.pageId) return;
    try {
      window.localStorage.setItem(`cms_draft_backup_${this.pageId}`, JSON.stringify(content));
    } catch (e) {
      console.warn("Failed to write draft backup to localStorage", e);
    }
  }

  private flushSync(): void {
    if (this.status === "unsaved" && this.lastContent) {
      if (this.timer !== null) {
        clearTimeout(this.timer);
        this.timer = null;
      }
      try {
        void fetch(this.saveEndpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ content: this.lastContent }),
          keepalive: true,
        });
      } catch {}
    }
  }

  getStatus(): AutosaveStatus {
    return this.status;
  }

  private setStatus(status: AutosaveStatus, errorMsg?: string) {
    this.status = status;
    if (this.onStatusChange) {
      this.onStatusChange(status, errorMsg);
    }
  }
}
