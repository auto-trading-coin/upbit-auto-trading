import { useMutation, useQueryClient } from '@tanstack/react-query'
import { updateTradeActive } from '@/app/api/member'
import { queryKeys } from '@/lib/utils/queryKeys'
import { useToast } from '@/components/ui/use-toast'
import type { User } from '@/types'

/**
 * 자동매매 상태 토글 Mutation Hook
 * 
 * 자동매매를 시작하거나 중지할 때 사용
 * Optimistic Update로 즉각적인 UI 반응 제공
 * 
 * @returns Mutation 객체
 * 
 * @example
 * ```tsx
 * const toggleMutation = useToggleTrading()
 * 
 * const handleToggle = () => {
 *   toggleMutation.mutate(!isRunning)
 * }
 * 
 * return (
 *   <Button 
 *     onClick={handleToggle}
 *     disabled={toggleMutation.isPending}
 *   >
 *     {isRunning ? '중지' : '시작'}
 *   </Button>
 * )
 * ```
 */
export const useToggleTrading = () => {
  const queryClient = useQueryClient()
  const { toast } = useToast()
  
  return useMutation({
    mutationFn: (tradeActive: boolean) => updateTradeActive(tradeActive),
    
    // ✨ Optimistic Update: mutation 시작 시 즉시 UI 업데이트
    onMutate: async (tradeActive) => {
      // 진행 중인 refetch 취소 (Race Condition 방지)
      await queryClient.cancelQueries({ queryKey: queryKeys.user.all })
      await queryClient.cancelQueries({ queryKey: queryKeys.trading.all })
      
      // 이전 값 백업 (롤백용)
      const previousUser = queryClient.getQueryData<User>(queryKeys.user.me())
      const previousTrading = queryClient.getQueryData(queryKeys.trading.status())
      
      // ✨ 즉시 캐시 업데이트 (UI 즉시 반영)
      queryClient.setQueryData<User>(queryKeys.user.me(), (old) => {
        if (!old) return old
        return {
          ...old,
          tradeActive,
        }
      })
      
      queryClient.setQueryData(queryKeys.trading.status(), (old: any) => {
        if (!old) return old
        return {
          ...old,
          isRunning: tradeActive,
        }
      })
      
      // 롤백을 위해 이전 값 반환
      return { previousUser, previousTrading }
    },
    
    // ✅ 성공: 서버 데이터로 동기화
    onSuccess: (_, tradeActive) => {
      // 서버 데이터와 동기화 (백그라운드에서 refetch)
      queryClient.invalidateQueries({ queryKey: queryKeys.user.all })
      queryClient.invalidateQueries({ queryKey: queryKeys.trading.all })
      
      toast({
        title: `자동매매가 ${tradeActive ? '시작' : '중지'}되었습니다`,
        duration: 3000,
      })
    },
    
    // ❌ 실패: 이전 값으로 롤백
    onError: (error, _, context) => {
      console.error('Toggle trading error:', error)
      
      // 이전 값으로 복구
      if (context?.previousUser) {
        queryClient.setQueryData(queryKeys.user.me(), context.previousUser)
      }
      if (context?.previousTrading) {
        queryClient.setQueryData(queryKeys.trading.status(), context.previousTrading)
      }
      
      toast({
        variant: 'destructive',
        title: '오류가 발생했습니다',
        description: '자동매매 상태 변경 중 오류가 발생했습니다. 다시 시도해주세요.',
      })
    },
  })
}
