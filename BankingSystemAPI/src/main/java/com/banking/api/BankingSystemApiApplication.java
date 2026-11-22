package com.banking.api;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.security.servlet.UserDetailsServiceAutoConfiguration;

//@SpringBootApplication
//public class BankingSystemApiApplication {
//
//	public static void main(String[] args) {
//		SpringApplication.run(
//				BankingSystemApiApplication.class,
//				args
//		);
//	}
//}



@SpringBootApplication(
		exclude = UserDetailsServiceAutoConfiguration.class
)
public class BankingSystemApiApplication {

	public static void main(String[] args) {
		SpringApplication.run(
				BankingSystemApiApplication.class, args
		);
	}
}