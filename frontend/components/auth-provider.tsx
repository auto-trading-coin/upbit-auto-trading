'use client';

import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/components/ui/use-toast';
import { getMyInfo } from '@/apis/MemberApi';
import api from '@/apis/api';
import { setAccessToken, removeAccessToken, getAccessToken } from '@/utils/token';
import { logoutApi } from '@/apis/TokenApi';

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
        let isMounted = true;
        const checkAuthStatus = async () => {
            setIsLoading(true);
            try {
                const accessToken = getAccessToken();
                if (accessToken) {
                    // accessToken이 있으면 바로 /member/me로 유저 정보 조회
                    const userInfo = await getMyInfo();
                    if (isMounted) {
                        setUser({
                            id: userInfo.email,
                            email: userInfo.email,
                            name: userInfo.nickname,
                            tradeActive: userInfo.tradeActive,
                            strategy_registered: userInfo.strategyRegistered,
                            api_key_registered: userInfo.apiKeyRegistered,
                        });
                    }
                } else {
                    // accessToken이 없으면 /token으로 발급 후 /member/me 조회
                    const { data: tokenData } = await api.get('/token', { withCredentials: true });
                    setAccessToken(tokenData.data);
                    const userInfo = await getMyInfo();
                    if (isMounted) {
                        setUser({
                            id: userInfo.email,
                            email: userInfo.email,
                            name: userInfo.nickname,
                            tradeActive: userInfo.tradeActive,
                            strategy_registered: userInfo.strategyRegistered,
                            api_key_registered: userInfo.apiKeyRegistered,
                        });
                    }
                }
            } catch (error) {
                if (isMounted) {
                    setUser(null);
                    removeAccessToken();
                }
            } finally {
                if (isMounted) setIsLoading(false);
            }
        };

        checkAuthStatus();

        const handleFocus = () => {
            checkAuthStatus();
        };

        window.addEventListener('focus', handleFocus);

        return () => {
            isMounted = false;
            window.removeEventListener('focus', handleFocus);
        };
    }, []);

    // 카카오 로그인 함수
    const login = () => {
        const backendUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
        window.location.href = `${backendUrl}/oauth2/authorization/kakao`;
    };

    // 로그아웃 함수
    const logout = async () => {
        try {
            await logoutApi();
        } catch (e) {
            // ignore
        }
        removeAccessToken();
        localStorage.removeItem('refresh_token');
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
