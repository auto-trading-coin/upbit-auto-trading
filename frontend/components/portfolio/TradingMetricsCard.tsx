/**
 * 트레이딩 지표 카드 컴포넌트
 * MDD, 승률, 총 수익률 등 자동매매 성과 지표를 표시
 */

'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { 
  TrendingUp, 
  TrendingDown, 
  BarChart3, 
  Calendar,
  Target,
  AlertTriangle,
  HelpCircle,
} from 'lucide-react'
import { formatCurrency, formatPercent, getProfitColorClass } from '@/lib/utils/format'
import type { TradingMetrics } from '@/types'

interface TradingMetricsCardProps {
  metrics: TradingMetrics
}

export function TradingMetricsCard({ metrics }: TradingMetricsCardProps) {
  return (
    <div className="space-y-6">
      {/* 수익률 요약 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            수익률 현황
          </CardTitle>
          <CardDescription>
            {metrics.tradingStartDate} 부터 현재까지의 성과
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <MetricItem
              label="총 수익률"
              value={formatPercent(metrics.totalProfitRate)}
              colorClass={getProfitColorClass(metrics.totalProfitRate)}
              tooltip="투자 시작 이후 누적 수익률"
            />
            <MetricItem
              label="연환산 수익률"
              value={formatPercent(metrics.annualizedReturn)}
              colorClass={getProfitColorClass(metrics.annualizedReturn)}
              tooltip="1년 기준으로 환산한 수익률"
            />
            <MetricItem
              label="최대 수익률"
              value={formatPercent(metrics.maxProfitRate)}
              colorClass="text-red-500"
              tooltip="기간 중 달성한 최대 수익률"
            />
            <MetricItem
              label="총 손익"
              value={formatCurrency(metrics.totalProfitLoss, true)}
              colorClass={getProfitColorClass(metrics.totalProfitLoss)}
              tooltip="투자 시작 이후 누적 손익금액"
            />
          </div>
        </CardContent>
      </Card>

      {/* 리스크 지표 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            리스크 지표
          </CardTitle>
          <CardDescription>
            자동매매 리스크 관리 현황
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <MetricItem
              label="최대 낙폭 (MDD)"
              value={formatPercent(metrics.maxDrawdown)}
              colorClass="text-blue-500"
              tooltip="최고점 대비 최대 하락폭. 낮을수록 안정적"
              isHighlighted
            />
            <MetricItem
              label="MDD 발생일"
              value={metrics.maxDrawdownDate}
              tooltip="최대 낙폭이 발생한 날짜"
            />
            <MetricItem
              label="최대 손실률"
              value={formatPercent(metrics.maxLossRate)}
              colorClass="text-blue-500"
              tooltip="단일 거래에서 발생한 최대 손실률"
            />
          </div>
        </CardContent>
      </Card>

      {/* 거래 통계 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            거래 통계
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <MetricItem
              label="총 거래 횟수"
              value={`${metrics.totalTrades}회`}
              tooltip="자동매매로 체결된 총 거래 수"
            />
            <MetricItem
              label="승률"
              value={formatPercent(metrics.winRate, false)}
              colorClass={metrics.winRate >= 50 ? 'text-red-500' : 'text-blue-500'}
              tooltip="수익 거래 / 전체 거래"
              isHighlighted
            />
            <MetricItem
              label="수익 거래"
              value={`${metrics.winningTrades}회`}
              colorClass="text-red-500"
              tooltip="수익을 낸 거래 횟수"
            />
            <MetricItem
              label="손실 거래"
              value={`${metrics.losingTrades}회`}
              colorClass="text-blue-500"
              tooltip="손실을 본 거래 횟수"
            />
          </div>
        </CardContent>
      </Card>

      {/* 투자 현황 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            투자 현황
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <MetricItem
              label="총 투자금액"
              value={formatCurrency(metrics.totalInvested)}
              tooltip="누적 입금 금액"
            />
            <MetricItem
              label="현재 자산"
              value={formatCurrency(metrics.currentAsset)}
              tooltip="현재 총 평가 금액"
            />
            <MetricItem
              label="거래 시작일"
              value={metrics.tradingStartDate}
              icon={<Calendar className="h-4 w-4" />}
            />
            <MetricItem
              label="총 거래일수"
              value={`${metrics.tradingDays}일`}
              tooltip="실제 거래가 발생한 날 수"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// ============================================
// 지표 아이템 컴포넌트
// ============================================

interface MetricItemProps {
  label: string
  value: string
  colorClass?: string
  tooltip?: string
  icon?: React.ReactNode
  isHighlighted?: boolean
}

function MetricItem({ 
  label, 
  value, 
  colorClass = '', 
  tooltip,
  icon,
  isHighlighted = false,
}: MetricItemProps) {
  const content = (
    <div className={`p-4 rounded-lg ${isHighlighted ? 'bg-muted' : 'bg-muted/30'}`}>
      <div className="flex items-center gap-1 text-xs text-muted-foreground mb-1">
        {icon}
        <span>{label}</span>
        {tooltip && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <HelpCircle className="h-3 w-3" />
              </TooltipTrigger>
              <TooltipContent>
                <p className="max-w-[200px]">{tooltip}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </div>
      <p className={`text-lg font-semibold ${colorClass}`}>
        {value}
      </p>
    </div>
  )

  return content
}
