/**
 * 투자손익 헤더 컴포넌트
 * 기간 누적 손익, 수익률, 평균 투자금액을 표시
 */

import { HelpCircle } from 'lucide-react'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { formatCurrency, formatPercent, getProfitColorClass } from '@/lib/utils/format'
import type { InvestmentProfitSummary } from '@/types'

interface InvestmentProfitHeaderProps {
  summary: InvestmentProfitSummary
  periodLabel: string  // "2025년 12월 01일 ~ 2025년 12월 04일" 형태
}

export function InvestmentProfitHeader({ summary, periodLabel }: InvestmentProfitHeaderProps) {
  return (
    <div className="space-y-4">
      {/* 기간 표시 */}
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <span>{periodLabel}의 투자손익</span>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger>
              <HelpCircle className="h-4 w-4" />
            </TooltipTrigger>
            <TooltipContent className="max-w-xs">
              <p>투자손익은 기간 내 자산 변동을 기반으로 계산됩니다.</p>
              <p className="mt-1 text-xs text-muted-foreground">
                입출금은 손익 계산에서 제외됩니다.
              </p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      {/* 지표 카드들 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* 기간 누적 손익 */}
        <div className="flex items-center justify-between p-4 rounded-lg border bg-card">
          <span className="text-sm text-muted-foreground">기간 누적 손익</span>
          <span className={`text-xl font-bold ${getProfitColorClass(summary.totalProfitLoss)}`}>
            {formatCurrency(summary.totalProfitLoss, true)}
          </span>
        </div>

        {/* 기간 누적 수익률 */}
        <div className="flex items-center justify-between p-4 rounded-lg border bg-card">
          <span className="text-sm text-muted-foreground">기간 누적 수익률</span>
          <span className={`text-xl font-bold ${getProfitColorClass(summary.totalProfitRate)}`}>
            {formatPercent(summary.totalProfitRate)}
          </span>
        </div>

        {/* 기간 평균 투자금액 */}
        <div className="flex items-center justify-between p-4 rounded-lg border bg-card">
          <span className="text-sm text-muted-foreground">기간 평균 투자금액</span>
          <span className="text-xl font-bold">
            {formatCurrency(summary.averageInvestment)}
          </span>
        </div>
      </div>
    </div>
  )
}
