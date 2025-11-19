import { create } from 'zustand'

/**
 * WebSocket 상태 타입
 */
interface WebSocketState {
  connected: boolean
  reconnecting: boolean
  subscriptions: Set<string>
  error: string | null
}

/**
 * WebSocket 액션 타입
 */
interface WebSocketActions {
  setConnected: (connected: boolean) => void
  setReconnecting: (reconnecting: boolean) => void
  addSubscription: (market: string) => void
  removeSubscription: (market: string) => void
  clearSubscriptions: () => void
  setError: (error: string | null) => void
  reset: () => void
}

/**
 * 초기 상태
 */
const initialState: WebSocketState = {
  connected: false,
  reconnecting: false,
  subscriptions: new Set(),
  error: null,
}

/**
 * WebSocket Store
 * 
 * WebSocket 연결 상태 및 구독 관리를 위한 클라이언트 상태 저장소입니다.
 * 
 * @example
 * ```tsx
 * // 연결 상태 확인
 * const { connected, reconnecting } = useWebSocketStore()
 * 
 * // 구독 추가/제거
 * const { addSubscription, removeSubscription } = useWebSocketStore()
 * addSubscription('KRW-BTC')
 * removeSubscription('KRW-BTC')
 * 
 * // 선택적 구독 (리렌더링 최적화)
 * const connected = useWebSocketStore(state => state.connected)
 * const error = useWebSocketStore(state => state.error)
 * ```
 */
export const useWebSocketStore = create<WebSocketState & WebSocketActions>((set) => ({
  // ===== State =====
  ...initialState,
  
  // ===== Actions =====
  
  /**
   * WebSocket 연결 상태 설정
   */
  setConnected: (connected) => 
    set({ connected, error: connected ? null : null }),
  
  /**
   * WebSocket 재연결 상태 설정
   */
  setReconnecting: (reconnecting) => 
    set({ reconnecting }),
  
  /**
   * 특정 마켓 구독 추가
   */
  addSubscription: (market) =>
    set((state) => {
      const newSubscriptions = new Set(state.subscriptions)
      newSubscriptions.add(market)
      return { subscriptions: newSubscriptions }
    }),
  
  /**
   * 특정 마켓 구독 제거
   */
  removeSubscription: (market) =>
    set((state) => {
      const newSubscriptions = new Set(state.subscriptions)
      newSubscriptions.delete(market)
      return { subscriptions: newSubscriptions }
    }),
  
  /**
   * 모든 구독 제거
   */
  clearSubscriptions: () =>
    set({ subscriptions: new Set() }),
  
  /**
   * 에러 메시지 설정
   */
  setError: (error) => 
    set({ error }),
  
  /**
   * 전체 상태 초기화
   */
  reset: () =>
    set({
      connected: false,
      reconnecting: false,
      subscriptions: new Set(),
      error: null,
    }),
}))
