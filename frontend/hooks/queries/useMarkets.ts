import { useQuery } from '@tanstack/react-query'
import { useEffect } from 'react'
import { getMarketList } from '@/app/api/market'
import { queryKeys } from '@/lib/utils/queryKeys'
import { useWebSocketStore } from '@/stores'
import { useWebSocket } from '../useWebSocket'

/**
 * 마켓 목록 조회 Hook (WebSocket 통합)
 * 
 * 실시간 시세 데이터를 조회하고 WebSocket으로 자동 업데이트합니다.
 * 
 * @returns 마켓 목록 쿼리 결과
 * 
 * @example
 * ```tsx
 * const { data: markets, isLoading } = useMarkets()
 * 
 * return (
 *   <div>
 *     {markets?.map(market => (
 *       <div key={market.market}>
 *         {market.koreanName}: {market.currentPrice.toLocaleString()}원
 *       </div>
 *     ))}
 *   </div>
 * )
 * ```
 */
export const useMarkets = () => {
  const { addSubscription, removeSubscription } = useWebSocketStore()
  
  // WebSocket 연결 활성화
  useWebSocket()
  
  const query = useQuery({
    queryKey: queryKeys.markets.list(),
    queryFn: getMarketList,
    staleTime: 5000,  // 5초
    refetchInterval: 10000,  // Fallback 폴링 (10초마다)
  })
  
  // 마켓 목록 로드 시 WebSocket 구독
  useEffect(() => {
    if (query.data && query.data.length > 0) {
      // 모든 마켓 구독 추가
      query.data.forEach(market => {
        addSubscription(market.market)
      })
      
      console.log(`[useMarkets] Subscribed to ${query.data.length} markets`)
    }
    
    return () => {
      // Cleanup: 구독 제거
      if (query.data && query.data.length > 0) {
        query.data.forEach(market => {
          removeSubscription(market.market)
        })
        
        console.log(`[useMarkets] Unsubscribed from ${query.data.length} markets`)
      }
    }
  }, [query.data, addSubscription, removeSubscription])
  
  return query
}
