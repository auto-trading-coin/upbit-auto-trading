'use client'

import { useEffect, useRef, useCallback } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { useWebSocketStore } from '@/stores'
import { queryKeys } from '@/lib/utils/queryKeys'
import type { MarketData, ChangeType } from '@/types'

const WS_URL = 'wss://api.upbit.com/websocket/v1'
const DISCONNECT_DELAY = 3000 // 연결 해제 대기 시간 (3초)

interface UpbitWebSocketTicker {
  type: 'ticker'
  code: string
  trade_price: number
  change: 'RISE' | 'FALL' | 'EVEN'
  change_price: number
  change_rate: number
  acc_trade_price_24h: number
  acc_trade_volume_24h: number
}

interface WebSocketProviderProps {
  children: React.ReactNode
}

/**
 * WebSocket 전역 관리 Provider
 * 
 * 구독자가 있으면 연결, 없으면 연결 해제 (debounce 적용)
 */
export function WebSocketProvider({ children }: WebSocketProviderProps) {
  const wsRef = useRef<WebSocket | null>(null)
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const disconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const retryTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const isConnectingRef = useRef(false)
  const queryClient = useQueryClient()

  const subscriberCount = useWebSocketStore(state => state.subscriberCount)
  const setConnected = useWebSocketStore(state => state.setConnected)
  const setReconnecting = useWebSocketStore(state => state.setReconnecting)
  const setError = useWebSocketStore(state => state.setError)

  // 구독 메시지 전송
  const sendSubscribeMessage = useCallback((ws: WebSocket, codes: string[]) => {
    if (ws.readyState === WebSocket.OPEN && codes.length > 0) {
      const subscribeMessage = [
        { ticket: 'upbit-auto-trading' },
        { type: 'ticker', codes },
      ]
      ws.send(JSON.stringify(subscribeMessage))
    }
  }, [])

  // WebSocket 연결
  const connect = useCallback((codes: string[]) => {
    // 연결 해제 예약 취소
    if (disconnectTimeoutRef.current) {
      clearTimeout(disconnectTimeoutRef.current)
      disconnectTimeoutRef.current = null
    }

    if (isConnectingRef.current) {
      return
    }

    // 이미 연결되어 있으면 구독만 전송
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      sendSubscribeMessage(wsRef.current, codes)
      return
    }

    if (codes.length === 0) {
      return
    }

    isConnectingRef.current = true

    const ws = new WebSocket(WS_URL)
    wsRef.current = ws

    ws.onopen = () => {
      isConnectingRef.current = false
      setConnected(true)
      setReconnecting(false)
      setError(null)
      sendSubscribeMessage(ws, codes)
    }

    ws.onmessage = async (event) => {
      try {
        const blob = event.data as Blob
        const text = await blob.text()
        const data: UpbitWebSocketTicker = JSON.parse(text)

        if (data.type !== 'ticker') return

        // React Query 캐시 업데이트
        queryClient.setQueryData(
          queryKeys.markets.list(),
          (oldData: MarketData[] | undefined) => {
            if (!oldData) return oldData

            return oldData.map(item => {
              if (item.market === data.code) {
                return {
                  ...item,
                  currentPrice: data.trade_price ?? item.currentPrice,
                  change: data.change as ChangeType ?? item.change,
                  changeRate: data.change_rate != null ? data.change_rate * 100 : item.changeRate,
                  changePrice: data.change_price ?? item.changePrice,
                  accTradePrice24h: data.acc_trade_price_24h ?? item.accTradePrice24h,
                  accTradeVolume24h: data.acc_trade_volume_24h ?? item.accTradeVolume24h,
                }
              }
              return item
            })
          }
        )
      } catch (error) {
        console.error('[WebSocket] Parse error:', error)
      }
    }

    ws.onerror = () => {
      isConnectingRef.current = false
      setError('WebSocket 연결 오류')
    }

    ws.onclose = () => {
      isConnectingRef.current = false
      setConnected(false)

      // 구독자가 있으면 재연결
      const currentSubscriberCount = useWebSocketStore.getState().subscriberCount
      if (currentSubscriberCount > 0) {
        setReconnecting(true)
        reconnectTimeoutRef.current = setTimeout(() => {
          const cachedData = queryClient.getQueryData<MarketData[]>(queryKeys.markets.list())
          if (cachedData && cachedData.length > 0) {
            connect(cachedData.map(m => m.market))
          }
        }, 3000)
      }
    }
  }, [queryClient, setConnected, setError, setReconnecting, sendSubscribeMessage])

  // 캐시 데이터로 연결 시도
  const tryConnectWithCache = useCallback(() => {
    const cachedData = queryClient.getQueryData<MarketData[]>(queryKeys.markets.list())
    if (cachedData && cachedData.length > 0) {
      connect(cachedData.map(m => m.market))
      return true
    }
    return false
  }, [queryClient, connect])

  // subscriberCount 변경 감지 → 연결/해제 관리
  useEffect(() => {
    // 이전 retry 타이머 정리
    if (retryTimeoutRef.current) {
      clearTimeout(retryTimeoutRef.current)
      retryTimeoutRef.current = null
    }

    if (subscriberCount > 0) {
      // 연결 해제 예약 취소
      if (disconnectTimeoutRef.current) {
        clearTimeout(disconnectTimeoutRef.current)
        disconnectTimeoutRef.current = null
      }

      // 구독자가 있으면 연결 시도
      if (!tryConnectWithCache()) {
        // 캐시에 데이터가 없으면 500ms 후 재시도
        retryTimeoutRef.current = setTimeout(() => {
          tryConnectWithCache()
        }, 500)
      }
    } else {
      // 구독자가 0이면 일정 시간 후 연결 해제 (debounce)
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current)
        reconnectTimeoutRef.current = null
      }

      // 이미 예약되어 있으면 무시
      if (!disconnectTimeoutRef.current) {
        disconnectTimeoutRef.current = setTimeout(() => {
          // 다시 확인: 아직도 구독자가 0인지
          const currentCount = useWebSocketStore.getState().subscriberCount
          if (currentCount === 0 && wsRef.current?.readyState === WebSocket.OPEN) {
            wsRef.current.close()
          }
          disconnectTimeoutRef.current = null
        }, DISCONNECT_DELAY)
      }
    }
  }, [subscriberCount, tryConnectWithCache])

  // Cleanup
  useEffect(() => {
    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current)
      }
      if (disconnectTimeoutRef.current) {
        clearTimeout(disconnectTimeoutRef.current)
      }
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current)
      }
      if (wsRef.current?.readyState === WebSocket.OPEN) {
        wsRef.current.close()
      }
    }
  }, [])

  return <>{children}</>
}
