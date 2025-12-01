/**
 * Order and Signal related types
 * 백엔드 엔티티 기반 타입 정의
 */

export type OrderStatus = 'wait' | 'done' | 'cancel'
export type OrderSide = 'bid' | 'ask'
export type OrderType = 'limit' | 'price' | 'market'

/**
 * 주문 내역
 * 백엔드: Orders 엔티티
 */
export interface Order {
  id: number
  market: string          // Market 엔티티의 market 코드 (예: "KRW-BTC")
  side: OrderSide         // 주문 방향 (bid: 매수, ask: 매도)
  price: number           // 주문가
  volume: number          // 주문 수량
  totalAmount: number     // 총 주문 금액 (price * volume)
  createdAt: string       // 생성일시 (ISO string)
  relatedSignalId?: number // 관련 시그널 ID

  // Optional fields (might be used in other contexts or detail view)
  status?: OrderStatus    // 주문 상태
  ordType?: OrderType     // 주문 유형
  uuid?: string           // 업비트 주문 UUID
  errorMessage?: string   // 주문 실패 시 오류 메시지
  updatedAt?: string      // 수정일시
}

/**
 * 매매 시그널
 * 백엔드: Signals 엔티티
 */
export interface Signal {
  id: number
  strategy: string        // 전략 이름
  market: string          // Market 엔티티의 market 코드
  side: OrderSide         // 매매 방향
  createdAt: string       // 생성일시 (ISO string)
  conditions?: string     // 전략 조건
  relatedOrderId?: number // 관련 주문 ID
}
