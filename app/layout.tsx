import type { Metadata } from "next"
import { GeistSans } from "geist/font/sans"

import "./globals.css"

export const metadata: Metadata = {
  metadataBase: new URL("https://agentic-software-engineers.com"),
  title: "Agentic Software Engineers",
  description:
    "Fail fast. Fix faster. Ship fastest. Secure. Open-source tools for engineering with AI agents, locked down by default.",
  openGraph: {
    type: "website",
    siteName: "Agentic Software Engineers",
    url: "/",
    title: "Agentic Software Engineers",
    description: "Fail fast. Fix faster. Ship fastest. Secure.",
    images: [{ url: "/og-image.png", width: 1200, height: 630 }],
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      className={`dark ${GeistSans.variable} font-sans antialiased`}
      // the docs switch the theme class on this element
      suppressHydrationWarning
    >
      <body>{children}</body>
    </html>
  )
}
