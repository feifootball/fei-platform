import type { Metadata } from "next"
import "./globals.css"

export const metadata: Metadata = {
  metadataBase: new URL("https://www.feifootball.com"),
  title: "Football English Intelligence",
  description:
    "Football-specific English training for global football professionals.",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Football English Intelligence",
    description:
      "Football-specific English training for global football professionals.",
    url: "https://www.feifootball.com/",
    siteName: "Football English Intelligence",
    type: "website",
  },
  icons: {
    icon: [{ url: "/favicon.svg", type: "image/svg+xml" }],
    apple: [{ url: "/apple-icon.svg", type: "image/svg+xml" }],
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebSite",
              name: "Football English Intelligence",
              alternateName: "FEI",
              url: "https://www.feifootball.com/",
            }),
          }}
        />
        {children}
      </body>
    </html>
  )
}
