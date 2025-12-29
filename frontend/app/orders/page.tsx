"use client"

import { useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { AlertTriangle, Loader2, Key, Zap } from "lucide-react"
import { AuthGuard, MobileDataCard, MobileCardGrid } from "@/components/common"
import { SignalChart } from "@/components/chart/SignalChart"
import { useUser } from "@/hooks/queries/useUser"
import { useOrders } from "@/hooks/queries/useOrders"
import { useRelatedSignal } from "@/hooks/queries/useRelatedSignals"
import { useSignals } from "@/hooks/queries/useSignals"
import { useStrategies } from "@/hooks/queries/useStrategies"
import { OrderFilters } from "@/components/filters/OrderFilters"
import { SignalFilters } from "@/components/filters/SignalFilters"
import { TablePagination } from "@/components/ui/table-pagination"
import { useIsMobile } from "@/hooks/use-mobile"

export default function OrdersPage() {
  const router = useRouter()
  const { data: user } = useUser()
  const isMobile = useIsMobile()

  // 탭 상태
  const [activeTab, setActiveTab] = useState<string>("orders")

  // 스크롤 상단 이동을 위한 Ref
  const ordersTopRef = useRef<HTMLDivElement>(null)
  const signalsTopRef = useRef<HTMLDivElement>(null)

  // ==========================================
  // [주문 내역] 상태 및 핸들러
  // ==========================================
  const [orderFilters, setOrderFilters] = useState({
    market: "",
    startDate: "",
    endDate: "",
    side: ""
  })
  const [orderPage, setOrderPage] = useState(0)
  const [orderPageSize, setOrderPageSize] = useState(10)

  // 주문 데이터 조회
  const { data: orderData, isLoading: isLoadingOrders } = useOrders({
    page: orderPage,
    size: orderPageSize,
    filters: orderFilters.market || orderFilters.startDate || orderFilters.endDate || orderFilters.side
      ? {
        market: orderFilters.market || undefined,
        startDate: orderFilters.startDate || undefined,
        endDate: orderFilters.endDate || undefined,
        side: orderFilters.side || undefined
      }
      : undefined
  })

  // 주문 필터 변경
  const handleOrderFilterChange = (newFilters: typeof orderFilters) => {
    setOrderFilters(newFilters)
    setOrderPage(0)
  }

  const handleOrderFilterReset = () => {
    setOrderFilters({ market: "", startDate: "", endDate: "", side: "" })
    setOrderPage(0)
  }

  // 주문 페이지 변경
  const handleOrderPageChange = (pageNum: number) => {
    setOrderPage(pageNum)
  }

  // 주문 페이지 변경 시 자동 스크롤
  useEffect(() => {
    // 첫 렌더링 시 스크롤 방지 (필요하다면 조건 추가)
    if (orderPage > 0 || orderData?.orders) {
      ordersTopRef.current?.scrollIntoView({ behavior: 'smooth' })
    }
  }, [orderPage])


  // ==========================================
  // [시그널 로그] 상태 및 핸들러
  // ==========================================
  const [signalFilters, setSignalFilters] = useState({
    market: "",
    startDate: "",
    endDate: "",
    strategyId: ""
  })
  const [signalPage, setSignalPage] = useState(0)
  const [signalPageSize, setSignalPageSize] = useState(10)

  // 시그널 데이터 조회
  const { data: signalData, isLoading: isLoadingSignals } = useSignals({
    page: signalPage,
    size: signalPageSize,
    filters: signalFilters.market || signalFilters.startDate || signalFilters.endDate || signalFilters.strategyId
      ? {
        market: signalFilters.market || undefined,
        startDate: signalFilters.startDate || undefined,
        endDate: signalFilters.endDate || undefined,
        strategyId: signalFilters.strategyId ? Number(signalFilters.strategyId) : undefined
      }
      : undefined
  })

  // 전략 목록 조회
  const { data: strategies } = useStrategies()

  // 시그널 필터 변경
  const handleSignalFilterChange = (newFilters: typeof signalFilters) => {
    setSignalFilters(newFilters)
    setSignalPage(0)
  }

  const handleSignalFilterReset = () => {
    setSignalFilters({ market: "", startDate: "", endDate: "", strategyId: "" })
    setSignalPage(0)
  }

  // 시그널 페이지 변경
  const handleSignalPageChange = (pageNum: number) => {
    setSignalPage(pageNum)
  }

  // 시그널 페이지 변경 시 자동 스크롤
  useEffect(() => {
    // 첫 렌더링 시 스크롤 방지 (필요하다면 조건 추가)
    if (signalPage > 0 || signalData?.signals) {
      signalsTopRef.current?.scrollIntoView({ behavior: 'smooth' })
    }
  }, [signalPage])

  // ==========================================
  // [모달] 관련 시그널 보기
  // ==========================================
  const [selectedOrderId, setSelectedOrderId] = useState<number | null>(null)
  const [showSignalModal, setShowSignalModal] = useState<boolean>(false)
  const { data: relatedSignal, isLoading: isLoadingRelatedSignal } = useRelatedSignal(selectedOrderId)

  const handleViewRelatedSignals = (orderId: number) => {
    setSelectedOrderId(orderId)
    setShowSignalModal(true)
  }

  // 날짜 포맷 함수
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString)
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")} ${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`
  }

  // 짧은 날짜 포맷 (모바일용)
  const formatShortDate = (dateString: string): string => {
    const date = new Date(dateString)
    return `${String(date.getMonth() + 1).padStart(2, "0")}.${String(date.getDate()).padStart(2, "0")} ${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`
  }

  // 모바일 주문 목록 렌더링
  const renderMobileOrderList = () => {
    if (isLoadingOrders) {
      return (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      )
    }

    if (!orderData?.orders || orderData.orders.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <AlertTriangle className="h-8 w-8 text-muted-foreground/50 mb-2" />
          <p className="text-muted-foreground">주문 내역이 없습니다</p>
        </div>
      )
    }

    return (
      <MobileCardGrid>
        {orderData.orders.map((order) => (
          <MobileDataCard
            key={order.id}
            header={order.market}
            subHeader={`주문 ID: ${order.id}`}
            headerRight={
              <Badge variant={order.side === "bid" ? "default" : "destructive"}>
                {order.side === "bid" ? "매수" : "매도"}
              </Badge>
            }
            rows={[
              {
                label: '주문 가격',
                value: `${order.price?.toLocaleString()} KRW`,
              },
              {
                label: '주문 수량',
                value: order.volume?.toLocaleString(undefined, { maximumFractionDigits: 8 }) || '-',
              },
              {
                label: '총 금액',
                value: `${order.totalAmount?.toLocaleString()} KRW`,
              },
              {
                label: '생성 시간',
                value: formatShortDate(order.createdAt),
              },
              {
                label: '시그널',
                value: order.relatedSignalId ? (
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-7 text-xs bg-blue-50 text-blue-700 border-blue-200"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleViewRelatedSignals(order.id)
                    }}
                  >
                    <Zap className="h-3 w-3 mr-1" />
                    보기
                  </Button>
                ) : '-',
                hidden: !order.relatedSignalId,
              },
            ]}
          />
        ))}
      </MobileCardGrid>
    )
  }

  // 모바일 시그널 목록 렌더링
  const renderMobileSignalList = () => {
    if (isLoadingSignals) {
      return (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      )
    }

    if (!signalData?.signals || signalData.signals.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <AlertTriangle className="h-8 w-8 text-muted-foreground/50 mb-2" />
          <p className="text-muted-foreground">시그널 로그가 없습니다</p>
        </div>
      )
    }

    return (
      <MobileCardGrid>
        {signalData.signals.map((signal) => (
          <MobileDataCard
            key={signal.id}
            header={signal.market}
            subHeader={`시그널 ID: ${signal.id}`}
            headerRight={
              <Badge variant={signal.side === "bid" ? "default" : "destructive"}>
                {signal.side === "bid" ? "매수" : "매도"}
              </Badge>
            }
            rows={[
              {
                label: '전략',
                value: signal.strategy,
              },
              {
                label: '트리거 조건',
                value: (
                  <code className="text-xs bg-muted px-1 py-0.5 rounded">
                    {signal.conditions || "-"}
                  </code>
                ),
              },
              {
                label: '생성 시간',
                value: formatShortDate(signal.createdAt),
              },
            ]}
          />
        ))}
      </MobileCardGrid>
    )
  }

  return (
    <AuthGuard>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h1 className="text-3xl font-bold tracking-tight">주문 관리</h1>
          <Button onClick={() => router.push("/")} variant="outline">
            대시보드로 돌아가기
          </Button>
        </div>

        {/* API 키 미등록 안내 (카드 형태) */}
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

        {/* 메인 컨텐츠 */}
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
            <TabsList className="w-full sm:w-auto">
              <TabsTrigger value="orders" className="flex-1 sm:flex-initial">주문 내역</TabsTrigger>
              <TabsTrigger value="signals" className="flex-1 sm:flex-initial">시그널 로그</TabsTrigger>
            </TabsList>

            {/* TAB: 주문 내역 */}
            <TabsContent value="orders" className="space-y-4">
              <div ref={ordersTopRef} className="scroll-mt-20" /> {/* 스크롤 앵커 */}
              <Card>
                <CardHeader>
                  <CardTitle>주문 내역</CardTitle>
                  <CardDescription>최근 주문 내역을 확인합니다.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <OrderFilters
                    filters={orderFilters}
                    onFilterChange={handleOrderFilterChange}
                    onReset={handleOrderFilterReset}
                  />

                  {/* 모바일 카드 / PC 테이블 분기 */}
                  {isMobile ? (
                    renderMobileOrderList()
                  ) : (
                    <div className="rounded-md border">
                      <div className="overflow-x-auto">
                        <table className="w-full border-collapse text-sm">
                          <thead>
                            <tr className="border-b bg-muted/50 transition-colors hover:bg-muted/50">
                              <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">주문 ID</th>
                              <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">마켓</th>
                              <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">주문 유형</th>
                              <th className="h-12 px-4 text-right align-middle font-medium text-muted-foreground">주문 가격</th>
                              <th className="h-12 px-4 text-right align-middle font-medium text-muted-foreground">주문 수량</th>
                              <th className="h-12 px-4 text-right align-middle font-medium text-muted-foreground">총 금액</th>
                              <th className="h-12 px-4 text-center align-middle font-medium text-muted-foreground">생성 시간</th>
                              <th className="h-12 px-4 text-center align-middle font-medium text-muted-foreground">시그널</th>
                            </tr>
                          </thead>
                          <tbody>
                            {isLoadingOrders ? (
                              <tr>
                                <td colSpan={8} className="h-24 text-center">
                                  <Loader2 className="h-6 w-6 animate-spin mx-auto text-muted-foreground" />
                                </td>
                              </tr>
                            ) : !orderData?.orders || orderData.orders.length === 0 ? (
                              <tr>
                                <td colSpan={8} className="h-24 text-center">
                                  <div className="flex flex-col items-center justify-center space-y-2">
                                    <AlertTriangle className="h-8 w-8 text-muted-foreground/50" />
                                    <p className="text-muted-foreground">주문 내역이 없습니다</p>
                                  </div>
                                </td>
                              </tr>
                            ) : (
                              orderData.orders.map((order) => (
                                <tr key={order.id} className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                                  <td className="p-4 align-middle">{order.id}</td>
                                  <td className="p-4 align-middle font-medium">{order.market}</td>
                                  <td className="p-4 align-middle">
                                    <Badge variant={order.side === "bid" ? "default" : "destructive"}>
                                      {order.side === "bid" ? "매수" : "매도"}
                                    </Badge>
                                  </td>
                                  <td className="p-4 align-middle text-right">{order.price?.toLocaleString()} KRW</td>
                                  <td className="p-4 align-middle text-right">
                                    {order.volume?.toLocaleString(undefined, { maximumFractionDigits: 8 })}
                                  </td>
                                  <td className="p-4 align-middle text-right font-medium">
                                    {order.totalAmount?.toLocaleString()} KRW
                                  </td>
                                  <td className="p-4 align-middle text-center text-muted-foreground">
                                    {formatDate(order.createdAt)}
                                  </td>
                                  <td className="p-4 align-middle text-center">
                                    {order.relatedSignalId && (
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        className="h-8 text-xs bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100 hover:text-blue-800"
                                        onClick={() => handleViewRelatedSignals(order.id)}
                                      >
                                        <Zap className="h-3 w-3 mr-1" />
                                        시그널
                                      </Button>
                                    )}
                                  </td>
                                </tr>
                              ))
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  {/* 페이지네이션 */}
                  {orderData && (
                    <TablePagination
                      currentPage={orderData.currentPage}
                      totalPages={orderData.totalPages}
                      pageSize={orderData.pageSize}
                      totalElements={orderData.totalElements}
                      onPageChange={handleOrderPageChange}
                      onPageSizeChange={setOrderPageSize}
                    />
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* TAB: 시그널 로그 */}
            <TabsContent value="signals" className="space-y-4">
              <div ref={signalsTopRef} className="scroll-mt-20" /> {/* 스크롤 앵커 */}
              
              {/* 시그널 차트 */}
              <SignalChart signals={signalData?.signals} />

              <Card>
                <CardHeader>
                  <CardTitle>시그널 로그</CardTitle>
                  <CardDescription>모든 자동 매매 시그널 로그를 확인합니다. 전략 선택에 참고하세요.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <SignalFilters
                    filters={signalFilters}
                    onFilterChange={handleSignalFilterChange}
                    onReset={handleSignalFilterReset}
                    strategies={strategies || []}
                  />

                  {/* 모바일 카드 / PC 테이블 분기 */}
                  {isMobile ? (
                    renderMobileSignalList()
                  ) : (
                    <div className="rounded-md border">
                      <div className="overflow-x-auto">
                        <table className="w-full border-collapse text-sm">
                          <thead>
                            <tr className="border-b bg-muted/50 transition-colors hover:bg-muted/50">
                              <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">시그널 ID</th>
                              <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">전략</th>
                              <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">마켓</th>
                              <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">매매 유형</th>
                              <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">트리거 조건</th>
                              <th className="h-12 px-4 text-center align-middle font-medium text-muted-foreground">생성 시간</th>
                            </tr>
                          </thead>
                          <tbody>
                            {isLoadingSignals ? (
                              <tr>
                                <td colSpan={6} className="h-24 text-center">
                                  <Loader2 className="h-6 w-6 animate-spin mx-auto text-muted-foreground" />
                                </td>
                              </tr>
                            ) : !signalData?.signals || signalData.signals.length === 0 ? (
                              <tr>
                                <td colSpan={6} className="h-24 text-center">
                                  <div className="flex flex-col items-center justify-center space-y-2">
                                    <AlertTriangle className="h-8 w-8 text-muted-foreground/50" />
                                    <p className="text-muted-foreground">시그널 로그가 없습니다</p>
                                  </div>
                                </td>
                              </tr>
                            ) : (
                              signalData.signals.map((signal) => (
                                <tr key={signal.id} className="border-b transition-colors hover:bg-muted/50">
                                  <td className="p-4 align-middle">{signal.id}</td>
                                  <td className="p-4 align-middle">{signal.strategy}</td>
                                  <td className="p-4 align-middle font-medium">{signal.market}</td>
                                  <td className="p-4 align-middle">
                                    <Badge variant={signal.side === "bid" ? "default" : "destructive"}>
                                      {signal.side === "bid" ? "매수" : "매도"}
                                    </Badge>
                                  </td>
                                  <td className="p-4 align-middle">
                                    <code className="relative rounded bg-muted px-[0.3rem] py-[0.2rem] font-mono text-sm">
                                      {signal.conditions || "-"}
                                    </code>
                                  </td>
                                  <td className="p-4 align-middle text-center text-muted-foreground">
                                    {formatDate(signal.createdAt)}
                                  </td>
                                </tr>
                              ))
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  {/* 페이지네이션 */}
                  {signalData && (
                    <TablePagination
                      currentPage={signalData.currentPage}
                      totalPages={signalData.totalPages}
                      pageSize={signalData.pageSize}
                      totalElements={signalData.totalElements}
                      onPageChange={handleSignalPageChange}
                      onPageSizeChange={setSignalPageSize}
                    />
                  )}
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
              ) : isMobile ? (
                /* 모바일 모달 */
                isLoadingRelatedSignal ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                  </div>
                ) : relatedSignal && (
                  <MobileDataCard
                    header={relatedSignal.market}
                    subHeader={`시그널 ID: ${relatedSignal.id}`}
                    headerRight={
                      <Badge variant={relatedSignal.side === "bid" ? "default" : "destructive"}>
                        {relatedSignal.side === "bid" ? "매수" : "매도"}
                      </Badge>
                    }
                    rows={[
                      { label: '전략', value: relatedSignal.strategy },
                      { label: '생성 시간', value: formatShortDate(relatedSignal.createdAt) },
                    ]}
                  />
                )
              ) : (
                /* PC 모달 테이블 */
                <div className="rounded-md border">
                  <table className="w-full border-collapse text-sm">
                    <thead className="bg-muted/50">
                      <tr className="border-b">
                        <th className="h-10 px-4 text-left align-middle font-medium text-muted-foreground">시그널 ID</th>
                        <th className="h-10 px-4 text-left align-middle font-medium text-muted-foreground">전략</th>
                        <th className="h-10 px-4 text-left align-middle font-medium text-muted-foreground">마켓</th>
                        <th className="h-10 px-4 text-left align-middle font-medium text-muted-foreground">매매 유형</th>
                        <th className="h-10 px-4 text-center align-middle font-medium text-muted-foreground">생성 시간</th>
                      </tr>
                    </thead>
                    <tbody>
                      {isLoadingRelatedSignal ? (
                        <tr>
                          <td colSpan={5} className="h-24 text-center">
                            <Loader2 className="h-6 w-6 animate-spin mx-auto text-muted-foreground" />
                          </td>
                        </tr>
                      ) : relatedSignal && (
                        <tr className="border-b hover:bg-muted/50">
                          <td className="p-4 align-middle">{relatedSignal.id}</td>
                          <td className="p-4 align-middle">{relatedSignal.strategy}</td>
                          <td className="p-4 align-middle">{relatedSignal.market}</td>
                          <td className="p-4 align-middle">
                            <Badge variant={relatedSignal.side === "bid" ? "default" : "destructive"}>
                              {relatedSignal.side === "bid" ? "매수" : "매도"}
                            </Badge>
                          </td>
                          <td className="p-4 align-middle text-center text-muted-foreground">
                            {formatDate(relatedSignal.createdAt)}
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </AuthGuard>
  )
}
