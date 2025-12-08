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
  const { data } = await api.get<SuccessResponse<SignalListResponse>>("/signal", {
    params: { page, size },
  })
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

  return useQuery({
    queryKey: [...queryKeys.signals.list(page), size],
    queryFn: () => getSignals(page, size),
    enabled: !!user?.apiKeyRegistered,
    staleTime: 10000, // 10초
  })
}
