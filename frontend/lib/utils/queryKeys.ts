/**
 * React Query 쿼리 키 관리
 * 
 * 쿼리 키 네이밍 규칙:
 * - all: 해당 도메인의 모든 쿼리
 * - list: 목록 조회
 * - detail: 상세 조회 (ID나 고유값 필요)
 * 
 * 예시:
 * - ['user'] - 모든 사용자 관련 쿼리
 * - ['user', 'me'] - 현재 사용자 정보
 * - ['markets', 'list'] - 마켓 목록
 * - ['markets', 'KRW-BTC'] - 특정 마켓 상세
 */
export const queryKeys = {
  // 사용자 관련
  user: {
    all: ['user'] as const,
    me: () => [...queryKeys.user.all, 'me'] as const,
  },

  // 자동매매 상태
  trading: {
    all: ['trading'] as const,
    status: () => [...queryKeys.trading.all, 'status'] as const,
  },

  // 시세 데이터
  markets: {
    all: ['markets'] as const,
    list: () => [...queryKeys.markets.all, 'list'] as const,
    detail: (market: string) => [...queryKeys.markets.all, market] as const,
  },

  // 포트폴리오
  portfolio: {
    all: ['portfolio'] as const,
    current: () => [...queryKeys.portfolio.all, 'current'] as const,
    history: (period: string) => [...queryKeys.portfolio.all, 'history', period] as const,
  },

  // 주문 내역
  orders: {
    all: ['orders'] as const,
    list: (page: number) => [...queryKeys.orders.all, 'list', page] as const,
    infinite: () => [...queryKeys.orders.all, 'infinite'] as const,
  },

  // 시그널 로그
  signals: {
    all: ['signals'] as const,
    list: (page: number) => [...queryKeys.signals.all, 'list', page] as const,
    byOrder: (orderId: number) => [...queryKeys.signals.all, 'order', orderId] as const,
  },

  // 전략 목록
  strategies: {
    all: ['strategies'] as const,
    list: () => [...queryKeys.strategies.all, 'list'] as const,
    detail: (id: number) => [...queryKeys.strategies.all, id] as const,
  },
} as const
