import { useQuery } from '@tanstack/react-query'
import { useUser } from './useUser'
import { queryKeys } from '@/lib/utils/queryKeys'

/**
 * 자동매매 상태 조회 Hook
 * 
 * 현재는 user 정보에서 파생되지만, 추후 별도 API가 생기면 교체 가능
 * 
 * @returns 자동매매 상태 쿼리 결과
 * 
 * @example
 * ```tsx
 * const { data: tradingStatus } = useTradingStatus()
 * 
 * return (
 *   <div>
 *     <p>자동매매 상태: {tradingStatus?.isRunning ? '실행 중' : '중지됨'}</p>
 *     <p>API 키: {tradingStatus?.hasApiKey ? '등록됨' : '미등록'}</p>
 *     <p>전략: {tradingStatus?.strategyRegistered ? '등록됨' : '미등록'}</p>
 *   </div>
 * )
 * ```
 */
export const useTradingStatus = () => {
  const { data: user } = useUser()
  
  return useQuery({
    queryKey: queryKeys.trading.status(),
    queryFn: async () => {
      // TODO: 백엔드 API 구현 시 실제 엔드포인트로 교체
      // const { data } = await api.get('/trading/status')
      // return data.data
      
      // 현재는 user 정보에서 파생
      return {
        isRunning: user?.tradeActive || false,
        hasApiKey: user?.apiKeyRegistered || false,
        strategyRegistered: user?.strategyRegistered || false,
        strategyId: user?.strategyId || null,
      }
    },
    enabled: !!user,  // user가 로드된 후에만 실행
    staleTime: 5000,  // 5초
    // ✨ refetchInterval 제거: Optimistic Update로 즉시 반영되므로 불필요
  })
}
