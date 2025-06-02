import type React from "react"
import "./globals.css"
import { Inter } from "next/font/google"
import { ThemeProvider } from "@/components/theme-provider"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"

const inter = Inter({ subsets: ["latin"] })

export const metadata = {
  title: "Interzept",
  description:
    "Mock, modify, and override API calls with ease. The ultimate browser extension for developer to intercept requests and responses, simulate APIs, and debug your applications efficiently.",
  icons: {
    icon: "/icons/icon16.png",
    shortcut: "/icons/icon16.png",
    apple: "/icons/icon128.png",
  },
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" type="image/png" sizes="16x16" href="/icons/icon16.png" />
        <link rel="icon" type="image/png" sizes="48x48" href="/icons/icon48.png" />
        <link rel="icon" type="image/png" sizes="128x128" href="/icons/icon128.png" />
      </head>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <SidebarProvider>
            <AppSidebar />
            <SidebarInset>
              {children}
            </SidebarInset>
          </SidebarProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
