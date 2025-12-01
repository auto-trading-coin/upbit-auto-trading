import { useState, useEffect } from 'react'

/**
 * 클라이언트 마운트 여부 확인 Hook
 * 
 * Hydration mismatch 방지를 위해 사용
 * 서버/클라이언트 렌더링 결과가 다를 수 있는 컴포넌트에서 사용
 * 
 * @returns 클라이언트에서 마운트되었으면 true
 */
export const useIsMounted = () => {
  const [isMounted, setIsMounted] = useState(false)
  
  useEffect(() => {
    setIsMounted(true)
  }, [])
  
  return isMounted
}
