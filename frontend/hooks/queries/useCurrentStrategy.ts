import { useMemo } from 'react'
import { useUser } from './useUser'
import { useStrategies } from './useStrategies'
import type { Strategy } from '@/types'

/**
 * 현재 선택된 전략 정보를 반환하는 Hook
 * 
 * user.strategyId와 전략 목록을 조합하여 전략 객체 생성
 * 
 * @returns 현재 선택된 Strategy 객체 또는 null
 * 
 * @example
 * ```tsx
 * const currentStrategy = useCurrentStrategy()
 * 
 * if (!currentStrategy) {
 *   return <Alert>전략을 선택해주세요</Alert>
 * }
 * 
 * return (
 *   <div>
 *     <h2>{currentStrategy.name}</h2>
 *     <p>{currentStrategy.information}</p>
 *   </div>
 * )
 * ```
 */
export const useCurrentStrategy = (): Strategy | null => {
  const { data: user } = useUser()
  const { data: strategies } = useStrategies()
  
  return useMemo(() => {
    // strategyId가 없거나 전략 목록이 로드되지 않았으면 null
    if (!user?.strategyId || !strategies) {
      return null
    }
    
    // 전략 목록에서 user.strategyId와 일치하는 전략 찾기
    return strategies.find(s => s.id === user.strategyId) || null
  }, [user?.strategyId, strategies])
}
