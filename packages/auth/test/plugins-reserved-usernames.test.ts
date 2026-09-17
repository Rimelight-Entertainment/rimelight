import { describe, it, expect } from "vitest"
import {
  normalizeUsername,
  createRestrictedUsernameSet,
  RESTRICTED_SET,
  STANDARD_RESTRICTED_GROUPS
} from "../src/plugins/reserved-usernames/index"

describe("@rimelight/auth reserved-usernames plugin", () => {
  describe("normalizeUsername", () => {
    it("should normalize basic uppercase and lowercase", () => {
      expect(normalizeUsername("Admin")).toBe("admin")
      expect(normalizeUsername("MODERATOR")).toBe("moderator")
    })

    it("should resolve leetspeak and homoglyphs", () => {
      expect(normalizeUsername("4dm1n")).toBe("admin")
      expect(normalizeUsername("@dm!n")).toBe("admin")
      expect(normalizeUsername("5upp0rt")).toBe("support")
      expect(normalizeUsername("r00t")).toBe("root")
      expect(normalizeUsername("b0t")).toBe("bot")
      expect(normalizeUsername("s3cur!ty")).toBe("security")
      expect(normalizeUsername("u$er")).toBe("user")
    })

    it("should strip non-alphanumeric punctuation and special characters", () => {
      expect(normalizeUsername("admin_user-888!")).toBe("adminuserbbbi")
      expect(normalizeUsername("  root . ")).toBe("root")
    })
  })

  describe("createRestrictedUsernameSet & RESTRICTED_SET", () => {
    it("should block standard staff roles", () => {
      expect(RESTRICTED_SET.has("admin")).toBe(true)
      expect(RESTRICTED_SET.has("root")).toBe(true)
      expect(RESTRICTED_SET.has("moderator")).toBe(true)
      expect(RESTRICTED_SET.has("bot")).toBe(true)
      expect(RESTRICTED_SET.has("system")).toBe(true)
    })

    it("should block technical and routing keywords", () => {
      expect(RESTRICTED_SET.has("api")).toBe(true)
      expect(RESTRICTED_SET.has("auth")).toBe(true)
      expect(RESTRICTED_SET.has("settings")).toBe(true)
      expect(RESTRICTED_SET.has("static")).toBe(true)
      expect(RESTRICTED_SET.has("login")).toBe(true)
    })

    it("should block legal and financial keywords", () => {
      expect(RESTRICTED_SET.has("billing")).toBe(true)
      expect(RESTRICTED_SET.has("checkout")).toBe(true)
      expect(RESTRICTED_SET.has("compliance")).toBe(true)
      expect(RESTRICTED_SET.has("privacy")).toBe(true)
    })

    it("should support custom blacklist entries", () => {
      const customSet = createRestrictedUsernameSet(["custom-ceo", "vip-club"])
      expect(customSet.has("customceo")).toBe(true)
      expect(customSet.has("vipclub")).toBe(true)
      expect(customSet.has("admin")).toBe(true)
    })

    it("should recognize homoglyphs against restricted set", () => {
      const isRestricted = (username: string) => RESTRICTED_SET.has(normalizeUsername(username))
      expect(isRestricted("4dm1n")).toBe(true)
      expect(isRestricted("@dmin")).toBe(true)
      expect(isRestricted("m0d3rat0r")).toBe(true)
      expect(isRestricted("st4ff")).toBe(true)
      expect(isRestricted("validuser99")).toBe(false)
    })
  })
})
