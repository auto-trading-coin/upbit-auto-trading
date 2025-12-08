/**
 * 투자손익 차트 컴포넌트
 * 누적 수익률 라인차트 + 손익 바차트
 */

'use client'

import { useMemo, useState } from 'react'
import {
  LineChart as RechartsLineChart,
  BarChart as RechartsBarChart,
  Line,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  ReferenceLine,
} from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ChevronUp, ChevronDown } from 'lucide-react'
import { formatCurrency, formatPercent } from '@/lib/utils/format'
import type { ProfitChartData } from '@/types'

interface InvestmentProfitChartProps {
  data: ProfitChartData[]
  className?: string
}

export function InvestmentProfitChart({ data, className = '' }: InvestmentProfitChartProps) {
  const [isCollapsed, setIsCollapsed] = useState(false)

  // 차트 데이터 (역순 정렬 - 오래된 것부터)
  const chartData = useMemo(() => {
    return [...data].reverse()
  }, [data])

  // 손익 바 색상
  const getBarColor = (value: number) => {
    return value >= 0 ? '#ef4444' : '#3b82f6' // 빨간색(이익) / 파란색(손실)
  }

  // 수익률 라인 색상 결정 (마지막 값 기준)
  const lineColor = useMemo(() => {
    if (chartData.length === 0) return '#94a3b8'
    const lastValue = chartData[chartData.length - 1]?.cumulativeRate ?? 0
    return lastValue >= 0 ? '#ef4444' : '#3b82f6'
  }, [chartData])

  if (chartData.length === 0) {
    return null
  }

  return (
    <Card className={className}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-medium">투자손익 그래프</CardTitle>
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-1 hover:bg-muted rounded transition-colors"
          >
            {isCollapsed ? (
              <ChevronDown className="h-5 w-5 text-muted-foreground" />
            ) : (
              <ChevronUp className="h-5 w-5 text-muted-foreground" />
            )}
          </button>
        </div>
      </CardHeader>

      {!isCollapsed && (
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* 누적 수익률 라인차트 */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">누적 수익률</span>
                <span className="text-xs text-muted-foreground">단위: %</span>
              </div>
              <div className="h-[200px]">
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsLineChart
                    data={chartData}
                    margin={{ top: 5, right: 10, left: 10, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis
                      dataKey="label"
                      tick={{ fontSize: 11 }}
                      tickLine={false}
                      axisLine={{ stroke: '#e2e8f0' }}
                    />
                    <YAxis
                      tick={{ fontSize: 11 }}
                      tickLine={false}
                      axisLine={{ stroke: '#e2e8f0' }}
                      tickFormatter={(value) => `${value}`}
                      domain={['dataMin - 1', 'dataMax + 1']}
                    />
                    <ReferenceLine y={0} stroke="#94a3b8" strokeDasharray="3 3" />
                    <Tooltip
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const data = payload[0].payload
                          return (
                            <div className="rounded-lg border bg-background p-2 shadow-md">
                              <p className="text-xs text-muted-foreground">{data.label}</p>
                              <p className="font-medium">
                                누적 수익률: {formatPercent(data.cumulativeRate)}
                              </p>
                            </div>
                          )
                        }
                        return null
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="cumulativeRate"
                      stroke={lineColor}
                      strokeWidth={2}
                      dot={false}
                      activeDot={{ r: 4, fill: lineColor }}
                    />
                  </RechartsLineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* 손익 바차트 */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">손익</span>
                <span className="text-xs text-muted-foreground">단위: 천</span>
              </div>
              <div className="h-[200px]">
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsBarChart
                    data={chartData}
                    margin={{ top: 5, right: 10, left: 10, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis
                      dataKey="label"
                      tick={{ fontSize: 11 }}
                      tickLine={false}
                      axisLine={{ stroke: '#e2e8f0' }}
                    />
                    <YAxis
                      tick={{ fontSize: 11 }}
                      tickLine={false}
                      axisLine={{ stroke: '#e2e8f0' }}
                      tickFormatter={(value) => `${(value / 1000).toFixed(0)}`}
                    />
                    <ReferenceLine y={0} stroke="#94a3b8" />
                    <Tooltip
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const data = payload[0].payload
                          return (
                            <div className="rounded-lg border bg-background p-2 shadow-md">
                              <p className="text-xs text-muted-foreground">{data.label}</p>
                              <p className="font-medium">
                                손익: {formatCurrency(data.profitLoss, true)}
                              </p>
                            </div>
                          )
                        }
                        return null
                      }}
                    />
                    <Bar dataKey="profitLoss" radius={[2, 2, 0, 0]}>
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={getBarColor(entry.profitLoss)} />
                      ))}
                    </Bar>
                  </RechartsBarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </CardContent>
      )}
    </Card>
  )
}
