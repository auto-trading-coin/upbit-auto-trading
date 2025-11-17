/**
 * Mock data for portfolio (자산 현황)
 * 개발 및 테스트용
 */

import type { Portfolio, AssetHistoryItem, PeriodHistoryItem } from '@/types'

export const mockPortfolio: Portfolio = {
  totalAsset: 3963550,
  cashBalance: 1500000,
  coinValue: 2463550,
  dailyProfitRate: 2.5,
  weeklyProfitRate: -1.2,
  monthlyProfitRate: 5.8,
  holdings: [
    { market: "BTC-KRW", koreanName: "비트코인", amount: 0.01, avgBuyPrice: 45000000, currentPrice: 47355000 },
    { market: "ETH-KRW", koreanName: "이더리움", amount: 0.4, avgBuyPrice: 3000000, currentPrice: 3125000 },
    { market: "XRP-KRW", koreanName: "리플", amount: 650, avgBuyPrice: 700, currentPrice: 769 },
    { market: "SOL-KRW", koreanName: "솔라나", amount: 1.5, avgBuyPrice: 150000, currentPrice: 160000 },
  ],
}

export const mockAssetHistory: AssetHistoryItem[] = [
  { date: "2023-06-21", totalAsset: 1250000, cashBalance: 500000, coinValue: 750000, dailyChange: 1.21 },
  { date: "2023-06-20", totalAsset: 1235000, cashBalance: 450000, coinValue: 785000, dailyChange: -0.4 },
  { date: "2023-06-19", totalAsset: 1240000, cashBalance: 450000, coinValue: 790000, dailyChange: 0.81 },
  { date: "2023-06-18", totalAsset: 1230000, cashBalance: 450000, coinValue: 780000, dailyChange: 1.65 },
  { date: "2023-06-17", totalAsset: 1210000, cashBalance: 450000, coinValue: 760000, dailyChange: -0.82 },
  { date: "2023-06-16", totalAsset: 1220000, cashBalance: 450000, coinValue: 770000, dailyChange: 1.67 },
  { date: "2023-06-15", totalAsset: 1200000, cashBalance: 450000, coinValue: 750000, dailyChange: 2.5 },
]

export const mockWeeklyHistory: PeriodHistoryItem[] = [
  { period: "2023-06-15 ~ 2023-06-21", totalAsset: 1250000, cashBalance: 500000, coinValue: 750000, change: 5.93 },
  { period: "2023-06-08 ~ 2023-06-14", totalAsset: 1180000, cashBalance: 420000, coinValue: 760000, change: 2.61 },
  { period: "2023-06-01 ~ 2023-06-07", totalAsset: 1150000, cashBalance: 400000, coinValue: 750000, change: 3.5 },
]

export const mockMonthlyHistory: PeriodHistoryItem[] = [
  { period: "2023-06", totalAsset: 1250000, cashBalance: 500000, coinValue: 750000, change: 5.93 },
  { period: "2023-05", totalAsset: 1180000, cashBalance: 420000, coinValue: 760000, change: 7.27 },
  { period: "2023-04", totalAsset: 1100000, cashBalance: 350000, coinValue: 750000, change: 10.0 },
]

export const mockYearlyHistory: PeriodHistoryItem[] = [
  { period: "2023", totalAsset: 1250000, cashBalance: 500000, coinValue: 750000, change: 25.0 },
  { period: "2022", totalAsset: 1000000, cashBalance: 300000, coinValue: 700000, change: 25.0 },
  { period: "2021", totalAsset: 800000, cashBalance: 200000, coinValue: 600000, change: 60.0 },
]
