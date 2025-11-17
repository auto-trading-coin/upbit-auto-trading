/**
 * Validation utility functions
 */

/**
 * 업비트 API 키 형식 검증
 * - Access Key: 대문자 + 소문자 + 숫자 조합
 * - Secret Key: 대문자 + 소문자 + 숫자 조합
 */
export const validateApiKey = (accessKey: string, secretKey: string): { valid: boolean; message?: string } => {
  if (!accessKey || !secretKey) {
    return {
      valid: false,
      message: 'Access Key와 Secret Key를 모두 입력해주세요.'
    }
  }

  if (accessKey.length < 20) {
    return {
      valid: false,
      message: 'Access Key가 너무 짧습니다.'
    }
  }

  if (secretKey.length < 20) {
    return {
      valid: false,
      message: 'Secret Key가 너무 짧습니다.'
    }
  }

  return { valid: true }
}

/**
 * 이메일 형식 검증
 */
export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

/**
 * 숫자 범위 검증
 */
export const validateRange = (value: number, min: number, max: number): boolean => {
  return value >= min && value <= max
}
