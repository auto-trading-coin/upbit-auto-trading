"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/components/AuthProvider"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { LoginModal } from "@/components/LoginModal"
import { AlertCircle } from "lucide-react"

interface AuthGuardProps {
  children: React.ReactNode
  /** 비로그인 시 표시할 커스텀 fallback (선택) */
  fallback?: React.ReactNode
  /** 자동으로 로그인 모달 표시 여부 (기본: false) */
  showModal?: boolean
}

/**
 * 로그인 여부를 체크하는 Guard 컴포넌트
 * 
 * @example
 * // 기본 사용
 * <AuthGuard>
 *   <ProtectedContent />
 * </AuthGuard>
 * 
 * @example
 * // 자동으로 로그인 모달 표시
 * <AuthGuard showModal>
 *   <ProtectedContent />
 * </AuthGuard>
 * 
 * @example
 * // 커스텀 fallback 사용
 * <AuthGuard fallback={<CustomLoginPrompt />}>
 *   <ProtectedContent />
 * </AuthGuard>
 */
export function AuthGuard({ children, fallback, showModal = false }: AuthGuardProps) {
  const { isAuthenticated, isLoading } = useAuth()
  const [showLoginModal, setShowLoginModal] = useState(false)

  // showModal이 true이고 비로그인 상태면 자동으로 모달 표시
  useEffect(() => {
    if (!isLoading && !isAuthenticated && showModal) {
      setShowLoginModal(true)
    }
  }, [isLoading, isAuthenticated, showModal])

  // 로딩 중
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    )
  }

  // 비로그인 상태
  if (!isAuthenticated) {
    // 커스텀 fallback이 있으면 사용
    if (fallback) {
      return <>{fallback}</>
    }

    // 기본 로그인 안내 메시지
    return (
      <>
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>로그인이 필요합니다</AlertTitle>
          <AlertDescription>
            이 페이지를 이용하기 위해 로그인해주세요.
            <Button 
              variant="link" 
              className="p-0 h-auto ml-2" 
              onClick={() => setShowLoginModal(true)}
            >
              로그인하기
            </Button>
          </AlertDescription>
        </Alert>
        <LoginModal open={showLoginModal} onOpenChange={setShowLoginModal} />
      </>
    )
  }

  // 로그인 완료 - children 렌더링
  return <>{children}</>
}
