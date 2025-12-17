'use client'

import { ReactNode } from 'react'
import { cn } from '@/lib/utils'

/**
 * 모바일 데이터 카드 컴포넌트
 * 테이블 데이터를 모바일에서 카드 형식으로 표시할 때 사용
 */

interface MobileDataCardProps {
  /** 카드 상단 헤더 (코인명, 주문ID 등) */
  header: ReactNode
  /** 헤더 우측 뱃지/아이콘 */
  headerRight?: ReactNode
  /** 헤더 하단 부제목 (마켓코드 등) */
  subHeader?: ReactNode
  /** 데이터 행 목록 */
  rows: MobileDataRow[]
  /** 클릭 핸들러 */
  onClick?: () => void
  /** 추가 클래스명 */
  className?: string
}

interface MobileDataRow {
  /** 라벨 */
  label: string
  /** 값 */
  value: ReactNode
  /** 값 색상 클래스 */
  valueClassName?: string
  /** 숨김 여부 (조건부 렌더링) */
  hidden?: boolean
}

export function MobileDataCard({
  header,
  headerRight,
  subHeader,
  rows,
  onClick,
  className,
}: MobileDataCardProps) {
  const visibleRows = rows.filter(row => !row.hidden)

  return (
    <div
      className={cn(
        'rounded-lg border bg-card p-4 space-y-3',
        onClick && 'cursor-pointer hover:bg-muted/50 transition-colors',
        className
      )}
      onClick={onClick}
    >
      {/* 헤더 영역 */}
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <div className="font-medium truncate">{header}</div>
          {subHeader && (
            <div className="text-xs text-muted-foreground mt-0.5">{subHeader}</div>
          )}
        </div>
        {headerRight && (
          <div className="flex-shrink-0">{headerRight}</div>
        )}
      </div>

      {/* 데이터 행들 */}
      {visibleRows.length > 0 && (
        <div className="space-y-2 pt-2 border-t">
          {visibleRows.map((row, index) => (
            <div key={index} className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">{row.label}</span>
              <span className={cn('font-medium text-right', row.valueClassName)}>
                {row.value}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

/**
 * 모바일 카드 그리드 컨테이너
 * 여러 MobileDataCard를 감싸는 컨테이너
 */
interface MobileCardGridProps {
  children: ReactNode
  className?: string
}

export function MobileCardGrid({ children, className }: MobileCardGridProps) {
  return (
    <div className={cn('space-y-3', className)}>
      {children}
    </div>
  )
}

/**
 * 모바일 합계 카드
 * 테이블 하단의 합계 정보를 표시
 */
interface MobileSummaryCardProps {
  rows: MobileDataRow[]
  className?: string
}

export function MobileSummaryCard({ rows, className }: MobileSummaryCardProps) {
  const visibleRows = rows.filter(row => !row.hidden)

  return (
    <div className={cn('rounded-lg border bg-muted/30 p-4', className)}>
      <div className="text-sm font-semibold mb-3">합계</div>
      <div className="space-y-2">
        {visibleRows.map((row, index) => (
          <div key={index} className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">{row.label}</span>
            <span className={cn('font-semibold', row.valueClassName)}>
              {row.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
