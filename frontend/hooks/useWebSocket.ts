import { useEffect, useRef } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { useWebSocketStore } from '@/stores'
import { queryKeys } from '@/lib/utils/queryKeys'
import type { MarketData, ChangeType } from '@/types'

/**
 * 업비트 WebSocket 엔드포인트
 */
const WS_URL = 'wss://api.upbit.com/websocket/v1'

/**
 * 업비트 WebSocket 응답 타입 (ticker)
 */
interface UpbitWebSocketTicker {
  type: 'ticker'
  code: string // 마켓 코드 (KRW-BTC)
  opening_price: number
  high_price: number
  low_price: number
  trade_price: number
  prev_closing_price: number
  change: 'RISE' | 'FALL' | 'EVEN'
  change_price: number
  signed_change_price: number
  change_rate: number
  signed_change_rate: number
  trade_volume: number
  acc_trade_volume: number
  acc_trade_volume_24h: number
  acc_trade_price: number
  acc_trade_price_24h: number
  trade_date: string
  trade_time: string
  trade_timestamp: number
  ask_bid: string
  acc_ask_volume: number
  acc_bid_volume: number
  highest_52_week_price: number
  highest_52_week_date: string
  lowest_52_week_price: number
  lowest_52_week_date: string
  trade_status: string
  market_state: string
  market_state_for_ios: null | string
  is_trading_suspended: boolean
  delisting_date: null | string
  market_warning: string
  timestamp: number
  stream_type: string
}

/**
 * 업비트 WebSocket Hook
 * 
 * 실시간 시세 데이터를 수신하고 React Query 캐시를 자동으로 업데이트합니다.
 * 
 * @example
 * ```tsx
 * function MarketList() {
 *   useWebSocket() // WebSocket 연결 활성화
 *   
 *   const { data: markets } = useMarkets() // 자동으로 실시간 업데이트됨
 *   
 *   return <div>...</div>
 * }
 * ```
 */
export const useWebSocket = () => {
  const wsRef = useRef<WebSocket | null>(null)
  const queryClient = useQueryClient()
  
  const {
    subscriptions,
    setConnected,
    setReconnecting,
    setError,
  } = useWebSocketStore()
  
  useEffect(() => {
    // 구독할 마켓이 없으면 연결하지 않음
    if (subscriptions.size === 0) {
      return
    }
    
    // WebSocket 연결
    const ws = new WebSocket(WS_URL)
    wsRef.current = ws
    
    ws.onopen = () => {
      console.log('[WebSocket] Connected')
      setConnected(true)
      setError(null)
      
      // 구독 메시지 전송
      const subscribeMessage = [
        { ticket: 'upbit-auto-trading' },
        {
          type: 'ticker',
          codes: Array.from(subscriptions),
        },
      ]
      
      ws.send(JSON.stringify(subscribeMessage))
      console.log('[WebSocket] Subscribed:', Array.from(subscriptions))
    }
    
    ws.onmessage = async (event) => {
      try {
        // 업비트는 ArrayBuffer로 응답을 보냄
        const blob = event.data as Blob
        const text = await blob.text()
        const data: UpbitWebSocketTicker = JSON.parse(text)
        
        if (data.type !== 'ticker') return
        
        // MarketData 형식으로 변환
        const marketData: MarketData = {
          market: data.code,
          koreanName: data.code.split('-')[1], // WebSocket에는 한글명이 없으므로 임시
          englishName: data.code.split('-')[1],
          currentPrice: data.trade_price,
          change: data.change as ChangeType,
          changeRate: data.change_rate * 100,
          changePrice: data.change_price,
          accTradePrice24h: data.acc_trade_price_24h,
          accTradeVolume24h: data.acc_trade_volume_24h,
        }
        
        // React Query 캐시 직접 업데이트
        // 1. 개별 마켓 캐시 업데이트
        queryClient.setQueryData(
          queryKeys.markets.detail(data.code),
          marketData
        )
        
        // 2. 마켓 목록 캐시 업데이트
        queryClient.setQueryData(
          queryKeys.markets.list(),
          (oldData: MarketData[] | undefined) => {
            if (!oldData) return oldData
            
            return oldData.map(item =>
              item.market === data.code ? marketData : item
            )
          }
        )
      } catch (error) {
        console.error('[WebSocket] Parse error:', error)
      }
    }
    
    ws.onerror = (event) => {
      console.error('[WebSocket] Error:', event)
      setError('WebSocket 연결 오류')
    }
    
    ws.onclose = () => {
      console.log('[WebSocket] Closed')
      setConnected(false)
      
      // 3초 후 재연결 시도
      setTimeout(() => {
        console.log('[WebSocket] Reconnecting...')
        setReconnecting(true)
        // useEffect가 다시 실행되어 재연결됨
      }, 3000)
    }
    
    // Cleanup
    return () => {
      if (ws.readyState === WebSocket.OPEN) {
        console.log('[WebSocket] Closing connection')
        ws.close()
      }
      setConnected(false)
      setReconnecting(false)
    }
  }, [subscriptions, queryClient, setConnected, setError, setReconnecting])
  
  return {
    send: (data: any) => {
      if (wsRef.current?.readyState === WebSocket.OPEN) {
        wsRef.current.send(JSON.stringify(data))
      }
    },
  }
}
