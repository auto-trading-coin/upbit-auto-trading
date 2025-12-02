/**
 * Portfolio and Asset related types
 * TODO: 백엔드 API 구현 후 실제 Response DTO에 맞춰 수정 필요
 */

export interface Holding {
  market: string
  koreanName: string
  amount: number           // 총 보유량 (balance + locked)
  lockedAmount?: number    // 주문 중 묶인 수량
  avgBuyPrice: number
  currentPrice: number
}

/**
 * 포트폴리오 API 응답 데이터
 */
export interface PortfolioData {
  holdings: Holding[]      // 보유 코인 목록
  cashBalance: number      // KRW 잔고
}

export interface Portfolio {
  totalAsset: number
  cashBalance: number
  coinValue: number
  dailyProfitRate: number
  weeklyProfitRate: number
  monthlyProfitRate: number
  holdings: Holding[]
}

export interface AssetHistoryItem {
  date: string
  totalAsset: number
  cashBalance: number
  coinValue: number
  dailyChange: number
}

export interface PeriodHistoryItem {
  period: string
  totalAsset: number
  cashBalance: number
  coinValue: number
  change: number
}

export interface Position {
  market: string
  amount: number
  avgPrice: number
  currentPrice: number
}
