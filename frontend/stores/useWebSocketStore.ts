import { create } from 'zustand'

/**
 * WebSocket 상태 타입
 */
interface WebSocketState {
  connected: boolean
  reconnecting: boolean
  subscriptions: Set<string>
  subscriberCount: number  // 구독자 수 (useMarkets 사용 중인 컴포넌트 수)
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
  incrementSubscribers: () => void
  decrementSubscribers: () => void
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
  subscriberCount: 0,
  error: null,
}

/**
 * WebSocket Store
 * 
 * WebSocket 연결 상태 및 구독 관리를 위한 클라이언트 상태 저장소입니다.
 */
export const useWebSocketStore = create<WebSocketState & WebSocketActions>((set, get) => ({
  ...initialState,
  
  setConnected: (connected) => 
    set({ connected, error: connected ? null : null }),
  
  setReconnecting: (reconnecting) => 
    set({ reconnecting }),
  
  addSubscription: (market) =>
    set((state) => {
      const newSubscriptions = new Set(state.subscriptions)
      newSubscriptions.add(market)
      return { subscriptions: newSubscriptions }
    }),
  
  removeSubscription: (market) =>
    set((state) => {
      const newSubscriptions = new Set(state.subscriptions)
      newSubscriptions.delete(market)
      return { subscriptions: newSubscriptions }
    }),
  
  clearSubscriptions: () =>
    set({ subscriptions: new Set() }),
  
  /**
   * 구독자 수 증가 (useMarkets 마운트 시)
   */
  incrementSubscribers: () =>
    set((state) => ({ subscriberCount: state.subscriberCount + 1 })),
  
  /**
   * 구독자 수 감소 (useMarkets 언마운트 시)
   * 구독자가 0이 되면 구독 해제
   */
  decrementSubscribers: () =>
    set((state) => {
      const newCount = state.subscriberCount - 1
      if (newCount <= 0) {
        return { 
          subscriberCount: 0, 
          subscriptions: new Set() 
        }
      }
      return { subscriberCount: newCount }
    }),
  
  setError: (error) => 
    set({ error }),
  
  reset: () =>
    set(initialState),
}))
