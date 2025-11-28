import { useQuery } from '@tanstack/react-query'
import { getAllStrategies } from '@/app/api/strategy'
import { queryKeys } from '@/lib/utils/queryKeys'
import { useUser } from './useUser'

/**
 * 전체 전략 목록 조회 Hook
 * 
 * 전략 목록은 거의 변경되지 않으므로 staleTime을 무한으로 설정
 * 로그인 상태에서만 조회 (인증 필요 API)
 * 
 * @returns 전략 목록 쿼리 결과
 * 
 * @example
 * ```tsx
 * const { data: strategies, isLoading } = useStrategies()
 * 
 * return (
 *   <div>
 *     {strategies?.map(strategy => (
 *       <div key={strategy.id}>{strategy.name}</div>
 *     ))}
 *   </div>
 * )
 * ```
 */
export const useStrategies = () => {
  const { data: user } = useUser()
  
  return useQuery({
    queryKey: queryKeys.strategies.list(),
    queryFn: getAllStrategies,
    staleTime: Infinity,  // 전략 목록은 거의 변경 없음 - 캐시 무한 유지
    enabled: !!user,      // 로그인 상태에서만 호출
  })
}
