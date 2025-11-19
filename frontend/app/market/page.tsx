"use client"

import { useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowDown, ArrowUp, ExternalLink, Search, TrendingUp, TrendingDown, Minus } from "lucide-react"
import { useMarkets } from "@/hooks/queries/useMarkets"
import { useFilterStore } from "@/stores"
import { LoadingSpinner } from "@/components/common"
import type { MarketData } from "@/types"

export default function MarketPage() {
  // React Query로 실시간 시세 조회 (WebSocket 자동 연결)
  const { data: markets = [], isLoading } = useMarkets()
  
  // Zustand 필터 상태
  const { market: filter, setMarketSearch } = useFilterStore()
  
  // 검색 필터링
  const filteredMarkets = useMemo(() => {
    if (!filter.searchTerm) return markets
    
    const searchLower = filter.searchTerm.toLowerCase()
    return markets.filter(
      (item) =>
        item.market.toLowerCase().includes(searchLower) ||
        item.koreanName.toLowerCase().includes(searchLower) ||
        item.englishName.toLowerCase().includes(searchLower)
    )
  }, [markets, filter.searchTerm])
  
  // 탭별 필터링
  const riseMarkets = useMemo(() => 
    filteredMarkets.filter(m => m.change === 'RISE'),
    [filteredMarkets]
  )
  
  const fallMarkets = useMemo(() => 
    filteredMarkets.filter(m => m.change === 'FALL'),
    [filteredMarkets]
  )
  
  const handleCoinClick = (market: string) => {
    // 업비트 웹사이트의 해당 코인 차트 URL로 이동
    window.open(`https://upbit.com/exchange?code=CRIX.UPBIT.${market}`, "_blank")
  }

  const formatPrice = (price: number) => {
    if (price >= 1000000) {
      return `${(price / 1000000).toLocaleString(undefined, { maximumFractionDigits: 2 })}백만`
    } else if (price >= 1000) {
      return `${(price / 1000).toLocaleString(undefined, { maximumFractionDigits: 2 })}천`
    }
    return price.toLocaleString()
  }

  const formatVolume = (volume: number) => {
    if (volume >= 1000000000) {
      return `${(volume / 1000000000).toLocaleString(undefined, { maximumFractionDigits: 2 })}B`
    } else if (volume >= 1000000) {
      return `${(volume / 1000000).toLocaleString(undefined, { maximumFractionDigits: 2 })}M`
    } else if (volume >= 1000) {
      return `${(volume / 1000).toLocaleString(undefined, { maximumFractionDigits: 2 })}K`
    }
    return volume.toLocaleString()
  }

  const renderChangeIcon = (change: string) => {
    switch (change) {
      case 'RISE':
        return <TrendingUp className="h-4 w-4 text-red-500" />
      case 'FALL':
        return <TrendingDown className="h-4 w-4 text-blue-500" />
      default:
        return <Minus className="h-4 w-4 text-gray-500" />
    }
  }

  const renderMarketList = (data: MarketData[]) => {
    if (data.length === 0) {
      return (
        <div className="p-8 text-center text-muted-foreground">
          검색 결과가 없습니다.
        </div>
      )
    }

    return (
      <div className="rounded-md border">
        <div className="grid grid-cols-7 gap-4 p-4 font-medium text-sm bg-muted/50">
          <div>코인명</div>
          <div className="text-right">현재가</div>
          <div className="text-right">변동률</div>
          <div className="text-right">변동가</div>
          <div className="text-right">거래대금(24h)</div>
          <div className="text-right">거래량(24h)</div>
          <div className="text-center">차트</div>
        </div>
        {data.map((item) => (
          <div
            key={item.market}
            className="grid grid-cols-7 gap-4 p-4 border-t hover:bg-muted/50 cursor-pointer transition-colors"
            onClick={() => handleCoinClick(item.market)}
          >
            <div className="flex flex-col">
              <span className="font-medium">{item.koreanName}</span>
              <span className="text-xs text-muted-foreground">{item.market}</span>
            </div>
            <div
              className={`text-right font-medium ${
                item.change === "RISE" 
                  ? "text-red-500" 
                  : item.change === "FALL" 
                  ? "text-blue-500" 
                  : ""
              }`}
            >
              {item.currentPrice.toLocaleString()}원
            </div>
            <div className="text-right flex items-center justify-end gap-1">
              {renderChangeIcon(item.change)}
              <span
                className={
                  item.change === "RISE"
                    ? "text-red-500"
                    : item.change === "FALL"
                    ? "text-blue-500"
                    : ""
                }
              >
                {item.changeRate.toFixed(2)}%
              </span>
            </div>
            <div
              className={`text-right ${
                item.change === "RISE" 
                  ? "text-red-500" 
                  : item.change === "FALL" 
                  ? "text-blue-500" 
                  : ""
              }`}
            >
              {item.changePrice > 0 ? '+' : ''}{item.changePrice.toLocaleString()}
            </div>
            <div className="text-right text-sm">
              {formatPrice(item.accTradePrice24h)}원
            </div>
            <div className="text-right text-sm">
              {formatVolume(item.accTradeVolume24h)}
            </div>
            <div className="flex items-center justify-center">
              <Badge variant="outline" className="cursor-pointer hover:bg-muted">
                <ExternalLink className="h-3 w-3 mr-1" />
                차트
              </Badge>
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (isLoading) {
    return <LoadingSpinner />
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">실시간 시세</h1>
          <p className="text-sm text-muted-foreground mt-1">
            업비트 API 실시간 WebSocket 연동
          </p>
        </div>
        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
          <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse" />
          실시간 업데이트
        </Badge>
      </div>

      <div className="flex items-center space-x-2">
        <Search className="h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="코인명 또는 심볼 검색 (예: 비트코인, BTC)"
          value={filter.searchTerm}
          onChange={(e) => setMarketSearch(e.target.value)}
          className="max-w-sm"
        />
      </div>

      <Tabs defaultValue="all" className="w-full">
        <TabsList>
          <TabsTrigger value="all">
            전체 ({filteredMarkets.length})
          </TabsTrigger>
          <TabsTrigger value="rise" className="text-red-500">
            <TrendingUp className="h-4 w-4 mr-1" />
            상승 ({riseMarkets.length})
          </TabsTrigger>
          <TabsTrigger value="fall" className="text-blue-500">
            <TrendingDown className="h-4 w-4 mr-1" />
            하락 ({fallMarkets.length})
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="all">
          <Card>
            <CardHeader>
              <CardTitle>전체 코인 시세</CardTitle>
              <CardDescription>
                실시간 코인 가격, 변동률, 거래량 정보 (총 {filteredMarkets.length}개)
              </CardDescription>
            </CardHeader>
            <CardContent>
              {renderMarketList(filteredMarkets)}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="rise">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-red-500">
                <TrendingUp className="h-5 w-5 mr-2" />
                상승 코인
              </CardTitle>
              <CardDescription>
                가격이 상승 중인 코인 목록 ({riseMarkets.length}개)
              </CardDescription>
            </CardHeader>
            <CardContent>
              {renderMarketList(riseMarkets)}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="fall">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-blue-500">
                <TrendingDown className="h-5 w-5 mr-2" />
                하락 코인
              </CardTitle>
              <CardDescription>
                가격이 하락 중인 코인 목록 ({fallMarkets.length}개)
              </CardDescription>
            </CardHeader>
            <CardContent>
              {renderMarketList(fallMarkets)}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
