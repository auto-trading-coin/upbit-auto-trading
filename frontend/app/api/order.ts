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

/**
 * 주문 내역 조회
 * GET /order?page=0&size=10
 */
export const getOrders = async (page: number = 0, size: number = 10): Promise<OrderListResponse> => {
  const { data } = await api.get<SuccessResponse<OrderListResponse>>(`/order?page=${page}&size=${size}`)
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
