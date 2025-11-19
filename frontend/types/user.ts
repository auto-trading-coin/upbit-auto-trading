/**
 * User and Member related types
 */

export interface User {
  id: string
  email: string
  name: string
  profileImage?: string
  tradeActive: boolean
  strategyRegistered: boolean
  apiKeyRegistered: boolean
  strategyId?: number | null  // ✨ 백엔드에서 받은 strategyId
}

export interface MemberLoginResponse {
  email: string
  nickname: string
  tradeActive: boolean
  strategyRegistered: boolean
  apiKeyRegistered: boolean
  strategyId?: number | null  // ✨ 백엔드 응답에 포함
}
