'use client'

import { LineChart } from 'lucide-react'
import { formatCurrency, formatAmount, formatPercent, getProfitColorClass } from '@/lib/utils/format'
import type { HoldingWithPrice } from '@/hooks/usePortfolioCalculation'

interface HoldingsTableProps {
  /**
   * 실시간 가격이 적용된 보유 자산 목록
   */
  holdings: HoldingWithPrice[]
  
  /**
   * 총 매수금액
   */
  totalBuyAmount: number
  
  /**
   * 총 평가금액
   */
  totalEvaluationAmount: number
  
  /**
   * 총 손익금액
   */
  totalProfitAmount: number
  
  /**
   * 보유 자산이 없을 때 표시할 메시지 (선택)
   */
  emptyMessage?: string
  
  /**
   * 보유 자산이 없을 때 표시할 부제목 (선택)
   */
  emptySubMessage?: string
}

/**
 * 보유 자산 테이블 컴포넌트
 * 
 * 대시보드와 자산현황 페이지에서 공통으로 사용되는 보유 자산 목록 테이블입니다.
 * 
 * @example
 * ```tsx
 * <HoldingsTable
 *   holdings={holdingsWithPrice}
 *   totalBuyAmount={coinTotalBuyAmount}
 *   totalEvaluationAmount={coinEvaluationAmount}
 *   totalProfitAmount={totalProfitAmount}
 * />
 * ```
 */
export function HoldingsTable({
  holdings,
  totalBuyAmount,
  totalEvaluationAmount,
  totalProfitAmount,
  emptyMessage = '보유 중인 코인이 없습니다',
  emptySubMessage = '자동매매가 시작되면 이곳에 코인 정보가 표시됩니다',
}: HoldingsTableProps) {
  if (holdings.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-center">
        <LineChart className="h-10 w-10 text-muted-foreground mb-4" />
        <h3 className="text-lg font-medium">{emptyMessage}</h3>
        <p className="text-sm text-muted-foreground mt-1">{emptySubMessage}</p>
      </div>
    )
  }

  const profitColorClass = getProfitColorClass(totalProfitAmount)

  return (
    <div className="rounded-md border">
      {/* 테이블 헤더 */}
      <div className="grid grid-cols-7 gap-4 p-4 font-medium text-sm bg-muted/50 border-b">
        <div>코인명</div>
        <div className="text-right">보유량</div>
        <div className="text-right">평균 매수가</div>
        <div className="text-right">총 매수금액</div>
        <div className="text-right">현재가</div>
        <div className="text-right">평가금액</div>
        <div className="text-right">수익률</div>
      </div>

      {/* 테이블 바디 */}
      {holdings.map((holding) => {
        const colorClass = getProfitColorClass(holding.profitAmount)
        
        return (
          <div
            key={holding.market}
            className="grid grid-cols-7 gap-4 p-4 border-b last:border-0 hover:bg-muted/50 transition-colors"
          >
            <div className="flex flex-col">
              <span className="font-medium">{holding.koreanName}</span>
              <span className="text-xs text-muted-foreground">{holding.market}</span>
            </div>
            <div className="text-right">
              <div className="font-medium">{formatAmount(holding.amount)}</div>
              {holding.lockedAmount && holding.lockedAmount > 0 && (
                <div className="text-xs text-muted-foreground">
                  (주문중: {formatAmount(holding.lockedAmount)})
                </div>
              )}
            </div>
            <div className="text-right">
              <div className="font-medium">{formatCurrency(holding.avgBuyPrice)}</div>
            </div>
            <div className="text-right">
              <div className="font-medium">{formatCurrency(holding.buyAmount)}</div>
            </div>
            <div className={`text-right font-medium ${colorClass}`}>
              {formatCurrency(holding.currentPrice)}
            </div>
            <div className="text-right">
              <div className="font-medium">{formatCurrency(holding.evaluationAmount)}</div>
            </div>
            <div className="text-right">
              <div className={`font-bold ${colorClass}`}>
                {formatPercent(holding.profitRate)}
              </div>
              <div className={`text-sm ${colorClass}`}>
                {formatCurrency(holding.profitAmount, true)}
              </div>
            </div>
          </div>
        )
      })}

      {/* 합계 */}
      <div className="grid grid-cols-7 gap-4 p-4 bg-muted/30 font-semibold">
        <div>합계</div>
        <div className="text-right">-</div>
        <div className="text-right">-</div>
        <div className="text-right">{formatCurrency(totalBuyAmount)}</div>
        <div className="text-right">-</div>
        <div className="text-right">{formatCurrency(totalEvaluationAmount)}</div>
        <div className={`text-right ${profitColorClass}`}>
          {formatCurrency(totalProfitAmount, true)}
        </div>
      </div>
    </div>
  )
}
