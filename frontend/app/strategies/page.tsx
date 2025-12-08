"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useToast } from "@/components/ui/use-toast"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  AlertCircle,
  ArrowDownUp,
  CheckCircle2,
  ChevronRight,
  Info,
  LineChart,
  Percent,
  TrendingDown,
  TrendingUp,
} from "lucide-react"
import { AuthGuard, ApiKeyRequired } from "@/components/common"
import { useUser } from "@/hooks/queries/useUser"
import { useCurrentStrategy } from "@/hooks/queries/useCurrentStrategy"
import { useStrategies } from "@/hooks/queries/useStrategies"
import { useTradingStatus } from "@/hooks/queries/useTradingStatus"
import { useUpdateStrategy } from "@/hooks/mutations/useUpdateStrategy"
import type { Strategy } from "@/types"

export default function StrategiesPage() {
  // React Query hooks
  const { data: user } = useUser()
  const currentStrategy = useCurrentStrategy()
  const { data: strategies = [], isLoading: isLoadingStrategies } = useStrategies()
  const { data: tradingStatus } = useTradingStatus()
  const updateStrategyMutation = useUpdateStrategy()

  const [selectedStrategy, setSelectedStrategy] = useState<number | null>(null)
  const [detailStrategy, setDetailStrategy] = useState<Strategy | null>(null)
  const [showDetailDialog, setShowDetailDialog] = useState(false)
  const [showConfirmDialog, setShowConfirmDialog] = useState(false)
  const [settings, setSettings] = useState({
    stopLossEnabled: true,
    stopLossLimit: 5,
  })
  const router = useRouter()
  const { toast } = useToast()

  const handleViewDetail = (strategy: Strategy) => {
    setDetailStrategy(strategy)
    setShowDetailDialog(true)
  }

  const handleSelectStrategy = (strategyId: number) => {
    if (!user?.apiKeyRegistered) {
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
    if (selectedStrategy === null) return

    updateStrategyMutation.mutate(selectedStrategy, {
      onSuccess: () => {
        setShowConfirmDialog(false)
      },
    })
  }

  const handleSaveSettings = async () => {
    if (!user?.apiKeyRegistered) {
      toast({
        variant: "destructive",
        title: "API 키가 등록되지 않았습니다",
        description: "설정을 변경하기 위해 API 키를 등록해주세요.",
      })
      return
    }

    // TODO: 백엔드 API 구현 시 실제 mutation으로 교체
    toast({
      title: "설정이 저장되었습니다",
      duration: 3000,
    })
  }

  const getStrategyTypeIcon = (type?: string) => {
    switch (type) {
      case "TREND_FOLLOWING":
        return <TrendingUp className="h-4 w-4" />
      case "TREND_REVERSAL":
        return <ArrowDownUp className="h-4 w-4" />
      case "MEAN_REVERSION":
        return <TrendingDown className="h-4 w-4" />
      default:
        return <LineChart className="h-4 w-4" />
    }
  }

  const getStrategyTypeLabel = (type?: string) => {
    switch (type) {
      case "추세추종형":
        return "추세 추종형"
      case "추세반전형":
        return "추세 반전형"
      case "평균회귀형":
        return "평균 회귀형"
      default:
        return "기타"
    }
  }

  return (
    <AuthGuard>
      <ApiKeyRequired>
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
              {currentStrategy && (
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
                        <h3 className="text-lg font-semibold">{currentStrategy.name}</h3>
                        <p className="text-sm text-muted-foreground">{currentStrategy.information}</p>
                      </div>
                      <Button variant="outline" size="sm" onClick={() => handleViewDetail(currentStrategy)}>
                        상세 보기
                        <ChevronRight className="ml-1 h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              {isLoadingStrategies ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
                </div>
              ) : (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {strategies.map((strategy) => (
                    <Card key={strategy.id} className={currentStrategy?.id === strategy.id ? "border-primary" : ""}>
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <Badge variant="outline" className="mb-2">
                            {getStrategyTypeIcon(strategy.strategyType)}
                            <span className="ml-1">{getStrategyTypeLabel(strategy.strategyType)}</span>
                          </Badge>
                          {currentStrategy?.id === strategy.id && <CheckCircle2 className="h-5 w-5 text-primary" />}
                        </div>
                        <CardTitle>{strategy.name}</CardTitle>
                        <CardDescription>{strategy.information}</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          <div className="flex flex-wrap gap-1">
                            {strategy.indicators && strategy.indicators.length > 0 ? (
                              strategy.indicators.map((indicator, idx) => (
                                <Badge key={idx} variant="secondary">
                                  {indicator}
                                </Badge>
                              ))
                            ) : (
                              <span className="text-xs text-muted-foreground">지표 정보 없음</span>
                            )}
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
                          disabled={currentStrategy?.id === strategy.id || updateStrategyMutation.isPending}
                        >
                          {currentStrategy?.id === strategy.id ? "현재 사용 중" : "이 전략으로 설정"}
                        </Button>
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              )}
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
                      disabled={!user?.apiKeyRegistered}
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
                        disabled={!user?.apiKeyRegistered}
                      />
                      <p className="text-xs text-muted-foreground">
                        일일 손실이 {settings.stopLossLimit}%를 초과하면 자동매매가 중지됩니다.
                      </p>
                    </div>
                  )}

                  {!user?.apiKeyRegistered && (
                    <Alert>
                      <AlertCircle className="h-4 w-4" />
                      <AlertTitle>API 키가 필요합니다</AlertTitle>
                      <AlertDescription>트레이딩 설정을 변경하려면 먼저 API 키를 등록해주세요.</AlertDescription>
                    </Alert>
                  )}
                </CardContent>
                <CardFooter>
                  <Button onClick={handleSaveSettings} className="ml-auto" disabled={!user?.apiKeyRegistered}>
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
                  <p className="text-sm">{detailStrategy?.information}</p>
                </div>
                <div className="space-y-2">
                  <h4 className="font-medium">전략 유형</h4>
                  <Badge variant="outline">
                    {getStrategyTypeIcon(detailStrategy?.strategyType)}
                    <span className="ml-1">{getStrategyTypeLabel(detailStrategy?.strategyType)}</span>
                  </Badge>
                </div>
                {detailStrategy?.indicators && detailStrategy.indicators.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="font-medium">사용 지표</h4>
                    <div className="flex flex-wrap gap-1">
                      {detailStrategy.indicators.map((indicator, idx) => (
                        <Badge key={idx} variant="secondary">
                          {indicator}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              <DialogFooter>
                <Button
                  onClick={() => {
                    setShowDetailDialog(false)
                    if (detailStrategy) handleSelectStrategy(detailStrategy.id)
                  }}
                  disabled={currentStrategy?.id === detailStrategy?.id || updateStrategyMutation.isPending}
                >
                  {currentStrategy?.id === detailStrategy?.id ? "현재 사용 중" : "이 전략으로 설정"}
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
                  <strong>현재 전략:</strong> {currentStrategy?.name || "없음"}
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
                <Button onClick={handleConfirmStrategy} disabled={updateStrategyMutation.isPending}>
                  {updateStrategyMutation.isPending ? "변경 중..." : "확인"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </ApiKeyRequired>
    </AuthGuard>
  )
}
