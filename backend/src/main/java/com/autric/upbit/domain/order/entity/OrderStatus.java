package com.autric.upbit.domain.order.entity;

import com.autric.upbit.util.EnumUtil;
import com.fasterxml.jackson.annotation.JsonValue;

/**
 * 주문 상태(OrderStatus) Enum.
 *
 * <p>업비트 API 기준:
 * <ul>
 *     <li>WAIT : 대기 중 ("wait")</li>
 *     <li>WATCH : 감시 중 ("watch")</li>
 *     <li>DONE : 체결 완료 ("done")</li>
 *     <li>CANCEL : 주문 취소됨 ("cancel")</li>
 * </ul>
 *
 * 사용 예시:
 * <pre>
 * OrderStatus status = OrderStatus.fromValue("done");
 * System.out.println(status); // OrderStatus.DONE
 * </pre>
 */
public enum OrderStatus {
    WAIT("wait"),
    WATCH("watch"),
    DONE("done"),
    CANCEL("cancel");

    private final String value;

    OrderStatus(String value) {
        this.value = value;
    }

    @JsonValue
    public String getValue() {
        return value;
    }

    public static OrderStatus fromValue(String value){
        return EnumUtil.fromValue(OrderStatus.class, value, OrderStatus::getValue);
    }
}
