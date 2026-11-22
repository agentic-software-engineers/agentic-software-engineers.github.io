import { site } from "@/lib/site"

export function SiteFooter() {
  return (
    <footer className="border-t">
      <div className="mx-auto max-w-[1200px] px-6 py-8 text-center text-sm text-muted-foreground sm:text-left">
        <p>
          © {new Date().getFullYear()} {site.name}
        </p>
      </div>
    </footer>
  )
}
