import { Badge } from "@/components/ui/badge"
import { CheckCircle2, Clock, XCircle, AlertCircle, ArrowUpCircle, ArrowDownCircle } from "lucide-react"
import { cn } from "@/lib/utils"

type OrderStatus = "PENDING" | "COMPLETED" | "CANCELLED" | "FAILED"
type SignalType = "BUY" | "SELL" | "HOLD"
type TradingStatus = "RUNNING" | "STOPPED" | "ERROR"

interface StatusBadgeProps {
  /**
   * 상태 타입
   * - order: 주문 상태 (PENDING, COMPLETED, CANCELLED, FAILED)
   * - signal: 시그널 타입 (BUY, SELL, HOLD)
   * - trading: 자동매매 상태 (RUNNING, STOPPED, ERROR)
   */
  type: "order" | "signal" | "trading"
  /**
   * 상태 값
   */
  status: OrderStatus | SignalType | TradingStatus
  /**
   * 추가 CSS 클래스
   */
  className?: string
}

/**
 * 상태 표시 뱃지 컴포넌트
 * 
 * 주문 상태, 시그널 타입, 자동매매 상태를 시각적으로 표시합니다.
 * 
 * @example 주문 상태
 * ```tsx
 * <StatusBadge type="order" status="COMPLETED" />
 * <StatusBadge type="order" status="PENDING" />
 * ```
 * 
 * @example 시그널 타입
 * ```tsx
 * <StatusBadge type="signal" status="BUY" />
 * <StatusBadge type="signal" status="SELL" />
 * ```
 * 
 * @example 자동매매 상태
 * ```tsx
 * <StatusBadge type="trading" status="RUNNING" />
 * <StatusBadge type="trading" status="STOPPED" />
 * ```
 */
export function StatusBadge({ type, status, className }: StatusBadgeProps) {
  if (type === "order") {
    return <OrderStatusBadge status={status as OrderStatus} className={className} />
  }

  if (type === "signal") {
    return <SignalTypeBadge status={status as SignalType} className={className} />
  }

  if (type === "trading") {
    return <TradingStatusBadge status={status as TradingStatus} className={className} />
  }

  return null
}

/**
 * 주문 상태 뱃지
 */
function OrderStatusBadge({ status, className }: { status: OrderStatus; className?: string }) {
  const variants = {
    PENDING: {
      icon: Clock,
      label: "대기 중",
      className: "bg-blue-100 text-blue-800 border-blue-200",
    },
    COMPLETED: {
      icon: CheckCircle2,
      label: "완료",
      className: "bg-green-100 text-green-800 border-green-200",
    },
    CANCELLED: {
      icon: XCircle,
      label: "취소됨",
      className: "bg-gray-100 text-gray-800 border-gray-200",
    },
    FAILED: {
      icon: AlertCircle,
      label: "실패",
      className: "bg-red-100 text-red-800 border-red-200",
    },
  }

  const config = variants[status]
  const Icon = config.icon

  return (
    <Badge variant="outline" className={cn(config.className, className)}>
      <Icon className="h-3 w-3 mr-1" />
      {config.label}
    </Badge>
  )
}

/**
 * 시그널 타입 뱃지
 */
function SignalTypeBadge({ status, className }: { status: SignalType; className?: string }) {
  const variants = {
    BUY: {
      icon: ArrowUpCircle,
      label: "매수",
      className: "bg-green-100 text-green-800 border-green-200",
    },
    SELL: {
      icon: ArrowDownCircle,
      label: "매도",
      className: "bg-red-100 text-red-800 border-red-200",
    },
    HOLD: {
      icon: Clock,
      label: "홀드",
      className: "bg-gray-100 text-gray-800 border-gray-200",
    },
  }

  const config = variants[status]
  const Icon = config.icon

  return (
    <Badge variant="outline" className={cn(config.className, className)}>
      <Icon className="h-3 w-3 mr-1" />
      {config.label}
    </Badge>
  )
}

/**
 * 자동매매 상태 뱃지
 */
function TradingStatusBadge({ status, className }: { status: TradingStatus; className?: string }) {
  const variants = {
    RUNNING: {
      icon: CheckCircle2,
      label: "실행 중",
      className: "bg-green-500 text-white",
    },
    STOPPED: {
      icon: XCircle,
      label: "중지됨",
      className: "bg-gray-500 text-white",
    },
    ERROR: {
      icon: AlertCircle,
      label: "오류",
      className: "bg-red-500 text-white",
    },
  }

  const config = variants[status]
  const Icon = config.icon

  return (
    <Badge className={cn(config.className, className)}>
      <Icon className="h-3 w-3 mr-1" />
      {config.label}
    </Badge>
  )
}
