/**
 * Investment Profit Query Hooks
 * 투자손익 데이터 조회를 위한 React Query 훅
 */

import { useQuery } from '@tanstack/react-query'
import {
  getDailyProfit,
  getMonthlyProfit,
  getYearlyProfit,
  getTradingMetrics,
  getAvailableYears,
} from '@/app/api/investment'
import { queryKeys } from '@/lib/utils/queryKeys'
import { useUser } from './useUser'
import type {
  DailyProfitResponse,
  MonthlyProfitResponse,
  YearlyProfitResponse,
  TradingMetrics,
} from '@/types'

/**
 * 일별 투자손익 조회 Hook
 * 
 * @param year 연도
 * @param month 월 (1-12)
 * @example
 * ```tsx
 * const { data, isLoading } = useDailyProfit(2025, 12)
 * ```
 */
export const useDailyProfit = (year: number, month: number) => {
  const { data: user } = useUser()
  
  return useQuery<DailyProfitResponse>({
    queryKey: [...queryKeys.portfolio.history('daily'), year, month],
    queryFn: () => getDailyProfit(year, month),
    enabled: !!user?.apiKeyRegistered && year > 0 && month > 0,
    staleTime: 60000, // 1분
  })
}

/**
 * 월별 투자손익 조회 Hook
 * 
 * @param year 연도
 * @example
 * ```tsx
 * const { data, isLoading } = useMonthlyProfit(2025)
 * ```
 */
export const useMonthlyProfit = (year: number) => {
  const { data: user } = useUser()
  
  return useQuery<MonthlyProfitResponse>({
    queryKey: [...queryKeys.portfolio.history('monthly'), year],
    queryFn: () => getMonthlyProfit(year),
    enabled: !!user?.apiKeyRegistered && year > 0,
    staleTime: 60000,
  })
}

/**
 * 연도별 투자손익 조회 Hook
 * 
 * @example
 * ```tsx
 * const { data, isLoading } = useYearlyProfit()
 * ```
 */
export const useYearlyProfit = () => {
  const { data: user } = useUser()
  
  return useQuery<YearlyProfitResponse>({
    queryKey: queryKeys.portfolio.history('yearly'),
    queryFn: getYearlyProfit,
    enabled: !!user?.apiKeyRegistered,
    staleTime: 60000,
  })
}

/**
 * 전체 기간 트레이딩 지표 조회 Hook
 * 
 * @example
 * ```tsx
 * const { data, isLoading } = useTradingMetrics()
 * ```
 */
export const useTradingMetrics = () => {
  const { data: user } = useUser()
  
  return useQuery<TradingMetrics>({
    queryKey: [...queryKeys.portfolio.all, 'metrics'],
    queryFn: getTradingMetrics,
    enabled: !!user?.apiKeyRegistered,
    staleTime: 300000, // 5분
  })
}

/**
 * 사용 가능한 연도 목록 조회 Hook
 */
export const useAvailableYears = () => {
  const { data: user } = useUser()
  
  return useQuery<number[]>({
    queryKey: [...queryKeys.portfolio.all, 'available-years'],
    queryFn: getAvailableYears,
    enabled: !!user?.apiKeyRegistered,
    staleTime: 3600000, // 1시간
  })
}
