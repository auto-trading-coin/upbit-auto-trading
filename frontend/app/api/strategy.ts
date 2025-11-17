/**
 * Strategy API Client
 * 전략 관련 API 호출
 */

import api from './api'
import type { Strategy, StrategyDetail, SuccessResponse, UpdateStrategyRequest } from '@/types'

/**
 * 전체 전략 목록 조회
 * GET /strategy
 */
export const getAllStrategies = async (): Promise<Strategy[]> => {
  const { data } = await api.get<SuccessResponse<Strategy[]>>('/strategy')
  return data.data || []
}

/**
 * 전략 상세 정보 조회
 * GET /strategy/{id}
 */
export const getStrategyDetail = async (id: number): Promise<StrategyDetail> => {
  const { data } = await api.get<SuccessResponse<StrategyDetail>>(`/strategy/${id}`)
  return data.data!
}

/**
 * 사용자의 전략 변경
 * PATCH /strategy
 */
export const updateStrategy = async (strategyId: number): Promise<void> => {
  const requestBody: UpdateStrategyRequest = { strategyId }
  await api.patch<SuccessResponse>('/strategy', requestBody)
}
