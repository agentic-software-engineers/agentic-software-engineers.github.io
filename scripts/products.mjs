// Brings each product's docs into content/docs/<repo>: takes the checkout in .products/<repo>
// (CI places one there), or clones the product's main branch, runs its generator, then copies
// its docs/content.
import { execFileSync } from "node:child_process"
import { cpSync, existsSync, rmSync } from "node:fs"

const org = "agentic-software-engineers"
const products = ["devcontainer-features", "o3s"]

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
}
