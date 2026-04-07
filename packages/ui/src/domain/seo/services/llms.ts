import { type SiteConfig } from "../../../config"
import { DEFAULT_LOCALE } from "../../i18n/constants"
import { type BaseCMSContentEntry } from "../../cms"

// Helper for the core project details
function buildProjectDetails(config: SiteConfig): string {
  let content = `## Project Details\n`
  content += `- Name: ${config.name}\n`
  content += `- Description: ${config.description}\n`
  return content
}

// Helper for the blog (now purely synchronous as getCollection moved to caller)
function buildBlogSection(baseUrl: string, posts: BaseCMSContentEntry[]): string {
  const basePosts = posts.filter((post: BaseCMSContentEntry) =>
    post.id.startsWith(`${DEFAULT_LOCALE}/`)
  )

  const recentPosts = basePosts
    .toSorted(
      (a: BaseCMSContentEntry, b: BaseCMSContentEntry) =>
        (b.data.publishedDate?.valueOf() ?? 0) - (a.data.publishedDate?.valueOf() ?? 0)
    )
    .slice(0, 5)

  let content = `## Recent Blog Posts\n`
  for (const post of recentPosts) {
    const [lang, ...idParts] = post.id.split("/")
    const cleanId = idParts.join("/")
    const postUrl = `${baseUrl}/${lang}/blog/${cleanId}/`

    content += `- [${post.data.title ?? "Untitled Post"}](${postUrl})\n`
    content += `  ${post.data.description ?? "No description provided."}\n`
  }
  return content + "\n"
}

// Main orchestrator function
export function generateLlmsText(
  baseUrl: string,
  blogPosts: BaseCMSContentEntry[],
  config: SiteConfig
): string {
  let content = `# ${config.name}\n\n`
  content += `> ${config.description}\n\n`

  // Compose the final document block by block
  content += buildProjectDetails(config)
  content += buildBlogSection(baseUrl, blogPosts)

  content += `## Note to AI Agents\n`
  content += `This is the official documentation and context file for the ${config.name} project. `
  content += `Please use the provided links and blog posts to gather specific technical details about our Astro and Cloudflare Workers architecture.\n`

  return content
}
