'use client'

import { createContext, useContext, useState, useEffect, type ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import { useToast } from '@/components/ui/use-toast'
import { getMyInfo } from '@/app/api/member'
import { reissueAccessToken, logoutApi } from '@/app/api/token'
import { setAccessToken, removeAccessToken, getAccessToken } from '@/lib/utils/token'
import type { User } from '@/types'

type AuthContextType = {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
  login: () => void
  logout: () => void
  refreshUser: () => Promise<void>
}

// 기본값 설정
const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: true,
  isAuthenticated: false,
  login: () => {},
  logout: () => {},
  refreshUser: async () => {},
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

  // 사용자 정보 조회 (재사용 가능한 함수)
  const fetchUserInfo = async (): Promise<void> => {
    try {
      const userInfo = await getMyInfo()
      setUser({
        id: userInfo.email,
        email: userInfo.email,
        name: userInfo.nickname,
        tradeActive: userInfo.tradeActive,
        strategyRegistered: userInfo.strategyRegistered,
        apiKeyRegistered: userInfo.apiKeyRegistered,
      })
    } catch (error) {
      setUser(null)
      removeAccessToken()
      throw error
    }
  }

  // 사용자 정보 새로고침 (외부에서 호출 가능)
  const refreshUser = async (): Promise<void> => {
    try {
      await fetchUserInfo()
    } catch (error) {
      console.error('Failed to refresh user info:', error)
    }
  }

  // 로그인 상태 확인
  useEffect(() => {
    let isMounted = true

    const checkAuthStatus = async () => {
      setIsLoading(true)
      try {
        const accessToken = getAccessToken()
        
        if (accessToken) {
          // accessToken이 있으면 바로 /member/me로 유저 정보 조회
          if (isMounted) {
            await fetchUserInfo()
          }
        } else {
          // accessToken이 없으면 /token으로 발급 후 /member/me 조회
          const newAccessToken = await reissueAccessToken()
          if (isMounted && newAccessToken) {
            await fetchUserInfo()
          }
        }
      } catch (error) {
        if (isMounted) {
          setUser(null)
          removeAccessToken()
        }
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    checkAuthStatus()

    // 탭 포커스 시 사용자 정보 재확인
    const handleFocus = () => {
      if (!isLoading) {
        checkAuthStatus()
      }
    }

    window.addEventListener('focus', handleFocus)

    return () => {
      isMounted = false
      window.removeEventListener('focus', handleFocus)
    }
  }, [])

  // 카카오 로그인 함수
  const login = () => {
    const backendUrl = process.env.NEXT_PUBLIC_API_BASE_URL
    window.location.href = `${backendUrl}/oauth2/authorization/kakao`
  }

  // 로그아웃 함수
  const logout = async () => {
    try {
      await logoutApi()
    } catch (e) {
      // 로그아웃 API 실패해도 로컬 상태는 정리
      console.error('Logout API failed:', e)
    }
    
    removeAccessToken()
    localStorage.removeItem('refresh_token')
    setUser(null)

    toast({
      title: '로그아웃',
      description: '안전하게 로그아웃되었습니다.',
      duration: 3000,
    })
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}
