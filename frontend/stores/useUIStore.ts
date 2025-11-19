import { create } from 'zustand'
import { persist } from 'zustand/middleware'

/**
 * UI 상태 타입 정의
 */
interface UIState {
  theme: 'light' | 'dark'
  sidebarOpen: boolean
  modals: {
    loginOpen: boolean
    strategyDetailOpen: boolean
    apiKeyFormOpen: boolean
  }
}

/**
 * UI 액션 타입 정의
 */
interface UIActions {
  toggleTheme: () => void
  setTheme: (theme: 'light' | 'dark') => void
  toggleSidebar: () => void
  setSidebarOpen: (open: boolean) => void
  openModal: (modalName: keyof UIState['modals']) => void
  closeModal: (modalName: keyof UIState['modals']) => void
  closeAllModals: () => void
}

/**
 * UI Store
 * 
 * 테마, 사이드바, 모달 등 UI 관련 클라이언트 상태를 관리합니다.
 * 
 * @example
 * ```tsx
 * // 테마 토글
 * const { theme, toggleTheme } = useUIStore()
 * 
 * // 모달 열기/닫기
 * const { openModal, closeModal } = useUIStore()
 * openModal('loginOpen')
 * 
 * // 선택적 구독 (성능 최적화)
 * const theme = useUIStore(state => state.theme)
 * const sidebarOpen = useUIStore(state => state.sidebarOpen)
 * ```
 */
export const useUIStore = create<UIState & UIActions>()(
  persist(
    (set) => ({
      // ===== State =====
      theme: 'light',
      sidebarOpen: true,
      modals: {
        loginOpen: false,
        strategyDetailOpen: false,
        apiKeyFormOpen: false,
      },
      
      // ===== Actions =====
      
      /**
       * 테마 토글 (light ↔ dark)
       */
      toggleTheme: () =>
        set((state) => ({
          theme: state.theme === 'light' ? 'dark' : 'light',
        })),
      
      /**
       * 테마 직접 설정
       */
      setTheme: (theme) => set({ theme }),
      
      /**
       * 사이드바 토글
       */
      toggleSidebar: () =>
        set((state) => ({
          sidebarOpen: !state.sidebarOpen,
        })),
      
      /**
       * 사이드바 열기/닫기 직접 설정
       */
      setSidebarOpen: (open) => set({ sidebarOpen: open }),
      
      /**
       * 특정 모달 열기
       */
      openModal: (modalName) =>
        set((state) => ({
          modals: { ...state.modals, [modalName]: true },
        })),
      
      /**
       * 특정 모달 닫기
       */
      closeModal: (modalName) =>
        set((state) => ({
          modals: { ...state.modals, [modalName]: false },
        })),
      
      /**
       * 모든 모달 닫기
       */
      closeAllModals: () =>
        set({
          modals: {
            loginOpen: false,
            strategyDetailOpen: false,
            apiKeyFormOpen: false,
          },
        }),
    }),
    {
      name: 'ui-storage', // localStorage key
      partialize: (state) => ({ 
        theme: state.theme, // 테마만 localStorage에 저장
      }),
    }
  )
)
