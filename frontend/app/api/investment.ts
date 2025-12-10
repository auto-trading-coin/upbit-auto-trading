/**
 * Investment Profit API Client
 * 투자손익 데이터 조회 (백엔드 API 연동)
 */

import api from './api'
import type {
  DailyProfitResponse,
  MonthlyProfitResponse,
  YearlyProfitResponse,
  TradingMetrics,
  SuccessResponse,
} from '@/types'

// ============================================
// API 함수
// ============================================

/**
 * 일별 투자손익 조회
 * @param year 연도
 * @param month 월 (1-12)
 */
export const getDailyProfit = async (
  year: number,
  month: number
): Promise<DailyProfitResponse> => {
  const { data } = await api.get<SuccessResponse<DailyProfitResponse>>(
    `/portfolio/profit/daily?year=${year}&month=${month}`
  )
  return data.data!
}

/**
 * 월별 투자손익 조회
 * @param year 연도
 */
export const getMonthlyProfit = async (
  year: number
): Promise<MonthlyProfitResponse> => {
  const { data } = await api.get<SuccessResponse<MonthlyProfitResponse>>(
    `/portfolio/profit/monthly?year=${year}`
  )
  return data.data!
}

/**
 * 연도별 투자손익 조회
 */
export const getYearlyProfit = async (): Promise<YearlyProfitResponse> => {
  const { data } = await api.get<SuccessResponse<YearlyProfitResponse>>(
    `/portfolio/profit/yearly`
  )
  return data.data!
}

/**
 * 전체 기간 트레이딩 지표 조회
 */
export const getTradingMetrics = async (): Promise<TradingMetrics> => {
  const { data } = await api.get<SuccessResponse<TradingMetrics>>(
    `/portfolio/profit/metrics`
  )
  return data.data!
}

/**
 * 사용 가능한 연도 목록 조회
 */
export const getAvailableYears = async (): Promise<number[]> => {
  const { data } = await api.get<SuccessResponse<number[]>>(
    `/portfolio/profit/years`
  )
  return data.data ?? []
}
