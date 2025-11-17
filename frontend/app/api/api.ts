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

// Response Interceptor: 401 에러 시 토큰 갱신 시도
api.interceptors.response.use(
  (res: AxiosResponse) => res,
  async (error: AxiosError) => {
    const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean }
    
    // 401 에러이고 재시도하지 않은 경우
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true
      
      try {
        // Refresh Token으로 Access Token 재발급
        const { data } = await axios.get<SuccessResponse<string>>('/token', {
          withCredentials: true,
          baseURL: process.env.NEXT_PUBLIC_API_BASE_URL,
        })
        
        const newAccessToken = data.data!
        setAccessToken(newAccessToken)
        
        // 원래 요청 재시도
        originalRequest.headers = originalRequest.headers || {}
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`
        return api.request(originalRequest)
      } catch (e) {
        // 토큰 갱신 실패 시 로그아웃 처리
        removeAccessToken()
        // 필요시 로그인 페이지로 리다이렉트
        if (typeof window !== 'undefined') {
          // window.location.href = '/login'
        }
      }
    }
    
    return Promise.reject(error)
  }
)

export default api
