/**
 * Axios Instance
 * - JWT 토큰 자동 첨부
 * - 401 에러 시 자동 토큰 갱신
 */

import axios, { AxiosRequestConfig, AxiosResponse, AxiosError, InternalAxiosRequestConfig } from 'axios'
import { getAccessToken, setAccessToken, removeAccessToken } from '../../lib/utils/token'
import type { SuccessResponse } from '@/types'

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL,
  withCredentials: true,
})

// Request Interceptor: JWT 토큰 자동 첨부
api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = getAccessToken()
  if (token) {
    config.headers = config.headers ?? {}
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// 토큰 갱신 진행 중 플래그 (중복 갱신 방지)
let isRefreshing = false
let refreshSubscribers: ((token: string) => void)[] = []

const subscribeTokenRefresh = (callback: (token: string) => void) => {
  refreshSubscribers.push(callback)
}

const onTokenRefreshed = (token: string) => {
  refreshSubscribers.forEach(callback => callback(token))
  refreshSubscribers = []
}

// Response Interceptor: 401 에러 시 토큰 갱신 시도
api.interceptors.response.use(
  (res: AxiosResponse) => res,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean }

    // 401 에러이고 재시도하지 않은 경우
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        // 이미 갱신 중이면 대기
        return new Promise(resolve => {
          subscribeTokenRefresh(token => {
            originalRequest.headers.Authorization = `Bearer ${token}`
            resolve(api.request(originalRequest))
          })
        })
      }

      originalRequest._retry = true
      isRefreshing = true

      try {
        // Refresh Token으로 Access Token 재발급
        const { data } = await axios.get<SuccessResponse<string>>('/token', {
          withCredentials: true,
          baseURL: process.env.NEXT_PUBLIC_API_BASE_URL,
        })

        const newAccessToken = data.data!
        setAccessToken(newAccessToken)
        isRefreshing = false
        onTokenRefreshed(newAccessToken)

        // 원래 요청 재시도
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`
        return api.request(originalRequest)
      } catch (e) {
        // 토큰 갱신 실패 시 로그아웃 처리
        isRefreshing = false
        refreshSubscribers = []
        removeAccessToken()
      }
    }

    return Promise.reject(error)
  }
)

export default api
