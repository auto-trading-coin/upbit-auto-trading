package com.autric.upbit.external.upbit.service;

import com.autric.upbit.domain.member.entity.Member;
import com.autric.upbit.domain.member.repository.MemberRepository;
import com.autric.upbit.external.kafka.dto.SignalMessage;
import com.autric.upbit.external.upbit.client.UpbitApiClient;
import com.autric.upbit.external.upbit.dto.response.UpbitAccountResponse;
import com.autric.upbit.external.upbit.dto.response.UpbitOrderResponse;
import com.autric.upbit.external.upbit.dto.response.UpbitTradePriceResponse;
import com.autric.upbit.external.upbit.util.UpbitUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;

@Slf4j
@Component
@RequiredArgsConstructor
public class UpbitOrderCalculatorService {

    private final UpbitApiClient upbitApiClient;

    public String getVolume(List<UpbitAccountResponse> accounts, String market) {
        String baseCurrency = market.split("-")[1];

        for(UpbitAccountResponse dto : accounts){
            if (baseCurrency.equals(dto.getCurrency())) {
                BigDecimal balance = new BigDecimal(dto.getBalance());
                BigDecimal locked  = new BigDecimal(dto.getLocked() == null ? "0" : dto.getLocked());

                // 가용할 수 있는 코인 수량
                BigDecimal available = balance.subtract(locked);
                if (available.compareTo(BigDecimal.ZERO) <= 0) return null;

                // 현재 코인의 시세 조회
                UpbitTradePriceResponse res = upbitApiClient.getCurrentPrice(market);
                BigDecimal curPrice = res.getTradePrice();

                // 현재 보유한 코인의 수량 * 시세 (5천원 이상이어야 함)
                BigDecimal price = available.multiply(curPrice);

                // 매도 주문이 가능한 수량의 가치가 5천원 미만이라면 null 리턴
                if(price.compareTo(new BigDecimal("5000")) <= 0) return null;

                // 소수점 자리수는 업비트의 코인별 최소 주문 단위에 맞춰야 함
//                volume = volume.setScale(8, RoundingMode.DOWN);

                return available.toPlainString();
            }
        }
        return null;
    }

    public String getPrice(List<UpbitAccountResponse> accounts){
        for(UpbitAccountResponse dto : accounts){
            if(dto.getCurrency().equals("KRW")) {
                // balance를 BigDecimal로 변환 (잔고 내 원화 총액)
                BigDecimal balance = new BigDecimal(dto.getBalance());
                // 주문 대기 상태 금액 (주문 가능 금액 = balance - locked)
                BigDecimal locked  = new BigDecimal(dto.getLocked() == null ? "0" : dto.getLocked());

                // 가용 원화
                BigDecimal available = balance.subtract(locked);
                if (available.compareTo(BigDecimal.ZERO) <= 0) return null;

                // 수수료(0.05%) 제외 = 1 - 0.0005 = 0.9995
                BigDecimal spend = available.multiply(new BigDecimal("0.9995"));

                // 소수점 자리를 없애고 내림 처리
                spend = spend.setScale(0, RoundingMode.DOWN);

                // 최소 주문 금액(5000원) 보정
                if (spend.compareTo(new BigDecimal("5000")) < 0) return null;
                return spend.toPlainString();
            }
        }
        return null;
    }
}
