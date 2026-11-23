export const siteUrl = "https://agentic-software-engineers.com"

/** the .md file of a docs page under /llms.mdx */
export function markdownUrl(url: string) {
  return `/llms.mdx${url.replace(/\/$/, "")}.md`
}
