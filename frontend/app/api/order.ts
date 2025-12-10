/**
 * Order API Client
 * 주문 관련 API 호출
 */

import api from './api'
import type { Order, Signal, SuccessResponse } from '@/types'

interface OrderListResponse {
  orders: Order[]
  totalPages: number
  totalElements: number
  currentPage: number
  pageSize: number
  hasMore: boolean
}

interface OrderFilters {
  market?: string
  startDate?: string
  endDate?: string
  side?: string
}

/**
 * 주문 내역 조회
 * GET /order?page=0&size=10&market=KRW-BTC&startDate=2025-12-01&endDate=2025-12-08&side=bid
 */
export const getOrders = async (
  page: number = 0,
  size: number = 10,
  filters?: OrderFilters
): Promise<OrderListResponse> => {
  // 쿼리 파라미터 구성
  const params = new URLSearchParams({
    page: String(page),
    size: String(size),
  })

  if (filters?.market) params.append('market', filters.market)
  if (filters?.startDate) params.append('startDate', filters.startDate)
  if (filters?.endDate) params.append('endDate', filters.endDate)
  if (filters?.side) params.append('side', filters.side)

  const { data } = await api.get<SuccessResponse<OrderListResponse>>(`/order?${params.toString()}`)
  return data.data || {
    orders: [],
    totalPages: 0,
    totalElements: 0,
    currentPage: page,
    pageSize: size,
    hasMore: false
  }
}

/**
 * 주문과 관련된 시그널 조회
 * GET /order/{orderId}/signal
 */
export const getSignalByOrderId = async (orderId: number): Promise<Signal> => {
  const { data } = await api.get<SuccessResponse<Signal>>(`/order/${orderId}/signal`)
  return data.data!
}
