"use client"

import type * as React from "react"
import {
  Line,
  LineChart as RechartsLineChart,
  Bar,
  BarChart as RechartsBarChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  Cell,
  Pie,
  PieChart as RechartsPieChart,
} from "recharts"

// 차트 컴포넌트 타입
interface ChartProps {
  className?: string
  children: React.ReactNode
}

// 차트 컨테이너 컴포넌트
export function Chart({ className, children }: ChartProps) {
  return (
    <div className={className}>
      <ResponsiveContainer width="100%" height={350}>
        {children}
      </ResponsiveContainer>
    </div>
  )
}

// 라인 차트 컴포넌트
interface LineChartProps {
  data: any[]
  categories?: string[]
  index: string
  colors?: string[]
  valueFormatter?: (value: number) => string
  yAxisWidth?: number
  showLegend?: boolean
  showXAxis?: boolean
  showYAxis?: boolean
  showGrid?: boolean
}

export function LineChart({
  data,
  categories,
  index,
  colors = ["hsl(var(--chart-1))", "hsl(var(--chart-2))", "hsl(var(--chart-3))", "hsl(var(--chart-4))"],
  valueFormatter = (value: number) => `${value}`,
  yAxisWidth = 40,
  showLegend = true,
  showXAxis = true,
  showYAxis = true,
  showGrid = true,
}: LineChartProps) {
  return (
    <RechartsLineChart data={data} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
      {showGrid && <CartesianGrid strokeDasharray="3 3" />}
      {showXAxis && <XAxis dataKey={index} />}
      {showYAxis && <YAxis width={yAxisWidth} tickFormatter={valueFormatter} />}
      <Tooltip
        content={({ active, payload }) => {
          if (active && payload && payload.length) {
            return (
              <div className="rounded-lg border bg-background p-2 shadow-sm">
                <div className="grid grid-cols-2 gap-2">
                  <div className="flex flex-col">
                    <span className="text-[0.70rem] uppercase text-muted-foreground">{payload[0].payload[index]}</span>
                  </div>
                  {payload.map((entry, index) => (
                    <div key={`item-${index}`} className="flex flex-col">
                      <span className="text-[0.70rem] text-muted-foreground">{entry.name}</span>
                      <span className="font-bold text-[0.70rem]">{valueFormatter(entry.value as number)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )
          }

          return null
        }}
      />
      {showLegend && <Legend />}
      {categories?.map((category, index) => (
        <Line
          key={category}
          type="monotone"
          dataKey={category}
          stroke={colors[index % colors.length]}
          activeDot={{ r: 8 }}
        />
      ))}
    </RechartsLineChart>
  )
}

// 바 차트 컴포넌트
interface BarChartProps {
  data: any[]
  categories?: string[]
  index: string
  colors?: string[]
  valueFormatter?: (value: number) => string
  yAxisWidth?: number
  showLegend?: boolean
  showXAxis?: boolean
  showYAxis?: boolean
  showGrid?: boolean
}

export function BarChart({
  data,
  categories,
  index,
  colors = ["hsl(var(--chart-1))", "hsl(var(--chart-2))", "hsl(var(--chart-3))", "hsl(var(--chart-4))"],
  valueFormatter = (value: number) => `${value}`,
  yAxisWidth = 40,
  showLegend = true,
  showXAxis = true,
  showYAxis = true,
  showGrid = true,
}: BarChartProps) {
  return (
    <RechartsBarChart data={data} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
      {showGrid && <CartesianGrid strokeDasharray="3 3" />}
      {showXAxis && <XAxis dataKey={index} />}
      {showYAxis && <YAxis width={yAxisWidth} tickFormatter={valueFormatter} />}
      <Tooltip
        content={({ active, payload }) => {
          if (active && payload && payload.length) {
            return (
              <div className="rounded-lg border bg-background p-2 shadow-sm">
                <div className="grid grid-cols-2 gap-2">
                  <div className="flex flex-col">
                    <span className="text-[0.70rem] uppercase text-muted-foreground">{payload[0].payload[index]}</span>
                  </div>
                  {payload.map((entry, index) => (
                    <div key={`item-${index}`} className="flex flex-col">
                      <span className="text-[0.70rem] text-muted-foreground">{entry.name}</span>
                      <span className="font-bold text-[0.70rem]">{valueFormatter(entry.value as number)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )
          }

          return null
        }}
      />
      {showLegend && <Legend />}
      {categories?.map((category, index) => (
        <Bar key={category} dataKey={category} fill={colors[index % colors.length]} />
      ))}
    </RechartsBarChart>
  )
}

// 파이 차트 컴포넌트
interface PieChartProps {
  data: Array<{
    name: string
    value: number
    color?: string
  }>
  valueFormatter?: (value: number) => string
  showLabel?: boolean
  showLegend?: boolean
  showTooltip?: boolean
  innerRadius?: number
  outerRadius?: number
  paddingAngle?: number
  labelRadius?: number
}

export function PieChart({
  data,
  valueFormatter = (value: number) => `${value.toFixed(1)}%`,
  showLabel = true,
  showLegend = false,
  showTooltip = true,
  innerRadius = 0,
  outerRadius = 80,
  paddingAngle = 0,
  labelRadius = 50,
}: PieChartProps) {
  // 기본 색상 배열
  const defaultColors = [
    "#3b82f6", // blue-500
    "#22c55e", // green-500
    "#eab308", // yellow-500
    "#a855f7", // purple-500
    "#ec4899", // pink-500
    "#6366f1", // indigo-500
    "#ef4444", // red-500
    "#f97316", // orange-500
    "#94a3b8", // slate-400
  ]

  return (
    <RechartsPieChart width={300} height={300}>
      <Pie
        data={data}
        cx="50%"
        cy="50%"
        labelLine={showLabel}
        label={showLabel ? ({ name, percent }) => `${name} ${(percent * 100).toFixed(1)}%` : undefined}
        innerRadius={innerRadius}
        outerRadius={outerRadius}
        paddingAngle={paddingAngle}
        dataKey="value"
      >
        {data.map((entry, index) => (
          <Cell key={`cell-${index}`} fill={entry.color || defaultColors[index % defaultColors.length]} />
        ))}
      </Pie>
      {showTooltip && (
        <Tooltip
          formatter={(value, name) => [valueFormatter(value as number), name]}
          contentStyle={{
            backgroundColor: "white",
            borderRadius: "0.375rem",
            border: "1px solid #e2e8f0",
            boxShadow: "0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)",
          }}
        />
      )}
      {showLegend && <Legend />}
    </RechartsPieChart>
  )
}
