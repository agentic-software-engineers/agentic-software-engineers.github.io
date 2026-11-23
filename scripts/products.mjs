// Brings each product's docs into content/docs/<repo>: takes the checkout in .products/<repo>
// (CI places one there), or clones the product's main branch, runs its generator, copies
// its docs/content, then sets its description from GitHub.
import { execFileSync } from "node:child_process"
import { cpSync, existsSync, readFileSync, rmSync, writeFileSync } from "node:fs"

const org = "agentic-software-engineers"
const products = ["devcontainer-features", "o3s"]

// descriptions come from each repository on GitHub
async function description(repo) {
  const token = process.env.GITHUB_TOKEN
  const res = await fetch(`https://api.github.com/repos/${org}/${repo}`, {
    headers: { Accept: "application/vnd.github+json", ...(token ? { Authorization: `Bearer ${token}` } : {}) },
  })
  if (!res.ok) throw new Error(`GitHub API ${res.status} for ${org}/${repo}`)
  const data = await res.json()
  return data.description ?? ""
}

for (const repo of products) {
  const checkout = `.products/${repo}`
  const target = `content/docs/${repo}`

  // take the checkout CI placed, or the product's main branch
  if (!existsSync(checkout)) {
    execFileSync("git", ["clone", "--depth", "1", `https://github.com/${org}/${repo}.git`, checkout], { stdio: "inherit" })
  }

  rmSync(target, { recursive: true, force: true })
  // a product without docs yet leaves its section out
  if (!existsSync(`${checkout}/docs/content`)) {
    console.log(`${repo}: no docs/content yet, leaving it out`)
    continue
  }

  // a product can generate pages from its own sources before they are copied
  if (existsSync(`${checkout}/docs/generate.ts`)) {
    execFileSync(process.execPath, ["docs/generate.ts"], { cwd: checkout, stdio: "inherit" })
  }

  cpSync(`${checkout}/docs/content`, target, { recursive: true })
  console.log(`${repo}: docs copied to ${target}`)

  // the switcher and the overview page show the repository description
  const text = await description(repo)
  const meta = JSON.parse(readFileSync(`${target}/meta.json`, "utf8"))
  writeFileSync(`${target}/meta.json`, JSON.stringify({ ...meta, description: text }, null, 2))
  const index = readFileSync(`${target}/index.mdx`, "utf8").replace(/^description:.*\n/m, "")
  writeFileSync(`${target}/index.mdx`, index.replace(/^---\n/, `---\ndescription: ${JSON.stringify(text)}\n`))
}
