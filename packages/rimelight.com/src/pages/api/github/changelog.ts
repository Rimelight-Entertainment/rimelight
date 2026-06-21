import type { APIRoute } from "astro"

export const GET: APIRoute = async ({ request }) => {
  const url = new URL(request.url)
  const component = url.searchParams.get("component")
  if (!component) {
    return new Response(JSON.stringify({ error: "Component name is required" }), { status: 400 })
  }

  // Convert kebab-case component name to PascalCase (e.g. chat-message -> ChatMessage)
  const pascalName = component
    .split("-")
    .map((seg) => seg.charAt(0).toUpperCase() + seg.slice(1))
    .join("")

  const token = import.meta.env.GITHUB_TOKEN || process.env.GITHUB_TOKEN
  const headers: Record<string, string> = {
    "User-Agent": "Rimelight-Docs-Changelog",
    "Accept": "application/vnd.github.v3+json"
  }
  if (token) {
    headers["Authorization"] = `Bearer ${token}`
  }

  const paths = [
    `packages/ui/src/components/vue/RLV${pascalName}.vue`,
    `packages/ui/src/components/astro/RLA${pascalName}.astro`,
    `packages/ui/src/themes/${component}.theme.ts`
  ]

  try {
    // 1. Fetch commits for all relevant paths
    const allCommitsPromises = paths.map(async (p) => {
      const apiUrl = `https://api.github.com/repos/Rimelight-Entertainment/rimelight/commits?path=${encodeURIComponent(p)}&per_page=50`
      const res = await fetch(apiUrl, { headers })
      if (!res.ok) return []
      const data = await res.json()
      if (!Array.isArray(data)) return []
      return data.map((c: any) => ({
        sha: c.sha,
        date: c.commit.author?.date || c.commit.committer?.date || "",
        message: c.commit.message.split("\n")[0] || ""
      }))
    })

    const commitsLists = await Promise.all(allCommitsPromises)
    const uniqueCommits = new Map<string, { sha: string; date: string; message: string }>()
    for (const list of commitsLists) {
      for (const commit of list) {
        if (!uniqueCommits.has(commit.sha)) {
          uniqueCommits.set(commit.sha, commit)
        }
      }
    }
    const commits = Array.from(uniqueCommits.values()).toSorted(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    )

    if (commits.length === 0) {
      return new Response(JSON.stringify([]), {
        headers: { "Content-Type": "application/json" }
      })
    }

    // 2. Fetch releases to group commits
    const releasesRes = await fetch(
      "https://api.github.com/repos/Rimelight-Entertainment/rimelight/releases?per_page=50",
      { headers }
    )
    let releases = []
    if (releasesRes.ok) {
      const data = await releasesRes.json()
      if (Array.isArray(data)) {
        releases = data.filter((r: any) => r.published_at)
      }
    }

    // 3. Group commits by release
    const sortedReleases = [...releases].toSorted(
      (a: any, b: any) => new Date(b.published_at).getTime() - new Date(a.published_at).getTime()
    )
    const releasesOldestFirst = [...sortedReleases].toReversed()

    const groups: any[] = []
    const unreleased: any[] = []

    for (const commit of commits) {
      const commitTime = new Date(commit.date).getTime()
      // Find the first release published after this commit
      const release = releasesOldestFirst.find(
        (r: any) => new Date(r.published_at).getTime() >= commitTime
      )

      if (release) {
        let group = groups.find((g) => g.tag === release.tag_name)
        if (!group) {
          group = {
            tag: release.tag_name,
            title: release.name || release.tag_name,
            published_at: release.published_at,
            url: release.html_url,
            commits: []
          }
          groups.push(group)
        }
        group.commits.push(commit)
      } else {
        unreleased.push(commit)
      }
    }

    const result: any[] = []
    if (unreleased.length > 0) {
      result.push({
        tag: "unreleased",
        title: "Soon",
        commits: unreleased
      })
    }

    // Sort groups in reverse chronological order (newest release first)
    groups.sort((a, b) => new Date(b.published_at).getTime() - new Date(a.published_at).getTime())
    result.push(...groups)

    return new Response(JSON.stringify(result), {
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "public, max-age=3600, s-maxage=3600, stale-while-revalidate=600"
      }
    })
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    })
  }
}
