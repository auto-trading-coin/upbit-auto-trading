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
  ordType: OrderType      // 주문 유형
  volume: number          // 주문 수량
  price: number | null    // 주문가 (시장가의 경우 null)
  status: OrderStatus     // 주문 상태
  uuid?: string           // 업비트 주문 UUID (주문 성공 시)
  errorMessage?: string   // 주문 실패 시 오류 메시지
  createdAt: string       // 생성일시 (ISO string)
  updatedAt: string       // 수정일시 (ISO string)
  relatedSignalId?: number // 관련 시그널 ID
}

/**
 * 매매 시그널
 * 백엔드: Signals 엔티티
 */
export interface Signal {
  id: number
  strategyId: number      // 전략 ID
  strategyName: string    // 전략 이름 (조회 시 편의를 위해)
  market: string          // Market 엔티티의 market 코드
  side: OrderSide         // 매매 방향
  createdAt: string       // 생성일시 (ISO string)
  relatedOrderId?: number // 관련 주문 ID (시그널이 실행되어 주문이 생성된 경우)
}
