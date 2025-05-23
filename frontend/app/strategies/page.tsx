"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/components/auth-provider"
import { useApi } from "@/lib/api-context"
import { useRouter } from "next/navigation"
import { useToast } from "@/components/ui/use-toast"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  AlertCircle,
  ArrowDownUp,
  CheckCircle2,
  ChevronRight,
  Info,
  Key,
  LineChart,
  Percent,
  TrendingDown,
  TrendingUp,
} from "lucide-react"
import { LoginModal } from "@/components/login-modal"

// 더미 데이터
const dummyStrategies = [
  {
    id: "rsi-oversold",
    name: "RSI 과매도 전략",
    description: "RSI 지표가 30 이하로 과매도 상태일 때 매수하는 전략",
    details: "RSI < 30 && EMA 20 > EMA 60",
    indicators: ["RSI", "EMA"],
    type: "trend-reversal",
  },
  {
    id: "macd-crossover",
    name: "MACD 크로스오버 전략",
    description: "MACD 선이 시그널 선을 상향 돌파할 때 매수하는 전략",
    details: "MACD Line crosses above Signal Line",
    indicators: ["MACD", "Signal Line"],
    type: "trend-following",
  },
  {
    id: "bollinger-bounce",
    name: "볼린저 밴드 반등 전략",
    description: "가격이 볼린저 밴드 하단에 닿았다가 반등할 때 매수하는 전략",
    details: "Price touches lower Bollinger Band && RSI < 40",
    indicators: ["Bollinger Bands", "RSI"],
    type: "mean-reversion",
  },
  {
    id: "triple-ema",
    name: "삼중 EMA 전략",
    description: "단기, 중기, 장기 EMA가 모두 상승 추세일 때 매수하는 전략",
    details: "EMA 5 > EMA 10 > EMA 20 && All EMAs trending upward",
    indicators: ["EMA"],
    type: "trend-following",
  },
]

export default function StrategiesPage() {
  const { isAuthenticated } = useAuth()
  const { apiKeyState, tradingStatus, setStrategy, updateTradingSettings } = useApi()
  const [showLoginModal, setShowLoginModal] = useState(false)
  const [strategies, setStrategies] = useState(dummyStrategies)
  const [selectedStrategy, setSelectedStrategy] = useState<string | null>(null)
  const [detailStrategy, setDetailStrategy] = useState<(typeof dummyStrategies)[0] | null>(null)
  const [showDetailDialog, setShowDetailDialog] = useState(false)
  const [showConfirmDialog, setShowConfirmDialog] = useState(false)
  const [settings, setSettings] = useState({
    stopLossEnabled: tradingStatus.settings?.stopLossEnabled || true,
    stopLossLimit: tradingStatus.settings?.stopLossLimit || 5,
  })
  const router = useRouter()
  const { toast } = useToast()

  // 트레이딩 설정 초기화
  useEffect(() => {
    if (tradingStatus.settings) {
      setSettings({
        stopLossEnabled: tradingStatus.settings.stopLossEnabled,
        stopLossLimit: tradingStatus.settings.stopLossLimit,
      })
    }
  }, [tradingStatus.settings])

  const handleViewDetail = (strategy: (typeof dummyStrategies)[0]) => {
    setDetailStrategy(strategy)
    setShowDetailDialog(true)
  }

  const handleSelectStrategy = (strategyId: string) => {
    if (!isAuthenticated) {
      setShowLoginModal(true)
      return
    }

    if (!apiKeyState.hasApiKey) {
      toast({
        variant: "destructive",
        title: "API 키가 등록되지 않았습니다",
        description: "전략을 설정하기 위해 API 키를 등록해주세요.",
        action: (
          <Button variant="outline" onClick={() => router.push("/mypage")}>
            등록하기
          </Button>
        ),
      })
      return
    }

    setSelectedStrategy(strategyId)
    setShowConfirmDialog(true)
  }

  const handleConfirmStrategy = async () => {
    if (!selectedStrategy) return

    try {
      const success = await setStrategy(selectedStrategy)

      if (success) {
        setShowConfirmDialog(false)
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "전략 설정 실패",
        description: "전략 설정 중 오류가 발생했습니다. 다시 시도해주세요.",
      })
    }
  }

  const handleSaveSettings = async () => {
    if (!apiKeyState.hasApiKey) {
      toast({
        variant: "destructive",
        title: "API 키가 등록되지 않았습니다",
        description: "설정을 변경하기 위해 API 키를 등록해주세요.",
      })
      return
    }

    await updateTradingSettings(settings)
  }

  const getStrategyTypeIcon = (type: string) => {
    switch (type) {
      case "trend-following":
        return <TrendingUp className="h-4 w-4" />
      case "trend-reversal":
        return <ArrowDownUp className="h-4 w-4" />
      case "mean-reversion":
        return <TrendingDown className="h-4 w-4" />
      default:
        return <LineChart className="h-4 w-4" />
    }
  }

  const getStrategyTypeLabel = (type: string) => {
    switch (type) {
      case "trend-following":
        return "추세 추종형"
      case "trend-reversal":
        return "추세 반전형"
      case "mean-reversion":
        return "평균 회귀형"
      default:
        return "기타"
    }
  }

  // API 키가 없는 경우 안내 메시지
  if (isAuthenticated && !apiKeyState.hasApiKey) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight">전략 설정</h1>
          <Button onClick={() => router.push("/")} variant="outline">
            대시보드로 돌아가기
          </Button>
        </div>

        <Card className="border-amber-300 bg-amber-50">
          <CardHeader>
            <CardTitle className="flex items-center text-amber-800">
              <Key className="h-5 w-5 mr-2" />
              업비트 API 키 등록이 필요합니다
            </CardTitle>
            <CardDescription className="text-amber-700">
              전략 설정을 이용하기 위해서는 업비트 API 키가 필요합니다.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col space-y-4">
              <p className="text-sm text-amber-700">
                API 키를 등록하면 다양한 자동매매 전략을 선택하고 실행할 수 있습니다.
              </p>
              <Button onClick={() => router.push("/mypage")} className="w-full sm:w-auto">
                <Key className="mr-2 h-4 w-4" />
                API 키 등록하기
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // 로그인하지 않은 경우 안내 메시지
  if (!isAuthenticated) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight">전략 설정</h1>
          <Button onClick={() => router.push("/")} variant="outline">
            대시보드로 돌아가기
          </Button>
        </div>

        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>로그인이 필요합니다</AlertTitle>
          <AlertDescription>
            전략 설정을 이용하기 위해 로그인해주세요.
            <Button variant="link" className="p-0 h-auto ml-2" onClick={() => setShowLoginModal(true)}>
              로그인하기
            </Button>
          </AlertDescription>
        </Alert>

        <LoginModal open={showLoginModal} onOpenChange={setShowLoginModal} />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">전략 설정</h1>
        <Button onClick={() => router.push("/")} variant="outline">
          대시보드로 돌아가기
        </Button>
      </div>

      <Tabs defaultValue="strategies" className="w-full">
        <TabsList>
          <TabsTrigger value="strategies">전략 선택</TabsTrigger>
          <TabsTrigger value="settings">트레이딩 설정</TabsTrigger>
        </TabsList>

        <TabsContent value="strategies" className="space-y-6">
          {tradingStatus.strategy && (
            <Card className="bg-muted/50">
              <CardHeader>
                <CardTitle className="flex items-center">
                  현재 선택된 전략
                  <Badge className="ml-2 bg-green-500">활성화됨</Badge>
                </CardTitle>
                <CardDescription>현재 자동매매에 적용 중인 전략입니다.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold">{tradingStatus.strategy.name}</h3>
                    <p className="text-sm text-muted-foreground">{tradingStatus.strategy.description}</p>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => handleViewDetail(tradingStatus.strategy!)}>
                    상세 보기
                    <ChevronRight className="ml-1 h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {strategies.map((strategy) => (
              <Card key={strategy.id} className={tradingStatus.strategy?.id === strategy.id ? "border-primary" : ""}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <Badge variant="outline" className="mb-2">
                      {getStrategyTypeIcon(strategy.type)}
                      <span className="ml-1">{getStrategyTypeLabel(strategy.type)}</span>
                    </Badge>
                    {tradingStatus.strategy?.id === strategy.id && <CheckCircle2 className="h-5 w-5 text-primary" />}
                  </div>
                  <CardTitle>{strategy.name}</CardTitle>
                  <CardDescription>{strategy.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex flex-wrap gap-1">
                      {strategy.indicators.map((indicator) => (
                        <Badge key={indicator} variant="secondary">
                          {indicator}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <Button variant="outline" size="sm" onClick={() => handleViewDetail(strategy)}>
                    <Info className="mr-2 h-4 w-4" />
                    상세 정보
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => handleSelectStrategy(strategy.id)}
                    disabled={tradingStatus.strategy?.id === strategy.id}
                  >
                    {tradingStatus.strategy?.id === strategy.id ? "현재 사용 중" : "이 전략으로 설정"}
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>트레이딩 설정</CardTitle>
              <CardDescription>자동매매 실행에 관한 설정을 관리합니다.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="stop-loss">일일 손실 한도 초과 시 자동 중지</Label>
                  <p className="text-sm text-muted-foreground">설정한 손실 한도를 초과하면 자동매매가 중지됩니다.</p>
                </div>
                <Switch
                  id="stop-loss"
                  checked={settings.stopLossEnabled}
                  onCheckedChange={(checked) => setSettings((prev) => ({ ...prev, stopLossEnabled: checked }))}
                  disabled={!apiKeyState.hasApiKey}
                />
              </div>

              {settings.stopLossEnabled && (
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Label htmlFor="stop-loss-limit">일일 손실 한도 (%)</Label>
                    <Percent className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <Input
                    id="stop-loss-limit"
                    type="number"
                    min="1"
                    max="100"
                    value={settings.stopLossLimit}
                    onChange={(e) =>
                      setSettings((prev) => ({
                        ...prev,
                        stopLossLimit: Number.parseInt(e.target.value) || 5,
                      }))
                    }
                    disabled={!apiKeyState.hasApiKey}
                  />
                  <p className="text-xs text-muted-foreground">
                    일일 손실이 {settings.stopLossLimit}%를 초과하면 자동매매가 중지됩니다.
                  </p>
                </div>
              )}

              {!apiKeyState.hasApiKey && (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>API 키가 필요합니다</AlertTitle>
                  <AlertDescription>트레이딩 설정을 변경하려면 먼저 API 키를 등록해주세요.</AlertDescription>
                </Alert>
              )}
            </CardContent>
            <CardFooter>
              <Button onClick={handleSaveSettings} className="ml-auto" disabled={!apiKeyState.hasApiKey}>
                설정 저장
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>

      {/* 전략 상세 정보 다이얼로그 */}
      <Dialog open={showDetailDialog} onOpenChange={setShowDetailDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{detailStrategy?.name}</DialogTitle>
            <DialogDescription>전략 상세 정보 및 작동 방식</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <h4 className="font-medium">전략 설명</h4>
              <p className="text-sm">{detailStrategy?.description}</p>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium">전략 조건</h4>
              <div className="rounded-md bg-muted p-3 font-mono text-sm">{detailStrategy?.details}</div>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium">사용 지표</h4>
              <div className="flex flex-wrap gap-1">
                {detailStrategy?.indicators.map((indicator) => (
                  <Badge key={indicator} variant="secondary">
                    {indicator}
                  </Badge>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium">전략 유형</h4>
              <Badge variant="outline">
                {getStrategyTypeIcon(detailStrategy?.type || "")}
                <span className="ml-1">{getStrategyTypeLabel(detailStrategy?.type || "")}</span>
              </Badge>
            </div>
          </div>
          <DialogFooter>
            <Button
              onClick={() => {
                setShowDetailDialog(false)
                if (detailStrategy) handleSelectStrategy(detailStrategy.id)
              }}
              disabled={tradingStatus.strategy?.id === detailStrategy?.id}
            >
              {tradingStatus.strategy?.id === detailStrategy?.id ? "현재 사용 중" : "이 전략으로 설정"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 전략 설정 확인 다이얼로그 */}
      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>전략 변경 확인</DialogTitle>
            <DialogDescription>선택한 전략으로 변경하시겠습니까?</DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <p className="text-sm">
              <strong>현재 전략:</strong> {tradingStatus.strategy?.name || "없음"}
            </p>
            <p className="text-sm mt-2">
              <strong>변경할 전략:</strong> {strategies.find((s) => s.id === selectedStrategy)?.name}
            </p>
            <Alert className="mt-4">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>주의</AlertTitle>
              <AlertDescription>
                전략을 변경하면 기존 전략에 의한 매매 신호는 더 이상 발생하지 않습니다.
              </AlertDescription>
            </Alert>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowConfirmDialog(false)}>
              취소
            </Button>
            <Button onClick={handleConfirmStrategy}>확인</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <LoginModal open={showLoginModal} onOpenChange={setShowLoginModal} />
    </div>
  )
}
