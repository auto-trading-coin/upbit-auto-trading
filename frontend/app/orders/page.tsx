"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { useAuth } from "@/components/auth-provider"
import { useApi } from "@/lib/api-context"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { AlertCircle, AlertTriangle, Check, Clock, Key, Loader2, X, Zap } from "lucide-react"
import { LoginModal } from "@/components/login-modal"

// 타입 정의
interface Order {
  id: string
  market: string
  side: "bid" | "ask"
  price: number
  volume: number
  created_at: string
  status: "wait" | "done" | "cancel"
  related_signal_id?: string
}

interface Signal {
  id: string
  strategy: string
  market: string
  side: "bid" | "ask"
  trigger_condition: string
  created_at: string
  status: "triggered" | "pending" | "expired"
  related_order_id?: string
}

// 더미 데이터 생성 함수
const generateDummyOrders = (count: number): Order[] => {
  const markets = ["BTC-KRW", "ETH-KRW", "XRP-KRW", "SOL-KRW", "ADA-KRW"]
  const sides: ("bid" | "ask")[] = ["bid", "ask"]
  const statuses: ("wait" | "done" | "cancel")[] = ["wait", "done", "cancel"]

  const now = new Date()

  return Array.from({ length: count }).map((_, index) => {
    const market = markets[Math.floor(Math.random() * markets.length)]
    const side = sides[Math.floor(Math.random() * sides.length)]
    const status = statuses[Math.floor(Math.random() * statuses.length)]
    const price = Math.floor(Math.random() * 50000000) + 1000000
    const volume = Number((Math.random() * 2).toFixed(4))

    // 생성 시간을 최근 7일 내로 랜덤하게 설정
    const createdAt = new Date(now)
    createdAt.setDate(now.getDate() - Math.floor(Math.random() * 7))
    createdAt.setHours(Math.floor(Math.random() * 24))
    createdAt.setMinutes(Math.floor(Math.random() * 60))

    const has_related_signal = Math.random() > 0.7 // 30% 확률로 관련 시그널 있음

    return {
      id: `ORDER${(index + 1).toString().padStart(6, "0")}`,
      market,
      side,
      price,
      volume,
      created_at: createdAt.toISOString(),
      status,
      related_signal_id: has_related_signal
        ? `SIGNAL${(Math.floor(Math.random() * 100) + 1).toString().padStart(6, "0")}`
        : undefined,
    }
  })
}

// 더미 시그널 데이터 생성 함수
const generateDummySignals = (count: number): Signal[] => {
  const markets = ["BTC-KRW", "ETH-KRW", "XRP-KRW", "SOL-KRW", "ADA-KRW"]
  const sides: ("bid" | "ask")[] = ["bid", "ask"]
  const statuses: ("triggered" | "pending" | "expired")[] = ["triggered", "pending", "expired"]
  const strategies = ["이동평균 돌파", "RSI 과매수/과매도", "볼린저밴드 돌파", "MACD 크로스", "가격 돌파"]

  const now = new Date()

  return Array.from({ length: count }).map((_, index) => {
    const market = markets[Math.floor(Math.random() * markets.length)]
    const side = sides[Math.floor(Math.random() * sides.length)]
    const status = statuses[Math.floor(Math.random() * statuses.length)]
    const strategy = strategies[Math.floor(Math.random() * strategies.length)]

    // 생성 시간을 최근 7일 내로 랜덤하게 설정
    const createdAt = new Date(now)
    createdAt.setDate(now.getDate() - Math.floor(Math.random() * 7))
    createdAt.setHours(Math.floor(Math.random() * 24))
    createdAt.setMinutes(Math.floor(Math.random() * 60))

    // 트리거 조건 생성
    let triggerCondition = ""
    if (strategy === "이동평균 돌파") {
      triggerCondition = `price > MA${[20, 50, 100, 200][Math.floor(Math.random() * 4)]}`
    } else if (strategy === "RSI 과매수/과매도") {
      triggerCondition = `RSI${[7, 14][Math.floor(Math.random() * 2)]} ${side === "bid" ? "<" : ">"} ${side === "bid" ? 30 : 70}`
    } else if (strategy === "볼린저밴드 돌파") {
      triggerCondition = `price ${side === "bid" ? "<" : ">"} BB_${side === "bid" ? "LOWER" : "UPPER"}`
    } else if (strategy === "MACD 크로스") {
      triggerCondition = `MACD_LINE ${side === "bid" ? ">" : "<"} SIGNAL_LINE`
    } else {
      triggerCondition = `price ${side === "bid" ? "<" : ">"} ${Math.floor(Math.random() * 50000000) + 1000000}`
    }

    const has_related_order = status === "triggered" && Math.random() > 0.5

    return {
      id: `SIGNAL${(index + 1).toString().padStart(6, "0")}`,
      strategy,
      market,
      side,
      trigger_condition: triggerCondition,
      created_at: createdAt.toISOString(),
      status,
      related_order_id: has_related_order
        ? `ORDER${(Math.floor(Math.random() * 100) + 1).toString().padStart(6, "0")}`
        : undefined,
    }
  })
}

// 초기 더미 데이터
const INITIAL_ORDERS = generateDummyOrders(20)
const INITIAL_SIGNALS = generateDummySignals(20)

// 추가 데이터 로드 크기
const LOAD_MORE_SIZE = 10

export default function OrdersPage() {
  const { isAuthenticated } = useAuth()
  const { apiKeyState } = useApi()
  const [showLoginModal, setShowLoginModal] = useState<boolean>(false)
  const [activeTab, setActiveTab] = useState<string>("orders")
  const [orders, setOrders] = useState<Order[]>(INITIAL_ORDERS)
  const [signals, setSignals] = useState<Signal[]>(INITIAL_SIGNALS)
  const [isLoadingMoreOrders, setIsLoadingMoreOrders] = useState<boolean>(false)
  const [isLoadingMoreSignals, setIsLoadingMoreSignals] = useState<boolean>(false)
  const [hasMoreOrders, setHasMoreOrders] = useState<boolean>(true)
  const [hasMoreSignals, setHasMoreSignals] = useState<boolean>(true)
  const [selectedSignals, setSelectedSignals] = useState<Signal[]>([])
  const [showSignalModal, setShowSignalModal] = useState<boolean>(false)

  const ordersEndRef = useRef<HTMLDivElement>(null)
  const signalsEndRef = useRef<HTMLDivElement>(null)
  const router = useRouter()

  // 주문 취소 함수
  const handleCancelOrder = (orderId: string) => {
    // 실제 구현에서는 API 호출로 주문 취소
    // 여기서는 상태 업데이트만 수행
    setOrders((prevOrders) =>
      prevOrders.map((order) => (order.id === orderId ? { ...order, status: "cancel" } : order)),
    )
  }

  // 관련 시그널 보기 함수
  const handleViewRelatedSignals = useCallback(
    (orderId: string) => {
      // 실제 구현에서는 API 호출로 관련 시그널 가져오기
      // 여기서는 더미 데이터에서 필터링
      const relatedSignals = INITIAL_SIGNALS.filter(
        (signal) =>
          signal.related_order_id === orderId || orders.find((o) => o.id === orderId)?.related_signal_id === signal.id,
      )

      if (relatedSignals.length === 0) {
        // 관련 시그널이 없는 경우, 랜덤 시그널 3개 생성
        const dummyRelatedSignals = generateDummySignals(3).map((signal) => ({
          ...signal,
          related_order_id: orderId,
        }))
        setSelectedSignals(dummyRelatedSignals)
      } else {
        setSelectedSignals(relatedSignals)
      }

      setShowSignalModal(true)
    },
    [orders],
  )

  // 무한 스크롤 - 주문 내역
  const loadMoreOrders = useCallback(async () => {
    if (isLoadingMoreOrders || !hasMoreOrders) return

    setIsLoadingMoreOrders(true)

    // 실제 구현에서는 API 호출로 추가 데이터 가져오기
    // 여기서는 지연 시간을 두고 더미 데이터 추가
    setTimeout(() => {
      const newOrders = generateDummyOrders(LOAD_MORE_SIZE)
      setOrders((prev) => [...prev, ...newOrders])

      // 최대 200개까지만 로드 (무한 스크롤 데모용)
      if (orders.length + LOAD_MORE_SIZE >= 200) {
        setHasMoreOrders(false)
      }

      setIsLoadingMoreOrders(false)
    }, 800)
  }, [isLoadingMoreOrders, hasMoreOrders, orders.length])

  // 무한 스크롤 - 시그널 로그
  const loadMoreSignals = useCallback(async () => {
    if (isLoadingMoreSignals || !hasMoreSignals) return

    setIsLoadingMoreSignals(true)

    // 실제 구현에서는 API 호출로 추가 데이터 가져오기
    // 여기서는 지연 시간을 두고 더미 데이터 추가
    setTimeout(() => {
      const newSignals = generateDummySignals(LOAD_MORE_SIZE)
      setSignals((prev) => [...prev, ...newSignals])

      // 최대 200개까지만 로드 (무한 스크롤 데모용)
      if (signals.length + LOAD_MORE_SIZE >= 200) {
        setHasMoreSignals(false)
      }

      setIsLoadingMoreSignals(false)
    }, 800)
  }, [isLoadingMoreSignals, hasMoreSignals, signals.length])

  // 인터섹션 옵저버 설정 - 주문 내역
  useEffect(() => {
    if (!ordersEndRef.current || activeTab !== "orders") return

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          loadMoreOrders()
        }
      },
      { threshold: 0.5 },
    )

    observer.observe(ordersEndRef.current)

    return () => {
      if (ordersEndRef.current) {
        observer.unobserve(ordersEndRef.current)
      }
    }
  }, [loadMoreOrders, activeTab])

  // 인터섹션 옵저버 설정 - 시그널 로그
  useEffect(() => {
    if (!signalsEndRef.current || activeTab !== "signals") return

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          loadMoreSignals()
        }
      },
      { threshold: 0.5 },
    )

    observer.observe(signalsEndRef.current)

    return () => {
      if (signalsEndRef.current) {
        observer.unobserve(signalsEndRef.current)
      }
    }
  }, [loadMoreSignals, activeTab])

  // 날짜 포맷 함수
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString)
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")} ${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">주문 관리</h1>
        <Button onClick={() => router.push("/")} variant="outline">
          대시보드로 돌아가기
        </Button>
      </div>

      {!isAuthenticated && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>로그인이 필요합니다</AlertTitle>
          <AlertDescription>
            주문 내역을 확인하기 위해 로그인해주세요.
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
              주문 내역을 확인하기 위해서는 업비트 API 키가 필요합니다.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col space-y-4">
              <p className="text-sm text-amber-700">API 키를 등록하면 다음 기능을 이용할 수 있습니다:</p>
              <ul className="list-disc list-inside text-sm text-amber-700 space-y-1">
                <li>실시간 주문 내역 확인</li>
                <li>주문 취소</li>
                <li>시그널 로그 확인</li>
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
            실제 주문 내역을 확인하기 위해 업비트 API 키를 등록해주세요.
          </p>
          <Button onClick={() => router.push("/mypage")}>API 키 등록하기</Button>
        </div>
      ) : !isAuthenticated ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <AlertCircle className="h-16 w-16 text-muted-foreground mb-6" />
          <h2 className="text-2xl font-bold mb-2">주문 내역을 확인하려면 로그인하세요</h2>
          <p className="text-muted-foreground mb-6 max-w-md">
            로그인하여 주문 내역, 시그널 로그 등 다양한 정보를 확인하세요.
          </p>
          <Button onClick={() => setShowLoginModal(true)}>로그인하기</Button>
        </div>
      ) : (
        <Tabs defaultValue="orders" className="w-full" onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="orders">주문 내역</TabsTrigger>
            <TabsTrigger value="signals">시그널 로그</TabsTrigger>
          </TabsList>

          <TabsContent value="orders" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>주문 내역</CardTitle>
                <CardDescription>최근 주문 내역을 확인합니다.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="border-b">
                        <th className="py-3 px-4 text-left font-medium">주문 ID</th>
                        <th className="py-3 px-4 text-left font-medium">마켓</th>
                        <th className="py-3 px-4 text-left font-medium">주문 유형</th>
                        <th className="py-3 px-4 text-right font-medium">주문 가격</th>
                        <th className="py-3 px-4 text-right font-medium">주문 수량</th>
                        <th className="py-3 px-4 text-right font-medium">총 금액</th>
                        <th className="py-3 px-4 text-center font-medium">상태</th>
                        <th className="py-3 px-4 text-center font-medium">생성 시간</th>
                        <th className="py-3 px-4 text-center font-medium">시그널</th>
                        <th className="py-3 px-4 text-center font-medium">액션</th>
                      </tr>
                    </thead>
                    <tbody>
                      {orders.map((order) => (
                        <tr key={order.id} className="border-b hover:bg-muted/50">
                          <td className="py-3 px-4 text-sm">{order.id}</td>
                          <td className="py-3 px-4 text-sm">{order.market}</td>
                          <td className="py-3 px-4">
                            <Badge variant={order.side === "bid" ? "default" : "destructive"}>
                              {order.side === "bid" ? "매수" : "매도"}
                            </Badge>
                          </td>
                          <td className="py-3 px-4 text-right">{order.price.toLocaleString()}원</td>
                          <td className="py-3 px-4 text-right">{order.volume}</td>
                          <td className="py-3 px-4 text-right">{(order.price * order.volume).toLocaleString()}원</td>
                          <td className="py-3 px-4 text-center">
                            {order.status === "wait" ? (
                              <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
                                <Clock className="h-3 w-3 mr-1" />
                                대기
                              </Badge>
                            ) : order.status === "done" ? (
                              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                                <Check className="h-3 w-3 mr-1" />
                                완료
                              </Badge>
                            ) : (
                              <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                                <X className="h-3 w-3 mr-1" />
                                취소
                              </Badge>
                            )}
                          </td>
                          <td className="py-3 px-4 text-center text-sm">{formatDate(order.created_at)}</td>
                          <td className="py-3 px-4 text-center">
                            {order.related_signal_id && (
                              <Button
                                variant="outline"
                                size="sm"
                                className="h-8 text-xs bg-blue-50 text-blue-700 border-blue-200"
                                onClick={() => handleViewRelatedSignals(order.id)}
                              >
                                <Zap className="h-3 w-3 mr-1" />
                                시그널 보기
                              </Button>
                            )}
                          </td>
                          <td className="py-3 px-4 text-center">
                            {order.status === "wait" && (
                              <Button
                                variant="outline"
                                size="sm"
                                className="h-8 text-xs bg-red-50 text-red-700 border-red-200"
                                onClick={() => handleCancelOrder(order.id)}
                              >
                                <X className="h-3 w-3 mr-1" />
                                취소
                              </Button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* 무한 스크롤 로딩 인디케이터 */}
                <div ref={ordersEndRef} className="py-4 text-center">
                  {isLoadingMoreOrders ? (
                    <div className="flex items-center justify-center">
                      <Loader2 className="h-6 w-6 animate-spin text-muted-foreground mr-2" />
                      <span className="text-sm text-muted-foreground">데이터를 불러오는 중...</span>
                    </div>
                  ) : hasMoreOrders ? (
                    <span className="text-sm text-muted-foreground">스크롤하여 더 불러오기</span>
                  ) : (
                    <span className="text-sm text-muted-foreground">모든 주문 내역을 불러왔습니다</span>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="signals" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>시그널 로그</CardTitle>
                <CardDescription>자동 매매 시그널 로그를 확인합니다.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="border-b">
                        <th className="py-3 px-4 text-left font-medium">시그널 ID</th>
                        <th className="py-3 px-4 text-left font-medium">전략</th>
                        <th className="py-3 px-4 text-left font-medium">마켓</th>
                        <th className="py-3 px-4 text-left font-medium">매매 유형</th>
                        <th className="py-3 px-4 text-left font-medium">트리거 조건</th>
                        <th className="py-3 px-4 text-center font-medium">생성 시간</th>
                        <th className="py-3 px-4 text-center font-medium">상태</th>
                      </tr>
                    </thead>
                    <tbody>
                      {signals.map((signal) => (
                        <tr key={signal.id} className="border-b hover:bg-muted/50">
                          <td className="py-3 px-4 text-sm">{signal.id}</td>
                          <td className="py-3 px-4">{signal.strategy}</td>
                          <td className="py-3 px-4">{signal.market}</td>
                          <td className="py-3 px-4">
                            <Badge variant={signal.side === "bid" ? "default" : "destructive"}>
                              {signal.side === "bid" ? "매수" : "매도"}
                            </Badge>
                          </td>
                          <td className="py-3 px-4">
                            <code className="px-1 py-0.5 rounded bg-muted font-mono text-sm">
                              {signal.trigger_condition}
                            </code>
                          </td>
                          <td className="py-3 px-4 text-center text-sm">{formatDate(signal.created_at)}</td>
                          <td className="py-3 px-4 text-center">
                            {signal.status === "triggered" ? (
                              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                                <Check className="h-3 w-3 mr-1" />
                                실행됨
                              </Badge>
                            ) : signal.status === "pending" ? (
                              <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
                                <Clock className="h-3 w-3 mr-1" />
                                대기중
                              </Badge>
                            ) : (
                              <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                                <X className="h-3 w-3 mr-1" />
                                만료됨
                              </Badge>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* 무한 스크롤 로딩 인디케이터 */}
                <div ref={signalsEndRef} className="py-4 text-center">
                  {isLoadingMoreSignals ? (
                    <div className="flex items-center justify-center">
                      <Loader2 className="h-6 w-6 animate-spin text-muted-foreground mr-2" />
                      <span className="text-sm text-muted-foreground">데이터를 불러오는 중...</span>
                    </div>
                  ) : hasMoreSignals ? (
                    <span className="text-sm text-muted-foreground">스크롤하여 더 불러오기</span>
                  ) : (
                    <span className="text-sm text-muted-foreground">모든 시그널 로그를 불러왔습니다</span>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}

      {/* 시그널 상세 모달 */}
      <Dialog open={showSignalModal} onOpenChange={setShowSignalModal}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle>관련 시그널 정보</DialogTitle>
            <DialogDescription>주문과 관련된 시그널 정보를 확인합니다.</DialogDescription>
          </DialogHeader>
          <div className="overflow-y-auto flex-1 pr-2">
            {selectedSignals.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <AlertTriangle className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">관련 시그널이 없습니다</h3>
                <p className="text-sm text-muted-foreground max-w-md">
                  이 주문과 관련된 시그널 정보가 없습니다. 수동 주문이거나 시그널 정보가 삭제되었을 수 있습니다.
                </p>
              </div>
            ) : (
              <table className="w-full border-collapse">
                <thead className="sticky top-0 bg-background z-10">
                  <tr className="border-b">
                    <th className="py-3 px-4 text-left font-medium">시그널 ID</th>
                    <th className="py-3 px-4 text-left font-medium">전략</th>
                    <th className="py-3 px-4 text-left font-medium">마켓</th>
                    <th className="py-3 px-4 text-left font-medium">매매 유형</th>
                    <th className="py-3 px-4 text-left font-medium">트리거 조건</th>
                    <th className="py-3 px-4 text-center font-medium">생성 시간</th>
                    <th className="py-3 px-4 text-center font-medium">상태</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedSignals.map((signal) => (
                    <tr key={signal.id} className="border-b hover:bg-muted/50">
                      <td className="py-3 px-4 text-sm">{signal.id}</td>
                      <td className="py-3 px-4">{signal.strategy}</td>
                      <td className="py-3 px-4">{signal.market}</td>
                      <td className="py-3 px-4">
                        <Badge variant={signal.side === "bid" ? "default" : "destructive"}>
                          {signal.side === "bid" ? "매수" : "매도"}
                        </Badge>
                      </td>
                      <td className="py-3 px-4">
                        <code className="px-1 py-0.5 rounded bg-muted font-mono text-sm">
                          {signal.trigger_condition}
                        </code>
                      </td>
                      <td className="py-3 px-4 text-center text-sm">{formatDate(signal.created_at)}</td>
                      <td className="py-3 px-4 text-center">
                        {signal.status === "triggered" ? (
                          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                            <Check className="h-3 w-3 mr-1" />
                            실행됨
                          </Badge>
                        ) : signal.status === "pending" ? (
                          <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
                            <Clock className="h-3 w-3 mr-1" />
                            대기중
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                            <X className="h-3 w-3 mr-1" />
                            만료됨
                          </Badge>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <LoginModal open={showLoginModal} onOpenChange={setShowLoginModal} />
    </div>
  )
}
