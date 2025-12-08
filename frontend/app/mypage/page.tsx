"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { Key, ShieldAlert, ShieldCheck } from "lucide-react"
import { AuthGuard } from "@/components/common"
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { useUser } from "@/hooks/queries/useUser"
import { useTradingStatus } from "@/hooks/queries/useTradingStatus"
import { useRegisterApiKey } from "@/hooks/mutations/useRegisterApiKey"
import { useDeleteApiKey } from "@/hooks/mutations/useDeleteApiKey"

export default function MyPage() {
  // React Query hooks
  const { data: user } = useUser()
  const { data: tradingStatus } = useTradingStatus()
  const registerMutation = useRegisterApiKey()
  const deleteMutation = useDeleteApiKey()

  const [accessKey, setAccessKey] = useState("")
  const [secretKey, setSecretKey] = useState("")
  const [stopLossEnabled, setStopLossEnabled] = useState(true)
  const [stopLossLimit, setStopLossLimit] = useState(5)
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

  const handleSaveSettings = async () => {
    // TODO: 백엔드 API 구현 시 실제 mutation으로 교체
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

        <Tabs defaultValue="api-keys" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="api-keys">API 키 관리</TabsTrigger>
            <TabsTrigger value="settings">거래 설정</TabsTrigger>
          </TabsList>
          <TabsContent value="api-keys">
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
                <div className="text-sm text-muted-foreground space-y-2">
                  <p className="font-medium">API 키 발급 방법:</p>
                  <ol className="list-decimal list-inside space-y-1">
                    <li>업비트 웹사이트에 로그인합니다.</li>
                    <li>
                      <span className="font-medium">마이페이지 &gt; Open API 관리</span>로 이동합니다.
                    </li>
                    <li>
                      <span className="font-medium">Open API 키 발급</span>을 클릭합니다.
                    </li>
                    <li>
                      <span className="font-medium">자동매매 권한</span>을 체크하고 발급합니다.
                    </li>
                    <li>발급받은 Access Key와 Secret Key를 위 양식에 입력합니다.</li>
                  </ol>
                  <p className="mt-2 text-red-500">
                    <Key className="inline-block mr-1 h-3 w-3" />
                    주의: API 키는 안전하게 보관하세요. 절대 타인에게 공유하지 마세요.
                  </p>
                </div>
              </CardFooter>
            </Card>
          </TabsContent>
          <TabsContent value="settings">
            <Card>
              <CardHeader>
                <CardTitle>거래 설정</CardTitle>
                <CardDescription>자동매매 거래 관련 설정을 관리합니다.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="stop-loss">손실 제한 (Stop Loss)</Label>
                      <p className="text-sm text-muted-foreground">설정한 손실률에 도달하면 자동으로 매도합니다.</p>
                    </div>
                    <Switch
                      id="stop-loss"
                      checked={stopLossEnabled}
                      onCheckedChange={setStopLossEnabled}
                      disabled={!user?.apiKeyRegistered}
                    />
                  </div>
                  {stopLossEnabled && (
                    <div className="space-y-2">
                      <Label htmlFor="stop-loss-limit">손실 제한 비율 (%)</Label>
                      <div className="flex items-center space-x-2">
                        <Input
                          id="stop-loss-limit"
                          type="number"
                          min="1"
                          max="50"
                          value={stopLossLimit}
                          onChange={(e) => setStopLossLimit(Number(e.target.value))}
                          disabled={!user?.apiKeyRegistered}
                          className="w-24"
                        />
                        <span>%</span>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        매수 가격 대비 {stopLossLimit}% 하락 시 자동 매도됩니다.
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
              <CardFooter>
                <Button
                  onClick={handleSaveSettings}
                  disabled={!user?.apiKeyRegistered || isSubmitting}
                  className="w-full"
                >
                  {isSubmitting ? "저장 중..." : "설정 저장"}
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AuthGuard>
  )
}
