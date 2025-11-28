'use client'

import type React from "react"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/ThemeProvider"
import { AuthProvider } from "@/components/AuthProvider"
import { WebSocketProvider } from "@/components/WebSocketProvider"
import { Toaster } from "@/components/ui/toaster"
import Navbar from "@/components/Navbar"
import { QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { queryClient } from '@/lib/queryClient'

const inter = Inter({ subsets: ["latin"] })

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <body className={inter.className}>
        <QueryClientProvider client={queryClient}>
          <WebSocketProvider>
            <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
              <AuthProvider>
                <div className="flex min-h-screen flex-col">
                  <Navbar />
                  <main className="flex-1 container mx-auto py-6 px-4">{children}</main>
                  <footer className="border-t py-4 text-center text-sm text-muted-foreground">
                    © {new Date().getFullYear()} 업비트 자동매매 시스템
                  </footer>
                </div>
                <Toaster />
              </AuthProvider>
            </ThemeProvider>
          </WebSocketProvider>
          
          {/* 개발 환경에서만 React Query DevTools 표시 */}
          {process.env.NODE_ENV === 'development' && (
            <ReactQueryDevtools initialIsOpen={false} />
          )}
        </QueryClientProvider>
      </body>
    </html>
  )
}
