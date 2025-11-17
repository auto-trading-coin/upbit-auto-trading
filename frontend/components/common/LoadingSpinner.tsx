/**
 * 로딩 스피너 컴포넌트
 * 페이지 로딩 시 표시되는 공통 스피너
 */

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export function LoadingSpinner({ size = 'md', className = '' }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'h-8 w-8',
    md: 'h-12 w-12',
    lg: 'h-16 w-16'
  }

  return (
    <div className={`flex items-center justify-center min-h-[60vh] ${className}`}>
      <div 
        className={`animate-spin rounded-full border-t-2 border-b-2 border-primary ${sizeClasses[size]}`}
        role="status"
        aria-label="로딩 중"
      >
        <span className="sr-only">로딩 중...</span>
      </div>
    </div>
  )
}
