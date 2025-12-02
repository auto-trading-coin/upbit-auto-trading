/**
 * 숫자 포맷팅 유틸리티
 */

/**
 * 통화 포맷팅 (원화)
 * @param value 숫자 값
 * @param showSign 부호 표시 여부 (기본: false)
 * @returns 포맷팅된 문자열 (예: "1,234,567원", "+1,234원")
 */
export const formatCurrency = (value: number, showSign = false): string => {
  const formatted = value.toLocaleString(undefined, { maximumFractionDigits: 0 })
  const sign = showSign && value > 0 ? '+' : ''
  return `${sign}${formatted}원`
}

/**
 * 퍼센트 포맷팅
 * @param value 숫자 값 (예: 5.25 = 5.25%)
 * @param showSign 부호 표시 여부 (기본: true)
 * @param decimals 소수점 자릿수 (기본: 2)
 * @returns 포맷팅된 문자열 (예: "+5.25%", "-3.10%")
 */
export const formatPercent = (value: number, showSign = true, decimals = 2): string => {
  const sign = showSign && value > 0 ? '+' : ''
  return `${sign}${value.toFixed(decimals)}%`
}

/**
 * 수량 포맷팅 (최대 8자리 소수점)
 * @param value 숫자 값
 * @returns 포맷팅된 문자열
 */
export const formatAmount = (value: number): string => {
  return value.toLocaleString(undefined, { maximumFractionDigits: 8 })
}

/**
 * 손익에 따른 색상 클래스 반환
 * @param value 손익 값
 * @returns Tailwind CSS 클래스
 */
export const getProfitColorClass = (value: number): string => {
  if (value > 0) return 'text-red-500'
  if (value < 0) return 'text-blue-500'
  return ''
}

/**
 * 손익 여부 확인
 * @param value 손익 값
 * @returns 수익이면 true
 */
export const isProfit = (value: number): boolean => {
  return value >= 0
}
