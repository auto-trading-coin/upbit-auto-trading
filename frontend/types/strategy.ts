/**
 * Strategy related types
 */

export interface Indicator {
  id: number
  name: string
  description: string
}

export interface Strategy {
  id: number
  name: string
  information: string
  strategyType: string
  indicators: string[]
}

export interface StrategyDetail {
  id: number
  name: string
  information: string
  conditions: string
  strategyType: string
  indicators: Indicator[]
}

// 프론트엔드에서 사용하는 전략 타입 (기존 코드 호환용)
export interface LegacyStrategy {
  id: string
  name: string
  description: string
  details: string
  indicators: string[]
  type: string
}

export type StrategyType = 
  | 'trend-following'
  | 'trend-reversal'
  | 'mean-reversion'
  | 'momentum'
  | 'breakout'
