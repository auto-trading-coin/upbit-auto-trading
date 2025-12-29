"use client"

import { useEffect, useRef, useState, useMemo } from "react"
import { createChart, ColorType, CandlestickSeries, createSeriesMarkers, UTCTimestamp, SeriesMarkerPosition, SeriesMarkerShape } from "lightweight-charts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Loader2, TrendingUp } from "lucide-react"
import { getChartData, CHART_LOAD_LIMIT } from "@/app/api/chart"
import { usePortfolio } from "@/hooks/queries/usePortfolio"
import { useSignals } from "@/hooks/queries/useSignals"
import { ChartCandle } from "@/types/chart"

interface SignalChartProps {
  initialMarket?: string
}

interface OHLCData {
  open: number
  high: number
  low: number
  close: number
  time: string
}

const MARKETS = [
  { value: "KRW-BTC", label: "비트코인 (BTC)" },
  { value: "KRW-ETH", label: "이더리움 (ETH)" },
  { value: "KRW-XRP", label: "리플 (XRP)" },
  { value: "KRW-SOL", label: "솔라나 (SOL)" },
  { value: "KRW-DOGE", label: "도지코인 (DOGE)" },
]

const TIMEFRAMES = [
  { value: "1", label: "1분" },
  { value: "5", label: "5분" },
  { value: "30", label: "30분" },
  { value: "60", label: "1시간" },
  { value: "240", label: "4시간" },
  { value: "1440", label: "1일" },
]

// KST 문자열을 Unix timestamp(초)로 변환 - KST 표시를 위해 9시간 추가
const kstToTimestamp = (kstString: string): UTCTimestamp => {
  const date = new Date(kstString)
  // lightweight-charts는 UTC로 표시하므로, KST 표시를 위해 9시간(32400초) 추가
  return (Math.floor(date.getTime() / 1000) + 32400) as UTCTimestamp
}

// 숫자 포맷 (천 단위 콤마)
const formatPrice = (price: number): string => {
  return price.toLocaleString("ko-KR", { maximumFractionDigits: 0 })
}

// 날짜를 YYYY-MM-DD 형식으로 변환
const formatDateForApi = (date: Date): string => {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`
}

export function SignalChart({ initialMarket = "KRW-BTC" }: SignalChartProps) {
  const chartContainerRef = useRef<HTMLDivElement>(null)
  const chartRef = useRef<any>(null)
  const candlestickSeriesRef = useRef<any>(null)
  const priceLineRef = useRef<any>(null)
  const markersRef = useRef<any>(null)

  const [market, setMarket] = useState(initialMarket)
  const [unit, setUnit] = useState(5)
  const [isLoading, setIsLoading] = useState(true)
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const [ohlcData, setOhlcData] = useState<OHLCData | null>(null)
  
  // 차트 데이터 날짜 범위
  const [chartDateRange, setChartDateRange] = useState<{ start: string; end: string } | null>(null)
  
  // 마커 표시 설정
  const [showMarkers, setShowMarkers] = useState(true)
  const [selectedStrategy, setSelectedStrategy] = useState<string>("all")
  
  // 포트폴리오 데이터 (보유 코인 정보)
  const { data: portfolio } = usePortfolio()
  
  // 시그널 데이터 - 차트 날짜 범위 + 마켓 필터 적용
  const { data: signalData } = useSignals({ 
    page: 0, 
    size: 500,  // 충분히 큰 값
    filters: chartDateRange ? {
      market: market,
      startDate: chartDateRange.start,
      endDate: chartDateRange.end,
    } : {
      market: market,
    }
  })
  
  // 현재 선택된 마켓의 보유 정보
  const currentHolding = portfolio?.holdings?.find(h => h.market === market)
  
  // 전략 필터 적용된 시그널 (메모이제이션)
  const filteredSignals = useMemo(() => {
    return signalData?.signals?.filter(s => {
      if (selectedStrategy !== "all" && s.strategy !== selectedStrategy) return false
      return true
    }) || []
  }, [signalData?.signals, selectedStrategy])
  
  // ref로 관리 (클로저 문제 해결)
  const allCandlesRef = useRef<ChartCandle[]>([])
  const oldestTimestampRef = useRef<number | null>(null)
  const hasMoreDataRef = useRef(true)
  const isLoadingMoreRef = useRef(false)
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null)

  // 차트 날짜 범위 업데이트 함수
  const updateChartDateRange = (candles: ChartCandle[]) => {
    if (candles.length === 0) return
    
    const sorted = [...candles].sort((a, b) => 
      new Date(a.candle_date_time_kst).getTime() - new Date(b.candle_date_time_kst).getTime()
    )
    
    const startDate = new Date(sorted[0].candle_date_time_kst)
    const endDate = new Date(sorted[sorted.length - 1].candle_date_time_kst)
    
    // 하루 여유 추가
    startDate.setDate(startDate.getDate() - 1)
    endDate.setDate(endDate.getDate() + 1)
    
    setChartDateRange({
      start: formatDateForApi(startDate),
      end: formatDateForApi(endDate),
    })
  }

  // 차트 초기화
  useEffect(() => {
    if (!chartContainerRef.current) return

    // 초기화
    allCandlesRef.current = []
    oldestTimestampRef.current = null
    hasMoreDataRef.current = true
    isLoadingMoreRef.current = false
    setChartDateRange(null)

    // 기존 차트 제거
    if (chartRef.current) {
      chartRef.current.remove()
      chartRef.current = null
      candlestickSeriesRef.current = null
      priceLineRef.current = null
      markersRef.current = null
    }

    const chart = createChart(chartContainerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: "#1a1a2e" },
        textColor: "#d1d5db",
      },
      grid: {
        vertLines: { color: "#2d2d44" },
        horzLines: { color: "#2d2d44" },
      },
      crosshair: {
        mode: 1,
      },
      rightPriceScale: {
        borderColor: "#2d2d44",
      },
      timeScale: {
        borderColor: "#2d2d44",
        timeVisible: true,
        secondsVisible: false,
      },
      width: chartContainerRef.current.clientWidth,
      height: 400,
    })

    const candlestickSeries = chart.addSeries(CandlestickSeries, {
      upColor: "#22c55e",
      downColor: "#ef4444",
      borderDownColor: "#ef4444",
      borderUpColor: "#22c55e",
      wickDownColor: "#ef4444",
      wickUpColor: "#22c55e",
    })

    chartRef.current = chart
    candlestickSeriesRef.current = candlestickSeries

    // 크로스헤어 이동 이벤트 (OHLC 표시)
    chart.subscribeCrosshairMove((param: any) => {
      if (!param || !param.time || !param.seriesData) {
        setOhlcData(null)
        return
      }

      const data = param.seriesData.get(candlestickSeries)
      if (data) {
        const date = new Date(param.time * 1000)
        const timeStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")} ${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`
        
        setOhlcData({
          open: data.open,
          high: data.high,
          low: data.low,
          close: data.close,
          time: timeStr,
        })
      }
    })

    // 과거 데이터 로드 함수
    const loadMoreData = async () => {
      if (isLoadingMoreRef.current || !hasMoreDataRef.current || !oldestTimestampRef.current) {
        return
      }

      isLoadingMoreRef.current = true
      setIsLoadingMore(true)
      
      try {
        const data = await getChartData(market, unit, CHART_LOAD_LIMIT, oldestTimestampRef.current)
        
        if (data.length === 0) {
          hasMoreDataRef.current = false
          return
        }

        allCandlesRef.current = [...data, ...allCandlesRef.current]
        
        const sorted = [...data].sort((a, b) => 
          new Date(a.candle_date_time_kst).getTime() - new Date(b.candle_date_time_kst).getTime()
        )
        oldestTimestampRef.current = sorted[0].timestamp
        hasMoreDataRef.current = data.length >= CHART_LOAD_LIMIT

        if (candlestickSeriesRef.current) {
          const allSorted = [...allCandlesRef.current].sort((a, b) => 
            new Date(a.candle_date_time_kst).getTime() - new Date(b.candle_date_time_kst).getTime()
          )
          const candles = allSorted.map((d) => ({
            time: kstToTimestamp(d.candle_date_time_kst),
            open: d.opening_price,
            high: d.high_price,
            low: d.low_price,
            close: d.trade_price,
          }))
          candlestickSeriesRef.current.setData(candles)
          
          // 날짜 범위 업데이트
          updateChartDateRange(allCandlesRef.current)
        }
      } catch (error) {
        console.error("Failed to load more chart data:", error)
      } finally {
        isLoadingMoreRef.current = false
        setIsLoadingMore(false)
      }
    }

    // 초기 데이터 로드
    const loadInitialData = async () => {
      setIsLoading(true)
      try {
        const data = await getChartData(market, unit, CHART_LOAD_LIMIT)
        
        allCandlesRef.current = data
        
        if (data.length > 0) {
          const sorted = [...data].sort((a, b) => 
            new Date(a.candle_date_time_kst).getTime() - new Date(b.candle_date_time_kst).getTime()
          )
          oldestTimestampRef.current = sorted[0].timestamp
          
          // 날짜 범위 업데이트
          updateChartDateRange(data)
        }
        hasMoreDataRef.current = data.length >= CHART_LOAD_LIMIT

        const sortedData = [...data].sort((a, b) => 
          new Date(a.candle_date_time_kst).getTime() - new Date(b.candle_date_time_kst).getTime()
        )
        const candles = sortedData.map((d) => ({
          time: kstToTimestamp(d.candle_date_time_kst),
          open: d.opening_price,
          high: d.high_price,
          low: d.low_price,
          close: d.trade_price,
        }))
        candlestickSeries.setData(candles)
        chart.timeScale().fitContent()
      } catch (error) {
        console.error("Failed to load chart data:", error)
      } finally {
        setIsLoading(false)
      }
    }

    loadInitialData()

    // 스크롤 감지 (debounce 적용)
    const handleVisibleRangeChange = (logicalRange: any) => {
      if (!logicalRange) return
      
      if (logicalRange.from < 10) {
        if (debounceTimerRef.current) {
          clearTimeout(debounceTimerRef.current)
        }
        
        debounceTimerRef.current = setTimeout(() => {
          loadMoreData()
        }, 300)
      }
    }
    
    chart.timeScale().subscribeVisibleLogicalRangeChange(handleVisibleRangeChange)

    const handleResize = () => {
      if (chartContainerRef.current) {
        chart.applyOptions({ width: chartContainerRef.current.clientWidth })
      }
    }
    window.addEventListener("resize", handleResize)

    return () => {
      window.removeEventListener("resize", handleResize)
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current)
      }
      chart.timeScale().unsubscribeVisibleLogicalRangeChange(handleVisibleRangeChange)
      chart.remove()
      chartRef.current = null
      candlestickSeriesRef.current = null
      priceLineRef.current = null
      markersRef.current = null
    }
  }, [market, unit])

  // 매수 평균가 수평선 업데이트
  useEffect(() => {
    if (!candlestickSeriesRef.current) return

    // 기존 price line 제거
    if (priceLineRef.current) {
      candlestickSeriesRef.current.removePriceLine(priceLineRef.current)
      priceLineRef.current = null
    }

    // 보유 코인이 있으면 매수 평균가 수평선 추가
    if (currentHolding && currentHolding.avgBuyPrice > 0) {
      priceLineRef.current = candlestickSeriesRef.current.createPriceLine({
        price: currentHolding.avgBuyPrice,
        color: "#fbbf24", // amber-400
        lineWidth: 2,
        lineStyle: 2, // Dashed
        axisLabelVisible: true,
        title: `평단 ${formatPrice(currentHolding.avgBuyPrice)}`,
      })
    }
  }, [currentHolding, market])

  // 시그널 마커 업데이트
  useEffect(() => {
    if (!candlestickSeriesRef.current || allCandlesRef.current.length === 0) {
      return
    }

    // 기존 마커 제거
    if (markersRef.current) {
      markersRef.current.detach()
      markersRef.current = null
    }

    // 마커 표시 꺼져있으면 종료
    if (!showMarkers || filteredSignals.length === 0) return

    // 시그널을 마커로 변환
    const markers = filteredSignals.map(signal => {
      const signalTime = kstToTimestamp(signal.createdAt)
      
      // 가장 가까운 캔들 찾기
      let closestCandle: ChartCandle | null = null
      let minDiff = Infinity
      
      allCandlesRef.current.forEach(candle => {
        const candleTime = kstToTimestamp(candle.candle_date_time_kst)
        const diff = Math.abs(candleTime - signalTime)
        if (diff < minDiff) {
          minDiff = diff
          closestCandle = candle
        }
      })

      if (closestCandle) {
        const candle = closestCandle as ChartCandle  // 타입 단언
        return {
          time: kstToTimestamp(candle.candle_date_time_kst),
          position: (signal.side === "bid" ? "belowBar" : "aboveBar") as SeriesMarkerPosition,
          color: signal.side === "bid" ? "#16a34a" : "#dc2626", // green-600 / red-600
          shape: (signal.side === "bid" ? "arrowUp" : "arrowDown") as SeriesMarkerShape,
          text: signal.side === "bid" ? "B" : "S",
        }
      }
      return null
    }).filter(Boolean)

    // 시간순 정렬 (필수)
    markers.sort((a: any, b: any) => a.time - b.time)

    // 중복 시간 제거 (같은 시간에 여러 마커가 있으면 에러)
    const uniqueMarkers = markers.reduce((acc: any[], marker: any) => {
      const exists = acc.find(m => m.time === marker.time)
      if (!exists) {
        acc.push(marker)
      }
      return acc
    }, [])

    // createSeriesMarkers 사용
    if (uniqueMarkers.length > 0) {
      markersRef.current = createSeriesMarkers(candlestickSeriesRef.current, uniqueMarkers)
    }
  }, [filteredSignals, showMarkers])

  // 시그널에서 사용된 전략 목록 (중복 제거, 메모이제이션)
  const usedStrategies = useMemo(() => {
    return Array.from(
      new Set(signalData?.signals?.map(s => s.strategy) || [])
    )
  }, [signalData?.signals])

  return (
    <Card className="w-full">
      <CardHeader className="pb-4">
        <div className="flex flex-col gap-4">
          {/* 첫 번째 줄: 제목 + 마켓/타임프레임 */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              시그널 차트
              {isLoadingMore && <Loader2 className="h-4 w-4 animate-spin ml-2" />}
            </CardTitle>
            <div className="flex gap-2">
              <Select value={market} onValueChange={setMarket}>
                <SelectTrigger className="w-[160px]">
                  <SelectValue placeholder="마켓 선택" />
                </SelectTrigger>
                <SelectContent>
                  {MARKETS.map((m) => (
                    <SelectItem key={m.value} value={m.value}>
                      {m.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={unit.toString()} onValueChange={(v) => setUnit(Number(v))}>
                <SelectTrigger className="w-[100px]">
                  <SelectValue placeholder="타임프레임" />
                </SelectTrigger>
                <SelectContent>
                  {TIMEFRAMES.map((t) => (
                    <SelectItem key={t.value} value={t.value}>
                      {t.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          {/* 두 번째 줄: 마커 설정 */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-4 pt-2 border-t">
            <div className="flex items-center gap-2">
              <Switch 
                id="show-markers" 
                checked={showMarkers} 
                onCheckedChange={setShowMarkers}
              />
              <Label htmlFor="show-markers" className="text-sm cursor-pointer">
                시그널 마커 표시
              </Label>
            </div>
            
            {showMarkers && (
              <div className="flex items-center gap-2">
                <Label className="text-sm text-muted-foreground">전략:</Label>
                <Select value={selectedStrategy} onValueChange={setSelectedStrategy}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="전략 선택" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">전체</SelectItem>
                    {/* 실제 사용된 전략 목록 */}
                    {usedStrategies.map((strategyName) => (
                      <SelectItem key={strategyName} value={strategyName}>
                        {strategyName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            
            {showMarkers && (
              <div className="flex gap-3 text-xs text-muted-foreground ml-auto">
                <span className="flex items-center gap-1">
                  <span className="text-green-500">▲</span> 매수
                </span>
                <span className="flex items-center gap-1">
                  <span className="text-red-600">▼</span> 매도
                </span>
                <span>({filteredSignals.length}건)</span>
              </div>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="relative">
        {/* OHLC 정보 표시 */}
        <div className="absolute top-2 left-2 z-10 bg-[#1a1a2e]/90 rounded px-3 py-2 text-xs font-mono">
          {ohlcData ? (
            <div className="flex flex-wrap gap-x-4 gap-y-1 text-gray-300">
              <span className="text-gray-500">{ohlcData.time}</span>
              <span>시가 <span className="text-white">{formatPrice(ohlcData.open)}</span></span>
              <span>고가 <span className="text-green-400">{formatPrice(ohlcData.high)}</span></span>
              <span>저가 <span className="text-red-400">{formatPrice(ohlcData.low)}</span></span>
              <span>종가 <span className={ohlcData.close >= ohlcData.open ? "text-green-400" : "text-red-400"}>
                {formatPrice(ohlcData.close)}
              </span></span>
              {currentHolding && (
                <span>평단 <span className="text-amber-400">{formatPrice(currentHolding.avgBuyPrice)}</span></span>
              )}
            </div>
          ) : (
            <div className="flex flex-wrap gap-x-4 gap-y-1 text-gray-300">
              <span className="text-gray-500">캔들에 마우스를 올려보세요</span>
              {currentHolding && (
                <span>평단 <span className="text-amber-400">{formatPrice(currentHolding.avgBuyPrice)}</span></span>
              )}
            </div>
          )}
        </div>

        <div ref={chartContainerRef} className="w-full rounded-lg overflow-hidden" />
        
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-[#1a1a2e] rounded-lg">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        )}
      </CardContent>
    </Card>
  )
}
