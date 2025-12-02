'use client'

import { formatCurrency, formatPercent, getProfitColorClass } from '@/lib/utils/format'

interface PortfolioSummaryProps {
  /**
   * 보유 현금 (KRW)
   */
  cashBalance: number
  
  /**
   * 코인 총 매수금액
   */
  coinTotalBuyAmount: number
  
  /**
   * 코인 총 평가금액
   */
  coinEvaluationAmount: number
  
  /**
   * 총 손익금액
   */
  totalProfitAmount: number
  
  /**
   * 총 수익률 (선택, 제공되지 않으면 계산)
   */
  totalProfitRate?: number
  
  /**
   * 수익률 표시 여부 (기본: false)
   */
  showProfitRate?: boolean
}

/**
 * 포트폴리오 요약 컴포넌트
 * 
 * 보유 현금, 코인 매수/평가금액, 손익을 요약하여 표시합니다.
 * 대시보드와 자산현황 페이지에서 공통으로 사용됩니다.
 * 
 * @example
 * ```tsx
 * <PortfolioSummary
 *   cashBalance={1000000}
 *   coinTotalBuyAmount={500000}
 *   coinEvaluationAmount={550000}
 *   totalProfitAmount={50000}
 * />
 * ```
 */
export function PortfolioSummary({
  cashBalance,
  coinTotalBuyAmount,
  coinEvaluationAmount,
  totalProfitAmount,
  totalProfitRate,
  showProfitRate = false,
}: PortfolioSummaryProps) {
  const profitColorClass = getProfitColorClass(totalProfitAmount)
  
  // 수익률 계산 (제공되지 않은 경우)
  const calculatedProfitRate = totalProfitRate ?? (
    coinTotalBuyAmount > 0 
      ? ((coinEvaluationAmount - coinTotalBuyAmount) / coinTotalBuyAmount) * 100 
      : 0
  )

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-muted/30 rounded-lg">
      <div>
        <p className="text-xs text-muted-foreground">보유 현금</p>
        <p className="text-lg font-semibold">{formatCurrency(cashBalance)}</p>
      </div>
      <div>
        <p className="text-xs text-muted-foreground">코인 총 매수금액</p>
        <p className="text-lg font-semibold">{formatCurrency(coinTotalBuyAmount)}</p>
      </div>
      <div>
        <p className="text-xs text-muted-foreground">코인 평가금액</p>
        <p className={`text-lg font-semibold ${profitColorClass}`}>
          {formatCurrency(coinEvaluationAmount)}
        </p>
      </div>
      <div>
        <p className="text-xs text-muted-foreground">
          {showProfitRate ? '코인 손익 / 수익률' : '코인 손익'}
        </p>
        <p className={`text-lg font-semibold ${profitColorClass}`}>
          {formatCurrency(totalProfitAmount, true)}
          {showProfitRate && (
            <span className="text-sm ml-1">({formatPercent(calculatedProfitRate)})</span>
          )}
        </p>
      </div>
    </div>
  )
}
