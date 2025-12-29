import api from "./api"
import { SuccessResponse } from "@/types"
import { ChartCandle } from "@/types/chart"

/** 차트 데이터 로드 개수 */
export const CHART_LOAD_LIMIT = 1000

/**
 * 차트 데이터 조회
 * GET /chart/{market}?unit=5&limit=1000&before=timestamp
 */
export const getChartData = async (
  market: string,
  unit: number = 5,
  limit: number = CHART_LOAD_LIMIT,
  before?: number
): Promise<ChartCandle[]> => {
  const params: Record<string, any> = { unit, limit }
  if (before) {
    params.before = before
  }
  
  const { data } = await api.get<SuccessResponse<ChartCandle[]>>(
    `/chart/${market}`,
    { params }
  )
  return data.data || []
}
