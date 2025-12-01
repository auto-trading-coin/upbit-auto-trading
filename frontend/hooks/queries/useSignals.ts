import { useQuery } from "@tanstack/react-query"
import api from "@/app/api/api"
import { Signal, SuccessResponse } from "@/types"
import { queryKeys } from "@/lib/utils/queryKeys"
import { useUser } from "./useUser"

interface SignalListResponse {
  signals: Signal[]
  totalPages: number
  totalElements: number
  currentPage: number
  pageSize: number
  hasMore: boolean
}

interface UseSignalsOptions {
  page?: number
  size?: number
}

const getSignals = async (page: number, size: number): Promise<SignalListResponse> => {
  console.log('🔍 [useSignals] Fetching signals:', { page, size })
  const { data } = await api.get<SuccessResponse<SignalListResponse>>("/signal", {
    params: { page, size },
  })
  console.log('✅ [useSignals] API Response:', data)
  console.log('📦 [useSignals] Extracted data:', data.data)
  return data.data || {
    signals: [],
    totalPages: 0,
    totalElements: 0,
    currentPage: page,
    pageSize: size,
    hasMore: false
  }
}

export const useSignals = (options: UseSignalsOptions = {}) => {
  const { page = 0, size = 10 } = options
  const { data: user } = useUser()

  console.log('🔍 [useSignals] Hook called:', { page, size, apiKeyRegistered: user?.apiKeyRegistered })

  return useQuery({
    queryKey: [...queryKeys.signals.list(page), size],
    queryFn: () => getSignals(page, size),
    enabled: !!user?.apiKeyRegistered,
    staleTime: 10000, // 10초
  })
}
