/**
 * Market API Client
 * 업비트 Public API를 직접 호출하여 시세 정보를 가져옵니다.
 */

import type { MarketData, ChangeType } from '@/types'

/**
 * 업비트 마켓 목록 API 응답 타입
 */
interface UpbitMarketInfo {
  market: string
  korean_name: string
  english_name: string
}

/**
 * 업비트 현재가 API 응답 타입
 */
interface UpbitTicker {
  market: string
  trade_date: string
  trade_time: string
  trade_date_kst: string
  trade_time_kst: string
  trade_timestamp: number
  opening_price: number
  high_price: number
  low_price: number
  trade_price: number
  prev_closing_price: number
  change: 'RISE' | 'FALL' | 'EVEN'
  change_price: number
  change_rate: number
  signed_change_price: number
  signed_change_rate: number
  trade_volume: number
  acc_trade_price: number
  acc_trade_price_24h: number
  acc_trade_volume: number
  acc_trade_volume_24h: number
  highest_52_week_price: number
  highest_52_week_date: string
  lowest_52_week_price: number
  lowest_52_week_date: string
  timestamp: number
}

/**
 * 업비트 API Base URL
 */
const UPBIT_API_BASE = 'https://api.upbit.com/v1'

/**
 * 전체 마켓 목록 조회
 * 업비트 Public API 호출
 */
export const getMarketList = async (): Promise<MarketData[]> => {
  try {
    // 1. 마켓 목록 조회 (한글명/영문명)
    const marketInfoResponse = await fetch(`${UPBIT_API_BASE}/market/all?isDetails=true`)
    if (!marketInfoResponse.ok) {
      throw new Error('Failed to fetch market list')
    }
    const marketInfos: UpbitMarketInfo[] = await marketInfoResponse.json()
    
    // KRW 마켓만 필터링
    const krwMarkets = marketInfos.filter(m => m.market.startsWith('KRW-'))
    
    // 2. 현재가 조회
    const markets = krwMarkets.map(m => m.market).join(',')
    const tickerResponse = await fetch(`${UPBIT_API_BASE}/ticker?markets=${markets}`)
    if (!tickerResponse.ok) {
      throw new Error('Failed to fetch ticker data')
    }
    const tickers: UpbitTicker[] = await tickerResponse.json()
    
    // 3. 데이터 병합 및 변환
    const marketDataMap = new Map(
      krwMarkets.map(info => [info.market, {
        market: info.market,
        koreanName: info.korean_name,
        englishName: info.english_name,
      }])
    )
    
    return tickers.map(ticker => {
      const info = marketDataMap.get(ticker.market)
      return {
        market: ticker.market,
        koreanName: info?.koreanName || ticker.market,
        englishName: info?.englishName || ticker.market,
        currentPrice: ticker.trade_price,
        change: ticker.change as ChangeType,
        changeRate: ticker.change_rate * 100, // 0.05 → 5%
        changePrice: ticker.change_price,
        accTradePrice24h: ticker.acc_trade_price_24h,
        accTradeVolume24h: ticker.acc_trade_volume_24h,
      }
    })
  } catch (error) {
    console.error('Failed to fetch market list:', error)
    throw error
  }
}

/**
 * 특정 마켓 시세 조회
 * 업비트 Public API 호출
 */
export const getMarketTicker = async (market: string): Promise<MarketData> => {
  try {
    const response = await fetch(`${UPBIT_API_BASE}/ticker?markets=${market}`)
    if (!response.ok) {
      throw new Error('Failed to fetch ticker data')
    }
    const [ticker]: UpbitTicker[] = await response.json()
    
    return {
      market: ticker.market,
      koreanName: ticker.market.split('-')[1], // 임시
      englishName: ticker.market.split('-')[1], // 임시
      currentPrice: ticker.trade_price,
      change: ticker.change as ChangeType,
      changeRate: ticker.change_rate * 100,
      changePrice: ticker.change_price,
      accTradePrice24h: ticker.acc_trade_price_24h,
      accTradeVolume24h: ticker.acc_trade_volume_24h,
    }
  } catch (error) {
    console.error('Failed to fetch market ticker:', error)
    throw error
  }
}
