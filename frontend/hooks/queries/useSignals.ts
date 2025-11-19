import { useQuery } from '@tanstack/react-query'
import { getSignals } from '@/app/api/order'
import { queryKeys } from '@/lib/utils/queryKeys'
import { useUser } from './useUser'

interface UseSignalsOptions {
  page?: number
  size?: number
}

/**
 * 시그널 로그 조회 Hook
 * 
 * 전략 서버에서 생성한 매매 시그널 내역 조회
 * 
 * @param options - 페이지 옵션
 * @returns 시그널 로그 쿼리 결과
 * 
 * @example
 * ```tsx
 * const { data: signals, isLoading } = useSignals({ page: 1, size: 20 })
 * 
 * return (
 *   <div>
 *     {signals?.map(signal => (
 *       <div key={signal.id}>
 *         {signal.market} - {signal.side} - {signal.strategyName}
 *       </div>
 *     ))}
 *   </div>
 * )
 * ```
 */
export const useSignals = (options: UseSignalsOptions = {}) => {
  const { page = 1, size = 20 } = options
  const { data: user } = useUser()
  
  return useQuery({
    queryKey: queryKeys.signals.list(),
    queryFn: () => getSignals(page, size),
    enabled: !!user?.apiKeyRegistered,  // API 키가 있을 때만 실행
    staleTime: 10000,  // 10초
  })
}
