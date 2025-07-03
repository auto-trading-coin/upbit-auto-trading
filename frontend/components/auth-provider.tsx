'use client';

import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/components/ui/use-toast';

// 타입 정의
interface User {
    id: string;
    email: string;
    name: string;
    profileImage?: string;
    tradeActive: boolean;
    strategy_registered: boolean;
    api_key_registered: boolean;
}

type AuthContextType = {
    user: User | null;
    isLoading: boolean;
    isAuthenticated: boolean;
    login: () => void;
    logout: () => void;
};

// 기본값 설정
const AuthContext = createContext<AuthContextType>({
    user: null,
    isLoading: true,
    isAuthenticated: false,
    login: () => {},
    logout: () => {},
});

// 컨텍스트 훅
export const useAuth = () => useContext(AuthContext);

interface AuthProviderProps {
    children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const router = useRouter();
    const { toast } = useToast();

    // 로그인 상태 확인
    useEffect(() => {
        const checkAuthStatus = () => {
            setIsLoading(true);
            try {
                // 로컬 스토리지에서 토큰 확인
                const accessToken = localStorage.getItem('access_token');
                const refreshToken = localStorage.getItem('refresh_token');

                if (accessToken && refreshToken) {
                    // 토큰이 있으면 사용자 정보 가져오기
                    const storedUser = localStorage.getItem('user_data');

                    if (storedUser) {
                        setUser(JSON.parse(storedUser));
                    }
                } else {
                    setUser(null);
                }
            } catch (error) {
                console.error('Failed to check auth status:', error);
                // 오류 발생 시 로그아웃 처리
                localStorage.removeItem('access_token');
                localStorage.removeItem('refresh_token');
                localStorage.removeItem('user_data');
                setUser(null);
            } finally {
                setIsLoading(false);
            }
        };

        checkAuthStatus();

        // 페이지 포커스 시 인증 상태 확인 (탭 전환 후 돌아왔을 때)
        const handleFocus = () => {
            checkAuthStatus();
        };

        window.addEventListener('focus', handleFocus);

        return () => {
            window.removeEventListener('focus', handleFocus);
        };
    }, []);

    // 카카오 로그인 함수
    const login = () => {
        const backendUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080';
        window.location.href = `${backendUrl}/api/oauth2/authorize/kakao`;
    };

    // 로그아웃 함수
    const logout = () => {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('user_data');
        setUser(null);

        toast({
            title: '로그아웃',
            description: '안전하게 로그아웃되었습니다.',
            duration: 3000,
        });
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                isLoading,
                isAuthenticated: !!user,
                login,
                logout,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}
