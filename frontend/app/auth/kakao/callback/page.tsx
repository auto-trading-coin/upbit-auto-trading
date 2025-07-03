'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useToast } from '@/components/ui/use-toast';

interface LoginResponse {
    accessToken: string;
    refreshToken: string;
    member: {
        email: string;
        nickname: string;
        tradeActive: boolean;
        strategy_registered: boolean;
        api_key_registered: boolean;
    };
}

export default function KakaoCallback() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { toast } = useToast();

    useEffect(() => {
        const code = searchParams.get('code');

        if (!code) {
            toast({
                variant: 'destructive',
                title: '로그인 실패',
                description: '인증 코드를 받지 못했습니다.',
                duration: 3000,
            });
            router.push('/');
            return;
        }

        // 백엔드의 OAuth2 엔드포인트로 리다이렉트
        const backendUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080';

        // 백엔드로 인증 코드 전송
        fetch(`${backendUrl}/api/oauth2/authorize/kakao?code=${code}`, {
            method: 'GET',
            credentials: 'include', // 쿠키 포함
        })
            .then((response) => {
                if (!response.ok) {
                    throw new Error('로그인에 실패했습니다.');
                }
                return response.json();
            })
            .then((data: LoginResponse) => {
                // 토큰 저장
                localStorage.setItem('access_token', data.accessToken);
                localStorage.setItem('refresh_token', data.refreshToken);

                // 사용자 정보 저장
                const userData = {
                    id: data.member.email, // 임시로 email을 id로 사용
                    email: data.member.email,
                    name: data.member.nickname,
                    tradeActive: data.member.tradeActive,
                    strategy_registered: data.member.strategy_registered,
                    api_key_registered: data.member.api_key_registered,
                };
                localStorage.setItem('user_data', JSON.stringify(userData));

                toast({
                    title: '로그인 성공!',
                    description: '환영합니다.',
                    duration: 3000,
                });

                // 메인 페이지로 리다이렉트
                router.push('/');
            })
            .catch((error) => {
                console.error('Login error:', error);
                toast({
                    variant: 'destructive',
                    title: '로그인 실패',
                    description: error.message || '다시 시도해주세요.',
                    duration: 3000,
                });
                router.push('/');
            });
    }, [searchParams, router, toast]);

    return (
        <div className="flex items-center justify-center min-h-screen">
            <div className="text-center">
                <h1 className="text-2xl font-bold mb-4">로그인 처리 중...</h1>
                <p className="text-muted-foreground">잠시만 기다려주세요.</p>
            </div>
        </div>
    );
}
