"use client"

import { useState, useEffect, useCallback } from "react"
import { useAuth } from "@/components/auth-provider"
import { useApi } from "@/lib/api-context"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import {
  AlertCircle,
  ArrowDown,
  ArrowUp,
  Calendar,
  DollarSign,
  Key,
  LineChart,
  TrendingDown,
  TrendingUp,
  Wallet,
} from "lucide-react"
import { LoginModal } from "@/components/login-modal"

// 타입 정의
interface Holding {
  market: string
  korean_name: string
  amount: number
  avg_buy_price: number
  current_price: number
}

interface Portfolio {
  totalAsset: number
  cashBalance: number
  coinValue: number
  dailyProfitRate: number
  weeklyProfitRate: number
  monthlyProfitRate: number
  holdings: Holding[]
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

interface ChartDataItem {
  name: string
  value: number
  rawValue: number
  color: string
}

// 더미 데이터
const dummyPortfolio: Portfolio = {
  totalAsset: 3963550,
  cashBalance: 1500000,
  coinValue: 2463550,
  dailyProfitRate: 2.5,
  weeklyProfitRate: -1.2,
  monthlyProfitRate: 5.8,
  holdings: [
    { market: "BTC-KRW", korean_name: "비트코인", amount: 0.01, avg_buy_price: 45000000, current_price: 47355000 },
    { market: "ETH-KRW", korean_name: "이더리움", amount: 0.4, avg_buy_price: 3000000, current_price: 3125000 },
    { market: "XRP-KRW", korean_name: "리플", amount: 650, avg_buy_price: 700, current_price: 769 },
    { market: "SOL-KRW", korean_name: "솔라나", amount: 1.5, avg_buy_price: 150000, current_price: 160000 },
  ],
}

// 더미 자산 변동 내역 데이터
const dummyAssetHistory: AssetHistoryItem[] = [
  { date: "2023-06-21", totalAsset: 1250000, cashBalance: 500000, coinValue: 750000, dailyChange: 1.21 },
  { date: "2023-06-20", totalAsset: 1235000, cashBalance: 450000, coinValue: 785000, dailyChange: -0.4 },
  { date: "2023-06-19", totalAsset: 1240000, cashBalance: 450000, coinValue: 790000, dailyChange: 0.81 },
  { date: "2023-06-18", totalAsset: 1230000, cashBalance: 450000, coinValue: 780000, dailyChange: 1.65 },
  { date: "2023-06-17", totalAsset: 1210000, cashBalance: 450000, coinValue: 760000, dailyChange: -0.82 },
  { date: "2023-06-16", totalAsset: 1220000, cashBalance: 450000, coinValue: 770000, dailyChange: 1.67 },
  { date: "2023-06-15", totalAsset: 1200000, cashBalance: 450000, coinValue: 750000, dailyChange: 2.5 },
]

// 주간 자산 변동 내역 데이터
const dummyWeeklyHistory: PeriodHistoryItem[] = [
  { period: "2023-06-15 ~ 2023-06-21", totalAsset: 1250000, cashBalance: 500000, coinValue: 750000, change: 5.93 },
  { period: "2023-06-08 ~ 2023-06-14", totalAsset: 1180000, cashBalance: 420000, coinValue: 760000, change: 2.61 },
  { period: "2023-06-01 ~ 2023-06-07", totalAsset: 1150000, cashBalance: 400000, coinValue: 750000, change: 3.5 },
]

// 월간 자산 변동 내역 데이터
const dummyMonthlyHistory: PeriodHistoryItem[] = [
  { period: "2023-06", totalAsset: 1250000, cashBalance: 500000, coinValue: 750000, change: 5.93 },
  { period: "2023-05", totalAsset: 1180000, cashBalance: 420000, coinValue: 760000, change: 7.27 },
  { period: "2023-04", totalAsset: 1100000, cashBalance: 350000, coinValue: 750000, change: 10.0 },
]

// 연간 자산 변동 내역 데이터
const dummyYearlyHistory: PeriodHistoryItem[] = [
  { period: "2023", totalAsset: 1250000, cashBalance: 500000, coinValue: 750000, change: 25.0 },
  { period: "2022", totalAsset: 1000000, cashBalance: 300000, coinValue: 700000, change: 25.0 },
  { period: "2021", totalAsset: 800000, cashBalance: 200000, coinValue: 600000, change: 60.0 },
]

export default function PortfolioPage() {
  const { isAuthenticated } = useAuth()
  const { apiKeyState } = useApi()
  const [showLoginModal, setShowLoginModal] = useState<boolean>(false)
  const [portfolio, setPortfolio] = useState<Portfolio>(dummyPortfolio)
  const [historyPeriod, setHistoryPeriod] = useState<string>("daily")
  const [hoveredSegment, setHoveredSegment] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    if (!isAuthenticated || !apiKeyState.hasApiKey) {
      return
    }

    // 실제 구현에서는 API 호출로 포트폴리오 데이터 가져오기
    // 여기서는 더미 데이터 사용
  }, [isAuthenticated, apiKeyState.hasApiKey])

  // 자산 분포 계산
  const calculateDistribution = useCallback(() => {
    const total = portfolio.totalAsset
    const cashPercentage = (portfolio.cashBalance / total) * 100

    const coinDistribution = portfolio.holdings.map((coin) => {
      const value = coin.amount * coin.current_price
      const percentage = (value / total) * 100
      return {
        name: coin.korean_name,
        market: coin.market,
        value,
        percentage,
        rawValue: value,
      }
    })

    return {
      cash: {
        name: "원화",
        value: portfolio.cashBalance,
        percentage: cashPercentage,
        rawValue: portfolio.cashBalance,
      },
      coins: coinDistribution,
    }
  }, [portfolio])

  const distribution = calculateDistribution()

  // 파이 차트 데이터 준비
  const prepareChartData = useCallback((): ChartDataItem[] => {
    const data: ChartDataItem[] = [
      {
        name: "KRW",
        value: distribution.cash.percentage,
        rawValue: distribution.cash.value,
        color: "#94a3b8", // slate-400
      },
    ]

    // 색상 배열
    const colors = [
      "#f97316", // orange-500 (BTC)
      "#a855f7", // purple-500 (ETH)
      "#3b82f6", // blue-500 (XRP)
      "#22c55e", // green-500 (SOL)
    ]

    distribution.coins.forEach((coin, index) => {
      data.push({
        name: coin.market.split("-")[0], // 'BTC-KRW'에서 'BTC'만 추출
        value: coin.percentage,
        rawValue: coin.value,
        color: colors[index % colors.length],
      })
    })

    return data
  }, [distribution])

  const chartData = prepareChartData()

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

  // 파이 차트 세그먼트에 마우스 오버 핸들러
  const handleSegmentHover = (segmentName: string | null) => {
    setHoveredSegment(segmentName)
  }

  // 코인 이름 찾기 (파이 차트 툴팁용)
  const findCoinInfo = (symbol: string): { name: string; amount: number } | null => {
    if (symbol === "KRW") {
      return { name: "원화", amount: 0 }
    }

    const coin = portfolio.holdings.find((h) => h.market.startsWith(symbol))
    return coin ? { name: coin.korean_name, amount: coin.amount } : null
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">자산 현황</h1>
        <Button onClick={() => router.push("/")} variant="outline">
          대시보드로 돌아가기
        </Button>
      </div>

      {!isAuthenticated && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>로그인이 필요합니다</AlertTitle>
          <AlertDescription>
            자산 현황을 확인하기 위해 로그인해주세요.
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

      {isAuthenticated && !apiKeyState.hasApiKey ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <Key className="h-16 w-16 text-amber-500 mb-6" />
          <h2 className="text-2xl font-bold mb-2">API 키 등록이 필요합니다</h2>
          <p className="text-muted-foreground mb-6 max-w-md">
            실제 자산 현황을 확인하기 위해 업비트 API 키를 등록해주세요.
          </p>
          <Button onClick={() => router.push("/mypage")}>API 키 등록하기</Button>
        </div>
      ) : !isAuthenticated ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <Wallet className="h-16 w-16 text-muted-foreground mb-6" />
          <h2 className="text-2xl font-bold mb-2">자산 현황을 확인하려면 로그인하세요</h2>
          <p className="text-muted-foreground mb-6 max-w-md">
            로그인하여 보유 자산, 수익률, 포트폴리오 분석 등 다양한 정보를 확인하세요.
          </p>
          <Button onClick={() => setShowLoginModal(true)}>로그인하기</Button>
        </div>
      ) : (
        <Tabs defaultValue="portfolio" className="w-full">
          <TabsList>
            <TabsTrigger value="portfolio">포트폴리오</TabsTrigger>
            <TabsTrigger value="holdings">보유 자산</TabsTrigger>
            <TabsTrigger value="history">자산 변동 내역</TabsTrigger>
          </TabsList>

          <TabsContent value="portfolio" className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">총 자산</CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{portfolio.totalAsset.toLocaleString()}원</div>
                  <p className="text-xs text-muted-foreground mt-2">원화 + 코인 평가금액</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">원화 보유액</CardTitle>
                  <Wallet className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{portfolio.cashBalance.toLocaleString()}원</div>
                  <p className="text-xs text-muted-foreground mt-2">사용 가능한 원화 잔액</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">코인 평가액</CardTitle>
                  <LineChart className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{portfolio.coinValue.toLocaleString()}원</div>
                  <p className="text-xs text-muted-foreground mt-2">보유 코인의 현재 평가 금액</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">일일 수익률</CardTitle>
                  {portfolio.dailyProfitRate > 0 ? (
                    <TrendingUp className="h-4 w-4 text-green-500" />
                  ) : portfolio.dailyProfitRate < 0 ? (
                    <TrendingDown className="h-4 w-4 text-red-500" />
                  ) : (
                    <LineChart className="h-4 w-4 text-muted-foreground" />
                  )}
                </CardHeader>
                <CardContent>
                  <div
                    className={`text-2xl font-bold ${
                      portfolio.dailyProfitRate > 0
                        ? "text-green-500"
                        : portfolio.dailyProfitRate < 0
                          ? "text-red-500"
                          : ""
                    }`}
                  >
                    {portfolio.dailyProfitRate > 0 ? "+" : ""}
                    {portfolio.dailyProfitRate}%
                  </div>
                  <div className="flex items-center text-xs text-muted-foreground mt-2 space-x-2">
                    <div className="flex items-center">
                      <span>주간:</span>
                      <span
                        className={
                          portfolio.weeklyProfitRate > 0
                            ? "text-green-500"
                            : portfolio.weeklyProfitRate < 0
                              ? "text-red-500"
                              : ""
                        }
                      >
                        {portfolio.weeklyProfitRate > 0 ? "+" : ""}
                        {portfolio.weeklyProfitRate}%
                      </span>
                    </div>
                    <div className="flex items-center">
                      <span>월간:</span>
                      <span
                        className={
                          portfolio.monthlyProfitRate > 0
                            ? "text-green-500"
                            : portfolio.monthlyProfitRate < 0
                              ? "text-red-500"
                              : ""
                        }
                      >
                        {portfolio.monthlyProfitRate > 0 ? "+" : ""}
                        {portfolio.monthlyProfitRate}%
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>자산 분포</CardTitle>
                <CardDescription>현재 보유 중인 자산의 분포 비율</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col lg:flex-row gap-8 items-start">
                  {/* 도넛 차트 */}
                  <div className="w-72 h-72 relative mx-auto lg:mx-0">
                    <div className="absolute inset-0 flex items-center justify-center flex-col">
                      <p className="text-sm text-muted-foreground">총 자산</p>
                      <p className="text-xl font-bold">₩{portfolio.totalAsset.toLocaleString()}</p>
                    </div>
                    <svg width="100%" height="100%" viewBox="0 0 100 100">
                      <circle cx="50" cy="50" r="40" fill="white" stroke="#e2e8f0" strokeWidth="1" />

                      {/* 파이 차트 섹션들 */}
                      {(() => {
                        let cumulativePercentage = 0

                        return chartData.map((item, index) => {
                          const startAngle = cumulativePercentage * 3.6 // 360 / 100 = 3.6
                          cumulativePercentage += item.value
                          const endAngle = cumulativePercentage * 3.6

                          // SVG 원호를 위한 좌표 계산
                          const startX = 50 + 40 * Math.cos(((startAngle - 90) * Math.PI) / 180)
                          const startY = 50 + 40 * Math.sin(((startAngle - 90) * Math.PI) / 180)
                          const endX = 50 + 40 * Math.cos(((endAngle - 90) * Math.PI) / 180)
                          const endY = 50 + 40 * Math.sin(((endAngle - 90) * Math.PI) / 180)

                          // 큰 호인지 여부 (180도 이상인 경우)
                          const largeArcFlag = endAngle - startAngle > 180 ? 1 : 0

                          // 원호 경로
                          const pathData = `
                            M 50 50
                            L ${startX} ${startY}
                            A 40 40 0 ${largeArcFlag} 1 ${endX} ${endY}
                            Z
                          `

                          const coinInfo = findCoinInfo(item.name)

                          return (
                            <TooltipProvider key={index}>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <path
                                    d={pathData}
                                    fill={item.color}
                                    stroke="white"
                                    strokeWidth="1"
                                    onMouseEnter={() => handleSegmentHover(item.name)}
                                    onMouseLeave={() => handleSegmentHover(null)}
                                    style={{ cursor: "pointer" }}
                                  />
                                </TooltipTrigger>
                                <TooltipContent className="p-2 max-w-xs">
                                  <div className="space-y-1">
                                    <div className="font-medium">{item.name === "KRW" ? "원화" : coinInfo?.name}</div>
                                    {item.name !== "KRW" && coinInfo && (
                                      <div className="text-sm">보유량: {coinInfo.amount}</div>
                                    )}
                                    <div className="text-sm">금액: ₩{item.rawValue.toLocaleString()}</div>
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
                      const coinInfo = findCoinInfo(item.name)

                      return (
                        <div key={index} className="flex items-center justify-between p-3 rounded-lg border">
                          <div className="flex items-center gap-2">
                            <div className={`w-3 h-3 rounded-full`} style={{ backgroundColor: item.color }}></div>
                            <div>
                              <p className="font-medium">{item.name}</p>
                              {item.name !== "KRW" && coinInfo && (
                                <p className="text-xs text-muted-foreground">보유량: {coinInfo.amount}</p>
                              )}
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-medium">₩{item.rawValue.toLocaleString()}</p>
                            <p className="text-xs text-muted-foreground">{item.value.toFixed(2)}%</p>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="holdings" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>보유 자산</CardTitle>
                <CardDescription>현재 보유 중인 자산 목록</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border">
                  <div className="grid grid-cols-7 gap-4 p-4 font-medium text-sm">
                    <div>코인명</div>
                    <div className="text-right">보유수량</div>
                    <div className="text-right">매수평균가</div>
                    <div className="text-right">현재가</div>
                    <div className="text-right">평가금액</div>
                    <div className="text-right">매수금액</div>
                    <div className="text-right">평가손익</div>
                  </div>

                  {portfolio.holdings.map((coin) => {
                    const currentValue = coin.amount * coin.current_price
                    const buyValue = coin.amount * coin.avg_buy_price
                    const profit = currentValue - buyValue
                    const profitRate = (profit / buyValue) * 100

                    return (
                      <div key={coin.market} className="grid grid-cols-7 gap-4 p-4 border-t">
                        <div className="flex flex-col">
                          <span className="font-medium">{coin.korean_name}</span>
                          <span className="text-xs text-muted-foreground">{coin.market}</span>
                        </div>
                        <div className="text-right">{coin.amount}</div>
                        <div className="text-right">{coin.avg_buy_price.toLocaleString()}원</div>
                        <div className="text-right">{coin.current_price.toLocaleString()}원</div>
                        <div className="text-right">{currentValue.toLocaleString()}원</div>
                        <div className="text-right">{buyValue.toLocaleString()}원</div>
                        <div className="text-right">
                          <div
                            className={`font-medium ${profit > 0 ? "text-green-500" : profit < 0 ? "text-red-500" : ""}`}
                          >
                            {profit > 0 ? "+" : ""}
                            {profit.toLocaleString()}원
                          </div>
                          <div
                            className={`text-xs ${profitRate > 0 ? "text-green-500" : profitRate < 0 ? "text-red-500" : ""}`}
                          >
                            {profitRate > 0 ? "+" : ""}
                            {profitRate.toFixed(2)}%
                          </div>
                        </div>
                      </div>
                    )
                  })}

                  <div className="grid grid-cols-7 gap-4 p-4 border-t bg-muted/50 font-medium">
                    <div>원화</div>
                    <div className="text-right">-</div>
                    <div className="text-right">-</div>
                    <div className="text-right">-</div>
                    <div className="text-right">{portfolio.cashBalance.toLocaleString()}원</div>
                    <div className="text-right">-</div>
                    <div className="text-right">-</div>
                  </div>

                  <div className="grid grid-cols-7 gap-4 p-4 border-t bg-muted font-medium">
                    <div>총합</div>
                    <div className="text-right">-</div>
                    <div className="text-right">-</div>
                    <div className="text-right">-</div>
                    <div className="text-right">{portfolio.totalAsset.toLocaleString()}원</div>
                    <div className="text-right">-</div>
                    <div className="text-right">
                      {portfolio.dailyProfitRate > 0 ? (
                        <Badge className="bg-green-500">
                          <ArrowUp className="h-3 w-3 mr-1" />
                          {portfolio.dailyProfitRate}%
                        </Badge>
                      ) : portfolio.dailyProfitRate < 0 ? (
                        <Badge className="bg-red-500">
                          <ArrowDown className="h-3 w-3 mr-1" />
                          {Math.abs(portfolio.dailyProfitRate)}%
                        </Badge>
                      ) : (
                        <Badge variant="outline">0.00%</Badge>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="history" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div>
                    <CardTitle>자산 변동 내역</CardTitle>
                    <CardDescription>기간별 자산 변동 내역을 확인합니다.</CardDescription>
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
                  <div className="grid grid-cols-5 gap-4 p-4 font-medium text-sm">
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
                        <div className="text-right">{item.totalAsset.toLocaleString()}원</div>
                        <div className="text-right">{item.cashBalance.toLocaleString()}원</div>
                        <div className="text-right">{item.coinValue.toLocaleString()}원</div>
                        <div className="text-right">
                          <span className={change > 0 ? "text-green-500" : change < 0 ? "text-red-500" : ""}>
                            {change > 0 ? "+" : ""}
                            {change.toFixed(2)}%
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

      <LoginModal open={showLoginModal} onOpenChange={setShowLoginModal} />
    </div>
  )
}
