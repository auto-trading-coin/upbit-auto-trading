/**
 * Portfolio and Asset related types
 * TODO: 백엔드 API 구현 후 실제 Response DTO에 맞춰 수정 필요
 */

export interface Holding {
  market: string
  koreanName: string
  amount: number
  avgBuyPrice: number
  currentPrice: number
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
