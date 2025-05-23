import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { AuthProvider } from "@/components/auth-provider"
import { ApiProvider } from "@/lib/api-context"
import { Toaster } from "@/components/ui/toaster"
import Navbar from "@/components/navbar"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "업비트 자동매매 시스템",
  description: "업비트 API를 활용한 자동매매 시스템",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
          <AuthProvider>
            <ApiProvider>
              <div className="flex min-h-screen flex-col">
                <Navbar />
                <main className="flex-1 container mx-auto py-6 px-4">{children}</main>
                <footer className="border-t py-4 text-center text-sm text-muted-foreground">
                  © {new Date().getFullYear()} 업비트 자동매매 시스템
                </footer>
              </div>
              <Toaster />
            </ApiProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
