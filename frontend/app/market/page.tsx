"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/components/auth-provider"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle, ArrowDown, ArrowUp, ExternalLink, Search } from "lucide-react"
import { LoginModal } from "@/components/login-modal"

// 더미 데이터
const dummyMarketData = [
  {
    market: "BTC-KRW",
    korean_name: "비트코인",
    english_name: "Bitcoin",
    current_price: 46000000,
    change: "RISE",
    change_rate: 0.025,
    change_price: 1150000,
    acc_trade_price_24h: 1250000000000,
    acc_trade_volume_24h: 27.5,
  },
  {
    market: "ETH-KRW",
    korean_name: "이더리움",
    english_name: "Ethereum",
    current_price: 3100000,
    change: "RISE",
    change_rate: 0.015,
    change_price: 46500,
    acc_trade_price_24h: 450000000000,
    acc_trade_volume_24h: 145.2,
  },
  {
    market: "XRP-KRW",
    korean_name: "리플",
    english_name: "Ripple",
    current_price: 750,
    change: "FALL",
    change_rate: 0.01,
    change_price: 7.5,
    acc_trade_price_24h: 125000000000,
    acc_trade_volume_24h: 166000000,
  },
  {
    market: "SOL-KRW",
    korean_name: "솔라나",
    english_name: "Solana",
    current_price: 150000,
    change: "RISE",
    change_rate: 0.05,
    change_price: 7500,
    acc_trade_price_24h: 85000000000,
    acc_trade_volume_24h: 566000,
  },
  {
    market: "ADA-KRW",
    korean_name: "에이다",
    english_name: "Cardano",
    current_price: 650,
    change: "FALL",
    change_rate: 0.02,
    change_price: 13,
    acc_trade_price_24h: 45000000000,
    acc_trade_volume_24h: 69000000,
  },
  {
    market: "DOGE-KRW",
    korean_name: "도지코인",
    english_name: "Dogecoin",
    current_price: 120,
    change: "EVEN",
    change_rate: 0,
    change_price: 0,
    acc_trade_price_24h: 25000000000,
    acc_trade_volume_24h: 208000000,
  },
  {
    market: "DOT-KRW",
    korean_name: "폴카닷",
    english_name: "Polkadot",
    current_price: 12500,
    change: "RISE",
    change_rate: 0.01,
    change_price: 125,
    acc_trade_price_24h: 18000000000,
    acc_trade_volume_24h: 1440000,
  },
  {
    market: "AVAX-KRW",
    korean_name: "아발란체",
    english_name: "Avalanche",
    current_price: 45000,
    change: "RISE",
    change_rate: 0.03,
    change_price: 1350,
    acc_trade_price_24h: 15000000000,
    acc_trade_volume_24h: 333000,
  },
]

export default function MarketPage() {
  const { isAuthenticated } = useAuth()
  const [showLoginModal, setShowLoginModal] = useState(false)
  const [marketData, setMarketData] = useState(dummyMarketData)
  const [searchTerm, setSearchTerm] = useState("")
  const [filteredData, setFilteredData] = useState(dummyMarketData)

  useEffect(() => {
    // 실제 구현에서는 WebSocket 연결로 실시간 데이터 가져오기
    // 여기서는 더미 데이터 사용 및 주기적 업데이트 시뮬레이션
    const interval = setInterval(() => {
      setMarketData((prev) =>
        prev.map((item) => ({
          ...item,
          current_price: item.current_price * (1 + (Math.random() * 0.01 - 0.005)),
          change: Math.random() > 0.5 ? "RISE" : Math.random() > 0.5 ? "FALL" : "EVEN",
          change_rate: Math.random() * 0.05,
          change_price: item.current_price * Math.random() * 0.05,
        })),
      )
    }, 5000)

    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    if (searchTerm) {
      setFilteredData(
        marketData.filter(
          (item) =>
            item.market.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.korean_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.english_name.toLowerCase().includes(searchTerm.toLowerCase()),
        ),
      )
    } else {
      setFilteredData(marketData)
    }
  }, [searchTerm, marketData])

  const handleCoinClick = (market: string) => {
    // 업비트 웹사이트의 해당 코인 차트 URL로 이동
    window.open(`https://upbit.com/exchange?code=CRIX.UPBIT.${market}`, "_blank")
  }

  const formatPrice = (price: number) => {
    if (price >= 1000000) {
      return `${(price / 1000000).toLocaleString(undefined, { maximumFractionDigits: 2 })}백만원`
    } else if (price >= 1000) {
      return `${(price / 1000).toLocaleString(undefined, { maximumFractionDigits: 2 })}천원`
    } else {
      return `${price.toLocaleString()}원`
    }
  }

  const formatVolume = (volume: number) => {
    if (volume >= 1000000000) {
      return `${(volume / 1000000000).toLocaleString(undefined, { maximumFractionDigits: 2 })}B`
    } else if (volume >= 1000000) {
      return `${(volume / 1000000).toLocaleString(undefined, { maximumFractionDigits: 2 })}M`
    } else if (volume >= 1000) {
      return `${(volume / 1000).toLocaleString(undefined, { maximumFractionDigits: 2 })}K`
    } else {
      return volume.toLocaleString()
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">실시간 시세</h1>

      {!isAuthenticated && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>로그인하면 더 많은 기능을 이용할 수 있습니다</AlertTitle>
          <AlertDescription>
            로그인하여 자동매매 시스템의 모든 기능을 이용해보세요.
            <LoginModal open={showLoginModal} onOpenChange={setShowLoginModal} />
          </AlertDescription>
        </Alert>
      )}

      <div className="flex items-center space-x-2">
        <Search className="h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="코인명 또는 심볼 검색"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm"
        />
      </div>

      <Tabs defaultValue="all" className="w-full">
        <TabsList>
          <TabsTrigger value="all">전체</TabsTrigger>
          <TabsTrigger value="rise">상승</TabsTrigger>
          <TabsTrigger value="fall">하락</TabsTrigger>
        </TabsList>
        <TabsContent value="all">
          <Card>
            <CardHeader>
              <CardTitle>전체 코인 시세</CardTitle>
              <CardDescription>실시간 코인 가격, 변동률, 거래량 정보</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <div className="grid grid-cols-7 gap-4 p-4 font-medium text-sm">
                  <div>코인명</div>
                  <div className="text-right">현재가</div>
                  <div className="text-right">변동률</div>
                  <div className="text-right">변동가</div>
                  <div className="text-right">거래대금</div>
                  <div className="text-right">거래량</div>
                  <div className="text-center">차트</div>
                </div>
                {filteredData.map((item) => (
                  <div
                    key={item.market}
                    className="grid grid-cols-7 gap-4 p-4 border-t hover:bg-muted/50 cursor-pointer"
                    onClick={() => handleCoinClick(item.market)}
                  >
                    <div className="flex flex-col">
                      <span className="font-medium">{item.korean_name}</span>
                      <span className="text-xs text-muted-foreground">{item.market}</span>
                    </div>
                    <div
                      className={`text-right font-medium ${
                        item.change === "RISE" ? "text-red-500" : item.change === "FALL" ? "text-blue-500" : ""
                      }`}
                    >
                      {item.current_price.toLocaleString()}원
                    </div>
                    <div className="text-right flex items-center justify-end">
                      {item.change === "RISE" ? (
                        <>
                          <ArrowUp className="h-4 w-4 text-red-500 mr-1" />
                          <span className="text-red-500">{(item.change_rate * 100).toFixed(2)}%</span>
                        </>
                      ) : item.change === "FALL" ? (
                        <>
                          <ArrowDown className="h-4 w-4 text-blue-500 mr-1" />
                          <span className="text-blue-500">{(item.change_rate * 100).toFixed(2)}%</span>
                        </>
                      ) : (
                        <span>0.00%</span>
                      )}
                    </div>
                    <div
                      className={`text-right ${
                        item.change === "RISE" ? "text-red-500" : item.change === "FALL" ? "text-blue-500" : ""
                      }`}
                    >
                      {item.change_price.toLocaleString()}원
                    </div>
                    <div className="text-right">{formatPrice(item.acc_trade_price_24h)}</div>
                    <div className="text-right">{formatVolume(item.acc_trade_volume_24h)}</div>
                    <div className="flex items-center justify-center">
                      <Badge variant="outline" className="cursor-pointer">
                        <ExternalLink className="h-3 w-3 mr-1" />
                        차트
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="rise">
          <Card>
            <CardHeader>
              <CardTitle>상승 코인</CardTitle>
              <CardDescription>가격이 상승 중인 코인 목록</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <div className="grid grid-cols-7 gap-4 p-4 font-medium text-sm">
                  <div>코인명</div>
                  <div className="text-right">현재가</div>
                  <div className="text-right">변동률</div>
                  <div className="text-right">변동가</div>
                  <div className="text-right">거래대금</div>
                  <div className="text-right">거래량</div>
                  <div className="text-center">차트</div>
                </div>
                {filteredData
                  .filter((item) => item.change === "RISE")
                  .map((item) => (
                    <div
                      key={item.market}
                      className="grid grid-cols-7 gap-4 p-4 border-t hover:bg-muted/50 cursor-pointer"
                      onClick={() => handleCoinClick(item.market)}
                    >
                      <div className="flex flex-col">
                        <span className="font-medium">{item.korean_name}</span>
                        <span className="text-xs text-muted-foreground">{item.market}</span>
                      </div>
                      <div className="text-right font-medium text-red-500">{item.current_price.toLocaleString()}원</div>
                      <div className="text-right flex items-center justify-end">
                        <ArrowUp className="h-4 w-4 text-red-500 mr-1" />
                        <span className="text-red-500">{(item.change_rate * 100).toFixed(2)}%</span>
                      </div>
                      <div className="text-right text-red-500">{item.change_price.toLocaleString()}원</div>
                      <div className="text-right">{formatPrice(item.acc_trade_price_24h)}</div>
                      <div className="text-right">{formatVolume(item.acc_trade_volume_24h)}</div>
                      <div className="flex items-center justify-center">
                        <Badge variant="outline" className="cursor-pointer">
                          <ExternalLink className="h-3 w-3 mr-1" />
                          차트
                        </Badge>
                      </div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="fall">
          <Card>
            <CardHeader>
              <CardTitle>하락 코인</CardTitle>
              <CardDescription>가격이 하락 중인 코인 목록</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <div className="grid grid-cols-7 gap-4 p-4 font-medium text-sm">
                  <div>코인명</div>
                  <div className="text-right">현재가</div>
                  <div className="text-right">변동률</div>
                  <div className="text-right">변동가</div>
                  <div className="text-right">거래대금</div>
                  <div className="text-right">거래량</div>
                  <div className="text-center">차트</div>
                </div>
                {filteredData
                  .filter((item) => item.change === "FALL")
                  .map((item) => (
                    <div
                      key={item.market}
                      className="grid grid-cols-7 gap-4 p-4 border-t hover:bg-muted/50 cursor-pointer"
                      onClick={() => handleCoinClick(item.market)}
                    >
                      <div className="flex flex-col">
                        <span className="font-medium">{item.korean_name}</span>
                        <span className="text-xs text-muted-foreground">{item.market}</span>
                      </div>
                      <div className="text-right font-medium text-blue-500">
                        {item.current_price.toLocaleString()}원
                      </div>
                      <div className="text-right flex items-center justify-end">
                        <ArrowDown className="h-4 w-4 text-blue-500 mr-1" />
                        <span className="text-blue-500">{(item.change_rate * 100).toFixed(2)}%</span>
                      </div>
                      <div className="text-right text-blue-500">{item.change_price.toLocaleString()}원</div>
                      <div className="text-right">{formatPrice(item.acc_trade_price_24h)}</div>
                      <div className="text-right">{formatVolume(item.acc_trade_volume_24h)}</div>
                      <div className="flex items-center justify-center">
                        <Badge variant="outline" className="cursor-pointer">
                          <ExternalLink className="h-3 w-3 mr-1" />
                          차트
                        </Badge>
                      </div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
