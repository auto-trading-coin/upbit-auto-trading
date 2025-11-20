/**
 * Portfolio API Client
 * 업비트 잔고 조회 (백엔드 API 연동)
 */

import api from './api'
import type { Holding, SuccessResponse } from '@/types'

/**
 * 업비트 잔고 응답 타입
 */
interface UpbitBalance {
  currency: string
  balance: string
  locked: string
  avg_buy_price: string
  avg_buy_price_modified: boolean
  unit_currency: string
}

/**
 * 현재 포트폴리오 조회
 * 백엔드 API: GET /portfolio/balances
 * 
 * @returns 보유 코인 목록
 * 
 * @example
 * 백엔드 응답 예시:
 * ```json
 * {
 *   "code": "SUCCESS",
 *   "message": "잔고 조회 성공",
 *   "data": [
 *     {
 *       "currency": "BTC",
 *       "balance": "0.05",
 *       "locked": "0",
 *       "avg_buy_price": "140000000",
 *       "unit_currency": "KRW"
 *     }
 *   ]
 * }
 * ```
 */
export const getPortfolio = async (): Promise<Holding[]> => {
  try {
    const { data } = await api.get<SuccessResponse<UpbitBalance[]>>('/portfolio/balances')
    const balances = data.data || []
    
    // KRW를 제외한 코인만 필터링하고 Holding 타입으로 변환
    const holdings: Holding[] = balances
      .filter(balance => 
        balance.currency !== 'KRW' && 
        parseFloat(balance.balance) > 0
      )
      .map(balance => ({
        market: `KRW-${balance.currency}`,
        koreanName: balance.currency, // WebSocket에서 업데이트됨
        amount: parseFloat(balance.balance),
        avgBuyPrice: parseFloat(balance.avg_buy_price),
        currentPrice: parseFloat(balance.avg_buy_price), // 초기값, WebSocket으로 업데이트
      }))
    
    return holdings
  } catch (error) {
    console.error('Failed to fetch portfolio:', error)
    
    // ✨ Mock 데이터 반환 (개발/테스트용)
    // 백엔드 API 준비되면 이 부분 제거
    console.log('[Mock] Using mock portfolio data')
    return getMockPortfolio()
  }
}

/**
 * Mock 포트폴리오 데이터
 * 백엔드 API 구현 전 테스트용
 */
const getMockPortfolio = (): Holding[] => {
  return [
    {
      market: 'KRW-BTC',
      koreanName: '비트코인',
      amount: 0.05,
      avgBuyPrice: 140000000,
      currentPrice: 140000000,
    },
    {
      market: 'KRW-ETH',
      koreanName: '이더리움',
      amount: 2.5,
      avgBuyPrice: 4500000,
      currentPrice: 4500000,
    },
    {
      market: 'KRW-XRP',
      koreanName: '리플',
      amount: 1000,
      avgBuyPrice: 650,
      currentPrice: 650,
    },
    {
      market: 'KRW-SOL',
      koreanName: '솔라나',
      amount: 5,
      avgBuyPrice: 250000,
      currentPrice: 250000,
    },
  ]
}

/**
 * 현금 잔고 조회
 * 백엔드 API: GET /portfolio/balances
 */
export const getCashBalance = async (): Promise<number> => {
  try {
    const { data } = await api.get<SuccessResponse<UpbitBalance[]>>('/portfolio/balances')
    const balances = data.data || []
    
    const krwBalance = balances.find(balance => balance.currency === 'KRW')
    return krwBalance ? parseFloat(krwBalance.balance) : 0
  } catch (error) {
    console.error('Failed to fetch cash balance:', error)
    
    // Mock 데이터
    return 5000000 // 5백만원
  }
}
