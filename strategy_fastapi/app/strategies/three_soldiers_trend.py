"""
app/strategies/three_soldiers_trend.py
- Three Soldiers Trend 전략: Three White Soldiers/Black Crows 패턴 + MA 필터
- 5분봉 기준으로 동작하며, 5분 완성 시점에만 판단
- MA 30/200 + 쿨다운 필터 적용 (시간 기반)
"""
import logging
from typing import List, Dict, Optional
from datetime import datetime, timedelta
from ..models.strategy_base import Strategy
from ..schemas.models import Candle, StrategyResult, Decision

logger = logging.getLogger(__name__)

class ThreeSoldiersTrend(Strategy):
    def __init__(self, strategy_id: int = 3, ma1_length: int = 30, ma2_length: int = 200,
                 cooldown_period: int = 100, use_cooldown: bool = True):
        self.strategy_id = strategy_id
        self.name = f"Three Soldiers Trend (MA{ma1_length}/{ma2_length})"
        self.ma1_length = ma1_length
        self.ma2_length = ma2_length
        self.cooldown_period = cooldown_period   # 쿨다운 기간 (봉 단위)
        self.use_cooldown = use_cooldown

        # 상태 관리 (마켓별로 저장)
        self._last_buy_time: Dict[str, datetime] = {}
        self._last_sell_time: Dict[str, datetime] = {}
        self._last_was_buy: Dict[str, bool] = {}
        self._last_was_sell: Dict[str, bool] = {}
        self._last_processed_candle_time: Dict[str, datetime] = {}  # 마지막 처리한 캔들 시각

    def _sma(self, closes: List[float], period: int) -> Optional[float]:
        """단순 이동평균 계산"""
        if len(closes) < period:
            return None
        return sum(closes[-period:]) / period

    def _three_white_soldiers(self, candles: List[Candle]) -> bool:
        """Three White Soldiers 패턴 감지"""
        if len(candles) < 3:
            return False
        c0, c1, c2 = candles[-1], candles[-2], candles[-3]
        c1_cond = (c0.trade_price > c0.opening_price and
                   c1.trade_price > c1.opening_price and
                   c2.trade_price > c2.opening_price)
        c2_cond = (c1.opening_price <= c2.trade_price and c1.trade_price > c2.trade_price)
        c3_cond = (c0.opening_price <= c1.trade_price and c0.trade_price > c1.trade_price)
        return c1_cond and c2_cond and c3_cond

    def _three_black_crows(self, candles: List[Candle]) -> bool:
        """Three Black Crows 패턴 감지"""
        if len(candles) < 3:
            return False
        c0, c1, c2 = candles[-1], candles[-2], candles[-3]
        c1_cond = (c0.trade_price < c0.opening_price and
                   c1.trade_price < c1.opening_price and
                   c2.trade_price < c2.opening_price)
        c2_cond = (c1.opening_price >= c2.trade_price and c1.trade_price < c2.trade_price)
        c3_cond = (c0.opening_price >= c1.trade_price and c0.trade_price < c1.trade_price)
        return c1_cond and c2_cond and c3_cond

    def _is_new_candle(self, market: str, latest_candle_time: str) -> bool:
        """새로운 캔들인지 확인 (중복 처리 방지)"""
        try:
            candle_time = datetime.fromisoformat(latest_candle_time.replace('Z', '+00:00'))
            
            # 처음 처리하는 마켓이거나, 새로운 캔들인 경우
            if market not in self._last_processed_candle_time:
                self._last_processed_candle_time[market] = candle_time
                return True
            
            # 이전보다 새로운 캔들인 경우
            if candle_time > self._last_processed_candle_time[market]:
                self._last_processed_candle_time[market] = candle_time
                return True
            
            # 이미 처리한 캔들인 경우
            return False
            
        except Exception as e:
            logger.error(f"캔들 시각 파싱 오류: {e}")
            return False

    def _check_cooldown(self, market: str, signal_type: str, latest_candle_time: str) -> bool:
        """쿨다운 조건 확인 (시간 기반)"""
        if not self.use_cooldown:
            return True

        current_time = datetime.fromisoformat(latest_candle_time.replace('Z', '+00:00'))
        cooldown_minutes = self.cooldown_period * 5  # 5분봉 × 주기

        if signal_type == "buy":
            last_time = self._last_buy_time.get(market)
        else:
            last_time = self._last_sell_time.get(market)

        if last_time is None:
            return True
        return (current_time - last_time) >= timedelta(minutes=cooldown_minutes)

    def evaluate_mtf(self, market: str, data_by_unit: Dict[int, List[Candle]]) -> StrategyResult:
        """5분봉 기준으로 Three Soldiers Trend 전략 실행"""
        if 5 not in data_by_unit or not data_by_unit[5]:
            return StrategyResult(
                strategy_id=self.strategy_id,
                strategy_name=self.name,
                market=market,
                unit=5,
                decision=Decision.HOLD
            )

        candles_5m = data_by_unit[5]
        latest_candle = candles_5m[-1]

        # 새로운 캔들 확인 (중복 처리 방지)
        if not self._is_new_candle(market, latest_candle.candle_date_time_kst):
            return StrategyResult(
                strategy_id=self.strategy_id,
                strategy_name=self.name,
                market=market,
                unit=5,
                decision=Decision.HOLD
            )

        # 최소 데이터 길이 확인
        required_length = max(self.ma1_length, self.ma2_length) + 3
        if len(candles_5m) < required_length:
            return StrategyResult(
                strategy_id=self.strategy_id,
                strategy_name=self.name,
                market=market,
                unit=5,
                decision=Decision.HOLD
            )

        closes = [c.trade_price for c in candles_5m]
        ma1_current = self._sma(closes, self.ma1_length) # 현재 30개 캔들의 이평선 값
        ma2_current = self._sma(closes, self.ma2_length) # 현재 200개 캔들의 이평선 값
        ma1_prev = self._sma(closes[:-1], self.ma1_length) # 1캔들 전 30개 캔들의 이평선 값
        ma2_prev = self._sma(closes[:-1], self.ma2_length) # 1캔들 전 200개 캔들의 이평선 값

        if None in (ma1_current, ma2_current, ma1_prev, ma2_prev):
            return StrategyResult(
                strategy_id=self.strategy_id,
                strategy_name=self.name,
                market=market,
                unit=5,
                decision=Decision.HOLD
            )

        # 패턴 감지
        three_white_soldiers = self._three_white_soldiers(candles_5m)
        three_black_crows = self._three_black_crows(candles_5m)

        # 상태 초기화
        if market not in self._last_was_buy:
            self._last_was_buy[market] = False
            self._last_was_sell[market] = False

        # 매수/매도 신호
        # 매수 : 직전 3개 캔들 연속상승 and 30 이평선 상승 and 200이평선 상승
        buy_signal = (three_white_soldiers and
                      not self._last_was_buy[market] and
                      ma1_current > ma1_prev and
                      ma2_current > ma2_prev and
                      self._check_cooldown(market, "buy", latest_candle.candle_date_time_kst))

        # 매도 : 직전 3개 캔들 연속하락 and 30 이평선 하락 and 200이평선 하락
        sell_signal = (three_black_crows and
                       not self._last_was_sell[market] and
                       ma1_current < ma1_prev and
                       ma2_current < ma2_prev and
                       self._check_cooldown(market, "sell", latest_candle.candle_date_time_kst))

        # decision 변수 초기화(HOLD)
        decision = Decision.HOLD
        latest_time = datetime.fromisoformat(latest_candle.candle_date_time_kst.replace('Z', '+00:00'))


        if buy_signal:
            decision = Decision.BID
            self._last_was_buy[market] = True
            self._last_was_sell[market] = False
            self._last_buy_time[market] = latest_time

        elif sell_signal:
            decision = Decision.ASK
            self._last_was_sell[market] = True
            self._last_was_buy[market] = False
            self._last_sell_time[market] = latest_time

        return StrategyResult(
            strategy_id=self.strategy_id,
            strategy_name=self.name,
            market=market,
            unit=5,
            decision=decision
        )
