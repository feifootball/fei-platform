import type { Metadata } from "next"
import "./globals.css"

export const metadata: Metadata = {
  title: "FEI - Football English Intelligence",
  description: "Communication Creates Opportunity",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        {children}
        </body>
    </html>
  )
}
