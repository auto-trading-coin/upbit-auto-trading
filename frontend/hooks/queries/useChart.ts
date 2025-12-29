import { useQuery } from "@tanstack/react-query"
import { getChartData, CHART_LOAD_LIMIT } from "@/app/api/chart"
import { queryKeys } from "@/lib/utils/queryKeys"

interface UseChartOptions {
  market: string
  unit?: number
  limit?: number
  enabled?: boolean
}

export const useChart = (options: UseChartOptions) => {
  const { market, unit = 5, limit = CHART_LOAD_LIMIT, enabled = true } = options

  return useQuery({
    queryKey: [...queryKeys.chart.data(market, unit), limit],
    queryFn: () => getChartData(market, unit, limit),
    enabled: enabled && !!market,
    staleTime: 60000, // 1분
  })
}
