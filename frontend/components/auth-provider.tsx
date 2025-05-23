"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { useRouter } from "next/navigation"
import { useToast } from "@/components/ui/use-toast"

// 타입 정의
interface User {
  id: string
  email: string
  name: string
  profileImage?: string
}

type AuthContextType = {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<boolean>
  logout: () => void
}

// 기본값 생성
const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: true,
  isAuthenticated: false,
  login: async () => false,
  logout: () => {},
})

// 컨텍스트 훅
export const useAuth = () => useContext(AuthContext)

interface AuthProviderProps {
  children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const router = useRouter()
  const { toast } = useToast()

  // 로그인 상태 확인
  useEffect(() => {
    const checkAuthStatus = () => {
      setIsLoading(true)
      try {
        // 로컬 스토리지에서 토큰 확인
        const token = localStorage.getItem("auth_token")

        if (token) {
          // 토큰이 있으면 사용자 정보 가져오기
          const storedUser = localStorage.getItem("user_data")

          if (storedUser) {
            setUser(JSON.parse(storedUser))
          } else {
            // 토큰은 있지만 사용자 정보가 없는 경우 더미 데이터 사용
            const dummyUser = {
              id: "user123",
              name: "홍길동",
              email: "user@example.com",
              profileImage: "/placeholder.svg?height=40&width=40",
            }
            setUser(dummyUser)
            localStorage.setItem("user_data", JSON.stringify(dummyUser))
          }
        } else {
          setUser(null)
        }
      } catch (error) {
        console.error("Failed to check auth status:", error)
        // 오류 발생 시 로그아웃 처리
        localStorage.removeItem("auth_token")
        localStorage.removeItem("user_data")
        setUser(null)
      } finally {
        setIsLoading(false)
      }
    }

    checkAuthStatus()

    // 페이지 포커스 시 인증 상태 확인 (탭 전환 후 돌아왔을 때)
    const handleFocus = () => {
      checkAuthStatus()
    }

    window.addEventListener("focus", handleFocus)

    return () => {
      window.removeEventListener("focus", handleFocus)
    }
  }, [])

  // 로그인 함수
  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      // 실제 구현에서는 API 호출로 인증
      // 여기서는 더미 데이터 사용
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // 더미 토큰 생성
      const dummyToken = "dummy_jwt_token_" + Date.now()
      localStorage.setItem("auth_token", dummyToken)

      // 더미 사용자 정보
      const dummyUser = {
        id: "user123",
        name: "홍길동",
        email: email || "user@example.com",
        profileImage: "/placeholder.svg?height=40&width=40",
      }

      // 사용자 정보 저장
      localStorage.setItem("user_data", JSON.stringify(dummyUser))
      setUser(dummyUser)

      toast({
        title: "로그인 성공!",
        description: "환영합니다.",
        duration: 3000,
      })

      return true
    } catch (error) {
      console.error("Login failed:", error)
      toast({
        variant: "destructive",
        title: "로그인 실패",
        description: "다시 시도해주세요.",
        duration: 3000,
      })
      return false
    }
  }

  // 로그아웃 함수
  const logout = () => {
    localStorage.removeItem("auth_token")
    localStorage.removeItem("user_data")
    setUser(null)
    router.push("/")
    toast({
      title: "로그아웃 되었습니다.",
      duration: 3000,
    })
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}
