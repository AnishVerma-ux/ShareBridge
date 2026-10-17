package com.foodbridge.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

@Configuration
public class AppConfig {

    // Register BCryptPasswordEncoder as a Spring Bean so it can be
    // injected and reused anywhere in the application.
    @Bean
    public BCryptPasswordEncoder hashPassword() {
        return new BCryptPasswordEncoder();
    }
}