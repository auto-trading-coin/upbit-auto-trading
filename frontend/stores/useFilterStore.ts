import { create } from 'zustand'

/**
 * Market 필터 타입
 */
interface MarketFilter {
  searchTerm: string
  sortBy: 'price' | 'volume' | 'change'
  sortOrder: 'asc' | 'desc'
  favoriteOnly: boolean
}

/**
 * Order 필터 타입
 */
interface OrderFilter {
  status: string[]
  dateRange: [Date | null, Date | null]
  side: 'all' | 'bid' | 'ask'
}

/**
 * Filter 상태 타입
 */
interface FilterState {
  market: MarketFilter
  order: OrderFilter
}

/**
 * Filter 액션 타입
 */
interface FilterActions {
  // Market 필터
  setMarketSearch: (term: string) => void
  setMarketSort: (by: MarketFilter['sortBy'], order: MarketFilter['sortOrder']) => void
  toggleFavoriteOnly: () => void
  resetMarketFilter: () => void
  
  // Order 필터
  setOrderFilter: (filter: Partial<OrderFilter>) => void
  resetOrderFilter: () => void
  
  // 전체 리셋
  resetAllFilters: () => void
}

/**
 * 초기 상태
 */
const initialMarketFilter: MarketFilter = {
  searchTerm: '',
  sortBy: 'volume',
  sortOrder: 'desc',
  favoriteOnly: false,
}

const initialOrderFilter: OrderFilter = {
  status: [],
  dateRange: [null, null],
  side: 'all',
}

/**
 * Filter Store
 * 
 * 검색, 정렬, 필터링 등 클라이언트 필터 상태를 관리합니다.
 * 
 * @example
 * ```tsx
 * // Market 필터
 * const { market, setMarketSearch, setMarketSort } = useFilterStore()
 * 
 * <Input 
 *   value={market.searchTerm}
 *   onChange={(e) => setMarketSearch(e.target.value)}
 * />
 * 
 * // 선택적 구독 (리렌더링 최적화)
 * const searchTerm = useFilterStore(state => state.market.searchTerm)
 * const sortBy = useFilterStore(state => state.market.sortBy)
 * ```
 */
export const useFilterStore = create<FilterState & FilterActions>((set) => ({
  // ===== State =====
  market: initialMarketFilter,
  order: initialOrderFilter,
  
  // ===== Market Filter Actions =====
  
  /**
   * Market 검색어 설정
   */
  setMarketSearch: (term) =>
    set((state) => ({
      market: { ...state.market, searchTerm: term },
    })),
  
  /**
   * Market 정렬 기준 및 순서 설정
   */
  setMarketSort: (by, order) =>
    set((state) => ({
      market: { ...state.market, sortBy: by, sortOrder: order },
    })),
  
  /**
   * 즐겨찾기 필터 토글
   */
  toggleFavoriteOnly: () =>
    set((state) => ({
      market: { ...state.market, favoriteOnly: !state.market.favoriteOnly },
    })),
  
  /**
   * Market 필터 초기화
   */
  resetMarketFilter: () =>
    set({ market: initialMarketFilter }),
  
  // ===== Order Filter Actions =====
  
  /**
   * Order 필터 설정 (부분 업데이트 가능)
   */
  setOrderFilter: (filter) =>
    set((state) => ({
      order: { ...state.order, ...filter },
    })),
  
  /**
   * Order 필터 초기화
   */
  resetOrderFilter: () =>
    set({ order: initialOrderFilter }),
  
  // ===== Global Actions =====
  
  /**
   * 모든 필터 초기화
   */
  resetAllFilters: () =>
    set({
      market: initialMarketFilter,
      order: initialOrderFilter,
    }),
}))
