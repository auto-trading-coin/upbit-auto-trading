import { useQuery } from '@tanstack/react-query'
import { getPortfolio } from '@/app/api/portfolio'
import { queryKeys } from '@/lib/utils/queryKeys'
import { useUser } from './useUser'

/**
 * 포트폴리오 조회 Hook
 * 
 * API 키가 등록된 경우에만 실행
 * 
 * @returns 포트폴리오 쿼리 결과
 * 
 * @example
 * ```tsx
 * const { data: portfolio, isLoading } = usePortfolio()
 * 
 * if (isLoading) return <div>Loading...</div>
 * if (!portfolio) return null
 * 
 * return (
 *   <div>
 *     <p>총 자산: {portfolio.totalAsset.toLocaleString()}원</p>
 *     <p>현금: {portfolio.cashBalance.toLocaleString()}원</p>
 *     <p>코인 평가액: {portfolio.coinValue.toLocaleString()}원</p>
 *   </div>
 * )
 * ```
 */
export const usePortfolio = () => {
  const { data: user } = useUser()
  
  return useQuery({
    queryKey: queryKeys.portfolio.current(),
    queryFn: getPortfolio,
    enabled: !!user?.apiKeyRegistered,  // API 키가 있을 때만 실행
    staleTime: 5000,  // 5초
    refetchInterval: 10000,  // 10초마다 자동 갱신
  })
}
