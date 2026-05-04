package com.backend.deopuri;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication(scanBasePackages = "com.backend.deopuri")
public class DeopuriApplication {

	public static void main(String[] args) {
		SpringApplication.run(DeopuriApplication.class, args);
	}

}
