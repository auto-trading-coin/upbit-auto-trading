import { useQuery } from '@tanstack/react-query'
import { getMyInfo } from '@/app/api/member'
import { queryKeys } from '@/lib/utils/queryKeys'
import { getAccessToken } from '@/lib/utils/token'
import type { User } from '@/types'

/**
 * 현재 로그인한 사용자 정보 조회 Hook
 * 
 * @returns 사용자 정보 쿼리 결과
 * 
 * @example
 * ```tsx
 * const { data: user, isLoading, error } = useUser()
 * 
 * if (isLoading) return <div>Loading...</div>
 * if (!user) return <div>Please login</div>
 * 
 * return <div>Welcome, {user.name}!</div>
 * ```
 */
export const useUser = () => {
  return useQuery({
    queryKey: queryKeys.user.me(),
    queryFn: async () => {
      const data = await getMyInfo()
      
      // 백엔드 응답을 User 타입으로 변환
      return {
        id: data.email,
        email: data.email,
        name: data.nickname,
        tradeActive: data.tradeActive,
        strategyRegistered: data.strategyRegistered,
        apiKeyRegistered: data.apiKeyRegistered,
        strategyId: data.strategyId,  // ✨ 백엔드에서 받은 strategyId
      } as User
    },
    enabled: !!getAccessToken(),  // ✨ 토큰이 있을 때만 쿼리 실행
    staleTime: 60000,  // 1분 - 사용자 정보는 자주 변하지 않음
    retry: false,      // 401 에러 시 재시도 안함 (로그인 필요)
  })
}
