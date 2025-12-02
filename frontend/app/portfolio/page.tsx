"use client"

import { useState, useCallback, useMemo } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import {
  Calendar,
  DollarSign,
  Key,
  LineChart,
  Wallet,
} from "lucide-react"
import { AuthGuard } from "@/components/common"
import { HoldingsTable } from "@/components/portfolio"
import { useUser } from "@/hooks/queries/useUser"
import { usePortfolioCalculation } from "@/hooks/usePortfolioCalculation"
import { useIsMounted } from "@/hooks/useIsMounted"
import { formatCurrency, formatPercent, formatAmount, getProfitColorClass } from "@/lib/utils/format"

// 타입 정의
interface ChartDataItem {
  name: string
  koreanName: string
  value: number
  rawValue: number
  color: string
}

interface AssetHistoryItem {
  date: string
  totalAsset: number
  cashBalance: number
  coinValue: number
  dailyChange: number
}

interface PeriodHistoryItem {
  period: string
  totalAsset: number
  cashBalance: number
  coinValue: number
  change: number
}

// 더미 자산 변동 내역 데이터 (히스토리는 백엔드 API 필요)
const dummyAssetHistory: AssetHistoryItem[] = [
  { date: "2023-06-21", totalAsset: 1250000, cashBalance: 500000, coinValue: 750000, dailyChange: 1.21 },
  { date: "2023-06-20", totalAsset: 1235000, cashBalance: 450000, coinValue: 785000, dailyChange: -0.4 },
  { date: "2023-06-19", totalAsset: 1240000, cashBalance: 450000, coinValue: 790000, dailyChange: 0.81 },
  { date: "2023-06-18", totalAsset: 1230000, cashBalance: 450000, coinValue: 780000, dailyChange: 1.65 },
  { date: "2023-06-17", totalAsset: 1210000, cashBalance: 450000, coinValue: 760000, dailyChange: -0.82 },
  { date: "2023-06-16", totalAsset: 1220000, cashBalance: 450000, coinValue: 770000, dailyChange: 1.67 },
  { date: "2023-06-15", totalAsset: 1200000, cashBalance: 450000, coinValue: 750000, dailyChange: 2.5 },
]

const dummyWeeklyHistory: PeriodHistoryItem[] = [
  { period: "2023-06-15 ~ 2023-06-21", totalAsset: 1250000, cashBalance: 500000, coinValue: 750000, change: 5.93 },
  { period: "2023-06-08 ~ 2023-06-14", totalAsset: 1180000, cashBalance: 420000, coinValue: 760000, change: 2.61 },
  { period: "2023-06-01 ~ 2023-06-07", totalAsset: 1150000, cashBalance: 400000, coinValue: 750000, change: 3.5 },
]

const dummyMonthlyHistory: PeriodHistoryItem[] = [
  { period: "2023-06", totalAsset: 1250000, cashBalance: 500000, coinValue: 750000, change: 5.93 },
  { period: "2023-05", totalAsset: 1180000, cashBalance: 420000, coinValue: 760000, change: 7.27 },
  { period: "2023-04", totalAsset: 1100000, cashBalance: 350000, coinValue: 750000, change: 10.0 },
]

const dummyYearlyHistory: PeriodHistoryItem[] = [
  { period: "2023", totalAsset: 1250000, cashBalance: 500000, coinValue: 750000, change: 25.0 },
  { period: "2022", totalAsset: 1000000, cashBalance: 300000, coinValue: 700000, change: 25.0 },
  { period: "2021", totalAsset: 800000, cashBalance: 200000, coinValue: 600000, change: 60.0 },
]

// 색상 배열
const CHART_COLORS = [
  "#f97316", // orange-500 (BTC)
  "#a855f7", // purple-500 (ETH)
  "#3b82f6", // blue-500
  "#22c55e", // green-500
  "#eab308", // yellow-500
  "#ef4444", // red-500
  "#06b6d4", // cyan-500
  "#ec4899", // pink-500
]

export default function PortfolioPage() {
  // Hydration mismatch 방지
  const isMounted = useIsMounted()
  
  // React Query hooks
  const { data: user, isLoading: userLoading } = useUser()
  
  // 포트폴리오 계산 (공통 훅 사용)
  const {
    holdingsWithPrice,
    cashBalance,
    coinTotalBuyAmount,
    coinEvaluationAmount,
    totalAsset,
    totalProfitAmount,
    totalProfitRate,
    isLoading: portfolioLoading,
  } = usePortfolioCalculation()
  
  const [historyPeriod, setHistoryPeriod] = useState<string>("daily")
  const [hoveredSegment, setHoveredSegment] = useState<string | null>(null)
  const router = useRouter()

  // 파이 차트 데이터 준비
  const chartData = useMemo((): ChartDataItem[] => {
    if (totalAsset === 0) return []

    const data: ChartDataItem[] = []
    
    // 원화 추가
    if (cashBalance > 0) {
      data.push({
        name: "KRW",
        koreanName: "원화",
        value: (cashBalance / totalAsset) * 100,
        rawValue: cashBalance,
        color: "#94a3b8", // slate-400
      })
    }

    // 코인들 추가
    holdingsWithPrice.forEach((holding, index) => {
      const value = holding.evaluationAmount
      if (value > 0) {
        data.push({
          name: holding.market.replace("KRW-", ""),
          koreanName: holding.koreanName,
          value: (value / totalAsset) * 100,
          rawValue: value,
          color: CHART_COLORS[index % CHART_COLORS.length],
        })
      }
    })

    return data
  }, [totalAsset, cashBalance, holdingsWithPrice])

  // 선택된 기간에 따른 자산 변동 내역 데이터 가져오기
  const getHistoryData = useCallback(() => {
    switch (historyPeriod) {
      case "daily":
        return dummyAssetHistory
      case "weekly":
        return dummyWeeklyHistory
      case "monthly":
        return dummyMonthlyHistory
      case "yearly":
        return dummyYearlyHistory
      default:
        return dummyAssetHistory
    }
  }, [historyPeriod])

  const historyData = getHistoryData()

  // 로딩 상태
  if (!isMounted || userLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <AuthGuard>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight">자산 현황</h1>
          <Button onClick={() => router.push("/")} variant="outline">
            대시보드로 돌아가기
          </Button>
        </div>

        {user && !user.apiKeyRegistered && (
          <Card className="border-amber-300 bg-amber-50">
            <CardHeader>
              <CardTitle className="flex items-center text-amber-800">
                <Key className="h-5 w-5 mr-2" />
                업비트 API 키 등록이 필요합니다
              </CardTitle>
              <CardDescription className="text-amber-700">
                자산 현황을 확인하기 위해서는 업비트 API 키가 필요합니다.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col space-y-4">
                <p className="text-sm text-amber-700">API 키를 등록하면 다음 기능을 이용할 수 있습니다:</p>
                <ul className="list-disc list-inside text-sm text-amber-700 space-y-1">
                  <li>실시간 자산 현황 확인</li>
                  <li>코인별 수익률 분석</li>
                  <li>자산 변동 내역 추적</li>
                  <li>포트폴리오 분석</li>
                </ul>
                <Button onClick={() => router.push("/mypage")} className="w-full sm:w-auto">
                  <Key className="mr-2 h-4 w-4" />
                  API 키 등록하기
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {user && !user.apiKeyRegistered ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Key className="h-16 w-16 text-amber-500 mb-6" />
            <h2 className="text-2xl font-bold mb-2">API 키 등록이 필요합니다</h2>
            <p className="text-muted-foreground mb-6 max-w-md">
              실제 자산 현황을 확인하기 위해 업비트 API 키를 등록해주세요.
            </p>
            <Button onClick={() => router.push("/mypage")}>API 키 등록하기</Button>
          </div>
        ) : (
          <Tabs defaultValue="portfolio" className="w-full">
            <TabsList>
              <TabsTrigger value="portfolio">포트폴리오</TabsTrigger>
              <TabsTrigger value="holdings">보유 자산</TabsTrigger>
              <TabsTrigger value="history">자산 변동 내역</TabsTrigger>
            </TabsList>

            <TabsContent value="portfolio" className="space-y-6">
              {portfolioLoading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
                </div>
              ) : (
                <>
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <Card>
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">총 자산</CardTitle>
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">{formatCurrency(totalAsset)}</div>
                        <p className="text-xs text-muted-foreground mt-2">원화 + 코인 평가금액</p>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">원화 보유액</CardTitle>
                        <Wallet className="h-4 w-4 text-muted-foreground" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">{formatCurrency(cashBalance)}</div>
                        <p className="text-xs text-muted-foreground mt-2">사용 가능한 원화 잔액</p>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">코인 평가액</CardTitle>
                        <LineChart className="h-4 w-4 text-muted-foreground" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">{formatCurrency(coinEvaluationAmount)}</div>
                        <p className="text-xs text-muted-foreground mt-2">
                          매수금액: {formatCurrency(coinTotalBuyAmount)}
                        </p>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">일일 수익률</CardTitle>
                        <LineChart className="h-4 w-4 text-muted-foreground" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold text-muted-foreground">-</div>
                        <p className="text-xs text-muted-foreground mt-2">추후 구현 예정</p>
                      </CardContent>
                    </Card>
                  </div>

                  {/* 손익 현황 카드 (공통 컴포넌트와 다른 레이아웃) */}
                  <Card>
                    <CardHeader>
                      <CardTitle>손익 현황</CardTitle>
                      <CardDescription>보유 코인의 평가 손익</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="p-4 bg-muted/30 rounded-lg">
                          <p className="text-xs text-muted-foreground">총 매수금액</p>
                          <p className="text-lg font-semibold">{formatCurrency(coinTotalBuyAmount)}</p>
                        </div>
                        <div className="p-4 bg-muted/30 rounded-lg">
                          <p className="text-xs text-muted-foreground">총 평가금액</p>
                          <p className="text-lg font-semibold">{formatCurrency(coinEvaluationAmount)}</p>
                        </div>
                        <div className="p-4 bg-muted/30 rounded-lg">
                          <p className="text-xs text-muted-foreground">평가 손익</p>
                          <p className={`text-lg font-semibold ${getProfitColorClass(totalProfitAmount)}`}>
                            {formatCurrency(totalProfitAmount, true)}
                          </p>
                        </div>
                        <div className="p-4 bg-muted/30 rounded-lg">
                          <p className="text-xs text-muted-foreground">수익률</p>
                          <p className={`text-lg font-semibold ${getProfitColorClass(totalProfitRate)}`}>
                            {formatPercent(totalProfitRate)}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>자산 분포</CardTitle>
                      <CardDescription>현재 보유 중인 자산의 분포 비율</CardDescription>
                    </CardHeader>
                    <CardContent>
                      {chartData.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-8 text-center">
                          <Wallet className="h-10 w-10 text-muted-foreground mb-4" />
                          <h3 className="text-lg font-medium">보유 자산이 없습니다</h3>
                          <p className="text-sm text-muted-foreground mt-1">
                            코인을 매수하거나 원화를 입금하면 자산 분포가 표시됩니다
                          </p>
                        </div>
                      ) : (
                        <div className="flex flex-col lg:flex-row gap-8 items-start">
                          {/* 도넛 차트 */}
                          <div className="w-72 h-72 relative mx-auto lg:mx-0">
                            <div className="absolute inset-0 flex items-center justify-center flex-col">
                              <p className="text-sm text-muted-foreground">총 자산</p>
                              <p className="text-xl font-bold">₩{totalAsset.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
                            </div>
                            <svg width="100%" height="100%" viewBox="0 0 100 100">
                              <circle cx="50" cy="50" r="40" fill="white" stroke="#e2e8f0" strokeWidth="1" />

                              {/* 파이 차트 섹션들 */}
                              {(() => {
                                let cumulativePercentage = 0

                                return chartData.map((item, index) => {
                                  const startAngle = cumulativePercentage * 3.6
                                  cumulativePercentage += item.value
                                  const endAngle = cumulativePercentage * 3.6

                                  const startX = 50 + 40 * Math.cos(((startAngle - 90) * Math.PI) / 180)
                                  const startY = 50 + 40 * Math.sin(((startAngle - 90) * Math.PI) / 180)
                                  const endX = 50 + 40 * Math.cos(((endAngle - 90) * Math.PI) / 180)
                                  const endY = 50 + 40 * Math.sin(((endAngle - 90) * Math.PI) / 180)

                                  const largeArcFlag = endAngle - startAngle > 180 ? 1 : 0

                                  const pathData = `
                                    M 50 50
                                    L ${startX} ${startY}
                                    A 40 40 0 ${largeArcFlag} 1 ${endX} ${endY}
                                    Z
                                  `

                                  return (
                                    <TooltipProvider key={index}>
                                      <Tooltip>
                                        <TooltipTrigger asChild>
                                          <path
                                            d={pathData}
                                            fill={item.color}
                                            stroke="white"
                                            strokeWidth="1"
                                            onMouseEnter={() => setHoveredSegment(item.name)}
                                            onMouseLeave={() => setHoveredSegment(null)}
                                            style={{ cursor: "pointer" }}
                                          />
                                        </TooltipTrigger>
                                        <TooltipContent className="p-2 max-w-xs">
                                          <div className="space-y-1">
                                            <div className="font-medium">{item.koreanName}</div>
                                            <div className="text-sm">금액: {formatCurrency(item.rawValue)}</div>
                                            <div className="text-sm">비율: {item.value.toFixed(2)}%</div>
                                          </div>
                                        </TooltipContent>
                                      </Tooltip>
                                    </TooltipProvider>
                                  )
                                })
                              })()}

                              {/* 내부 원 (도넛 모양을 위한) */}
                              <circle cx="50" cy="50" r="25" fill="white" />
                            </svg>
                          </div>

                          {/* 자산 목록 */}
                          <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-3">
                            {chartData.map((item, index) => {
                              const holding = holdingsWithPrice.find(
                                h => h.market.replace("KRW-", "") === item.name
                              )

                              return (
                                <div key={index} className="flex items-center justify-between p-3 rounded-lg border">
                                  <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                                    <div>
                                      <p className="font-medium">{item.koreanName}</p>
                                      {holding && (
                                        <p className="text-xs text-muted-foreground">
                                          보유량: {formatAmount(holding.amount)}
                                        </p>
                                      )}
                                    </div>
                                  </div>
                                  <div className="text-right">
                                    <p className="font-medium">{formatCurrency(item.rawValue)}</p>
                                    <p className="text-xs text-muted-foreground">{item.value.toFixed(2)}%</p>
                                  </div>
                                </div>
                              )
                            })}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </>
              )}
            </TabsContent>

            <TabsContent value="holdings" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>보유 자산</CardTitle>
                  <CardDescription>현재 보유 중인 자산 목록</CardDescription>
                </CardHeader>
                <CardContent>
                  {portfolioLoading ? (
                    <div className="flex items-center justify-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
                    </div>
                  ) : holdingsWithPrice.length === 0 && cashBalance === 0 ? (
                    <div className="flex flex-col items-center justify-center py-8 text-center">
                      <Wallet className="h-10 w-10 text-muted-foreground mb-4" />
                      <h3 className="text-lg font-medium">보유 자산이 없습니다</h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        코인을 매수하거나 원화를 입금하면 이곳에 표시됩니다
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {/* 보유 자산 테이블 (공통 컴포넌트 사용) */}
                      <HoldingsTable
                        holdings={holdingsWithPrice}
                        totalBuyAmount={coinTotalBuyAmount}
                        totalEvaluationAmount={coinEvaluationAmount}
                        totalProfitAmount={totalProfitAmount}
                        emptyMessage="보유 중인 코인이 없습니다"
                        emptySubMessage="코인을 매수하면 이곳에 표시됩니다"
                      />
                      
                      {/* 원화 + 총합 행 (별도 표시) */}
                      <div className="rounded-md border">
                        <div className="grid grid-cols-7 gap-4 p-4 bg-muted/30">
                          <div className="font-medium">원화 (KRW)</div>
                          <div className="text-right">-</div>
                          <div className="text-right">-</div>
                          <div className="text-right">-</div>
                          <div className="text-right">-</div>
                          <div className="text-right font-medium">{formatCurrency(cashBalance)}</div>
                          <div className="text-right">-</div>
                        </div>
                        <div className="grid grid-cols-7 gap-4 p-4 bg-muted font-semibold border-t">
                          <div>총 자산</div>
                          <div className="text-right">-</div>
                          <div className="text-right">-</div>
                          <div className="text-right">-</div>
                          <div className="text-right">-</div>
                          <div className="text-right">{formatCurrency(totalAsset)}</div>
                          <div className={`text-right ${getProfitColorClass(totalProfitAmount)}`}>
                            {formatCurrency(totalProfitAmount, true)}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="history" className="space-y-4">
              <Card>
                <CardHeader>
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                      <CardTitle>자산 변동 내역</CardTitle>
                      <CardDescription>기간별 자산 변동 내역을 확인합니다. (추후 구현 예정)</CardDescription>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <Select value={historyPeriod} onValueChange={setHistoryPeriod}>
                        <SelectTrigger className="w-[120px]">
                          <SelectValue placeholder="기간 선택" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="daily">일별</SelectItem>
                          <SelectItem value="weekly">주별</SelectItem>
                          <SelectItem value="monthly">월별</SelectItem>
                          <SelectItem value="yearly">연도별</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="rounded-md border">
                    <div className="grid grid-cols-5 gap-4 p-4 font-medium text-sm bg-muted/50">
                      <div>기간</div>
                      <div className="text-right">총 자산</div>
                      <div className="text-right">원화 보유액</div>
                      <div className="text-right">코인 평가액</div>
                      <div className="text-right">변동률</div>
                    </div>
                    {historyData.map((item, index) => {
                      const change = "change" in item ? item.change : "dailyChange" in item ? item.dailyChange : 0

                      return (
                        <div key={index} className="grid grid-cols-5 gap-4 p-4 border-t">
                          <div>{"period" in item ? item.period : item.date}</div>
                          <div className="text-right">{formatCurrency(item.totalAsset)}</div>
                          <div className="text-right">{formatCurrency(item.cashBalance)}</div>
                          <div className="text-right">{formatCurrency(item.coinValue)}</div>
                          <div className="text-right">
                            <span className={getProfitColorClass(change)}>
                              {formatPercent(change)}
                            </span>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        )}
      </div>
    </AuthGuard>
  )
}
