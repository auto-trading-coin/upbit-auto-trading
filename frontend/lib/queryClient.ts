import { QueryClient } from '@tanstack/react-query'

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60000, // 1분 - 데이터가 신선한 것으로 간주되는 시간
      gcTime: 5 * 60 * 1000, // 5분 - 캐시 가비지 컬렉션 시간
      retry: 1, // 실패 시 1회 재시도
      refetchOnWindowFocus: true, // 창 포커스 시 자동 리페치
      refetchOnMount: true, // 컴포넌트 마운트 시 리페치
    },
    mutations: {
      retry: 0, // Mutation은 재시도 안함
    },
  },
})
