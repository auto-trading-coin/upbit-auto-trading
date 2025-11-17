/**
 * Order API Client
 * 주문 관련 API 호출 (백엔드 구현 후 추가 예정)
 */

import api from './api'
import type { Order, Signal, SuccessResponse } from '@/types'

/**
 * 주문 내역 조회 (추후 구현)
 * GET /orders?page=1&size=20
 */
export const getOrders = async (page: number = 1, size: number = 20): Promise<Order[]> => {
  const { data } = await api.get<SuccessResponse<Order[]>>(`/orders?page=${page}&size=${size}`)
  return data.data || []
}

/**
 * 주문 취소 (추후 구현)
 * DELETE /orders/{orderId}
 */
export const cancelOrder = async (orderId: string): Promise<void> => {
  await api.delete<SuccessResponse>(`/orders/${orderId}`)
}

/**
 * 시그널 로그 조회 (추후 구현)
 * GET /signals?page=1&size=20
 */
export const getSignals = async (page: number = 1, size: number = 20): Promise<Signal[]> => {
  const { data } = await api.get<SuccessResponse<Signal[]>>(`/signals?page=${page}&size=${size}`)
  return data.data || []
}

/**
 * 주문과 관련된 시그널 조회 (추후 구현)
 * GET /signals/order/{orderId}
 */
export const getSignalsByOrderId = async (orderId: string): Promise<Signal[]> => {
  const { data } = await api.get<SuccessResponse<Signal[]>>(`/signals/order/${orderId}`)
  return data.data || []
}
