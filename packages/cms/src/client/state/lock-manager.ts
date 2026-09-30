export interface LockState {
  isLocked: boolean;
  lockedByUserId?: string;
  lockedByUserName?: string;
  expiresAt?: string;
}

export class LockManager {
  private pageId: string;
  private heartbeatInterval: ReturnType<typeof setInterval> | null = null;
  private heartbeatMs: number;

  constructor(pageId: string, heartbeatMs = 30000) {
    this.pageId = pageId;
    this.heartbeatMs = heartbeatMs;
  }

  async acquireCheckout(
    userId: string,
    userName: string,
  ): Promise<{ success: boolean; lockState: LockState }> {
    try {
      const res = await fetch(`/api/cms/pages/${this.pageId}/lock/checkout`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, userName }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        this.startHeartbeat(userId);
        return {
          success: true,
          lockState: { isLocked: false },
        };
      } else {
        return {
          success: false,
          lockState: {
            isLocked: true,
            lockedByUserId: data.lockedByUserId,
            lockedByUserName: data.lockedByUserName,
            expiresAt: data.expiresAt,
          },
        };
      }
    } catch {
      return {
        success: false,
        lockState: { isLocked: true, lockedByUserName: "Unknown (Network Error)" },
      };
    }
  }

  private startHeartbeat(userId: string): void {
    this.stopHeartbeat();
    this.heartbeatInterval = setInterval(async () => {
      try {
        await fetch(`/api/cms/pages/${this.pageId}/lock/heartbeat`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId }),
        });
      } catch {
        // Silently retry on next heartbeat interval
      }
    }, this.heartbeatMs);
  }

  stopHeartbeat(): void {
    if (this.heartbeatInterval !== null) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
  }

  async releaseCheckout(userId: string): Promise<void> {
    this.stopHeartbeat();
    try {
      await fetch(`/api/cms/pages/${this.pageId}/lock/release`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      });
    } catch {
      // Ignore cleanup error
    }
  }
}
