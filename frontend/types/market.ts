/**
 * Market data related types
 */

export type ChangeType = 'RISE' | 'FALL' | 'EVEN'

/**
 * 시세 데이터
 * TODO: 백엔드 API 구현 후 실제 Response DTO에 맞춰 수정 필요
 */
export interface MarketData {
  market: string              // 마켓 코드 (예: "KRW-BTC")
  koreanName: string          // 한글명
  englishName: string         // 영문명
  currentPrice: number        // 현재가
  change: ChangeType          // 전일 대비 상승/하락
  changeRate: number          // 변동률
  changePrice: number         // 변동 금액
  accTradePrice24h: number    // 24시간 누적 거래대금
  accTradeVolume24h: number   // 24시간 누적 거래량
}
