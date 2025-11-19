import { useMutation, useQueryClient } from '@tanstack/react-query'
import { updateTradeActive } from '@/app/api/member'
import { queryKeys } from '@/lib/utils/queryKeys'
import { useToast } from '@/components/ui/use-toast'

/**
 * 자동매매 상태 토글 Mutation Hook
 * 
 * 자동매매를 시작하거나 중지할 때 사용
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
    onSuccess: (_, tradeActive) => {
      // 관련 쿼리 무효화 - 사용자 정보와 트레이딩 상태 다시 불러오기
      queryClient.invalidateQueries({ queryKey: queryKeys.user.all })
      queryClient.invalidateQueries({ queryKey: queryKeys.trading.all })
      
      toast({
        title: `자동매매가 ${tradeActive ? '시작' : '중지'}되었습니다`,
        duration: 3000,
      })
    },
    onError: (error) => {
      console.error('Toggle trading error:', error)
      toast({
        variant: 'destructive',
        title: '오류가 발생했습니다',
        description: '자동매매 상태 변경 중 오류가 발생했습니다. 다시 시도해주세요.',
      })
    },
  })
}
