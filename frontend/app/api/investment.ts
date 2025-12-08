/**
 * Investment Profit API Client
 * 투자손익 데이터 조회 (백엔드 API 연동 준비)
 * 
 * TODO: 백엔드 API 구현 후 실제 API 호출로 변경
 */

import type {
  DailyProfitResponse,
  MonthlyProfitResponse,
  YearlyProfitResponse,
  TradingMetrics,
  DailyProfitItem,
  MonthlyProfitItem,
  YearlyProfitItem,
} from '@/types'

// ============================================
// 더미 데이터 생성 함수
// ============================================

/**
 * 일별 더미 데이터 생성
 */
const generateDailyDummyData = (year: number, month: number): DailyProfitItem[] => {
  const daysInMonth = new Date(year, month, 0).getDate()
  const today = new Date()
  const items: DailyProfitItem[] = []
  
  let cumulativePL = -5000 // 시작 누적 손익
  let prevAsset = 90000
  
  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(year, month - 1, day)
    if (date > today) break
    
    // 랜덤 일일 손익 (-10% ~ +5%)
    const dailyRate = (Math.random() - 0.6) * 10
    const dailyPL = Math.round(prevAsset * dailyRate / 100)
    cumulativePL += dailyPL
    
    const startingAsset = prevAsset
    const endingAsset = startingAsset + dailyPL
    const cumulativeRate = (cumulativePL / 90000) * 100
    
    items.push({
      date: `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`,
      dailyProfitLoss: dailyPL,
      dailyProfitRate: dailyRate,
      cumulativeProfitLoss: cumulativePL,
      cumulativeProfitRate: parseFloat(cumulativeRate.toFixed(2)),
      startingAsset,
      endingAsset,
      deposit: 0,
      withdrawal: 0,
    })
    
    prevAsset = endingAsset
  }
  
  return items.reverse() // 최신순 정렬
}

/**
 * 월별 더미 데이터 생성
 */
const generateMonthlyDummyData = (year: number): MonthlyProfitItem[] => {
  const today = new Date()
  const currentMonth = today.getFullYear() === year ? today.getMonth() + 1 : 12
  const items: MonthlyProfitItem[] = []
  
  let cumulativePL = 0
  let prevAsset = 1000000
  
  for (let month = 1; month <= currentMonth; month++) {
    // 랜덤 월간 수익률 (-15% ~ +20%)
    const monthlyRate = (Math.random() - 0.4) * 25
    const monthlyPL = Math.round(prevAsset * monthlyRate / 100)
    cumulativePL += monthlyPL
    
    const startingAsset = prevAsset
    const endingAsset = startingAsset + monthlyPL
    const cumulativeRate = (cumulativePL / 1000000) * 100
    
    items.push({
      year,
      month,
      monthlyProfitLoss: monthlyPL,
      monthlyProfitRate: parseFloat(monthlyRate.toFixed(2)),
      cumulativeProfitLoss: cumulativePL,
      cumulativeProfitRate: parseFloat(cumulativeRate.toFixed(2)),
      startingAsset,
      endingAsset,
      deposit: 0,
      withdrawal: 0,
      tradingDays: Math.floor(Math.random() * 5) + 20,
    })
    
    prevAsset = endingAsset
  }
  
  return items.reverse() // 최신순 정렬
}

/**
 * 연도별 더미 데이터 생성
 */
const generateYearlyDummyData = (): YearlyProfitItem[] => {
  const currentYear = new Date().getFullYear()
  const items: YearlyProfitItem[] = []
  
  let cumulativePL = 0
  let prevAsset = 500000
  
  for (let year = currentYear - 2; year <= currentYear; year++) {
    // 랜덤 연간 수익률 (-30% ~ +50%)
    const yearlyRate = (Math.random() - 0.3) * 60
    const yearlyPL = Math.round(prevAsset * yearlyRate / 100)
    cumulativePL += yearlyPL
    
    const startingAsset = prevAsset
    const endingAsset = startingAsset + yearlyPL
    const cumulativeRate = (cumulativePL / 500000) * 100
    
    items.push({
      year,
      yearlyProfitLoss: yearlyPL,
      yearlyProfitRate: parseFloat(yearlyRate.toFixed(2)),
      cumulativeProfitLoss: cumulativePL,
      cumulativeProfitRate: parseFloat(cumulativeRate.toFixed(2)),
      startingAsset,
      endingAsset,
      deposit: year === currentYear - 2 ? 500000 : 0,
      withdrawal: 0,
      tradingDays: year === currentYear ? 300 : 365,
    })
    
    prevAsset = endingAsset
  }
  
  return items.reverse() // 최신순 정렬
}

/**
 * 트레이딩 지표 더미 데이터 생성
 */
const generateTradingMetricsDummy = (): TradingMetrics => {
  return {
    totalProfitRate: 15.32,
    annualizedReturn: 8.45,
    maxProfitRate: 28.5,
    maxDrawdown: -12.8,
    maxDrawdownDate: '2025-03-15',
    maxLossRate: -8.2,
    totalTrades: 156,
    winningTrades: 89,
    losingTrades: 67,
    winRate: 57.05,
    tradingStartDate: '2023-01-15',
    tradingDays: 680,
    totalInvested: 1500000,
    currentAsset: 1729800,
    totalProfitLoss: 229800,
  }
}

// ============================================
// API 함수
// ============================================

/**
 * 일별 투자손익 조회
 * @param year 연도
 * @param month 월 (1-12)
 */
export const getDailyProfit = async (
  year: number,
  month: number
): Promise<DailyProfitResponse> => {
  // TODO: 실제 API 호출로 변경
  // const { data } = await api.get<SuccessResponse<DailyProfitResponse>>(
  //   `/portfolio/profit?year=${year}&month=${month}`
  // )
  // return data.data
  
  // 더미 데이터 반환
  await new Promise(resolve => setTimeout(resolve, 300)) // 로딩 시뮬레이션
  
  const items = generateDailyDummyData(year, month)
  const lastItem = items[0]
  const firstItem = items[items.length - 1]
  
  return {
    summary: {
      periodStart: firstItem?.date || '',
      periodEnd: lastItem?.date || '',
      totalProfitLoss: lastItem?.cumulativeProfitLoss || 0,
      totalProfitRate: lastItem?.cumulativeProfitRate || 0,
      averageInvestment: 86291,
    },
    items,
  }
}

/**
 * 월별 투자손익 조회
 * @param year 연도
 */
export const getMonthlyProfit = async (
  year: number
): Promise<MonthlyProfitResponse> => {
  // TODO: 실제 API 호출로 변경
  
  await new Promise(resolve => setTimeout(resolve, 300))
  
  const items = generateMonthlyDummyData(year)
  const lastItem = items[0]
  const firstItem = items[items.length - 1]
  
  return {
    summary: {
      periodStart: `${firstItem?.year}-${String(firstItem?.month).padStart(2, '0')}-01`,
      periodEnd: `${lastItem?.year}-${String(lastItem?.month).padStart(2, '0')}-01`,
      totalProfitLoss: lastItem?.cumulativeProfitLoss || 0,
      totalProfitRate: lastItem?.cumulativeProfitRate || 0,
      averageInvestment: 1050000,
    },
    items,
  }
}

/**
 * 연도별 투자손익 조회
 */
export const getYearlyProfit = async (): Promise<YearlyProfitResponse> => {
  // TODO: 실제 API 호출로 변경
  
  await new Promise(resolve => setTimeout(resolve, 300))
  
  const items = generateYearlyDummyData()
  const lastItem = items[0]
  const firstItem = items[items.length - 1]
  
  return {
    summary: {
      periodStart: `${firstItem?.year}-01-01`,
      periodEnd: `${lastItem?.year}-12-31`,
      totalProfitLoss: lastItem?.cumulativeProfitLoss || 0,
      totalProfitRate: lastItem?.cumulativeProfitRate || 0,
      averageInvestment: 750000,
    },
    items,
  }
}

/**
 * 전체 기간 트레이딩 지표 조회
 */
export const getTradingMetrics = async (): Promise<TradingMetrics> => {
  // TODO: 실제 API 호출로 변경
  
  await new Promise(resolve => setTimeout(resolve, 300))
  
  return generateTradingMetricsDummy()
}

/**
 * 사용 가능한 연도 목록 조회
 */
export const getAvailableYears = async (): Promise<number[]> => {
  // TODO: 실제 API 호출로 변경
  const currentYear = new Date().getFullYear()
  return [currentYear, currentYear - 1, currentYear - 2]
}
