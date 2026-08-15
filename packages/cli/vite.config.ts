import { defineConfig } from "vite-plus"

export default defineConfig({
  run: {
    tasks: {
      check: {
        command: "pnpm audit --audit-level=moderate"
      }
    }
  }
})
