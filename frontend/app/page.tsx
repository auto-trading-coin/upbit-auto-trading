'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
    AlertCircle,
    AlertTriangle,
    BarChart3,
    CheckCircle2,
    Clock,
    DollarSign,
    Key,
    LineChart,
    Percent,
    Settings,
    StopCircle,
} from 'lucide-react';
import { LoginModal } from '@/components/LoginModal';
import { StatusBadge } from '@/components/common';
import { HoldingsTable, PortfolioSummary } from '@/components/portfolio';
import { useUser } from '@/hooks/queries/useUser';
import { useCurrentStrategy } from '@/hooks/queries/useCurrentStrategy';
import { useTradingStatus } from '@/hooks/queries/useTradingStatus';
import { useToggleTrading } from '@/hooks/mutations/useToggleTrading';
import { usePortfolioCalculation } from '@/hooks/usePortfolioCalculation';
import { useIsMounted } from '@/hooks/useIsMounted';
import { formatCurrency } from '@/lib/utils/format';

export default function Dashboard() {
    // 클라이언트 마운트 확인 (Hydration mismatch 방지)
    const isMounted = useIsMounted();
    
    // React Query hooks
    const { data: user, isLoading } = useUser();
    const currentStrategy = useCurrentStrategy();
    const { data: tradingStatus } = useTradingStatus();
    const toggleMutation = useToggleTrading();
    
    // 포트폴리오 계산 (공통 훅 사용)
    const {
        holdingsWithPrice,
        cashBalance,
        coinTotalBuyAmount,
        coinEvaluationAmount,
        totalAsset,
        totalProfitAmount,
        isLoading: portfolioLoading,
    } = usePortfolioCalculation();

    const [showLoginModal, setShowLoginModal] = useState(false);
    const router = useRouter();
    const { toast } = useToast();

    // 인증 여부
    const isAuthenticated = !!user;

    // 서버/클라이언트 불일치 방지: 마운트 전에는 로딩 표시
    if (!isMounted || isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
        );
    }

    const handleToggleTrading = async () => {
        if (!isAuthenticated) {
            setShowLoginModal(true);
            return;
        }

        if (!user.apiKeyRegistered) {
            toast({
                variant: 'destructive',
                title: 'API 키가 등록되지 않았습니다',
                description: '자동매매를 실행하기 위해 API 키를 등록해주세요.',
                action: (
                    <Button variant="outline" onClick={() => router.push('/mypage')}>
                        등록하기
                    </Button>
                ),
            });
            return;
        }

        if (!currentStrategy) {
            toast({
                variant: 'destructive',
                title: '전략이 선택되지 않았습니다',
                description: '자동매매를 실행하기 위해 전략을 선택해주세요.',
                action: (
                    <Button variant="outline" onClick={() => router.push('/strategies')}>
                        전략 선택하기
                    </Button>
                ),
            });
            return;
        }

        toggleMutation.mutate(!tradingStatus?.isRunning);
    };

    const handleRegisterApiKey = () => {
        router.push('/mypage');
    };

    const handleSelectStrategy = () => {
        router.push('/strategies');
    };

    const handleEmergencyStop = async () => {
        if (tradingStatus?.isRunning) {
            toggleMutation.mutate(false);
        }
    };

    const canRunTrading = user?.apiKeyRegistered && currentStrategy !== null;

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold tracking-tight">자동매매 대시보드</h1>
                <Button
                    onClick={() => router.push('/strategies')}
                    variant="outline"
                    disabled={!isAuthenticated || !user?.apiKeyRegistered}
                >
                    전략 설정
                </Button>
            </div>

            {!isAuthenticated && (
                <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>로그인이 필요합니다</AlertTitle>
                    <AlertDescription>
                        자동매매 시스템을 이용하기 위해 로그인해주세요.
                        <Button variant="link" className="p-0 h-auto ml-2" onClick={() => setShowLoginModal(true)}>
                            로그인하기
                        </Button>
                    </AlertDescription>
                </Alert>
            )}

            {isAuthenticated && !user.apiKeyRegistered && (
                <Card className="border-amber-300 bg-amber-50">
                    <CardHeader>
                        <CardTitle className="flex items-center text-amber-800">
                            <Key className="h-5 w-5 mr-2" />
                            업비트 API 키 등록이 필요합니다
                        </CardTitle>
                        <CardDescription className="text-amber-700">
                            자동매매 시스템의 모든 기능을 이용하기 위해서는 업비트 API 키가 필요합니다.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-col space-y-4">
                            <p className="text-sm text-amber-700">API 키를 등록하면 다음 기능을 이용할 수 있습니다:</p>
                            <ul className="list-disc list-inside text-sm text-amber-700 space-y-1">
                                <li>자동매매 실행 및 제어</li>
                                <li>실시간 포지션 확인</li>
                                <li>주문 내역 및 시그널 로그 확인</li>
                                <li>자산 현황 및 수익률 분석</li>
                            </ul>
                            <Button onClick={handleRegisterApiKey} className="w-full sm:w-auto">
                                <Key className="mr-2 h-4 w-4" />
                                API 키 등록하기
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            )}

            {isAuthenticated && user.apiKeyRegistered && !currentStrategy && (
                <Card className="border-amber-300 bg-amber-50">
                    <CardHeader>
                        <CardTitle className="flex items-center text-amber-800">
                            <Settings className="h-5 w-5 mr-2" />
                            자동매매 전략 선택이 필요합니다
                        </CardTitle>
                        <CardDescription className="text-amber-700">
                            자동매매를 실행하기 위해서는 전략을 선택해야 합니다.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-col space-y-4">
                            <p className="text-sm text-amber-700">
                                다양한 자동매매 전략 중 하나를 선택하여 자동매매를 시작하세요.
                            </p>
                            <Button onClick={handleSelectStrategy} className="w-full sm:w-auto">
                                <Settings className="mr-2 h-4 w-4" />
                                전략 선택하기
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            )}

            {!isAuthenticated ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                    <div className="max-w-md space-y-6">
                        <div className="space-y-2">
                            <h2 className="text-2xl font-bold tracking-tight">
                                자동매매 시스템에 오신 것을 환영합니다
                            </h2>
                            <p className="text-muted-foreground">
                                업비트 API를 활용한 자동매매 시스템을 이용하려면 로그인이 필요합니다.
                            </p>
                        </div>
                        <div className="flex flex-col space-y-4">
                            <div className="rounded-lg border bg-card p-4 shadow-sm">
                                <div className="flex items-center gap-4">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                                        <LineChart className="h-5 w-5 text-primary" />
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="font-medium">실시간 시세 모니터링</h3>
                                        <p className="text-sm text-muted-foreground">
                                            다양한 코인의 실시간 가격 정보를 확인하세요.
                                        </p>
                                    </div>
                                </div>
                            </div>
                            <div className="rounded-lg border bg-card p-4 shadow-sm">
                                <div className="flex items-center gap-4">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                                        <Settings className="h-5 w-5 text-primary" />
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="font-medium">다양한 전략 선택</h3>
                                        <p className="text-sm text-muted-foreground">
                                            RSI, MACD 등 다양한 전략을 선택하여 자동매매를 실행하세요.
                                        </p>
                                    </div>
                                </div>
                            </div>
                            <div className="rounded-lg border bg-card p-4 shadow-sm">
                                <div className="flex items-center gap-4">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                                        <BarChart3 className="h-5 w-5 text-primary" />
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="font-medium">포트폴리오 관리</h3>
                                        <p className="text-sm text-muted-foreground">
                                            자산 현황과 수익률을 한눈에 확인하세요.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <Button size="lg" className="w-full" onClick={() => setShowLoginModal(true)}>
                            로그인하고 시작하기
                        </Button>
                    </div>
                </div>
            ) : (
                <>
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">자동매매 상태</CardTitle>
                                <Switch
                                    checked={user.apiKeyRegistered && tradingStatus?.isRunning}
                                    onCheckedChange={handleToggleTrading}
                                    disabled={!isAuthenticated || !canRunTrading || toggleMutation.isPending}
                                />
                            </CardHeader>
                            <CardContent>
                                <div className="flex items-center space-x-2">
                                    {!user.apiKeyRegistered ? (
                                        <Badge
                                            variant="outline"
                                            className="bg-amber-50 text-amber-700 border-amber-200"
                                        >
                                            API 키 필요
                                        </Badge>
                                    ) : !currentStrategy ? (
                                        <Badge
                                            variant="outline"
                                            className="bg-amber-50 text-amber-700 border-amber-200"
                                        >
                                            전략 선택 필요
                                        </Badge>
                                    ) : tradingStatus?.isRunning ? (
                                        <StatusBadge type="trading" status="RUNNING" />
                                    ) : (
                                        <StatusBadge type="trading" status="STOPPED" />
                                    )}
                                </div>
                                <p className="text-xs text-muted-foreground mt-2">
                                    {!user.apiKeyRegistered
                                        ? 'API 키를 등록해주세요'
                                        : !currentStrategy
                                        ? '전략을 선택해주세요'
                                        : `현재 전략: ${currentStrategy?.name || '선택된 전략 없음'}`}
                                </p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">마지막 시그널</CardTitle>
                                <Clock className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <>
                                    <div className="text-2xl font-bold">-</div>
                                    <p className="text-xs text-muted-foreground mt-2">
                                        {!user.apiKeyRegistered
                                            ? 'API 키 등록 후 확인 가능'
                                            : '전략 선택 후 확인 가능'}
                                    </p>
                                </>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">일일 수익률</CardTitle>
                                <Percent className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <>
                                    <div className="text-2xl font-bold">-</div>
                                    <p className="text-xs text-muted-foreground mt-2">
                                        {!user.apiKeyRegistered
                                            ? 'API 키 등록 후 확인 가능'
                                            : '전략 선택 후 확인 가능'}
                                    </p>
                                </>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">총 자산</CardTitle>
                                <DollarSign className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                {portfolioLoading ? (
                                    <div className="animate-pulse">
                                        <div className="h-8 bg-muted rounded w-24"></div>
                                    </div>
                                ) : (
                                    <>
                                        <div className="text-2xl font-bold">
                                            {formatCurrency(totalAsset)}
                                        </div>
                                        <p className="text-xs text-muted-foreground mt-2">
                                            코인 {formatCurrency(coinEvaluationAmount)} + 현금 {formatCurrency(cashBalance)}
                                        </p>
                                    </>
                                )}
                            </CardContent>
                        </Card>
                    </div>

                    <Tabs defaultValue="positions" className="w-full">
                        <TabsList>
                            <TabsTrigger value="positions">포지션 현황</TabsTrigger>
                            <TabsTrigger value="status">시스템 상태</TabsTrigger>
                        </TabsList>
                        <TabsContent value="positions" className="space-y-4">
                            <Card>
                                <CardHeader>
                                    <CardTitle>현재 포지션</CardTitle>
                                    <CardDescription>현재 보유 중인 코인 포지션 정보</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    {!user?.apiKeyRegistered ? (
                                        <div className="flex flex-col items-center justify-center py-8 text-center">
                                            <LineChart className="h-10 w-10 text-muted-foreground mb-4" />
                                            <h3 className="text-lg font-medium">API 키 등록 후 확인 가능합니다</h3>
                                            <p className="text-sm text-muted-foreground mt-1">
                                                업비트 API 키를 등록하여 포지션 정보를 확인하세요
                                            </p>
                                            <Button variant="outline" className="mt-4" onClick={handleRegisterApiKey}>
                                                API 키 등록하기
                                            </Button>
                                        </div>
                                    ) : portfolioLoading ? (
                                        <div className="flex items-center justify-center py-8">
                                            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
                                        </div>
                                    ) : (
                                        <div className="space-y-4">
                                            {/* 자산 요약 (공통 컴포넌트 사용) */}
                                            <PortfolioSummary
                                                cashBalance={cashBalance}
                                                coinTotalBuyAmount={coinTotalBuyAmount}
                                                coinEvaluationAmount={coinEvaluationAmount}
                                                totalProfitAmount={totalProfitAmount}
                                            />
                                            
                                            {/* 보유 자산 테이블 (공통 컴포넌트 사용) */}
                                            <HoldingsTable
                                                holdings={holdingsWithPrice}
                                                totalBuyAmount={coinTotalBuyAmount}
                                                totalEvaluationAmount={coinEvaluationAmount}
                                                totalProfitAmount={totalProfitAmount}
                                            />
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </TabsContent>
                        <TabsContent value="status" className="space-y-4">
                            <Card>
                                <CardHeader>
                                    <CardTitle>시스템 상태</CardTitle>
                                    <CardDescription>자동매매 시스템의 현재 상태 정보</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="flex items-center space-x-2">
                                                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted">
                                                    {user.apiKeyRegistered ? (
                                                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                                                    ) : (
                                                        <AlertTriangle className="h-4 w-4 text-amber-500" />
                                                    )}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-medium">API 키 상태</p>
                                                    <p className="text-xs text-muted-foreground">
                                                        {user.apiKeyRegistered ? '등록됨' : '미등록'}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted">
                                                    {currentStrategy ? (
                                                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                                                    ) : (
                                                        <AlertTriangle className="h-4 w-4 text-amber-500" />
                                                    )}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-medium">전략 상태</p>
                                                    <p className="text-xs text-muted-foreground">
                                                        {currentStrategy ? currentStrategy.name : '미선택'}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted">
                                                    {tradingStatus?.isRunning ? (
                                                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                                                    ) : (
                                                        <StopCircle className="h-4 w-4 text-amber-500" />
                                                    )}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-medium">자동매매 상태</p>
                                                    <p className="text-xs text-muted-foreground">
                                                        {!canRunTrading
                                                            ? '실행 불가'
                                                            : tradingStatus?.isRunning
                                                            ? '실행 중'
                                                            : '중지됨'}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted">
                                                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                                                </div>
                                                <div>
                                                    <p className="text-sm font-medium">손실 제한</p>
                                                    <p className="text-xs text-muted-foreground">5% 제한</p>
                                                </div>
                                            </div>
                                        </div>

                                        {!user.apiKeyRegistered ? (
                                            <Button onClick={handleRegisterApiKey} className="w-full">
                                                <Key className="mr-2 h-4 w-4" />
                                                API 키 등록하기
                                            </Button>
                                        ) : !currentStrategy ? (
                                            <Button onClick={handleSelectStrategy} className="w-full">
                                                <Settings className="mr-2 h-4 w-4" />
                                                전략 선택하기
                                            </Button>
                                        ) : (
                                            <Button
                                                variant="destructive"
                                                className="w-full"
                                                disabled={!tradingStatus?.isRunning || toggleMutation.isPending}
                                                onClick={handleEmergencyStop}
                                            >
                                                <StopCircle className="mr-2 h-4 w-4" />
                                                긴급 정지
                                            </Button>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>
                    </Tabs>
                </>
            )}

            <LoginModal open={showLoginModal} onOpenChange={setShowLoginModal} />
        </div>
    );
}
