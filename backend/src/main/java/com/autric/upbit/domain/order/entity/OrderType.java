package com.autric.upbit.domain.order.entity;

import com.autric.upbit.util.EnumUtil;
import com.fasterxml.jackson.annotation.JsonValue;

/**
 * 주문 유형(Enum).
 *
 * <p>업비트 API 기준:
 * <ul>
 *     <li>LIMIT : 지정가 주문 ("limit")</li>
 *     <li>PRICE : 시장가 매수 주문 ("price")</li>
 *     <li>MARKET : 시장가 매도 주문 ("market")</li>
 * </ul>
 *
 * 사용 예시:
 * <pre>
 * OrderType type = OrderType.fromValue("limit");
 * System.out.println(type); // OrderType.LIMIT
 * </pre>
 */

public enum OrderType {
    LIMIT("limit"),
    PRICE("price"),
    MARKET("market");

    private final String value;

    OrderType(String value) {
        this.value = value;
    }

    @JsonValue
    public String getValue() {
        return value;
    }

    public static OrderType fromValue(String value){
        return EnumUtil.fromValue(OrderType.class, value, OrderType::getValue);
    }
}
