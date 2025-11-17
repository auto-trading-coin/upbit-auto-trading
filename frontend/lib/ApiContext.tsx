"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import { useAuth } from "@/components/AuthProvider"
import { useToast } from "@/components/ui/use-toast"
import { 
  registerUpbitKey as registerUpbitKeyApi, 
  deleteUpbitKey as deleteUpbitKeyApi,
  updateTradeActive as updateTradeActiveApi
} from "@/app/api/member"
import { getAllStrategies, updateStrategy as updateStrategyApi } from "@/app/api/strategy"
import type { 
  Strategy, 
  Position, 
  TradingSettings, 
  ApiKeyState 
} from "@/types"

// Context 타입 정의
interface TradingStatus {
  isRunning: boolean
  strategy: Strategy | null
  lastSignal: string | null
  hasError: boolean
  dailyProfit: number | null
  totalAsset: number | null
  positions: Position[]
  settings: TradingSettings
}

interface ApiContextType {
  apiKeyState: ApiKeyState
  tradingStatus: TradingStatus
  isLoading: boolean
  registerUpbitKey: (accessKey: string, secretKey: string) => Promise<boolean>
  deleteUpbitKey: () => Promise<boolean>
  toggleTrading: () => Promise<boolean>
  updateStrategy: (strategyId: number) => Promise<boolean>
  emergencyStop: () => Promise<boolean>
  refreshData: () => Promise<void>
  updateTradingSettings: (settings: TradingSettings) => Promise<boolean>
}

// 기본값
const defaultApiContext: ApiContextType = {
  apiKeyState: {
    hasApiKey: false,
    accessKey: "",
    secretKey: "",
  },
  tradingStatus: {
    isRunning: false,
    strategy: null,
    lastSignal: null,
    hasError: false,
    dailyProfit: null,
    totalAsset: null,
    positions: [],
    settings: {
      stopLossEnabled: true,
      stopLossLimit: 5,
    },
  },
  isLoading: true,
  registerUpbitKey: async () => false,
  deleteUpbitKey: async () => false,
  toggleTrading: async () => false,
  updateStrategy: async () => false,
  emergencyStop: async () => false,
  refreshData: async () => {},
  updateTradingSettings: async () => false,
}

// Context 생성
const ApiContext = createContext<ApiContextType>(defaultApiContext)

// Context Hook
export const useApi = () => useContext(ApiContext)

interface ApiProviderProps {
  children: React.ReactNode
}

export function ApiProvider({ children }: ApiProviderProps) {
  const { user, isAuthenticated, refreshUser } = useAuth()
  const { toast } = useToast()
  
  const [apiKeyState, setApiKeyState] = useState<ApiKeyState>({
    hasApiKey: false,
    accessKey: "",
    secretKey: "",
  })
  
  const [tradingStatus, setTradingStatus] = useState<TradingStatus>({
    isRunning: false,
    strategy: null,
    lastSignal: null,
    hasError: false,
    dailyProfit: null,
    totalAsset: null,
    positions: [],
    settings: {
      stopLossEnabled: true,
      stopLossLimit: 5,
    },
  })
  
  const [isLoading, setIsLoading] = useState(true)
  const [allStrategies, setAllStrategies] = useState<Strategy[]>([])

  // 사용자 정보 기반 API 키 상태 업데이트
  useEffect(() => {
    if (user) {
      setApiKeyState({
        hasApiKey: user.apiKeyRegistered,
        accessKey: "",
        secretKey: "",
      })
      
      // tradeActive 상태도 반영
      setTradingStatus(prev => ({
        ...prev,
        isRunning: user.tradeActive,
      }))
    } else {
      setApiKeyState({
        hasApiKey: false,
        accessKey: "",
        secretKey: "",
      })
      
      setTradingStatus({
        isRunning: false,
        strategy: null,
        lastSignal: null,
        hasError: false,
        dailyProfit: null,
        totalAsset: null,
        positions: [],
        settings: {
          stopLossEnabled: true,
          stopLossLimit: 5,
        },
      })
    }
  }, [user])

  // 초기 데이터 로드
  useEffect(() => {
    if (isAuthenticated && user?.apiKeyRegistered) {
      loadInitialData()
    } else {
      setIsLoading(false)
    }
  }, [isAuthenticated, user?.apiKeyRegistered])

  // 초기 데이터 로드 (전략 목록 등)
  const loadInitialData = async () => {
    setIsLoading(true)
    try {
      // 전략 목록 조회
      const strategies = await getAllStrategies()
      setAllStrategies(strategies)
      
      // 현재 선택된 전략이 있다면 찾아서 설정 (추후 백엔드 API 추가 시)
      // const currentStrategy = strategies.find(s => s.id === user.strategyId)
      // if (currentStrategy) {
      //   setTradingStatus(prev => ({ ...prev, strategy: currentStrategy }))
      // }
      
      // TODO: 자산 현황, 포지션 등 추가 데이터 로드 (백엔드 구현 후)
      
    } catch (error) {
      console.error("Failed to load initial data:", error)
    } finally {
      setIsLoading(false)
    }
  }

  /**
   * 업비트 API 키 등록
   */
  const registerUpbitKey = async (accessKey: string, secretKey: string): Promise<boolean> => {
    try {
      await registerUpbitKeyApi(accessKey, secretKey)
      
      toast({
        title: "API 키가 등록되었습니다",
        description: "업비트 API 키가 성공적으로 등록되었습니다.",
      })
      
      // 사용자 정보 갱신
      await refreshUser()
      
      return true
    } catch (error: any) {
      console.error("Failed to register API key:", error)
      
      // 백엔드 에러 메시지 확인
      const errorMessage = error.response?.data?.message || error.message
      
      if (errorMessage?.includes('Invalid') || errorMessage?.includes('유효하지 않은')) {
        toast({
          variant: "destructive",
          title: "유효하지 않은 API 키입니다",
          description: "입력하신 API 키가 유효하지 않습니다. 다시 확인해주세요.",
        })
      } else if (errorMessage?.includes('duplicate') || errorMessage?.includes('중복')) {
        toast({
          variant: "destructive",
          title: "이미 등록된 API 키입니다",
          description: "해당 API 키는 이미 등록되어 있습니다.",
        })
      } else {
        toast({
          variant: "destructive",
          title: "API 키 등록 실패",
          description: "API 키 등록 중 오류가 발생했습니다. 다시 시도해주세요.",
        })
      }
      
      return false
    }
  }

  /**
   * 업비트 API 키 삭제
   */
  const deleteUpbitKey = async (): Promise<boolean> => {
    // 자동매매 실행 중 체크
    if (tradingStatus.isRunning) {
      toast({
        variant: "destructive",
        title: "자동매매 실행 중에는 API 키를 삭제할 수 없습니다",
        description: "자동매매를 먼저 중지해주세요.",
      })
      return false
    }

    try {
      await deleteUpbitKeyApi()
      
      toast({
        title: "API 키가 삭제되었습니다",
        description: "업비트 API 키가 성공적으로 삭제되었습니다.",
      })
      
      // 사용자 정보 갱신
      await refreshUser()
      
      // 전략 정보도 초기화
      setTradingStatus(prev => ({
        ...prev,
        strategy: null,
      }))
      
      return true
    } catch (error: any) {
      console.error("Failed to delete API key:", error)
      
      const errorMessage = error.response?.data?.message || error.message
      
      if (errorMessage?.includes('trade') || errorMessage?.includes('자동매매')) {
        toast({
          variant: "destructive",
          title: "자동매매 실행 중에는 API 키를 삭제할 수 없습니다",
          description: "자동매매를 먼저 중지해주세요.",
        })
      } else {
        toast({
          variant: "destructive",
          title: "API 키 삭제 실패",
          description: "API 키 삭제 중 오류가 발생했습니다. 다시 시도해주세요.",
        })
      }
      
      return false
    }
  }

  /**
   * 자동매매 상태 토글
   */
  const toggleTrading = async (): Promise<boolean> => {
    if (!user?.apiKeyRegistered) {
      toast({
        variant: "destructive",
        title: "API 키가 등록되지 않았습니다",
        description: "자동매매를 실행하기 위해 API 키를 먼저 등록해주세요.",
      })
      return false
    }

    if (!tradingStatus.strategy && !user?.strategyRegistered) {
      toast({
        variant: "destructive",
        title: "전략이 선택되지 않았습니다",
        description: "자동매매를 실행하기 위해 전략을 먼저 선택해주세요.",
      })
      return false
    }

    try {
      const newTradeActive = !tradingStatus.isRunning
      await updateTradeActiveApi(newTradeActive)
      
      setTradingStatus(prev => ({
        ...prev,
        isRunning: newTradeActive,
      }))
      
      toast({
        title: `자동매매가 ${newTradeActive ? "시작" : "중지"}되었습니다`,
        duration: 3000,
      })
      
      // 사용자 정보 갱신
      await refreshUser()
      
      return true
    } catch (error) {
      console.error("Failed to toggle trading:", error)
      toast({
        variant: "destructive",
        title: "오류가 발생했습니다",
        description: "자동매매 상태 변경 중 오류가 발생했습니다. 다시 시도해주세요.",
      })
      return false
    }
  }

  /**
   * 전략 변경
   */
  const updateStrategy = async (strategyId: number): Promise<boolean> => {
    if (!user?.apiKeyRegistered) {
      toast({
        variant: "destructive",
        title: "API 키가 등록되지 않았습니다",
        description: "전략을 설정하기 위해 API 키를 먼저 등록해주세요.",
      })
      return false
    }

    try {
      await updateStrategyApi(strategyId)
      
      // 전략 목록에서 선택된 전략 찾기
      const selectedStrategy = allStrategies.find(s => s.id === strategyId)
      
      if (selectedStrategy) {
        setTradingStatus(prev => ({
          ...prev,
          strategy: selectedStrategy,
        }))
      }
      
      toast({
        title: "전략이 변경되었습니다",
        description: selectedStrategy ? `${selectedStrategy.name} 전략이 설정되었습니다.` : "전략이 변경되었습니다.",
      })
      
      // 사용자 정보 갱신
      await refreshUser()
      
      return true
    } catch (error) {
      console.error("Failed to update strategy:", error)
      toast({
        variant: "destructive",
        title: "전략 변경 실패",
        description: "전략 변경 중 오류가 발생했습니다. 다시 시도해주세요.",
      })
      return false
    }
  }

  /**
   * 긴급 정지
   */
  const emergencyStop = async (): Promise<boolean> => {
    if (!tradingStatus.isRunning) {
      return false
    }

    try {
      await updateTradeActiveApi(false)
      
      setTradingStatus(prev => ({
        ...prev,
        isRunning: false,
      }))
      
      toast({
        title: "자동매매가 긴급 중지되었습니다",
        duration: 3000,
      })
      
      await refreshUser()
      
      return true
    } catch (error) {
      console.error("Failed to emergency stop:", error)
      toast({
        variant: "destructive",
        title: "긴급 정지 실패",
        description: "긴급 정지 중 오류가 발생했습니다. 다시 시도해주세요.",
      })
      return false
    }
  }

  /**
   * 트레이딩 설정 업데이트
   */
  const updateTradingSettings = async (settings: TradingSettings): Promise<boolean> => {
    if (!user?.apiKeyRegistered) {
      toast({
        variant: "destructive",
        title: "API 키가 등록되지 않았습니다",
        description: "설정을 변경하기 위해 API 키를 먼저 등록해주세요.",
      })
      return false
    }

    try {
      // TODO: 백엔드 API 구현 후 실제 호출로 변경
      await new Promise(resolve => setTimeout(resolve, 500))
      
      setTradingStatus(prev => ({
        ...prev,
        settings,
      }))
      
      toast({
        title: "설정이 저장되었습니다",
        description: "트레이딩 설정이 성공적으로 저장되었습니다.",
      })
      
      return true
    } catch (error) {
      console.error("Failed to update trading settings:", error)
      toast({
        variant: "destructive",
        title: "설정 저장 실패",
        description: "설정 저장 중 오류가 발생했습니다. 다시 시도해주세요.",
      })
      return false
    }
  }

  /**
   * 데이터 새로고침
   */
  const refreshData = async (): Promise<void> => {
    if (isAuthenticated && user?.apiKeyRegistered) {
      await loadInitialData()
    }
  }

  return (
    <ApiContext.Provider
      value={{
        apiKeyState,
        tradingStatus,
        isLoading,
        registerUpbitKey,
        deleteUpbitKey,
        toggleTrading,
        updateStrategy,
        emergencyStop,
        refreshData,
        updateTradingSettings,
      }}
    >
      {children}
    </ApiContext.Provider>
  )
}
