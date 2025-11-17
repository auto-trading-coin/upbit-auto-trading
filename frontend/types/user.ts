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
}

export interface MemberLoginResponse {
  email: string
  nickname: string
  tradeActive: boolean
  strategyRegistered: boolean
  apiKeyRegistered: boolean
}
