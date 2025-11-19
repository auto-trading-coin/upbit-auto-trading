import { useMutation, useQueryClient } from '@tanstack/react-query'
import { deleteUpbitKey } from '@/app/api/member'
import { queryKeys } from '@/lib/utils/queryKeys'
import { useToast } from '@/components/ui/use-toast'

/**
 * 업비트 API 키 삭제 Mutation Hook
 * 
 * @returns Mutation 객체
 * 
 * @example
 * ```tsx
 * const deleteMutation = useDeleteApiKey()
 * 
 * const handleDelete = () => {
 *   if (confirm('정말 삭제하시겠습니까?')) {
 *     deleteMutation.mutate()
 *   }
 * }
 * 
 * return (
 *   <Button 
 *     onClick={handleDelete}
 *     disabled={deleteMutation.isPending}
 *     variant="destructive"
 *   >
 *     API 키 삭제
 *   </Button>
 * )
 * ```
 */
export const useDeleteApiKey = () => {
  const queryClient = useQueryClient()
  const { toast } = useToast()
  
  return useMutation({
    mutationFn: deleteUpbitKey,
    onSuccess: () => {
      // 사용자 정보 갱신 (apiKeyRegistered가 false로 변경됨)
      queryClient.invalidateQueries({ queryKey: queryKeys.user.all })
      
      toast({
        title: 'API 키가 삭제되었습니다',
        description: '업비트 API 키가 성공적으로 삭제되었습니다.',
      })
    },
    onError: (error: any) => {
      console.error('Delete API key error:', error)
      
      const errorMessage = error.response?.data?.message || error.message
      
      if (errorMessage?.includes('trade') || errorMessage?.includes('자동매매')) {
        toast({
          variant: 'destructive',
          title: '자동매매 실행 중에는 API 키를 삭제할 수 없습니다',
          description: '자동매매를 먼저 중지해주세요.',
        })
      } else {
        toast({
          variant: 'destructive',
          title: 'API 키 삭제 실패',
          description: 'API 키 삭제 중 오류가 발생했습니다. 다시 시도해주세요.',
        })
      }
    },
  })
}
