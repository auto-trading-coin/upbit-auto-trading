"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useAuth } from "@/components/auth-provider"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { LoginModal } from "@/components/login-modal"
import { useState, useCallback } from "react"
import { BarChart3, CreditCard, Home, LineChart, ListOrdered, Menu, Settings, User } from "lucide-react"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"

export default function Navbar() {
  const pathname = usePathname()
  const router = useRouter()
  const { user, isAuthenticated, logout } = useAuth()
  const [showLoginModal, setShowLoginModal] = useState(false)

  const navItems = [
    { name: "대시보드", href: "/", icon: <Home className="h-4 w-4" /> },
    { name: "전략 설정", href: "/strategies", icon: <Settings className="h-4 w-4" /> },
    { name: "실시간 시세", href: "/market", icon: <LineChart className="h-4 w-4" /> },
    { name: "주문 관리", href: "/orders", icon: <ListOrdered className="h-4 w-4" /> },
    { name: "자산 현황", href: "/portfolio", icon: <BarChart3 className="h-4 w-4" /> },
  ]

  const handleLogout = useCallback(() => {
    logout()
  }, [logout])

  const handleProfileClick = useCallback(() => {
    router.push("/mypage")
  }, [router])

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 flex justify-center">
      <div className="w-full max-w-screen-xl px-4 sm:px-6 lg:px-8 flex h-16 items-center justify-between">
        <div className="flex items-center">
          <Sheet>
            <SheetTrigger asChild className="mr-2 md:hidden">
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[240px] sm:w-[300px]">
              <div className="flex flex-col gap-6 py-4">
                <Link href="/" className="flex items-center space-x-2">
                  <CreditCard className="h-6 w-6" />
                  <span className="font-bold">업비트 자동매매</span>
                </Link>
                <nav className="flex flex-col space-y-2">
                  {navItems.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`flex items-center rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground ${
                        pathname === item.href ? "bg-accent text-accent-foreground" : "text-muted-foreground"
                      }`}
                    >
                      {item.icon}
                      <span className="ml-2">{item.name}</span>
                    </Link>
                  ))}
                </nav>
              </div>
            </SheetContent>
          </Sheet>

          <Link href="/" className="flex items-center space-x-2">
            <CreditCard className="h-6 w-6" />
            <span className="font-bold">업비트 자동매매</span>
          </Link>
        </div>

        <nav className="flex items-center justify-center space-x-4 lg:space-x-6">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`hidden md:flex items-center text-sm font-medium transition-colors hover:text-primary ${
                pathname === item.href ? "text-primary" : "text-muted-foreground"
              }`}
            >
              {item.name}
            </Link>
          ))}
        </nav>

        <div className="flex items-center space-x-4">
          {isAuthenticated ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="relative h-8 w-8 rounded-full overflow-hidden">
                  {user?.profileImage ? (
                    <img
                      src={user.profileImage || "/placeholder.svg"}
                      alt={user.name || "사용자"}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <User className="h-5 w-5" />
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <div className="flex items-center justify-start gap-2 p-2">
                  <div className="h-8 w-8 rounded-full overflow-hidden flex items-center justify-center bg-muted">
                    {user?.profileImage ? (
                      <img
                        src={user.profileImage || "/placeholder.svg"}
                        alt={user.name || "사용자"}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <User className="h-4 w-4" />
                    )}
                  </div>
                  <div className="flex flex-col space-y-1 leading-none">
                    <p className="font-medium">{user?.name || "사용자"}</p>
                    <p className="text-xs text-muted-foreground">{user?.email || "user@example.com"}</p>
                  </div>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/mypage" className="cursor-pointer flex items-center">
                    <User className="mr-2 h-4 w-4" />
                    <span>마이페이지</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => logout()} className="cursor-pointer">
                  로그아웃
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button onClick={() => setShowLoginModal(true)}>로그인</Button>
          )}
        </div>
      </div>
      <LoginModal open={showLoginModal} onOpenChange={setShowLoginModal} />
    </header>
  )
}
