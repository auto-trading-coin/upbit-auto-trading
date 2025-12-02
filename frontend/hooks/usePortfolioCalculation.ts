import { useMemo } from 'react'
import { usePortfolio } from '@/hooks/queries/usePortfolio'
import { useMarkets } from '@/hooks/queries/useMarkets'
import type { Holding, MarketData } from '@/types'

/**
 * 실시간 가격이 적용된 보유 자산 정보
 */
export interface HoldingWithPrice extends Holding {
  currentPrice: number
  koreanName: string
  buyAmount: number        // 매수금액
  evaluationAmount: number // 평가금액
  profitAmount: number     // 손익금액
  profitRate: number       // 수익률 (%)
  isProfit: boolean        // 수익 여부
}

/**
 * 포트폴리오 계산 결과
 */
export interface PortfolioCalculation {
  // 원본 데이터
  holdings: Holding[]
  cashBalance: number
  markets: MarketData[]
  
  // 실시간 가격 적용된 보유 자산
  holdingsWithPrice: HoldingWithPrice[]
  
  // 계산된 값들
  coinTotalBuyAmount: number      // 코인 총 매수금액
  coinEvaluationAmount: number    // 코인 총 평가금액
  totalAsset: number              // 총 자산 (코인 + 현금)
  totalProfitAmount: number       // 총 손익금액
  totalProfitRate: number         // 총 수익률 (%)
  
  // 로딩 상태
  isLoading: boolean
}

/**
 * 포트폴리오 계산 Hook
 * 
 * 포트폴리오 데이터를 가져오고 실시간 가격을 적용하여 각종 지표를 계산합니다.
 * 대시보드와 자산현황 페이지에서 공통으로 사용됩니다.
 * 
 * @example
 * ```tsx
 * const {
 *   holdingsWithPrice,
 *   totalAsset,
 *   totalProfitAmount,
 *   isLoading
 * } = usePortfolioCalculation()
 * ```
 */
export const usePortfolioCalculation = (): PortfolioCalculation => {
  const { data: portfolioData, isLoading: portfolioLoading } = usePortfolio()
  const { data: markets = [] } = useMarkets()
  
  // 포트폴리오 데이터 추출
  const holdings = portfolioData?.holdings ?? []
  const cashBalance = portfolioData?.cashBalance ?? 0
  
  // 실시간 가격 적용된 보유 자산 계산
  const holdingsWithPrice = useMemo((): HoldingWithPrice[] => {
    return holdings.map(holding => {
      const marketData = markets.find(m => m.market === holding.market)
      const currentPrice = marketData?.currentPrice || holding.currentPrice
      const koreanName = marketData?.koreanName || holding.koreanName
      
      const buyAmount = holding.amount * holding.avgBuyPrice
      const evaluationAmount = holding.amount * currentPrice
      const profitAmount = evaluationAmount - buyAmount
      const profitRate = buyAmount > 0 
        ? ((currentPrice - holding.avgBuyPrice) / holding.avgBuyPrice) * 100 
        : 0
      
      return {
        ...holding,
        currentPrice,
        koreanName,
        buyAmount,
        evaluationAmount,
        profitAmount,
        profitRate,
        isProfit: profitAmount >= 0,
      }
    })
  }, [holdings, markets])
  
  // 코인 총 매수금액
  const coinTotalBuyAmount = useMemo(() => {
    return holdingsWithPrice.reduce((sum, h) => sum + h.buyAmount, 0)
  }, [holdingsWithPrice])
  
  // 코인 총 평가금액
  const coinEvaluationAmount = useMemo(() => {
    return holdingsWithPrice.reduce((sum, h) => sum + h.evaluationAmount, 0)
  }, [holdingsWithPrice])
  
  // 총 자산
  const totalAsset = coinEvaluationAmount + cashBalance
  
  // 총 손익금액
  const totalProfitAmount = coinEvaluationAmount - coinTotalBuyAmount
  
  // 총 수익률
  const totalProfitRate = coinTotalBuyAmount > 0 
    ? ((coinEvaluationAmount - coinTotalBuyAmount) / coinTotalBuyAmount) * 100 
    : 0
  
  return {
    holdings,
    cashBalance,
    markets,
    holdingsWithPrice,
    coinTotalBuyAmount,
    coinEvaluationAmount,
    totalAsset,
    totalProfitAmount,
    totalProfitRate,
    isLoading: portfolioLoading,
  }
}
