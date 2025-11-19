import { useQuery } from '@tanstack/react-query'
import { useEffect, useMemo, useRef } from 'react'
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
  const { addSubscription, removeSubscription, clearSubscriptions } = useWebSocketStore()
  const isInitialMount = useRef(true)
  
  // WebSocket 연결 활성화
  useWebSocket()
  
  const query = useQuery({
    queryKey: queryKeys.markets.list(),
    queryFn: getMarketList,
    staleTime: 5000,  // 5초
    refetchInterval: 10000,  // Fallback 폴링 (10초마다)
  })
  
  // ✨ 마켓 코드만 추출 (React Query 캐시 업데이트로 인한 재실행 방지)
  const marketCodes = useMemo(() => {
    if (!query.data) return []
    return query.data.map(market => market.market).sort()
  }, [query.data?.length]) // ✨ 길이만 의존성으로 - 개수가 바뀔 때만 재계산
  
  // 이전 마켓 코드 저장
  const prevMarketCodesRef = useRef<string[]>([])
  
  // 마켓 코드가 실제로 변경되었는지 확인
  const hasMarketsChanged = useMemo(() => {
    const prev = prevMarketCodesRef.current
    const current = marketCodes
    
    if (prev.length !== current.length) return true
    
    for (let i = 0; i < prev.length; i++) {
      if (prev[i] !== current[i]) return true
    }
    
    return false
  }, [marketCodes])
  
  // 마켓 목록 로드 시 WebSocket 구독 (실제 변경 시에만)
  useEffect(() => {
    // 초기 마운트이거나 실제로 마켓이 변경된 경우에만 실행
    if (marketCodes.length > 0 && (isInitialMount.current || hasMarketsChanged)) {
      if (isInitialMount.current) {
        isInitialMount.current = false
      }
      
      // 이전 구독 모두 제거
      clearSubscriptions()
      
      // 새로운 마켓 구독
      marketCodes.forEach(code => {
        addSubscription(code)
      })
      
      // 이전 마켓 코드 저장
      prevMarketCodesRef.current = marketCodes
      
      console.log(`[useMarkets] Subscribed to ${marketCodes.length} markets`)
    }
    
    return () => {
      // ✨ Cleanup은 컴포넌트 언마운트 시에만 실행됨
      if (!isInitialMount.current) {
        console.log(`[useMarkets] Cleanup: Clearing subscriptions`)
      }
    }
  }, [marketCodes, hasMarketsChanged, addSubscription, clearSubscriptions])
  
  return query
}
