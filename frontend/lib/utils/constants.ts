/**
 * Application constants
 */

import type { OrderStatus, OrderSide, OrderType, SignalStatus, ChangeType } from '@/types'

// Order Type
export const ORDER_TYPE: Record<OrderType, { label: string }> = {
  limit: {
    label: '지정가'
  },
  price: {
    label: '시장가(매수)'
  },
  market: {
    label: '시장가(매도)'
  }
}

// Order Status
export const ORDER_STATUS: Record<OrderStatus, { label: string; variant: string; color: string }> = {
  wait: {
    label: '대기',
    variant: 'outline',
    color: 'bg-yellow-50 text-yellow-700 border-yellow-200'
  },
  done: {
    label: '완료',
    variant: 'outline',
    color: 'bg-green-50 text-green-700 border-green-200'
  },
  cancel: {
    label: '취소',
    variant: 'outline',
    color: 'bg-red-50 text-red-700 border-red-200'
  }
}

// Signal Status
export const SIGNAL_STATUS: Record<SignalStatus, { label: string; variant: string; color: string }> = {
  triggered: {
    label: '실행됨',
    variant: 'outline',
    color: 'bg-green-50 text-green-700 border-green-200'
  },
  pending: {
    label: '대기중',
    variant: 'outline',
    color: 'bg-yellow-50 text-yellow-700 border-yellow-200'
  },
  expired: {
    label: '만료됨',
    variant: 'outline',
    color: 'bg-red-50 text-red-700 border-red-200'
  }
}

// Order Side
export const ORDER_SIDE: Record<OrderSide, { label: string; variant: string }> = {
  bid: {
    label: '매수',
    variant: 'default'
  },
  ask: {
    label: '매도',
    variant: 'destructive'
  }
}

// Change Type
export const CHANGE_TYPE: Record<ChangeType, { color: string; textColor: string }> = {
  RISE: {
    color: 'text-red-500',
    textColor: 'text-red-500'
  },
  FALL: {
    color: 'text-blue-500',
    textColor: 'text-blue-500'
  },
  EVEN: {
    color: '',
    textColor: ''
  }
}

// Strategy Type Labels
export const STRATEGY_TYPE_LABELS: Record<string, string> = {
  'trend-following': '추세 추종형',
  'trend-reversal': '추세 반전형',
  'mean-reversion': '평균 회귀형',
  'momentum': '모멘텀형',
  'breakout': '돌파형'
}

// Load More Size for Infinite Scroll
export const LOAD_MORE_SIZE = 10

// Max Items for Infinite Scroll
export const MAX_INFINITE_SCROLL_ITEMS = 200
