import { useMutation, useQueryClient } from '@tanstack/react-query'
import { registerUpbitKey } from '@/app/api/member'
import { queryKeys } from '@/lib/utils/queryKeys'
import { useToast } from '@/components/ui/use-toast'

interface RegisterApiKeyParams {
  accessKey: string
  secretKey: string
}

/**
 * 업비트 API 키 등록 Mutation Hook
 * 
 * @returns Mutation 객체
 * 
 * @example
 * ```tsx
 * const registerMutation = useRegisterApiKey()
 * 
 * const handleSubmit = (data: { accessKey: string; secretKey: string }) => {
 *   registerMutation.mutate(data)
 * }
 * ```
 */
export const useRegisterApiKey = () => {
  const queryClient = useQueryClient()
  const { toast } = useToast()
  
  return useMutation({
    mutationFn: ({ accessKey, secretKey }: RegisterApiKeyParams) => 
      registerUpbitKey(accessKey, secretKey),
    onSuccess: () => {
      // 사용자 정보 갱신 (apiKeyRegistered가 true로 변경됨)
      queryClient.invalidateQueries({ queryKey: queryKeys.user.all })
      
      toast({
        title: 'API 키가 등록되었습니다',
        description: '업비트 API 키가 성공적으로 등록되었습니다.',
      })
    },
    onError: (error: any) => {
      console.error('Register API key error:', error)
      
      // 백엔드 에러 메시지 확인
      const errorMessage = error.response?.data?.message || error.message
      
      if (errorMessage?.includes('Invalid') || errorMessage?.includes('유효하지 않은')) {
        toast({
          variant: 'destructive',
          title: '유효하지 않은 API 키입니다',
          description: '입력하신 API 키가 유효하지 않습니다. 다시 확인해주세요.',
        })
      } else if (errorMessage?.includes('duplicate') || errorMessage?.includes('중복')) {
        toast({
          variant: 'destructive',
          title: '이미 등록된 API 키입니다',
          description: '해당 API 키는 이미 등록되어 있습니다.',
        })
      } else {
        toast({
          variant: 'destructive',
          title: 'API 키 등록 실패',
          description: 'API 키 등록 중 오류가 발생했습니다. 다시 시도해주세요.',
        })
      }
    },
  })
}
