import { useQuery } from '@tanstack/react-query'
import { useEffect } from 'react'
import { getMarketList } from '@/app/api/market'
import { queryKeys } from '@/lib/utils/queryKeys'
import { useWebSocketStore } from '@/stores'

/**
 * 마켓 목록 조회 Hook (실시간 시세 구독 포함)
 * 
 * 이 훅을 사용하는 컴포넌트가 마운트되면 WebSocket 구독이 시작되고,
 * 모든 사용자가 언마운트되면 구독이 해제됩니다.
 * 
 * 실시간 시세가 필요한 페이지에서만 사용하세요:
 * - / (대시보드)
 * - /market (실시간 시세)
 * - /portfolio (자산현황)
 * 
 * @returns 마켓 목록 쿼리 결과
 */
export const useMarkets = () => {
  const incrementSubscribers = useWebSocketStore(state => state.incrementSubscribers)
  const decrementSubscribers = useWebSocketStore(state => state.decrementSubscribers)
  
  const query = useQuery({
    queryKey: queryKeys.markets.list(),
    queryFn: getMarketList,
    staleTime: Infinity,
    gcTime: Infinity,
  })
  
  // 마운트/언마운트 시에만 구독자 관리 (빈 의존성)
  useEffect(() => {
    incrementSubscribers()
    console.log('[useMarkets] Subscriber registered')
    
    return () => {
      decrementSubscribers()
      console.log('[useMarkets] Subscriber unregistered')
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []) // 빈 의존성 - 마운트/언마운트 시에만 실행
  
  return query
}
