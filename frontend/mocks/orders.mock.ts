/**
 * Mock data generators for orders and signals
 * 개발 및 테스트용
 */

import type { Order, Signal, OrderSide, OrderStatus, OrderType } from '@/types'

const markets = ["BTC-KRW", "ETH-KRW", "XRP-KRW", "SOL-KRW", "ADA-KRW"]
const strategies = ["이동평균 돌파", "RSI 과매수/과매도", "볼린저밴드 돌파", "MACD 크로스", "가격 돌파"]

/**
 * 더미 주문 데이터 생성 함수
 */
export const generateDummyOrders = (count: number): Order[] => {
  const sides: OrderSide[] = ["bid", "ask"]
  const statuses: OrderStatus[] = ["wait", "done", "cancel"]
  const ordTypes: OrderType[] = ["limit", "price", "market"]
  const now = new Date()

  return Array.from({ length: count }).map((_, index) => {
    const market = markets[Math.floor(Math.random() * markets.length)]
    const side = sides[Math.floor(Math.random() * sides.length)]
    const status = statuses[Math.floor(Math.random() * statuses.length)]
    const ordType = ordTypes[Math.floor(Math.random() * ordTypes.length)]
    const price = ordType === "market" ? null : Math.floor(Math.random() * 50000000) + 1000000
    const volume = Number((Math.random() * 2).toFixed(4))

    // 생성 시간을 최근 7일 내로 랜덤하게 설정
    const createdAt = new Date(now)
    createdAt.setDate(now.getDate() - Math.floor(Math.random() * 7))
    createdAt.setHours(Math.floor(Math.random() * 24))
    createdAt.setMinutes(Math.floor(Math.random() * 60))

    const updatedAt = new Date(createdAt)
    updatedAt.setMinutes(createdAt.getMinutes() + Math.floor(Math.random() * 10))

    const hasRelatedSignal = Math.random() > 0.7 // 30% 확률로 관련 시그널 있음

    return {
      id: index + 1,
      market,
      side,
      ordType,
      price,
      volume,
      status,
      uuid: status === "done" ? `uuid-${index + 1}` : undefined,
      errorMessage: status === "cancel" ? "주문 취소됨" : undefined,
      createdAt: createdAt.toISOString(),
      updatedAt: updatedAt.toISOString(),
      relatedSignalId: hasRelatedSignal ? Math.floor(Math.random() * 100) + 1 : undefined,
    }
  })
}

/**
 * 더미 시그널 데이터 생성 함수
 */
export const generateDummySignals = (count: number): Signal[] => {
  const sides: OrderSide[] = ["bid", "ask"]
  const now = new Date()

  return Array.from({ length: count }).map((_, index) => {
    const market = markets[Math.floor(Math.random() * markets.length)]
    const side = sides[Math.floor(Math.random() * sides.length)]
    const strategyId = Math.floor(Math.random() * 5) + 1
    const strategyName = strategies[strategyId - 1]

    // 생성 시간을 최근 7일 내로 랜덤하게 설정
    const createdAt = new Date(now)
    createdAt.setDate(now.getDate() - Math.floor(Math.random() * 7))
    createdAt.setHours(Math.floor(Math.random() * 24))
    createdAt.setMinutes(Math.floor(Math.random() * 60))

    const hasRelatedOrder = Math.random() > 0.5

    return {
      id: index + 1,
      strategyId,
      strategyName,
      market,
      side,
      createdAt: createdAt.toISOString(),
      relatedOrderId: hasRelatedOrder ? Math.floor(Math.random() * 100) + 1 : undefined,
    }
  })
}

// 초기 더미 데이터
export const INITIAL_ORDERS = generateDummyOrders(20)
export const INITIAL_SIGNALS = generateDummySignals(20)
