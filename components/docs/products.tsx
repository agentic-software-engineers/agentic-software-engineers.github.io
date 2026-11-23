import { Card, Cards } from "fumadocs-ui/components/card"

import { source } from "@/lib/source"

// one card per product, named and described by its docs
export function Products() {
  return (
    <Cards>
      {source.getPageTree().children.flatMap((node) =>
        node.type === "folder" && node.root && node.index
          ? [
              <Card key={node.index.url} title={node.name} href={node.index.url}>
                {node.description}
              </Card>,
            ]
          : [],
      )}
    </Cards>
  )
}
