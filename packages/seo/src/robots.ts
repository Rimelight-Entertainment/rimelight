import type { RobotsOptions, UserAgentRule } from "./types";

/**
 * Build robots.txt content from options
 */
export function buildRobotsTxt(options: RobotsOptions): string {
  const lines: string[] = [];

  // Add user-agent specific rules first
  if (options.userAgentRules && options.userAgentRules.length > 0) {
    for (const rule of options.userAgentRules) {
      lines.push(buildUserAgentSection(rule));
      lines.push("");
    }
  }

  // Add wildcard user-agent (all bots)
  lines.push("User-agent: *");

  if (options.disallow && options.disallow.length > 0) {
    for (const path of options.disallow) {
      lines.push(`Disallow: ${path}`);
    }
  }

  if (options.allow && options.allow.length > 0) {
    for (const path of options.allow) {
      lines.push(`Allow: ${path}`);
    }
  }

  lines.push("");
  lines.push(`Sitemap: ${options.sitemapUrl}`);

  return lines.join("\n");
}

/**
 * Build a user-agent specific section
 */
function buildUserAgentSection(rule: UserAgentRule): string {
  const lines: string[] = [];

  lines.push(`User-agent: ${rule.userAgent}`);

  if (rule.disallow && rule.disallow.length > 0) {
    for (const path of rule.disallow) {
      lines.push(`Disallow: ${path}`);
    }
  }

  if (rule.allow && rule.allow.length > 0) {
    for (const path of rule.allow) {
      lines.push(`Allow: ${path}`);
    }
  }

  return lines.join("\n");
}
