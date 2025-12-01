package com.autric.upbit.domain.signal.dto.response;

import com.autric.upbit.domain.signal.entity.Signals;
import lombok.Builder;
import lombok.Getter;
import org.springframework.data.domain.Page;

import java.util.List;

@Getter
@Builder
public class SignalListResponse {
    private List<SignalResponse> signals;
    private int totalPages;
    private long totalElements;
    private int currentPage;
    private int pageSize;
    private boolean hasMore;

    public static SignalListResponse fromEntity(Page<Signals> signalPage) {
        List<SignalResponse> signalResponses = signalPage.getContent().stream()
                .map(SignalResponse::fromEntity)
                .toList();

        return SignalListResponse.builder()
                .signals(signalResponses)
                .totalPages(signalPage.getTotalPages())
                .totalElements(signalPage.getTotalElements())
                .currentPage(signalPage.getNumber())
                .pageSize(signalPage.getSize())
                .hasMore(signalPage.hasNext())
                .build();
    }
}
