/**
 * Member API Client
 * 회원 관련 API 호출
 */

import api from './api'
import type { 
  MemberLoginResponse, 
  SuccessResponse, 
  RegisterUpbitKeyRequest,
  UpdateTradeActiveRequest,
  UpdateTradeActiveResponse
} from '@/types'

/**
 * 현재 로그인한 사용자 정보 조회
 * GET /member/me
 */
export const getMyInfo = async (): Promise<MemberLoginResponse> => {
  const { data } = await api.get<SuccessResponse<MemberLoginResponse>>('/member/me')
  return data.data!
}

/**
 * 업비트 API 키 등록
 * PUT /member/upbit-api-key
 * @throws 유효하지 않은 키인 경우 에러 발생
 */
export const registerUpbitKey = async (accessKey: string, secretKey: string): Promise<void> => {
  const requestBody: RegisterUpbitKeyRequest = { accessKey, secretKey }
  await api.put<SuccessResponse>('/member/upbit-api-key', requestBody)
}

/**
 * 업비트 API 키 삭제
 * DELETE /member
 * @throws 자동매매 실행 중인 경우 에러 발생
 */
export const deleteUpbitKey = async (): Promise<void> => {
  await api.delete<SuccessResponse>('/member')
}

/**
 * 자동매매 상태 변경
 * PATCH /member/trade-active
 */
export const updateTradeActive = async (tradeActive: boolean): Promise<UpdateTradeActiveResponse> => {
  const requestBody: UpdateTradeActiveRequest = { tradeActive }
  const { data } = await api.patch<SuccessResponse<UpdateTradeActiveResponse>>('/member/trade-active', requestBody)
  return data.data!
}
