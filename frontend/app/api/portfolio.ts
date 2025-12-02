/**
 * Portfolio API Client
 * 업비트 잔고 조회 (백엔드 API 연동)
 */

import api from './api'
import type { Holding, PortfolioData, SuccessResponse } from '@/types'

/**
 * 업비트 잔고 응답 타입 (백엔드 응답 형식)
 */
interface UpbitAccountResponse {
  currency: string
  balance: string
  locked: string
  avg_buy_price: string
  avg_buy_price_modified: boolean
  unit_currency: string
}

/**
 * 현재 포트폴리오 조회 (코인 + KRW 잔고)
 * 백엔드 API: GET /upbit/portfolio
 * 
 * @returns 포트폴리오 데이터 (코인 목록 + KRW 잔고)
 */
export const getPortfolio = async (): Promise<PortfolioData> => {
  const { data } = await api.get<SuccessResponse<UpbitAccountResponse[]>>('/upbit/portfolio')
  const accounts = data.data || []
  
  // KRW 잔고 추출
  const krwAccount = accounts.find(account => account.currency === 'KRW')
  const cashBalance = krwAccount 
    ? parseFloat(krwAccount.balance) + parseFloat(krwAccount.locked)
    : 0
  
  // KRW를 제외한 코인만 필터링하고 Holding 타입으로 변환
  const holdings: Holding[] = accounts
    .filter(account => {
      const totalAmount = parseFloat(account.balance) + parseFloat(account.locked)
      return account.currency !== 'KRW' && totalAmount > 0
    })
    .map(account => {
      const balance = parseFloat(account.balance)
      const locked = parseFloat(account.locked)
      const totalAmount = balance + locked
      const avgBuyPrice = parseFloat(account.avg_buy_price)
      
      return {
        market: `KRW-${account.currency}`,
        koreanName: account.currency, // WebSocket에서 업데이트됨
        amount: totalAmount,  // balance + locked
        lockedAmount: locked, // 주문 중 수량 (별도 표시용)
        avgBuyPrice: avgBuyPrice,
        currentPrice: avgBuyPrice, // 초기값, WebSocket으로 업데이트
      }
    })
  
  return {
    holdings,
    cashBalance,
  }
}
