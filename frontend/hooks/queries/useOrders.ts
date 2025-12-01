import { useQuery } from '@tanstack/react-query'
import { getOrders } from '@/app/api/order'
import { queryKeys } from '@/lib/utils/queryKeys'
import { useUser } from './useUser'

interface UseOrdersOptions {
  page?: number
  size?: number
}

/**
 * 주문 내역 조회 Hook
 * 
 * 페이지네이션 지원 (page는 0부터 시작)
 * 
 * @param options - 페이지 옵션
 * @returns 주문 내역 쿼리 결과
 * 
 * @example
 * ```tsx
 * const { data, isLoading } = useOrders({ page: 0, size: 10 })
 * 
 * return (
 *   <div>
 *     {data?.orders.map(order => (
 *       <div key={order.id}>
 *         {order.market} - {order.side}
 *       </div>
 *     ))}
 *   </div>
 * )
 * ```
 */
export const useOrders = (options: UseOrdersOptions = {}) => {
  const { page = 0, size = 10 } = options
  const { data: user } = useUser()

  return useQuery({
    queryKey: [...queryKeys.orders.list(page), size],  // size도 포함!
    queryFn: () => getOrders(page, size),
    enabled: !!user?.apiKeyRegistered,  // API 키가 있을 때만 실행
    staleTime: 10000,  // 10초
  })
}
