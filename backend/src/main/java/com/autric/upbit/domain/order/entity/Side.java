package com.autric.upbit.domain.order.entity;

import com.autric.upbit.global.util.EnumUtil;
import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonValue;

/**
 * 주문 방향(Side) Enum.
 *
 * <p>업비트 API 기준:
 * <ul>
 *     <li>BID : 매수 ("bid")</li>
 *     <li>ASK : 매도 ("ask")</li>
 * </ul>
 *
 * 사용 예시:
 * <pre>
 * Side side = Side.fromValue("bid");
 * System.out.println(side); // Side.BID
 * </pre>
 */
@JsonFormat(shape = JsonFormat.Shape.OBJECT)
public enum Side {
    BID("bid"),
    ASK("ask");

    private final String value;

    Side(String value) {
        this.value = value;
    }

    @JsonValue
    public String getValue() {
        return value;
    }

    public static Side fromValue(String value){
        return EnumUtil.fromValue(Side.class, value, Side::getValue);
    }
}
