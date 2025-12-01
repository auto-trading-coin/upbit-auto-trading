"use client"

import { useMemo, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowDown, ArrowUp, ArrowUpDown, ExternalLink, Search, TrendingUp, TrendingDown, Minus, Languages } from "lucide-react"
import { useMarkets } from "@/hooks/queries/useMarkets"
import { useFilterStore } from "@/stores"
import { LoadingSpinner } from "@/components/common"
import { useIsMounted } from "@/hooks/useIsMounted"
import type { MarketData } from "@/types"

type SortKey = 'name' | 'price' | 'changeRate' | 'changePrice' | 'tradePrice' | 'tradeVolume'
type SortOrder = 'asc' | 'desc'

export default function MarketPage() {
  // 클라이언트 마운트 확인 (Hydration mismatch 방지)
  const isMounted = useIsMounted()
  
  // React Query로 실시간 시세 조회 (WebSocket 자동 연결)
  const { data: markets = [], isLoading } = useMarkets()
  
  // Zustand 필터 상태
  const { market: filter, setMarketSearch } = useFilterStore()
  
  // 정렬 상태
  const [sortKey, setSortKey] = useState<SortKey>('tradePrice') // 기본: 거래대금 순
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc') // 기본: 내림차순
  
  // 코인명 표시 형식 (한글/영문)
  const [showKoreanName, setShowKoreanName] = useState(true)
  
  // 정렬 핸들러
  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      // 같은 컬럼 클릭 시 정렬 방향 변경
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      // 다른 컬럼 클릭 시 해당 컬럼으로 정렬 (내림차순 기본)
      setSortKey(key)
      setSortOrder('desc')
    }
  }
  
  // 코인명 토글
  const handleToggleName = () => {
    setShowKoreanName(!showKoreanName)
  }
  
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
  
  // 정렬 적용
  const sortedMarkets = useMemo(() => {
    const sorted = [...filteredMarkets]
    
    sorted.sort((a, b) => {
      let compareA: number | string = 0
      let compareB: number | string = 0
      
      switch (sortKey) {
        case 'name':
          compareA = showKoreanName ? a.koreanName : a.englishName
          compareB = showKoreanName ? b.koreanName : b.englishName
          break
        case 'price':
          compareA = a.currentPrice
          compareB = b.currentPrice
          break
        case 'changeRate':
          compareA = a.change === 'RISE' ? a.changeRate : a.change === 'FALL' ? -a.changeRate : 0
          compareB = b.change === 'RISE' ? b.changeRate : b.change === 'FALL' ? -b.changeRate : 0
          break
        case 'changePrice':
          compareA = a.change === 'RISE' ? a.changePrice : a.change === 'FALL' ? -a.changePrice : 0
          compareB = b.change === 'RISE' ? b.changePrice : b.change === 'FALL' ? -b.changePrice : 0
          break
        case 'tradePrice':
          compareA = a.accTradePrice24h
          compareB = b.accTradePrice24h
          break
        case 'tradeVolume':
          compareA = a.accTradeVolume24h
          compareB = b.accTradeVolume24h
          break
      }
      
      if (typeof compareA === 'string' && typeof compareB === 'string') {
        return sortOrder === 'asc' 
          ? compareA.localeCompare(compareB, 'ko')
          : compareB.localeCompare(compareA, 'ko')
      }
      
      return sortOrder === 'asc' 
        ? (compareA as number) - (compareB as number)
        : (compareB as number) - (compareA as number)
    })
    
    return sorted
  }, [filteredMarkets, sortKey, sortOrder, showKoreanName])
  
  // 탭별 필터링 (정렬된 데이터 기준)
  const riseMarkets = useMemo(() => 
    sortedMarkets.filter(m => m.change === 'RISE'),
    [sortedMarkets]
  )
  
  const fallMarkets = useMemo(() => 
    sortedMarkets.filter(m => m.change === 'FALL'),
    [sortedMarkets]
  )
  
  const handleCoinClick = (market: string) => {
    // 업비트 웹사이트의 해당 코인 차트 URL로 이동
    window.open(`https://upbit.com/exchange?code=CRIX.UPBIT.${market}`, "_blank")
  }

  const formatPrice = (price: number) => {
    if (price >= 100000000) {
      return `${(price / 100000000).toLocaleString(undefined, { maximumFractionDigits: 2 })}억원`
    } else if (price >= 10000) {
      return `${(price / 10000).toLocaleString(undefined, { maximumFractionDigits: 2 })}만원`
    }
    return `${price.toLocaleString()}원`
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
  
  // 정렬 아이콘 렌더링
  const renderSortIcon = (key: SortKey) => {
    if (sortKey !== key) {
      return <ArrowUpDown className="h-3 w-3 ml-1 text-muted-foreground" />
    }
    return sortOrder === 'asc' 
      ? <ArrowUp className="h-3 w-3 ml-1" />
      : <ArrowDown className="h-3 w-3 ml-1" />
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
        {/* 테이블 헤더 */}
        <div className="grid grid-cols-7 gap-4 p-4 font-medium text-sm bg-muted/50">
          <div 
            className={`flex items-center cursor-pointer hover:text-primary transition-colors ${
              sortKey === 'name' ? 'text-primary font-semibold' : ''
            }`}
            onClick={() => handleSort('name')}
          >
            코인명
            {renderSortIcon('name')}
          </div>
          <div 
            className={`text-right flex items-center justify-end cursor-pointer hover:text-primary transition-colors ${
              sortKey === 'price' ? 'text-primary font-semibold' : ''
            }`}
            onClick={() => handleSort('price')}
          >
            현재가
            {renderSortIcon('price')}
          </div>
          <div 
            className={`text-right flex items-center justify-end cursor-pointer hover:text-primary transition-colors ${
              sortKey === 'changeRate' ? 'text-primary font-semibold' : ''
            }`}
            onClick={() => handleSort('changeRate')}
          >
            변동률
            {renderSortIcon('changeRate')}
          </div>
          <div 
            className={`text-right flex items-center justify-end cursor-pointer hover:text-primary transition-colors ${
              sortKey === 'changePrice' ? 'text-primary font-semibold' : ''
            }`}
            onClick={() => handleSort('changePrice')}
          >
            변동가
            {renderSortIcon('changePrice')}
          </div>
          <div 
            className={`text-right flex items-center justify-end cursor-pointer hover:text-primary transition-colors ${
              sortKey === 'tradePrice' ? 'text-primary font-semibold' : ''
            }`}
            onClick={() => handleSort('tradePrice')}
          >
            거래대금(24h)
            {renderSortIcon('tradePrice')}
          </div>
          <div 
            className={`text-right flex items-center justify-end cursor-pointer hover:text-primary transition-colors ${
              sortKey === 'tradeVolume' ? 'text-primary font-semibold' : ''
            }`}
            onClick={() => handleSort('tradeVolume')}
          >
            거래량(24h)
            {renderSortIcon('tradeVolume')}
          </div>
          <div className="text-center">차트</div>
        </div>
        
        {/* 테이블 바디 */}
        {data.map((item) => (
          <div
            key={item.market}
            className="grid grid-cols-7 gap-4 p-4 border-t hover:bg-muted/50 cursor-pointer transition-colors"
            onClick={() => handleCoinClick(item.market)}
          >
            <div className="flex flex-col">
              <span className="font-medium">
                {showKoreanName ? item.koreanName : item.englishName}
              </span>
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
                {item.change === 'RISE' ? '+' : item.change === 'FALL' ? '-' : ''}{item.changeRate.toFixed(2)}%
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
              {item.change === 'RISE' ? '+' : item.change === 'FALL' ? '-' : ''}{item.changePrice.toLocaleString()}
            </div>
            <div className="text-right text-sm">
              {formatPrice(item.accTradePrice24h)}
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

  if (!isMounted || isLoading) {
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
        <Button
          variant="outline"
          size="sm"
          onClick={handleToggleName}
          className="flex items-center gap-2"
        >
          <Languages className="h-4 w-4" />
          {showKoreanName ? "한글명" : "영문명"}
        </Button>
      </div>

      <Tabs defaultValue="all" className="w-full">
        <TabsList>
          <TabsTrigger value="all">
            전체 ({sortedMarkets.length})
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
                실시간 코인 가격, 변동률, 거래량 정보 (총 {sortedMarkets.length}개)
              </CardDescription>
            </CardHeader>
            <CardContent>
              {renderMarketList(sortedMarkets)}
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
