import { Card, Cards } from "fumadocs-ui/components/card"

import { source } from "@/lib/source"

// one card per product, named and described by its docs, linked to its first page
export function Products() {
  return (
    <Cards>
      {source.getPageTree().children.flatMap((node) => {
        if (node.type !== "folder" || !node.root) return []
        const page = node.index ?? node.children.find((child) => child.type === "page")
        return page
          ? [
              <Card key={page.url} title={node.name} href={page.url}>
                {node.description}
              </Card>,
            ]
          : []
      })}
    </Cards>
  )
}
