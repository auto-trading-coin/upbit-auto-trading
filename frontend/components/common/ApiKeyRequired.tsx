"use client"

import { useRouter } from "next/navigation"
import { useApi } from "@/lib/ApiContext"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Key } from "lucide-react"

interface ApiKeyRequiredProps {
  children: React.ReactNode
  fallback?: React.ReactNode
  title?: string
  description?: string
  showRegisterButton?: boolean
}

/**
 * API 키 체크 컴포넌트
 * 
 * API 키가 등록되어 있으면 children을 렌더링하고,
 * 등록되어 있지 않으면 API 키 등록 안내 메시지 또는 커스텀 fallback을 표시합니다.
 * 
 * @example
 * ```tsx
 * <ApiKeyRequired>
 *   <TradingContent />
 * </ApiKeyRequired>
 * ```
 * 
 * @example 커스텀 메시지
 * ```tsx
 * <ApiKeyRequired 
 *   title="전략 설정을 위한 API 키가 필요합니다"
 *   description="전략을 선택하고 실행하려면 먼저 업비트 API 키를 등록해주세요."
 * >
 *   <StrategyContent />
 * </ApiKeyRequired>
 * ```
 */
export function ApiKeyRequired({
  children,
  fallback,
  title = "업비트 API 키 등록이 필요합니다",
  description = "이 기능을 이용하기 위해서는 업비트 API 키가 필요합니다.",
  showRegisterButton = true,
}: ApiKeyRequiredProps) {
  const { apiKeyState } = useApi()
  const router = useRouter()

  // API 키가 등록되어 있으면 children 렌더링
  if (apiKeyState.hasApiKey) {
    return <>{children}</>
  }

  // 커스텀 fallback이 있으면 렌더링
  if (fallback) {
    return <>{fallback}</>
  }

  // 기본 API 키 등록 안내 메시지
  return (
    <Card className="border-amber-300 bg-amber-50">
      <CardHeader>
        <CardTitle className="flex items-center text-amber-800">
          <Key className="h-5 w-5 mr-2" />
          {title}
        </CardTitle>
        <CardDescription className="text-amber-700">{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col space-y-4">
          <p className="text-sm text-amber-700">
            API 키를 등록하면 다음 기능을 이용할 수 있습니다:
          </p>
          <ul className="list-disc list-inside text-sm text-amber-700 space-y-1">
            <li>자동매매 실행 및 제어</li>
            <li>실시간 포지션 확인</li>
            <li>주문 내역 및 시그널 로그 확인</li>
            <li>자산 현황 및 수익률 분석</li>
          </ul>
          {showRegisterButton && (
            <Button onClick={() => router.push("/mypage")} className="w-full sm:w-auto">
              <Key className="mr-2 h-4 w-4" />
              API 키 등록하기
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
