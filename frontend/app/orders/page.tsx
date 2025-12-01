"use client"

import { useState, useRef, useCallback, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { AlertTriangle, Loader2, Key, Zap, Check, Clock, X } from "lucide-react"
import { AuthGuard } from "@/components/common"
import { useUser } from "@/hooks/queries/useUser"
import { useOrders } from "@/hooks/queries/useOrders"
import { useRelatedSignal } from "@/hooks/queries/useRelatedSignals"
import { useSignals } from "@/hooks/queries/useSignals"
import { Order, Signal } from "@/types"



export default function OrdersPage() {
  const router = useRouter()
  const { data: user } = useUser()

  // 주문 무한스크롤 상태
  const [currentPage, setCurrentPage] = useState(0)
  const [allOrders, setAllOrders] = useState<Order[]>([])
  const [hasMoreOrders, setHasMoreOrders] = useState(true)
  const [isLoadingMoreOrders, setIsLoadingMoreOrders] = useState(false)

  // 현재 페이지 주문 데이터 조회
  const { data: orderData, isLoading: isLoadingOrders } = useOrders({ page: currentPage, size: 10 })

  const [activeTab, setActiveTab] = useState<string>("orders")

  // 시그널 무한스크롤 상태
  const [currentSignalPage, setCurrentSignalPage] = useState(0)
  const [allSignals, setAllSignals] = useState<Signal[]>([])
  const [hasMoreSignals, setHasMoreSignals] = useState(true)
  const [isLoadingMoreSignals, setIsLoadingMoreSignals] = useState(false)

  // 현재 페이지 시그널 데이터 조회
  const { data: signalData, isLoading: isLoadingSignals } = useSignals({ page: currentSignalPage, size: 10 })

  // 시그널 모달 상태
  const [selectedOrderId, setSelectedOrderId] = useState<number | null>(null)
  const [showSignalModal, setShowSignalModal] = useState<boolean>(false)

  // 선택된 주문의 관련 시그널 조회 (API)
  const { data: relatedSignal, isLoading: isLoadingRelatedSignal } = useRelatedSignal(selectedOrderId)

  const ordersEndRef = useRef<HTMLTableRowElement>(null)
  const signalsEndRef = useRef<HTMLTableRowElement>(null)
  const observerRef = useRef<IntersectionObserver | null>(null)  // observer 인스턴스 저장
  const signalObserverRef = useRef<IntersectionObserver | null>(null)  // signal observer

  // 주문 데이터 로드 시 누적
  useEffect(() => {
    if (orderData?.orders) {
      console.log('📦 Order data received:', {
        page: currentPage,
        ordersCount: orderData.orders.length,
        hasMore: orderData.hasMore,
        totalElements: orderData.totalElements
      })

      if (currentPage === 0) {
        // 첫 페이지면 초기화
        setAllOrders(orderData.orders)
      } else {
        // 추가 페이지면 중복 제거 후 누적
        setAllOrders(prev => {
          const newOrders = orderData.orders.filter(
            newOrder => !prev.some(existing => existing.id === newOrder.id)
          )
          return [...prev, ...newOrders]
        })
      }
      setHasMoreOrders(orderData.hasMore)
      setIsLoadingMoreOrders(false)
    }
  }, [orderData, currentPage])

  // 관련 시그널 보기 함수
  const handleViewRelatedSignals = (orderId: number) => {
    setSelectedOrderId(orderId)
    setShowSignalModal(true)
  }

  // 무한 스크롤 - 주문 로그
  const loadMoreOrders = useCallback(() => {
    console.log('🔄 loadMoreOrders called:', {
      isLoadingMoreOrders,
      hasMoreOrders,
      isLoadingOrders,
      currentPage
    })

    if (isLoadingMoreOrders || !hasMoreOrders || isLoadingOrders) {
      console.log('⛔ Loading blocked:', {
        isLoadingMoreOrders,
        hasMoreOrders,
        isLoadingOrders
      })
      return
    }

    console.log('✅ Loading next page:', currentPage + 1)
    setIsLoadingMoreOrders(true)
    setCurrentPage(prev => prev + 1)
  }, [isLoadingMoreOrders, hasMoreOrders, isLoadingOrders, currentPage])

  // 시그널 데이터 로드 시 누적
  useEffect(() => {
    console.log('🔍 [Signal Data Effect] Triggered:', {
      hasSignalData: !!signalData?.signals,
      signalsCount: signalData?.signals?.length,
      currentSignalPage,
      signalData
    })

    if (signalData?.signals) {
      console.log('📊 [Signal Data] Processing:', {
        receivedSignals: signalData.signals.length,
        hasMore: signalData.hasMore,
        currentPage: signalData.currentPage
      })

      if (currentSignalPage === 0) {
        console.log('🔄 [Signal Data] Initial load - setting all signals')
        setAllSignals(signalData.signals)
      } else {
        setAllSignals(prev => {
          const newSignals = signalData.signals.filter(
            newSignal => !prev.some(existing => existing.id === newSignal.id)
          )
          console.log('➕ [Signal Data] Appending new signals:', {
            previousCount: prev.length,
            newCount: newSignals.length,
            totalAfter: prev.length + newSignals.length
          })
          return [...prev, ...newSignals]
        })
      }
      setHasMoreSignals(signalData.hasMore)
      setIsLoadingMoreSignals(false)
    }
  }, [signalData, currentSignalPage])

  // 무한 스크롤 - 시그널 로그
  const loadMoreSignals = useCallback(() => {
    if (isLoadingMoreSignals || !hasMoreSignals || isLoadingSignals) return

    setIsLoadingMoreSignals(true)
    setCurrentSignalPage(prev => prev + 1)
  }, [isLoadingMoreSignals, hasMoreSignals, isLoadingSignals])



  // 인터섹션 옵저버 설정 - 주문 로그
  useEffect(() => {
    // 이전 observer cleanup
    if (observerRef.current) {
      observerRef.current.disconnect()
      observerRef.current = null
    }

    if (!ordersEndRef.current || activeTab !== "orders" || !hasMoreOrders) {
      return
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          loadMoreOrders()
        }
      },
      { threshold: 0.1 }
    )

    observer.observe(ordersEndRef.current)
    observerRef.current = observer

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect()
        observerRef.current = null
      }
    }
  }, [loadMoreOrders, activeTab, hasMoreOrders, allOrders.length])  // allOrders.length 추가!

  // 인터섹션 옵저버 설정 - 시그널 로그
  useEffect(() => {
    // 이전 observer cleanup
    if (signalObserverRef.current) {
      signalObserverRef.current.disconnect()
      signalObserverRef.current = null
    }

    if (!signalsEndRef.current || activeTab !== "signals" || !hasMoreSignals) {
      return
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          loadMoreSignals()
        }
      },
      { threshold: 0.1 }
    )

    observer.observe(signalsEndRef.current)
    signalObserverRef.current = observer

    return () => {
      if (signalObserverRef.current) {
        signalObserverRef.current.disconnect()
        signalObserverRef.current = null
      }
    }
  }, [loadMoreSignals, activeTab, hasMoreSignals, allSignals.length])

  // 날짜 포맷 함수
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString)
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")} ${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`
  }

  return (
    <AuthGuard>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight">주문 관리</h1>
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

        {user && !user.apiKeyRegistered ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Key className="h-16 w-16 text-amber-500 mb-6" />
            <h2 className="text-2xl font-bold mb-2">API 키 등록이 필요합니다</h2>
            <p className="text-muted-foreground mb-6 max-w-md">
              실제 주문 내역을 확인하기 위해 업비트 API 키를 등록해주세요.
            </p>
            <Button onClick={() => router.push("/mypage")}>API 키 등록하기</Button>
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
                          <th className="py-3 px-4 text-center font-medium">생성 시간</th>
                          <th className="py-3 px-4 text-center font-medium">시그널</th>
                        </tr>
                      </thead>
                      <tbody>
                        {isLoadingOrders && currentPage === 0 ? (
                          <tr>
                            <td colSpan={8} className="py-8 text-center">
                              <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                            </td>
                          </tr>
                        ) : !user?.apiKeyRegistered ? (
                          <tr>
                            <td colSpan={8} className="py-8 text-center">
                              <div className="flex flex-col items-center space-y-4">
                                <Key className="h-12 w-12 text-muted-foreground" />
                                <div>
                                  <p className="text-muted-foreground">API 키를 먼저 등록해주세요</p>
                                  <Button
                                    variant="outline"
                                    className="mt-2"
                                    onClick={() => router.push("/mypage")}
                                  >
                                    API 키 등록하러 가기
                                  </Button>
                                </div>
                              </div>
                            </td>
                          </tr>
                        ) : allOrders.length === 0 ? (
                          <tr>
                            <td colSpan={8} className="py-8 text-center">
                              <div className="flex flex-col items-center space-y-4">
                                <AlertTriangle className="h-12 w-12 text-muted-foreground" />
                                <p className="text-muted-foreground">주문 내역이 없습니다</p>
                              </div>
                            </td>
                          </tr>
                        ) : (
                          <>
                            {allOrders.map((order) => (
                              <tr key={order.id} className="border-b hover:bg-muted/50">
                                <td className="py-3 px-4 text-sm">{order.id}</td>
                                <td className="py-3 px-4">{order.market}</td>
                                <td className="py-3 px-4">
                                  <Badge variant={order.side === "bid" ? "default" : "destructive"}>
                                    {order.side === "bid" ? "매수" : "매도"}
                                  </Badge>
                                </td>
                                <td className="py-3 px-4 text-right">{order.price?.toLocaleString()} KRW</td>
                                <td className="py-3 px-4 text-right">
                                  {order.volume?.toLocaleString(undefined, { maximumFractionDigits: 8 })}
                                </td>
                                <td className="py-3 px-4 text-right font-medium">
                                  {order.totalAmount?.toLocaleString()} KRW
                                </td>
                                <td className="py-3 px-4 text-center text-sm">{formatDate(order.createdAt)}</td>
                                <td className="py-3 px-4 text-center">
                                  {order.relatedSignalId && (
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
                              </tr>
                            ))}
                            {/* 무한 스크롤 트리거 */}
                            {hasMoreOrders && (
                              <tr ref={ordersEndRef}>
                                <td colSpan={8} className="py-4 text-center">
                                  <Loader2 className="h-5 w-5 animate-spin mx-auto text-muted-foreground" />
                                </td>
                              </tr>
                            )}
                          </>
                        )}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="signals" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>시그널 로그</CardTitle>
                  <CardDescription>모든 자동 매매 시그널 로그를 확인합니다. 전략 선택에 참고하세요.</CardDescription>
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
                        </tr>
                      </thead>
                      <tbody>
                        {isLoadingSignals && currentSignalPage === 0 ? (
                          <tr>
                            <td colSpan={6} className="py-8 text-center">
                              <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                            </td>
                          </tr>
                        ) : allSignals.length === 0 ? (
                          <tr>
                            <td colSpan={6} className="py-8 text-center">
                              <div className="flex flex-col items-center space-y-4">
                                <AlertTriangle className="h-12 w-12 text-muted-foreground" />
                                <p className="text-muted-foreground">시그널 로그가 없습니다</p>
                              </div>
                            </td>
                          </tr>
                        ) : (
                          <>
                            {allSignals.map((signal) => (
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
                                    {signal.conditions || "-"}
                                  </code>
                                </td>
                                <td className="py-3 px-4 text-center text-sm">{formatDate(signal.createdAt)}</td>
                              </tr>
                            ))}
                            {/* 무한 스크롤 트리거 */}
                            {hasMoreSignals && (
                              <tr ref={signalsEndRef}>
                                <td colSpan={6} className="py-4 text-center">
                                  <Loader2 className="h-5 w-5 animate-spin mx-auto text-muted-foreground" />
                                </td>
                              </tr>
                            )}
                          </>
                        )}
                      </tbody>
                    </table>
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
              {!isLoadingRelatedSignal && !relatedSignal ? (
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
                      <th className="py-3 px-4 text-center font-medium">생성 시간</th>
                    </tr>
                  </thead>
                  <tbody>
                    {isLoadingRelatedSignal ? (
                      <tr>
                        <td colSpan={5} className="py-8 text-center">
                          <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                        </td>
                      </tr>
                    ) : relatedSignal && (
                      <tr className="border-b hover:bg-muted/50">
                        <td className="py-3 px-4 text-sm">{relatedSignal.id}</td>
                        <td className="py-3 px-4">{relatedSignal.strategy}</td>
                        <td className="py-3 px-4">{relatedSignal.market}</td>
                        <td className="py-3 px-4">
                          <Badge variant={relatedSignal.side === "bid" ? "default" : "destructive"}>
                            {relatedSignal.side === "bid" ? "매수" : "매도"}
                          </Badge>
                        </td>
                        <td className="py-3 px-4 text-center text-sm">{formatDate(relatedSignal.createdAt)}</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              )}
            </div>
          </DialogContent>
        </Dialog >
      </div >
    </AuthGuard >
  )
}
