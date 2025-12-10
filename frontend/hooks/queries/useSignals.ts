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

interface SignalFilters {
  market?: string
  startDate?: string
  endDate?: string
  strategyId?: number
}

interface UseSignalsOptions {
  page?: number
  size?: number
  filters?: SignalFilters
}

const getSignals = async (
  page: number,
  size: number,
  filters?: SignalFilters
): Promise<SignalListResponse> => {
  // 쿼리 파라미터 구성
  const params: any = { page, size }

  if (filters?.market) params.market = filters.market
  if (filters?.startDate) params.startDate = filters.startDate
  if (filters?.endDate) params.endDate = filters.endDate
  if (filters?.strategyId) params.strategyId = filters.strategyId

  const { data } = await api.get<SuccessResponse<SignalListResponse>>("/signal", {
    params,
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
  const { page = 0, size = 10, filters } = options
  const { data: user } = useUser()

  return useQuery({
    queryKey: [...queryKeys.signals.list(page), size, filters],
    queryFn: () => getSignals(page, size, filters),
    enabled: !!user?.apiKeyRegistered,
    staleTime: 10000, // 10초
  })
}
