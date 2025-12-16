/**
 * API Request and Response types
 */

// Common API Response
export interface SuccessResponse<T = any> {
  code: string
  message: string
  data?: T
}

export interface ErrorResponse {
  code: string
  message: string
}

// Member API
export interface UpdateTradeActiveRequest {
  tradeActive: boolean
}

export interface UpdateTradeActiveResponse {
  tradeActive: boolean
}

export interface RegisterUpbitKeyRequest {
  accessKey: string
  secretKey: string
}

// Strategy API
export interface UpdateStrategyRequest {
  strategyId: number
}



// API Key State
export interface ApiKeyState {
  hasApiKey: boolean
  accessKey: string
  secretKey: string
}
