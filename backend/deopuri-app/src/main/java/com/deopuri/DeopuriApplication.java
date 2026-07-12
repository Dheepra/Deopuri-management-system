package com.deopuri;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;

@SpringBootApplication(scanBasePackages = "com.deopuri")
@EnableJpaAuditing // enables BaseEntity @CreatedBy/@LastModifiedBy via AuditorAwareImpl

public class DeopuriApplication {

	public static void main(String[] args) {
		SpringApplication.run(DeopuriApplication.class, args);
	}

}
