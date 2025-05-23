"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import { useAuth } from "@/components/auth-provider"
import { useToast } from "@/components/ui/use-toast"

// 타입 정의
interface ApiKeyState {
  hasApiKey: boolean
  accessKey: string
  secretKey: string
}

interface TradingSettings {
  stopLossEnabled: boolean
  stopLossLimit: number
}

interface Position {
  market: string
  amount: number
  avgPrice: number
  currentPrice: number
}

interface Strategy {
  id: string
  name: string
  description: string
  details: string
  indicators: string[]
  type: string
}

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
  setApiKeys: (accessKey: string, secretKey: string) => void
  clearApiKeys: () => void
  toggleTrading: () => Promise<boolean>
  setStrategy: (strategyId: string) => Promise<boolean>
  emergencyStop: () => Promise<boolean>
  refreshData: () => Promise<void>
  updateTradingSettings: (settings: TradingSettings) => Promise<boolean>
}

// 기본값 생성
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
  setApiKeys: () => {},
  clearApiKeys: () => {},
  toggleTrading: async () => false,
  setStrategy: async () => false,
  emergencyStop: async () => false,
  refreshData: async () => {},
  updateTradingSettings: async () => false,
}

// 컨텍스트 생성
const ApiContext = createContext<ApiContextType>(defaultApiContext)

// 컨텍스트 훅
export const useApi = () => useContext(ApiContext)

interface ApiProviderProps {
  children: React.ReactNode
}

export function ApiProvider({ children }: ApiProviderProps) {
  const { isAuthenticated } = useAuth()
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
  const [socket, setSocket] = useState<WebSocket | null>(null)

  // 로컬 스토리지에서 API 키 가져오기
  useEffect(() => {
    const storedAccessKey = localStorage.getItem("upbit_access_key")
    const storedSecretKey = localStorage.getItem("upbit_secret_key")

    if (storedAccessKey && storedSecretKey) {
      setApiKeyState({
        hasApiKey: true,
        accessKey: storedAccessKey,
        secretKey: storedSecretKey,
      })
    }
  }, [])

  // 초기 데이터 로드
  useEffect(() => {
    if (isAuthenticated) {
      loadApiKeyState()
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
      setIsLoading(false)
    }
  }, [isAuthenticated])

  // API 키 상태에 따라 트레이딩 상태 로드
  useEffect(() => {
    if (isAuthenticated && apiKeyState.hasApiKey) {
      loadTradingStatus()
      setupWebSocket()
    } else {
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
      if (socket) {
        socket.close()
        setSocket(null)
      }
    }
  }, [isAuthenticated, apiKeyState.hasApiKey])

  // 컴포넌트 언마운트 시 웹소켓 연결 종료
  useEffect(() => {
    return () => {
      if (socket) {
        socket.close()
      }
    }
  }, [socket])

  // API 키 상태 로드
  const loadApiKeyState = async () => {
    setIsLoading(true)
    try {
      // 실제 구현에서는 백엔드 API 호출
      // 여기서는 로컬 스토리지에서 가져오는 것으로 시뮬레이션
      const storedAccessKey = localStorage.getItem("upbit_access_key")
      const storedSecretKey = localStorage.getItem("upbit_secret_key")

      if (storedAccessKey && storedSecretKey) {
        setApiKeyState({
          hasApiKey: true,
          accessKey: storedAccessKey,
          secretKey: storedSecretKey,
        })
      } else {
        setApiKeyState({
          hasApiKey: false,
          accessKey: "",
          secretKey: "",
        })
      }
    } catch (error) {
      console.error("Failed to load API key state:", error)
      setApiKeyState({
        hasApiKey: false,
        accessKey: "",
        secretKey: "",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // 트레이딩 상태 로드
  const loadTradingStatus = async () => {
    try {
      // 실제 구현에서는 백엔드 API 호출
      // 여기서는 더미 데이터로 시뮬레이션

      // 로컬 스토리지에서 전략 정보 가져오기
      const storedStrategy = localStorage.getItem("selected_strategy")
      const currentStrategy = storedStrategy ? JSON.parse(storedStrategy) : null

      // 로컬 스토리지에서 트레이딩 설정 가져오기
      const storedSettings = localStorage.getItem("trading_settings")
      const currentSettings = storedSettings
        ? JSON.parse(storedSettings)
        : {
            stopLossEnabled: true,
            stopLossLimit: 5,
          }

      setTradingStatus({
        isRunning: false, // 초기값은 항상 false
        strategy: currentStrategy,
        lastSignal: "2023-06-15T09:30:00Z",
        hasError: false,
        dailyProfit: 2.5,
        totalAsset: 1250000,
        positions: [
          { market: "BTC-KRW", amount: 0.01, avgPrice: 45000000, currentPrice: 46000000 },
          { market: "ETH-KRW", amount: 0.5, avgPrice: 3000000, currentPrice: 3100000 },
        ],
        settings: currentSettings,
      })
    } catch (error) {
      console.error("Failed to load trading status:", error)
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
  }

  // 웹소켓 설정
  const setupWebSocket = () => {
    if (!apiKeyState.hasApiKey) return

    // 실제 구현에서는 실제 웹소켓 서버 URL 사용
    // 여기서는 더미 데이터로 시뮬레이션
    const dummySocket = {
      close: () => {},
    } as WebSocket

    // 실시간 데이터 업데이트 시뮬레이션
    const interval = setInterval(() => {
      if (apiKeyState.hasApiKey) {
        setTradingStatus((prev) => ({
          ...prev,
          lastSignal: new Date().toISOString(),
          dailyProfit: +(Math.random() * 5 - 2.5).toFixed(2),
          totalAsset: prev.totalAsset ? prev.totalAsset + Math.floor(Math.random() * 10000 - 5000) : 1250000,
          positions: prev.positions.map((pos) => ({
            ...pos,
            currentPrice: pos.currentPrice * (1 + (Math.random() * 0.02 - 0.01)),
          })),
        }))
      }
    }, 5000)

    // 컴포넌트 언마운트 시 인터벌 정리
    return () => clearInterval(interval)
  }

  // API 키 설정
  const setApiKeys = (accessKey: string, secretKey: string) => {
    localStorage.setItem("upbit_access_key", accessKey)
    localStorage.setItem("upbit_secret_key", secretKey)
    setApiKeyState({
      hasApiKey: true,
      accessKey,
      secretKey,
    })
  }

  // API 키 제거
  const clearApiKeys = () => {
    localStorage.removeItem("upbit_access_key")
    localStorage.removeItem("upbit_secret_key")
    setApiKeyState({
      hasApiKey: false,
      accessKey: "",
      secretKey: "",
    })
  }

  // 자동매매 토글
  const toggleTrading = async (): Promise<boolean> => {
    if (!apiKeyState.hasApiKey) {
      toast({
        variant: "destructive",
        title: "API 키가 등록되지 않았습니다",
        description: "자동매매를 실행하기 위해 API 키를 등록해주세요.",
      })
      return false
    }

    if (!tradingStatus.strategy) {
      toast({
        variant: "destructive",
        title: "전략이 선택되지 않았습니다",
        description: "자동매매를 실행하기 위해 전략을 선택해주세요.",
      })
      return false
    }

    try {
      // 실제 구현에서는 백엔드 API 호출
      await new Promise((resolve) => setTimeout(resolve, 500))

      setTradingStatus((prev) => ({
        ...prev,
        isRunning: !prev.isRunning,
      }))

      toast({
        title: `자동매매가 ${!tradingStatus.isRunning ? "시작" : "중지"}되었습니다.`,
        duration: 3000,
      })

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

  // 전략 설정
  const setStrategy = async (strategyId: string): Promise<boolean> => {
    if (!apiKeyState.hasApiKey) {
      toast({
        variant: "destructive",
        title: "API 키가 등록되지 않았습니다",
        description: "전략을 설정하기 위해 API 키를 등록해주세요.",
      })
      return false
    }

    try {
      // 실제 구현에서는 백엔드 API 호출
      await new Promise((resolve) => setTimeout(resolve, 500))

      // 더미 전략 데이터
      const strategies = [
        {
          id: "rsi-oversold",
          name: "RSI 과매도 전략",
          description: "RSI 지표가 30 이하로 과매도 상태일 때 매수하는 전략",
          details: "RSI < 30 && EMA 20 > EMA 60",
          indicators: ["RSI", "EMA"],
          type: "trend-reversal",
        },
        {
          id: "macd-crossover",
          name: "MACD 크로스오버 전략",
          description: "MACD 선이 시그널 선을 상향 돌파할 때 매수하는 전략",
          details: "MACD Line crosses above Signal Line",
          indicators: ["MACD", "Signal Line"],
          type: "trend-following",
        },
        {
          id: "bollinger-bounce",
          name: "볼린저 밴드 반등 전략",
          description: "가격이 볼린저 밴드 하단에 닿았다가 반등할 때 매수하는 전략",
          details: "Price touches lower Bollinger Band && RSI < 40",
          indicators: ["Bollinger Bands", "RSI"],
          type: "mean-reversion",
        },
        {
          id: "triple-ema",
          name: "삼중 EMA 전략",
          description: "단기, 중기, 장기 EMA가 모두 상승 추세일 때 매수하는 전략",
          details: "EMA 5 > EMA 10 > EMA 20 && All EMAs trending upward",
          indicators: ["EMA"],
          type: "trend-following",
        },
      ]

      const selectedStrategy = strategies.find((s) => s.id === strategyId)

      if (selectedStrategy) {
        // 로컬 스토리지에 선택된 전략 저장
        localStorage.setItem("selected_strategy", JSON.stringify(selectedStrategy))

        setTradingStatus((prev) => ({
          ...prev,
          strategy: selectedStrategy,
        }))

        toast({
          title: "전략이 설정되었습니다",
          description: `${selectedStrategy.name} 전략이 성공적으로 설정되었습니다.`,
        })

        return true
      } else {
        throw new Error("Invalid strategy ID")
      }
    } catch (error) {
      console.error("Failed to set strategy:", error)
      toast({
        variant: "destructive",
        title: "전략 설정 실패",
        description: "전략 설정 중 오류가 발생했습니다. 다시 시도해주세요.",
      })
      return false
    }
  }

  // 트레이딩 설정 업데이트
  const updateTradingSettings = async (settings: TradingSettings): Promise<boolean> => {
    if (!apiKeyState.hasApiKey) {
      toast({
        variant: "destructive",
        title: "API 키가 등록되지 않았습니다",
        description: "설정을 변경하기 위해 API 키를 등록해주세요.",
      })
      return false
    }

    try {
      // 실제 구현에서는 백엔드 API 호출
      await new Promise((resolve) => setTimeout(resolve, 500))

      // 로컬 스토리지에 설정 저장
      localStorage.setItem("trading_settings", JSON.stringify(settings))

      setTradingStatus((prev) => ({
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

  // 긴급 정지
  const emergencyStop = async (): Promise<boolean> => {
    if (!apiKeyState.hasApiKey || !tradingStatus.isRunning) {
      return false
    }

    try {
      // 실제 구현에서는 백엔드 API 호출
      await new Promise((resolve) => setTimeout(resolve, 500))

      setTradingStatus((prev) => ({
        ...prev,
        isRunning: false,
      }))

      toast({
        title: "자동매매가 긴급 중지되었습니다.",
        duration: 3000,
      })

      return true
    } catch (error) {
      console.error("Failed to emergency stop:", error)
      toast({
        variant: "destructive",
        title: "오류가 발생했습니다",
        description: "긴급 정지 중 오류가 발생했습니다. 다시 시도해주세요.",
      })
      return false
    }
  }

  // 데이터 새로고침
  const refreshData = async (): Promise<void> => {
    if (isAuthenticated) {
      await loadApiKeyState()
      if (apiKeyState.hasApiKey) {
        await loadTradingStatus()
      }
    }
  }

  return (
    <ApiContext.Provider
      value={{
        apiKeyState,
        tradingStatus,
        isLoading,
        setApiKeys,
        clearApiKeys,
        toggleTrading,
        setStrategy,
        emergencyStop,
        refreshData,
        updateTradingSettings,
      }}
    >
      {children}
    </ApiContext.Provider>
  )
}
