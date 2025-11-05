package com.autric.upbit.domain.order.service;

import com.autric.upbit.domain.order.entity.Orders;
import com.autric.upbit.domain.order.repository.OrderRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Slf4j
@RequiredArgsConstructor
public class OrderService {

    private final OrderRepository orderRepository;

    @Transactional
    public Orders createOrder(Orders order){
        return orderRepository.save(order);
    }
}
