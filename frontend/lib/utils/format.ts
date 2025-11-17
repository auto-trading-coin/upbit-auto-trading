/**
 * Formatting utility functions
 */

/**
 * 가격을 한글 단위로 포맷팅
 * @example formatPrice(1500000) => "150만원"
 */
export const formatPrice = (price: number): string => {
  if (price >= 1000000) {
    return `${(price / 1000000).toLocaleString(undefined, { maximumFractionDigits: 2 })}백만원`
  } else if (price >= 1000) {
    return `${(price / 1000).toLocaleString(undefined, { maximumFractionDigits: 2 })}천원`
  } else {
    return `${price.toLocaleString()}원`
  }
}

/**
 * 거래량을 축약 표기로 포맷팅
 * @example formatVolume(1500000000) => "1.5B"
 */
export const formatVolume = (volume: number): string => {
  if (volume >= 1000000000) {
    return `${(volume / 1000000000).toLocaleString(undefined, { maximumFractionDigits: 2 })}B`
  } else if (volume >= 1000000) {
    return `${(volume / 1000000).toLocaleString(undefined, { maximumFractionDigits: 2 })}M`
  } else if (volume >= 1000) {
    return `${(volume / 1000).toLocaleString(undefined, { maximumFractionDigits: 2 })}K`
  } else {
    return volume.toLocaleString()
  }
}

/**
 * ISO 날짜 문자열을 "YYYY-MM-DD HH:mm" 형식으로 포맷팅
 * @example formatDate("2023-06-15T09:30:00Z") => "2023-06-15 09:30"
 */
export const formatDate = (dateString: string): string => {
  const date = new Date(dateString)
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`
}

/**
 * 변동률을 포맷팅 (부호 포함)
 * @example formatChangeRate(0.025) => "+2.50%"
 */
export const formatChangeRate = (rate: number, showSign: boolean = true): string => {
  const formatted = `${(rate * 100).toFixed(2)}%`
  if (showSign && rate > 0) {
    return `+${formatted}`
  }
  return formatted
}

/**
 * 숫자를 천단위 콤마로 포맷팅
 * @example formatNumber(1000000) => "1,000,000"
 */
export const formatNumber = (num: number, fractionDigits: number = 0): string => {
  return num.toLocaleString(undefined, { 
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits 
  })
}

/**
 * 원화 표시 (천단위 콤마 + "원")
 * @example formatKRW(1000000) => "1,000,000원"
 */
export const formatKRW = (amount: number): string => {
  return `${amount.toLocaleString()}원`
}
