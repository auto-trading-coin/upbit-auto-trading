/**
 * Token API Client
 * 토큰 관련 API 호출
 */

import api from './api'
import { setAccessToken } from '@/lib/utils/token'
import type { SuccessResponse } from '@/types'

/**
 * Refresh Token을 이용해 Access Token 재발급
 * GET /token
 */
export const reissueAccessToken = async (): Promise<string> => {
  const { data } = await api.get<SuccessResponse<string>>('/token')
  const accessToken = data.data!
  setAccessToken(accessToken)
  return accessToken
}

/**
 * 로그아웃 (Refresh Token 제거)
 * GET /token/logout
 */
export const logoutApi = async (): Promise<void> => {
  await api.get<SuccessResponse>('/token/logout', { withCredentials: true })
}
