package com.autric.upbit.domain.signal.entity;

import com.autric.upbit.util.EnumUtil;
import com.fasterxml.jackson.annotation.JsonValue;

/**
 * 매매 신호 유형(SignalType) Enum.
 *
 * <p>업비트 API 기준:
 * <ul>
 *     <li>ENTRY : 신규 진입 ("entry")</li>
 *     <li>EXIT  : 청산 ("exit")</li>
 *     <li>CANCEL : 주문 취소 ("cancel")</li>
 * </ul>
 *
 * 사용 예시:
 * <pre>
 * SignalType type = SignalType.fromValue("entry");
 * System.out.println(type); // SignalType.ENTRY
 * </pre>
 */
public enum SignalType {
    ENTRY("entry"),
    EXIT("exit"),
    CANCEL("cancel");

    private final String value;

    SignalType(String value) {
        this.value = value;
    }

    @JsonValue
    public String getValue() {
        return value;
    }

    public static SignalType fromValue(String value) {
        return EnumUtil.fromValue(SignalType.class, value, SignalType::getValue);
    }
}
