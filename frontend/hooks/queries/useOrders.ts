import { useQuery } from '@tanstack/react-query'
import { getOrders } from '@/app/api/order'
import { queryKeys } from '@/lib/utils/queryKeys'
import { useUser } from './useUser'

interface OrderFilters {
  market?: string
  startDate?: string
  endDate?: string
  side?: string
}

interface UseOrdersOptions {
  page?: number
  size?: number
  filters?: OrderFilters
}

/**
 * 주문 내역 조회 Hook
 * 
 * 페이지네이션 및 필터링 지원 (page는 0부터 시작)
 * 
 * @param options - 페이지 옵션 및 필터
 * @returns 주문 내역 쿼리 결과
 * 
 * @example
 * ```tsx
 * const { data, isLoading } = useOrders({ 
 *   page: 0, 
 *   size: 10,
 *   filters: { market: 'KRW-BTC', side: 'bid' }
 * })
 * ```
 */
export const useOrders = (options: UseOrdersOptions = {}) => {
  const { page = 0, size = 10, filters } = options
  const { data: user } = useUser()

  return useQuery({
    queryKey: [...queryKeys.orders.list(page), size, filters],
    queryFn: () => getOrders(page, size, filters),
    enabled: !!user?.apiKeyRegistered,  // API 키가 있을 때만 실행
    staleTime: 10000,  // 10초
  })
}
