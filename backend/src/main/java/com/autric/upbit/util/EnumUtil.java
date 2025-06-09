package com.autric.upbit.util;

import java.util.Arrays;

public class EnumUtil {

    public static <T extends Enum<T>> T fromValue(Class<T> enumClass, String value, ValueExtractor<T> extractor) {
        return Arrays.stream(enumClass.getEnumConstants())
                .filter(e -> extractor.getValue(e).equalsIgnoreCase(value))
                .findFirst()
                .orElseThrow(() -> new IllegalArgumentException(
                        "Unknown value [" + value + "] for enum class: " + enumClass.getSimpleName()
                ));
    }

    @FunctionalInterface
    public interface ValueExtractor<T> {
        String getValue(T enumConstant);
    }

}
