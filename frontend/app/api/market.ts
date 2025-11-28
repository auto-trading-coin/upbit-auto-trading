/**
 * Market API Client
 * 백엔드 프록시를 통해 마켓 정보를 가져옵니다.
 * 실시간 가격은 WebSocket을 통해 업데이트됩니다.
 */

import api from './api'
import type { MarketData, ChangeType } from '@/types'
import type { SuccessResponse } from '@/types'

/**
 * 백엔드 마켓 정보 응답 타입 (스네이크 케이스)
 */
interface MarketInfoResponse {
  market: string
  korean_name: string
  english_name: string
}

/**
 * 전체 마켓 목록 조회
 * 백엔드 프록시 API 호출 (가격 정보는 WebSocket에서 업데이트)
 */
export const getMarketList = async (): Promise<MarketData[]> => {
  try {
    const response = await api.get<SuccessResponse<MarketInfoResponse[]>>('/upbit/markets')
    const markets = response.data.data || []

    // 가격 정보는 WebSocket에서 채워지므로 초기값 설정
    return markets.map(info => ({
      market: info.market,
      koreanName: info.korean_name,
      englishName: info.english_name,
      currentPrice: 0,
      change: 'EVEN' as ChangeType,
      changeRate: 0,
      changePrice: 0,
      accTradePrice24h: 0,
      accTradeVolume24h: 0,
    }))
  } catch (error) {
    console.error('Failed to fetch market list:', error)
    throw error
  }
}

/**
 * 특정 마켓 정보 조회
 * 전체 목록에서 필터링 (개별 조회 API 불필요)
 */
export const getMarketTicker = async (market: string): Promise<MarketData> => {
  const markets = await getMarketList()
  const found = markets.find(m => m.market === market)

  if (!found) {
    throw new Error(`Market not found: ${market}`)
  }

  return found
}
