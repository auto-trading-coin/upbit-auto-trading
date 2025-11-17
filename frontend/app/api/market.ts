/**
 * Market API Client
 * 시세 관련 API 호출 (백엔드 구현 후 추가 예정)
 */

import api from './api'
import type { MarketData, SuccessResponse } from '@/types'

/**
 * 전체 마켓 목록 조회 (추후 구현)
 * GET /market/list
 */
export const getMarketList = async (): Promise<MarketData[]> => {
  const { data } = await api.get<SuccessResponse<MarketData[]>>('/market/list')
  return data.data || []
}

/**
 * 특정 마켓 시세 조회 (추후 구현)
 * GET /market/ticker/{market}
 */
export const getMarketTicker = async (market: string): Promise<MarketData> => {
  const { data } = await api.get<SuccessResponse<MarketData>>(`/market/ticker/${market}`)
  return data.data!
}
