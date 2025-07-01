package com.autric.upbit;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class UpbitApplication {

	public static void main(String[] args) {
		SpringApplication.run(UpbitApplication.class, args);
	}

}
