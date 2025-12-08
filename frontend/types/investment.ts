/**
 * Investment Profit/Loss Types
 * 업비트 스타일 투자손익 관련 타입 정의
 */

/**
 * 투자손익 조회 기간 타입
 */
export type InvestmentPeriodType = 'daily' | 'monthly' | 'yearly' | 'all'

/**
 * 수익률 계산 방식
 */
export type ProfitCalculationType = 'amount-weighted' | 'time-weighted' | 'simple'

/**
 * 기간별 투자손익 요약
 */
export interface InvestmentProfitSummary {
  periodStart: string              // 기간 시작일
  periodEnd: string                // 기간 종료일
  totalProfitLoss: number          // 기간 누적 손익 (KRW)
  totalProfitRate: number          // 기간 누적 수익률 (%)
  averageInvestment: number        // 기간 평균 투자금액 (KRW)
}

/**
 * 일별 투자손익 상세
 */
export interface DailyProfitItem {
  date: string                     // 날짜 (YYYY-MM-DD)
  dailyProfitLoss: number          // 일일 손익 (KRW)
  dailyProfitRate: number          // 일일 수익률 (%)
  cumulativeProfitLoss: number     // 누적 손익 (KRW)
  cumulativeProfitRate: number     // 누적 수익률 (%)
  startingAsset: number            // 기초 자산 (KRW)
  endingAsset: number              // 기말 자산 (KRW)
  deposit: number                  // 입금액 (KRW)
  withdrawal: number               // 출금액 (KRW)
}

/**
 * 월별 투자손익 상세
 */
export interface MonthlyProfitItem {
  year: number                     // 연도
  month: number                    // 월 (1-12)
  monthlyProfitLoss: number        // 월간 손익 (KRW)
  monthlyProfitRate: number        // 월간 수익률 (%)
  cumulativeProfitLoss: number     // 누적 손익 (KRW)
  cumulativeProfitRate: number     // 누적 수익률 (%)
  startingAsset: number            // 기초 자산 (KRW)
  endingAsset: number              // 기말 자산 (KRW)
  deposit: number                  // 입금액 (KRW)
  withdrawal: number               // 출금액 (KRW)
  tradingDays: number              // 거래일수
}

/**
 * 연도별 투자손익 상세
 */
export interface YearlyProfitItem {
  year: number                     // 연도
  yearlyProfitLoss: number         // 연간 손익 (KRW)
  yearlyProfitRate: number         // 연간 수익률 (%)
  cumulativeProfitLoss: number     // 누적 손익 (KRW)
  cumulativeProfitRate: number     // 누적 수익률 (%)
  startingAsset: number            // 기초 자산 (KRW)
  endingAsset: number              // 기말 자산 (KRW)
  deposit: number                  // 입금액 (KRW)
  withdrawal: number               // 출금액 (KRW)
  tradingDays: number              // 거래일수
}

/**
 * 자동매매 성과 지표 (전체 기간)
 */
export interface TradingMetrics {
  // 수익률 지표
  totalProfitRate: number          // 총 수익률 (%)
  annualizedReturn: number         // 연환산 수익률 (%)
  maxProfitRate: number            // 최대 수익률 (%)
  
  // 손실 지표
  maxDrawdown: number              // 최대 낙폭 (MDD, %)
  maxDrawdownDate: string          // MDD 발생일
  maxLossRate: number              // 최대 손실률 (%)
  
  // 거래 통계
  totalTrades: number              // 총 거래 횟수
  winningTrades: number            // 수익 거래 횟수
  losingTrades: number             // 손실 거래 횟수
  winRate: number                  // 승률 (%)
  
  // 기간 정보
  tradingStartDate: string         // 거래 시작일
  tradingDays: number              // 총 거래일수
  
  // 투자 금액
  totalInvested: number            // 총 투자금액 (KRW)
  currentAsset: number             // 현재 자산 (KRW)
  totalProfitLoss: number          // 총 손익 (KRW)
}

/**
 * 투자손익 API 응답 (일별)
 */
export interface DailyProfitResponse {
  summary: InvestmentProfitSummary
  items: DailyProfitItem[]
}

/**
 * 투자손익 API 응답 (월별)
 */
export interface MonthlyProfitResponse {
  summary: InvestmentProfitSummary
  items: MonthlyProfitItem[]
}

/**
 * 투자손익 API 응답 (연도별)
 */
export interface YearlyProfitResponse {
  summary: InvestmentProfitSummary
  items: YearlyProfitItem[]
}

/**
 * 차트 데이터 포맷
 */
export interface ProfitChartData {
  label: string                    // X축 라벨 (날짜/월/연도)
  cumulativeRate: number           // 누적 수익률
  profitLoss: number               // 손익 금액
}
