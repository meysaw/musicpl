package com.example.musicplayer;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class MusicPlayerApplication {

	public static void main(String[] args) {
		// Fix for Render's PostgreSQL URL format
		String dbUrl = System.getenv("DATABASE_URL");
		if (dbUrl != null && dbUrl.startsWith("postgres://")) {
			// Convert postgres://... to jdbc:postgresql://...
			String jdbcUrl = "jdbc:postgresql://" + dbUrl.substring("postgres://".length());
			System.setProperty("spring.datasource.url", jdbcUrl);
		}
		
		SpringApplication.run(MusicPlayerApplication.class, args);
	}

}
