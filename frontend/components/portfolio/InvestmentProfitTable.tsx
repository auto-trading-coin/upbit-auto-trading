/**
 * 투자손익 상세 테이블 컴포넌트
 * 일별/월별/연도별 손익 데이터를 테이블로 표시
 */

'use client'

import { HelpCircle } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { formatCurrency, formatPercent, getProfitColorClass } from '@/lib/utils/format'
import type { DailyProfitItem, MonthlyProfitItem, YearlyProfitItem } from '@/types'

// ============================================
// 일별 테이블
// ============================================

interface DailyProfitTableProps {
  items: DailyProfitItem[]
}

export function DailyProfitTable({ items }: DailyProfitTableProps) {
  if (items.length === 0) {
    return (
      <EmptyState message="해당 기간의 투자손익 데이터가 없습니다." />
    )
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <CardTitle className="text-base font-medium">투자손익 상세</CardTitle>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <span className="text-xs text-muted-foreground">KRW 환산 추정값</span>
                <HelpCircle className="inline h-3 w-3 ml-1" />
              </TooltipTrigger>
              <TooltipContent>
                <p>입출금을 제외한 순수 투자손익입니다.</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="px-4 py-3 text-left font-medium">일자</th>
                <th className="px-4 py-3 text-right font-medium">일일 손익</th>
                <th className="px-4 py-3 text-right font-medium">일일 수익률</th>
                <th className="px-4 py-3 text-right font-medium">누적 손익</th>
                <th className="px-4 py-3 text-right font-medium">누적 수익률</th>
                <th className="px-4 py-3 text-right font-medium">기초 자산</th>
                <th className="px-4 py-3 text-right font-medium">기말 자산</th>
                <th className="px-4 py-3 text-right font-medium">입금</th>
                <th className="px-4 py-3 text-right font-medium">출금</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, index) => (
                <tr 
                  key={item.date} 
                  className={`border-b hover:bg-muted/30 transition-colors ${
                    index % 2 === 0 ? 'bg-background' : 'bg-muted/10'
                  }`}
                >
                  <td className="px-4 py-3 font-medium">
                    {formatDate(item.date)}
                  </td>
                  <td className={`px-4 py-3 text-right ${getProfitColorClass(item.dailyProfitLoss)}`}>
                    {formatCurrency(item.dailyProfitLoss, true)}
                  </td>
                  <td className={`px-4 py-3 text-right ${getProfitColorClass(item.dailyProfitRate)}`}>
                    {formatPercent(item.dailyProfitRate)}
                  </td>
                  <td className={`px-4 py-3 text-right ${getProfitColorClass(item.cumulativeProfitLoss)}`}>
                    {formatCurrency(item.cumulativeProfitLoss, true)}
                  </td>
                  <td className={`px-4 py-3 text-right ${getProfitColorClass(item.cumulativeProfitRate)}`}>
                    {formatPercent(item.cumulativeProfitRate)}
                  </td>
                  <td className="px-4 py-3 text-right text-muted-foreground">
                    {formatCurrency(item.startingAsset)}
                  </td>
                  <td className="px-4 py-3 text-right text-muted-foreground">
                    {formatCurrency(item.endingAsset)}
                  </td>
                  <td className="px-4 py-3 text-right text-muted-foreground">
                    {item.deposit > 0 ? formatCurrency(item.deposit) : '-'}
                  </td>
                  <td className="px-4 py-3 text-right text-muted-foreground">
                    {item.withdrawal > 0 ? formatCurrency(item.withdrawal) : '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  )
}

// ============================================
// 월별 테이블
// ============================================

interface MonthlyProfitTableProps {
  items: MonthlyProfitItem[]
  onMonthClick?: (year: number, month: number) => void
}

export function MonthlyProfitTable({ items, onMonthClick }: MonthlyProfitTableProps) {
  if (items.length === 0) {
    return (
      <EmptyState message="해당 연도의 투자손익 데이터가 없습니다." />
    )
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <CardTitle className="text-base font-medium">투자손익 상세</CardTitle>
          <span className="text-xs text-muted-foreground">월을 클릭하면 일별 상세를 볼 수 있습니다</span>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="px-4 py-3 text-left font-medium">월</th>
                <th className="px-4 py-3 text-right font-medium">월간 손익</th>
                <th className="px-4 py-3 text-right font-medium">월간 수익률</th>
                <th className="px-4 py-3 text-right font-medium">누적 손익</th>
                <th className="px-4 py-3 text-right font-medium">누적 수익률</th>
                <th className="px-4 py-3 text-right font-medium">기초 자산</th>
                <th className="px-4 py-3 text-right font-medium">기말 자산</th>
                <th className="px-4 py-3 text-right font-medium">거래일</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, index) => (
                <tr 
                  key={`${item.year}-${item.month}`} 
                  className={`border-b hover:bg-muted/30 transition-colors cursor-pointer ${
                    index % 2 === 0 ? 'bg-background' : 'bg-muted/10'
                  }`}
                  onClick={() => onMonthClick?.(item.year, item.month)}
                >
                  <td className="px-4 py-3 font-medium">
                    {item.year}년 {item.month}월
                  </td>
                  <td className={`px-4 py-3 text-right ${getProfitColorClass(item.monthlyProfitLoss)}`}>
                    {formatCurrency(item.monthlyProfitLoss, true)}
                  </td>
                  <td className={`px-4 py-3 text-right ${getProfitColorClass(item.monthlyProfitRate)}`}>
                    {formatPercent(item.monthlyProfitRate)}
                  </td>
                  <td className={`px-4 py-3 text-right ${getProfitColorClass(item.cumulativeProfitLoss)}`}>
                    {formatCurrency(item.cumulativeProfitLoss, true)}
                  </td>
                  <td className={`px-4 py-3 text-right ${getProfitColorClass(item.cumulativeProfitRate)}`}>
                    {formatPercent(item.cumulativeProfitRate)}
                  </td>
                  <td className="px-4 py-3 text-right text-muted-foreground">
                    {formatCurrency(item.startingAsset)}
                  </td>
                  <td className="px-4 py-3 text-right text-muted-foreground">
                    {formatCurrency(item.endingAsset)}
                  </td>
                  <td className="px-4 py-3 text-right text-muted-foreground">
                    {item.tradingDays}일
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  )
}

// ============================================
// 연도별 테이블
// ============================================

interface YearlyProfitTableProps {
  items: YearlyProfitItem[]
  onYearClick?: (year: number) => void
}

export function YearlyProfitTable({ items, onYearClick }: YearlyProfitTableProps) {
  if (items.length === 0) {
    return (
      <EmptyState message="투자손익 데이터가 없습니다." />
    )
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <CardTitle className="text-base font-medium">투자손익 상세</CardTitle>
          <span className="text-xs text-muted-foreground">연도를 클릭하면 월별 상세를 볼 수 있습니다</span>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="px-4 py-3 text-left font-medium">연도</th>
                <th className="px-4 py-3 text-right font-medium">연간 손익</th>
                <th className="px-4 py-3 text-right font-medium">연간 수익률</th>
                <th className="px-4 py-3 text-right font-medium">누적 손익</th>
                <th className="px-4 py-3 text-right font-medium">누적 수익률</th>
                <th className="px-4 py-3 text-right font-medium">기초 자산</th>
                <th className="px-4 py-3 text-right font-medium">기말 자산</th>
                <th className="px-4 py-3 text-right font-medium">거래일</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, index) => (
                <tr 
                  key={item.year} 
                  className={`border-b hover:bg-muted/30 transition-colors cursor-pointer ${
                    index % 2 === 0 ? 'bg-background' : 'bg-muted/10'
                  }`}
                  onClick={() => onYearClick?.(item.year)}
                >
                  <td className="px-4 py-3 font-medium">
                    {item.year}년
                  </td>
                  <td className={`px-4 py-3 text-right ${getProfitColorClass(item.yearlyProfitLoss)}`}>
                    {formatCurrency(item.yearlyProfitLoss, true)}
                  </td>
                  <td className={`px-4 py-3 text-right ${getProfitColorClass(item.yearlyProfitRate)}`}>
                    {formatPercent(item.yearlyProfitRate)}
                  </td>
                  <td className={`px-4 py-3 text-right ${getProfitColorClass(item.cumulativeProfitLoss)}`}>
                    {formatCurrency(item.cumulativeProfitLoss, true)}
                  </td>
                  <td className={`px-4 py-3 text-right ${getProfitColorClass(item.cumulativeProfitRate)}`}>
                    {formatPercent(item.cumulativeProfitRate)}
                  </td>
                  <td className="px-4 py-3 text-right text-muted-foreground">
                    {formatCurrency(item.startingAsset)}
                  </td>
                  <td className="px-4 py-3 text-right text-muted-foreground">
                    {formatCurrency(item.endingAsset)}
                  </td>
                  <td className="px-4 py-3 text-right text-muted-foreground">
                    {item.tradingDays}일
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  )
}

// ============================================
// 공통 컴포넌트
// ============================================

function EmptyState({ message }: { message: string }) {
  return (
    <Card>
      <CardContent className="py-12">
        <div className="text-center text-muted-foreground">
          <p>{message}</p>
        </div>
      </CardContent>
    </Card>
  )
}

// 날짜 포맷 헬퍼 (MM.DD)
function formatDate(dateString: string): string {
  const [, month, day] = dateString.split('-')
  return `${month}.${day}`
}
