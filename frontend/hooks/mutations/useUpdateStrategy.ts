import { useMutation, useQueryClient } from '@tanstack/react-query'
import { updateStrategy } from '@/app/api/strategy'
import { queryKeys } from '@/lib/utils/queryKeys'
import { useToast } from '@/components/ui/use-toast'

/**
 * 전략 변경 Mutation Hook
 * 
 * 사용자의 자동매매 전략을 변경할 때 사용
 * 
 * @returns Mutation 객체
 * 
 * @example
 * ```tsx
 * const updateStrategyMutation = useUpdateStrategy()
 * 
 * const handleSelectStrategy = (strategyId: number) => {
 *   updateStrategyMutation.mutate(strategyId)
 * }
 * 
 * return (
 *   <Button 
 *     onClick={() => handleSelectStrategy(3)}
 *     disabled={updateStrategyMutation.isPending}
 *   >
 *     이 전략 선택
 *   </Button>
 * )
 * ```
 */
export const useUpdateStrategy = () => {
  const queryClient = useQueryClient()
  const { toast } = useToast()
  
  return useMutation({
    mutationFn: (strategyId: number) => updateStrategy(strategyId),
    onSuccess: () => {
      // 관련 쿼리 무효화 - 사용자 정보 다시 불러오기 (strategyId 업데이트됨)
      queryClient.invalidateQueries({ queryKey: queryKeys.user.all })
      queryClient.invalidateQueries({ queryKey: queryKeys.trading.all })
      
      toast({
        title: '전략이 변경되었습니다',
        duration: 3000,
      })
    },
    onError: (error) => {
      console.error('Update strategy error:', error)
      toast({
        variant: 'destructive',
        title: '전략 변경 실패',
        description: '전략 변경 중 오류가 발생했습니다. 다시 시도해주세요.',
      })
    },
  })
}
