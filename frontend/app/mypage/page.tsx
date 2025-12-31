"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Key, ShieldAlert, ShieldCheck, Copy, Check } from "lucide-react"
import { AuthGuard } from "@/components/common"
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { useUser } from "@/hooks/queries/useUser"
import { useTradingStatus } from "@/hooks/queries/useTradingStatus"
import { useRegisterApiKey } from "@/hooks/mutations/useRegisterApiKey"
import { useDeleteApiKey } from "@/hooks/mutations/useDeleteApiKey"
import { useToast } from "@/components/ui/use-toast"

export default function MyPage() {
  // React Query hooks
  const { data: user } = useUser()
  const { data: tradingStatus } = useTradingStatus()
  const registerMutation = useRegisterApiKey()
  const deleteMutation = useDeleteApiKey()
  const { toast } = useToast()

  const [accessKey, setAccessKey] = useState("")
  const [secretKey, setSecretKey] = useState("")
  const router = useRouter()

  const handleRegisterApiKey = async () => {
    if (!accessKey || !secretKey) {
      return
    }

    registerMutation.mutate(
      { accessKey, secretKey },
      {
        onSuccess: () => {
          // 폼 초기화
          setAccessKey("")
          setSecretKey("")
        },
      }
    )
  }

  const handleDeleteApiKey = async () => {
    deleteMutation.mutate()
  }



  const handleCopyIp = async () => {
    try {
      await navigator.clipboard.writeText("138.2.121.218")
      toast({
        title: "IP 주소가 복사되었습니다",
        description: "138.2.121.218",
        duration: 2000,
      })
    } catch (err) {
      toast({
        variant: "destructive",
        title: "복사 실패",
        description: "직접 선택하여 복사해주세요.",
      })
    }
  }

  // API 키 등록/삭제 진행 중 상태
  const isSubmitting = registerMutation.isPending || deleteMutation.isPending

  return (
    <AuthGuard>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight">내 계정</h1>
          <Button variant="outline" onClick={() => router.push("/")}>
            대시보드로 돌아가기
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>업비트 API 키 관리</CardTitle>
            <CardDescription>자동매매를 위한 업비트 API 키를 등록하거나 관리합니다.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {user?.apiKeyRegistered ? (
              <div className="space-y-4">
                <Alert className="bg-green-50 border-green-200">
                  <ShieldCheck className="h-4 w-4 text-green-500" />
                  <AlertTitle className="text-green-700">API 키가 등록되어 있습니다</AlertTitle>
                  <AlertDescription className="text-green-600">
                    자동매매 시스템이 업비트 API를 통해 거래할 수 있습니다.
                  </AlertDescription>
                </Alert>
                <div className="space-y-2">
                  <Label htmlFor="registered-access-key">Access Key</Label>
                  <Input
                    id="registered-access-key"
                    value="••••••••••••••••••••••••"
                    disabled
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="registered-secret-key">Secret Key</Label>
                  <Input id="registered-secret-key" value="••••••••••••••••••••••••••••••••" disabled />
                </div>
                <Button
                  variant="destructive"
                  onClick={handleDeleteApiKey}
                  disabled={isSubmitting || tradingStatus?.isRunning}
                  className="w-full"
                >
                  {deleteMutation.isPending ? "삭제 중..." : "API 키 삭제"}
                </Button>
                {tradingStatus?.isRunning && (
                  <p className="text-xs text-red-500">
                    자동매매가 실행 중일 때는 API 키를 삭제할 수 없습니다. 먼저 자동매매를 중지해주세요.
                  </p>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                <Alert className="bg-amber-50 border-amber-200">
                  <ShieldAlert className="h-4 w-4 text-amber-500" />
                  <AlertTitle className="text-amber-700">API 키 등록이 필요합니다</AlertTitle>
                  <AlertDescription className="text-amber-600">
                    자동매매를 실행하기 위해 업비트 API 키를 등록해주세요.
                  </AlertDescription>
                </Alert>
                <div className="space-y-2">
                  <Label htmlFor="access-key">Access Key</Label>
                  <Input
                    id="access-key"
                    placeholder="업비트에서 발급받은 Access Key를 입력하세요"
                    value={accessKey}
                    onChange={(e) => setAccessKey(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="secret-key">Secret Key</Label>
                  <Input
                    id="secret-key"
                    type="password"
                    placeholder="업비트에서 발급받은 Secret Key를 입력하세요"
                    value={secretKey}
                    onChange={(e) => setSecretKey(e.target.value)}
                  />
                </div>
                <Button
                  onClick={handleRegisterApiKey}
                  disabled={!accessKey || !secretKey || isSubmitting}
                  className="w-full"
                >
                  {registerMutation.isPending ? "등록 중..." : "API 키 등록"}
                </Button>
              </div>
            )}
          </CardContent>
          <CardFooter className="flex flex-col items-start">
            <div className="text-sm text-muted-foreground space-y-2 w-full">
              <p className="font-medium">API 키 발급 방법:</p>
              <ol className="list-decimal list-inside space-y-2">
                <li>업비트 웹사이트에 로그인합니다.</li>
                <li>
                  <span className="font-medium">고객센터 &gt; Open API 안내 &gt; Open API 사용하기</span> 페이지로 이동합니다.
                </li>
                <li>
                  <span className="font-medium">Open API Key 관리</span> 탭에서 <span className="text-red-500">입금하기와 출금하기를 제외한 모든 항목</span>을 선택합니다.
                </li>
                <li>
                  IP 주소 등록 입력칸에{" "}
                  <button
                    onClick={handleCopyIp}
                    className="inline-flex items-center gap-1 rounded bg-muted px-1.5 py-0.5 text-xs font-medium text-primary hover:bg-muted/80 transition-colors cursor-pointer border border-border"
                    title="IP 주소 복사하기"
                  >
                    138.2.121.218 (Ubot server IP)
                    <Copy className="h-3 w-3" />
                  </button>{" "}
                  입력합니다.
                </li>
                <li>발급받은 Access Key와 Secret Key를 위 양식에 입력합니다.</li>
              </ol>
              <p className="mt-4 text-red-500 flex items-center gap-1.5 p-3 bg-red-50 rounded-md border border-red-100">
                <Key className="h-4 w-4" />
                <span className="font-medium">주의: API 키는 안전하게 보관하세요. 절대 타인에게 공유하지 마세요.</span>
              </p>
            </div>
          </CardFooter>
        </Card>

      </div>
    </AuthGuard>
  )
}
