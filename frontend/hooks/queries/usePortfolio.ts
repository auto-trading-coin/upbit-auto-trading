import { useQuery } from '@tanstack/react-query'
import { getPortfolio } from '@/app/api/portfolio'
import { queryKeys } from '@/lib/utils/queryKeys'
import { useUser } from './useUser'
import type { PortfolioData } from '@/types'

/**
 * 포트폴리오 조회 Hook (실시간 업데이트)
 * 
 * 업비트 잔고를 조회하고 실시간 가격 업데이트
 * (WebSocket 구독은 useMarkets에서 처리)
 * 
 * @returns 포트폴리오 쿼리 결과 { holdings: Holding[], cashBalance: number }
 */
export const usePortfolio = () => {
  const { data: user } = useUser()
  
  return useQuery<PortfolioData>({
    queryKey: queryKeys.portfolio.current(),
    queryFn: getPortfolio,
    enabled: !!user?.apiKeyRegistered,  // API 키 등록된 경우에만
    staleTime: 10000,  // 10초
    refetchInterval: 30000,  // 30초마다 갱신 (잔고 변동 확인)
  })
}
