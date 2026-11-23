import { DocsLayout } from "fumadocs-ui/layouts/docs"
import { RootProvider } from "fumadocs-ui/provider/next"

import { DocsSearch } from "@/components/docs/search"
import { baseOptions } from "@/lib/layout.shared"
import { source } from "@/lib/source"

// the docs: Fumadocs' layout with a product switcher, the landing page keeps its own
export default function Layout({ children }: LayoutProps<"/docs">) {
  return (
    <RootProvider search={{ SearchDialog: DocsSearch }} theme={{ enabled: false }}>
      <DocsLayout tree={source.getPageTree()} {...baseOptions()}>
        {children}
      </DocsLayout>
    </RootProvider>
  )
}
