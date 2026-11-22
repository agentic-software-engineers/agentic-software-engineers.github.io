import { llms, loader } from "fumadocs-core/source"
import { defineDocs } from "fumadocs-mdx/macro"
import { metaSchema, pageSchema } from "fumadocs-core/source/schema"

import { siteUrl } from "@/lib/docs"

// the docs home lives here, each product's docs are copied in by scripts/products.mjs
const docs = defineDocs({
  dir: "content/docs",
  docs: {
    schema: pageSchema,
    postprocess: {
      includeProcessedMarkdown: true,
    },
  },
  meta: {
    schema: metaSchema,
  },
})

export const source = loader({
  baseUrl: "/docs",
  source: docs.toFumadocsSource(),
})

export const docsLlms = llms(source, {
  renderPage: async (page) => `# ${page.data.title} (${siteUrl}${page.url})

${await page.data.getText("processed")}`,
  // link to the files under /llms.mdx, with the full address so agents can follow them
  renderUrl: (item) =>
    /^\/.*\.(md|txt)$/.test(item.url) ? `${siteUrl}/llms.mdx${item.url}` : `${siteUrl}${item.url}`,
})
