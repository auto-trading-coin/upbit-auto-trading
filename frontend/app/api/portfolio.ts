/**
 * Portfolio API Client
 * 자산 현황 관련 API 호출 (백엔드 구현 후 추가 예정)
 */

import api from './api'
import type { Portfolio, AssetHistoryItem, PeriodHistoryItem, SuccessResponse } from '@/types'

/**
 * 현재 포트폴리오 조회 (추후 구현)
 * GET /portfolio
 */
export const getPortfolio = async (): Promise<Portfolio> => {
  const { data } = await api.get<SuccessResponse<Portfolio>>('/portfolio')
  return data.data!
}

/**
 * 자산 변동 내역 조회 (추후 구현)
 * GET /portfolio/history?period=daily
 */
export const getAssetHistory = async (period: 'daily' | 'weekly' | 'monthly' | 'yearly'): Promise<AssetHistoryItem[] | PeriodHistoryItem[]> => {
  const { data } = await api.get<SuccessResponse<AssetHistoryItem[] | PeriodHistoryItem[]>>(`/portfolio/history?period=${period}`)
  return data.data || []
}
