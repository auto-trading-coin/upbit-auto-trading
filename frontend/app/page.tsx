"use client"

import { useState } from "react"
import { useAuth } from "@/components/auth-provider"
import { useApi } from "@/lib/api-context"
import { useRouter } from "next/navigation"
import { useToast } from "@/components/ui/use-toast"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import {
  AlertCircle,
  AlertTriangle,
  ArrowUpDown,
  BarChart3,
  CheckCircle2,
  Clock,
  DollarSign,
  Key,
  LineChart,
  Percent,
  Settings,
  StopCircle,
  TrendingDown,
  TrendingUp,
} from "lucide-react"
import { LoginModal } from "@/components/login-modal"

export default function Dashboard() {
  const { isAuthenticated } = useAuth()
  const { apiKeyState, tradingStatus, toggleTrading, emergencyStop } = useApi()
  const [showLoginModal, setShowLoginModal] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  const handleToggleTrading = async () => {
    if (!isAuthenticated) {
      setShowLoginModal(true)
      return
    }

    if (!apiKeyState.hasApiKey) {
      toast({
        variant: "destructive",
        title: "API 키가 등록되지 않았습니다",
        description: "자동매매를 실행하기 위해 API 키를 등록해주세요.",
        action: (
          <Button variant="outline" onClick={() => router.push("/mypage")}>
            등록하기
          </Button>
        ),
      })
      return
    }

    if (!tradingStatus.strategy) {
      toast({
        variant: "destructive",
        title: "전략이 선택되지 않았습니다",
        description: "자동매매를 실행하기 위해 전략을 선택해주세요.",
        action: (
          <Button variant="outline" onClick={() => router.push("/strategies")}>
            전략 선택하기
          </Button>
        ),
      })
      return
    }

    await toggleTrading()
  }

  const handleRegisterApiKey = () => {
    // Use shallow routing to prevent full page reload
    router.push("/mypage", { shallow: true })
  }

  const handleSelectStrategy = () => {
    // Use shallow routing to prevent full page reload
    router.push("/strategies", { shallow: true })
  }

  const handleEmergencyStop = async () => {
    await emergencyStop()
  }

  const canRunTrading = apiKeyState.hasApiKey && tradingStatus.strategy !== null

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">자동매매 대시보드</h1>
        <Button
          onClick={() => router.push("/strategies", { shallow: true })}
          variant="outline"
          disabled={!isAuthenticated || !apiKeyState.hasApiKey}
        >
          전략 설정
        </Button>
      </div>

      {!isAuthenticated && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>로그인이 필요합니다</AlertTitle>
          <AlertDescription>
            자동매매 시스템을 이용하기 위해 로그인해주세요.
            <Button variant="link" className="p-0 h-auto ml-2" onClick={() => setShowLoginModal(true)}>
              로그인하기
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {isAuthenticated && !apiKeyState.hasApiKey && (
        <Card className="border-amber-300 bg-amber-50">
          <CardHeader>
            <CardTitle className="flex items-center text-amber-800">
              <Key className="h-5 w-5 mr-2" />
              업비트 API 키 등록이 필요합니다
            </CardTitle>
            <CardDescription className="text-amber-700">
              자동매매 시스템의 모든 기능을 이용하기 위해서는 업비트 API 키가 필요합니다.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col space-y-4">
              <p className="text-sm text-amber-700">API 키를 등록하면 다음 기능을 이용할 수 있습니다:</p>
              <ul className="list-disc list-inside text-sm text-amber-700 space-y-1">
                <li>자동매매 실행 및 제어</li>
                <li>실시간 포지션 확인</li>
                <li>주문 내역 및 시그널 로그 확인</li>
                <li>자산 현황 및 수익률 분석</li>
              </ul>
              <Button onClick={handleRegisterApiKey} className="w-full sm:w-auto">
                <Key className="mr-2 h-4 w-4" />
                API 키 등록하기
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {isAuthenticated && apiKeyState.hasApiKey && !tradingStatus.strategy && (
        <Card className="border-amber-300 bg-amber-50">
          <CardHeader>
            <CardTitle className="flex items-center text-amber-800">
              <Settings className="h-5 w-5 mr-2" />
              자동매매 전략 선택이 필요합니다
            </CardTitle>
            <CardDescription className="text-amber-700">
              자동매매를 실행하기 위해서는 전략을 선택해야 합니다.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col space-y-4">
              <p className="text-sm text-amber-700">다양한 자동매매 전략 중 하나를 선택하여 자동매매를 시작하세요.</p>
              <Button onClick={handleSelectStrategy} className="w-full sm:w-auto">
                <Settings className="mr-2 h-4 w-4" />
                전략 선택하기
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {!isAuthenticated ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="max-w-md space-y-6">
            <div className="space-y-2">
              <h2 className="text-2xl font-bold tracking-tight">자동매매 시스템에 오신 것을 환영합니다</h2>
              <p className="text-muted-foreground">
                업비트 API를 활용한 자동매매 시스템을 이용하려면 로그인이 필요합니다.
              </p>
            </div>
            <div className="flex flex-col space-y-4">
              <div className="rounded-lg border bg-card p-4 shadow-sm">
                <div className="flex items-center gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                    <LineChart className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium">실시간 시세 모니터링</h3>
                    <p className="text-sm text-muted-foreground">다양한 코인의 실시간 가격 정보를 확인하세요.</p>
                  </div>
                </div>
              </div>
              <div className="rounded-lg border bg-card p-4 shadow-sm">
                <div className="flex items-center gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                    <Settings className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium">다양한 전략 선택</h3>
                    <p className="text-sm text-muted-foreground">
                      RSI, MACD 등 다양한 전략을 선택하여 자동매매를 실행하세요.
                    </p>
                  </div>
                </div>
              </div>
              <div className="rounded-lg border bg-card p-4 shadow-sm">
                <div className="flex items-center gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                    <BarChart3 className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium">포트폴리오 관리</h3>
                    <p className="text-sm text-muted-foreground">자산 현황과 수익률을 한눈에 확인하세요.</p>
                  </div>
                </div>
              </div>
            </div>
            <Button size="lg" className="w-full" onClick={() => setShowLoginModal(true)}>
              로그인하고 시작하기
            </Button>
          </div>
        </div>
      ) : (
        <>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">자동매매 상태</CardTitle>
                <Switch
                  checked={apiKeyState.hasApiKey && tradingStatus.isRunning}
                  onCheckedChange={handleToggleTrading}
                  disabled={!isAuthenticated || !canRunTrading}
                />
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-2">
                  {!apiKeyState.hasApiKey ? (
                    <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
                      API 키 필요
                    </Badge>
                  ) : !tradingStatus.strategy ? (
                    <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
                      전략 선택 필요
                    </Badge>
                  ) : tradingStatus.isRunning ? (
                    <Badge className="bg-green-500">실행 중</Badge>
                  ) : (
                    <Badge variant="outline">중지됨</Badge>
                  )}
                  {tradingStatus.hasError && <Badge variant="destructive">오류 발생</Badge>}
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  {!apiKeyState.hasApiKey
                    ? "API 키를 등록해주세요"
                    : !tradingStatus.strategy
                      ? "전략을 선택해주세요"
                      : `현재 전략: ${tradingStatus.strategy?.name || "선택된 전략 없음"}`}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">마지막 시그널</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                {canRunTrading ? (
                  <>
                    <div className="text-2xl font-bold">
                      {tradingStatus.lastSignal ? new Date(tradingStatus.lastSignal).toLocaleTimeString() : "-"}
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">
                      {tradingStatus.lastSignal
                        ? new Date(tradingStatus.lastSignal).toLocaleDateString()
                        : "시그널 없음"}
                    </p>
                  </>
                ) : (
                  <>
                    <div className="text-2xl font-bold">-</div>
                    <p className="text-xs text-muted-foreground mt-2">
                      {!apiKeyState.hasApiKey ? "API 키 등록 후 확인 가능" : "전략 선택 후 확인 가능"}
                    </p>
                  </>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">일일 수익률</CardTitle>
                <Percent className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                {canRunTrading && tradingStatus.dailyProfit !== null ? (
                  <>
                    <div className="flex items-center">
                      <div
                        className={`text-2xl font-bold ${
                          tradingStatus.dailyProfit > 0
                            ? "text-green-500"
                            : tradingStatus.dailyProfit < 0
                              ? "text-red-500"
                              : ""
                        }`}
                      >
                        {tradingStatus.dailyProfit > 0 ? "+" : ""}
                        {tradingStatus.dailyProfit}%
                      </div>
                      {tradingStatus.dailyProfit > 0 ? (
                        <TrendingUp className="ml-2 h-4 w-4 text-green-500" />
                      ) : tradingStatus.dailyProfit < 0 ? (
                        <TrendingDown className="ml-2 h-4 w-4 text-red-500" />
                      ) : (
                        <ArrowUpDown className="ml-2 h-4 w-4 text-muted-foreground" />
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">오늘의 수익률</p>
                  </>
                ) : (
                  <>
                    <div className="text-2xl font-bold">-</div>
                    <p className="text-xs text-muted-foreground mt-2">
                      {!apiKeyState.hasApiKey ? "API 키 등록 후 확인 가능" : "전략 선택 후 확인 가능"}
                    </p>
                  </>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">총 자산</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                {canRunTrading && tradingStatus.totalAsset !== null ? (
                  <>
                    <div className="text-2xl font-bold">{tradingStatus.totalAsset?.toLocaleString()}원</div>
                    <p className="text-xs text-muted-foreground mt-2">원화 + 코인 평가금액</p>
                  </>
                ) : (
                  <>
                    <div className="text-2xl font-bold">-</div>
                    <p className="text-xs text-muted-foreground mt-2">
                      {!apiKeyState.hasApiKey ? "API 키 등록 후 확인 가능" : "전략 선택 후 확인 가능"}
                    </p>
                  </>
                )}
              </CardContent>
            </Card>
          </div>

          <Tabs defaultValue="positions" className="w-full">
            <TabsList>
              <TabsTrigger value="positions">포지션 현황</TabsTrigger>
              <TabsTrigger value="status">시스템 상태</TabsTrigger>
            </TabsList>
            <TabsContent value="positions" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>현재 포지션</CardTitle>
                  <CardDescription>현재 보유 중인 코인 포지션 정보</CardDescription>
                </CardHeader>
                <CardContent>
                  {canRunTrading && tradingStatus.positions && tradingStatus.positions.length > 0 ? (
                    <div className="rounded-md border">
                      <div className="grid grid-cols-5 gap-4 p-4 font-medium">
                        <div>마켓</div>
                        <div>수량</div>
                        <div>매수 평균가</div>
                        <div>현재가</div>
                        <div>수익률</div>
                      </div>
                      {tradingStatus.positions.map((position, index) => {
                        const profitPercent = ((position.currentPrice - position.avgPrice) / position.avgPrice) * 100
                        return (
                          <div key={index} className="grid grid-cols-5 gap-4 p-4 border-t">
                            <div>{position.market}</div>
                            <div>{position.amount}</div>
                            <div>{position.avgPrice.toLocaleString()}원</div>
                            <div>{position.currentPrice.toLocaleString()}원</div>
                            <div
                              className={profitPercent > 0 ? "text-green-500" : profitPercent < 0 ? "text-red-500" : ""}
                            >
                              {profitPercent > 0 ? "+" : ""}
                              {profitPercent.toFixed(2)}%
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-8 text-center">
                      <LineChart className="h-10 w-10 text-muted-foreground mb-4" />
                      <h3 className="text-lg font-medium">
                        {!apiKeyState.hasApiKey
                          ? "API 키 등록 후 확인 가능합니다"
                          : !tradingStatus.strategy
                            ? "전략 선택 후 확인 가능합니다"
                            : "보유 중인 포지션이 없습니다"}
                      </h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        {!apiKeyState.hasApiKey
                          ? "업비트 API 키를 등록하여 포지션 정보를 확인하세요"
                          : !tradingStatus.strategy
                            ? "자동매매 전략을 선택하여 포지션 정보를 확인하세요"
                            : "자동매매가 시작되면 이곳에 포지션 정보가 표시됩니다"}
                      </p>
                      {!apiKeyState.hasApiKey ? (
                        <Button variant="outline" className="mt-4" onClick={handleRegisterApiKey}>
                          API 키 등록하기
                        </Button>
                      ) : !tradingStatus.strategy ? (
                        <Button variant="outline" className="mt-4" onClick={handleSelectStrategy}>
                          전략 선택하기
                        </Button>
                      ) : null}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="status" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>시스템 상태</CardTitle>
                  <CardDescription>자동매매 시스템의 현재 상태 정보</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex items-center space-x-2">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted">
                          {apiKeyState.hasApiKey ? (
                            <CheckCircle2 className="h-4 w-4 text-green-500" />
                          ) : (
                            <AlertTriangle className="h-4 w-4 text-amber-500" />
                          )}
                        </div>
                        <div>
                          <p className="text-sm font-medium">API 키 상태</p>
                          <p className="text-xs text-muted-foreground">{apiKeyState.hasApiKey ? "등록됨" : "미등록"}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted">
                          {tradingStatus.strategy ? (
                            <CheckCircle2 className="h-4 w-4 text-green-500" />
                          ) : (
                            <AlertTriangle className="h-4 w-4 text-amber-500" />
                          )}
                        </div>
                        <div>
                          <p className="text-sm font-medium">전략 상태</p>
                          <p className="text-xs text-muted-foreground">
                            {tradingStatus.strategy ? tradingStatus.strategy.name : "미선택"}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted">
                          {tradingStatus.isRunning ? (
                            <CheckCircle2 className="h-4 w-4 text-green-500" />
                          ) : (
                            <StopCircle className="h-4 w-4 text-amber-500" />
                          )}
                        </div>
                        <div>
                          <p className="text-sm font-medium">자동매매 상태</p>
                          <p className="text-xs text-muted-foreground">
                            {!canRunTrading ? "실행 불가" : tradingStatus.isRunning ? "실행 중" : "중지됨"}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted">
                          {tradingStatus.settings?.stopLossEnabled ? (
                            <CheckCircle2 className="h-4 w-4 text-green-500" />
                          ) : (
                            <AlertTriangle className="h-4 w-4 text-amber-500" />
                          )}
                        </div>
                        <div>
                          <p className="text-sm font-medium">손실 제한</p>
                          <p className="text-xs text-muted-foreground">
                            {tradingStatus.settings?.stopLossEnabled
                              ? `${tradingStatus.settings.stopLossLimit}% 제한`
                              : "비활성화"}
                          </p>
                        </div>
                      </div>
                    </div>

                    {!apiKeyState.hasApiKey ? (
                      <Button onClick={handleRegisterApiKey} className="w-full">
                        <Key className="mr-2 h-4 w-4" />
                        API 키 등록하기
                      </Button>
                    ) : !tradingStatus.strategy ? (
                      <Button onClick={handleSelectStrategy} className="w-full">
                        <Settings className="mr-2 h-4 w-4" />
                        전략 선택하기
                      </Button>
                    ) : (
                      <Button
                        variant="destructive"
                        className="w-full"
                        disabled={!tradingStatus.isRunning}
                        onClick={handleEmergencyStop}
                      >
                        <StopCircle className="mr-2 h-4 w-4" />
                        긴급 정지
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </>
      )}

      <LoginModal open={showLoginModal} onOpenChange={setShowLoginModal} />
    </div>
  )
}
