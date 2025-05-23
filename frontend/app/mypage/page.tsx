"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/components/auth-provider"
import { useApi } from "@/lib/api-context"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle, Key, ShieldAlert, ShieldCheck } from "lucide-react"
import { LoginModal } from "@/components/login-modal"

export default function MyPage() {
  const { isAuthenticated, isLoading: authLoading } = useAuth()
  const { apiKeyState, setApiKeys, clearApiKeys, tradingStatus, updateTradingSettings } = useApi()
  const [accessKey, setAccessKey] = useState("")
  const [secretKey, setSecretKey] = useState("")
  const [stopLossEnabled, setStopLossEnabled] = useState(tradingStatus.settings?.stopLossEnabled || true)
  const [stopLossLimit, setStopLossLimit] = useState(tradingStatus.settings?.stopLossLimit || 5)
  const [showLoginModal, setShowLoginModal] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const router = useRouter()

  // 설정 값 초기화
  useEffect(() => {
    if (tradingStatus.settings) {
      setStopLossEnabled(tradingStatus.settings.stopLossEnabled)
      setStopLossLimit(tradingStatus.settings.stopLossLimit)
    }
  }, [tradingStatus.settings])

  // 로그인 상태 확인
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      setShowLoginModal(true)
    }
  }, [authLoading, isAuthenticated])

  const handleRegisterApiKey = async () => {
    if (!accessKey || !secretKey) {
      return
    }

    setIsSubmitting(true)
    try {
      // API 키 등록
      setApiKeys(accessKey, secretKey)

      // 폼 초기화
      setAccessKey("")
      setSecretKey("")
    } catch (error) {
      console.error("Failed to register API key:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeleteApiKey = async () => {
    setIsSubmitting(true)
    try {
      clearApiKeys()
    } catch (error) {
      console.error("Failed to delete API key:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleSaveSettings = async () => {
    setIsSubmitting(true)
    try {
      await updateTradingSettings({
        stopLossEnabled,
        stopLossLimit,
      })
    } catch (error) {
      console.error("Failed to save settings:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">내 계정</h1>
        <Button variant="outline" onClick={() => router.push("/")}>
          대시보드로 돌아가기
        </Button>
      </div>

      {!isAuthenticated ? (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>로그인이 필요합니다</AlertTitle>
          <AlertDescription>
            계정 설정을 관리하기 위해 로그인해주세요.
            <Button variant="link" className="p-0 h-auto ml-2" onClick={() => setShowLoginModal(true)}>
              로그인하기
            </Button>
          </AlertDescription>
        </Alert>
      ) : (
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
                {apiKeyState.hasApiKey ? (
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
                        value={apiKeyState.accessKey.substring(0, 8) + "••••••••••••••••"}
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
                      disabled={isSubmitting || tradingStatus.isRunning}
                      className="w-full"
                    >
                      {isSubmitting ? "처리 중..." : "API 키 삭제"}
                    </Button>
                    {tradingStatus.isRunning && (
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
                      {isSubmitting ? "등록 중..." : "API 키 등록"}
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
                      disabled={!apiKeyState.hasApiKey}
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
                          disabled={!apiKeyState.hasApiKey}
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
                  disabled={!apiKeyState.hasApiKey || isSubmitting}
                  className="w-full"
                >
                  {isSubmitting ? "저장 중..." : "설정 저장"}
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>
      )}

      <LoginModal open={showLoginModal} onOpenChange={setShowLoginModal} />
    </div>
  )
}
