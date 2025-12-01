import { useQuery } from '@tanstack/react-query'
import { getSignalByOrderId } from '@/app/api/order'
import { queryKeys } from '@/lib/utils/queryKeys'

/**
 * 특정 주문의 관련 시그널 조회 Hook
 * 
 * @param orderId - 주문 ID
 * @returns 주문과 관련된 시그널 쿼리 결과
 * 
 * @example
 * ```tsx
 * const { data: signal, isLoading } = useRelatedSignal(orderId)
 * 
 * return (
 *   <div>
 *     {signal && (
 *       <div>
 *         {signal.strategy} - {signal.market} - {signal.side}
 *       </div>
 *     )}
 *   </div>
 * )
 * ```
 */
export const useRelatedSignal = (orderId: number | null) => {
    return useQuery({
        queryKey: queryKeys.signals.byOrder(orderId!),
        queryFn: () => getSignalByOrderId(orderId!),
        enabled: !!orderId,  // orderId가 있을 때만 실행
        staleTime: 30000,  // 30초
    })
}
