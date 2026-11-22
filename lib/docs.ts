export const org = "agentic-software-engineers"
export const siteUrl = "https://agentic-software-engineers.com"

/** the .md file of a docs page under /llms.mdx */
export function markdownUrl(url: string) {
  return `/llms.mdx${url.replace(/\/$/, "")}.md`
}

/** the file a docs page comes from: a product's docs/content, or this repo's content/docs */
export function sourceUrl(path: string) {
  const [first, ...rest] = path.split("/")
  if (rest.length > 0 && first !== "index.mdx" && first !== "meta.json") {
    return `https://github.com/${org}/${first}/blob/main/docs/content/${rest.join("/")}`
  }
  return `https://github.com/${org}/${org}.github.io/blob/main/content/docs/${path}`
}
