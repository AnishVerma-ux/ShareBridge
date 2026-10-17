package com.foodbridge.config;

import com.foodbridge.security.JwtFilter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import java.util.List;

@Configuration
@EnableMethodSecurity
public class SecurityConfig {
    private final JwtFilter jwtFilter;
    public SecurityConfig(JwtFilter jwtFilter) { this.jwtFilter = jwtFilter; }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http.csrf(csrf -> csrf.disable())
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/uploads/**", "/swagger-ui/**", "/v3/api-docs/**").permitAll()
                .requestMatchers(HttpMethod.POST, "/users", "/users/login").permitAll()
                .requestMatchers(HttpMethod.GET, "/users").hasAuthority("ADMIN")
                .requestMatchers("/users/admin/**").hasAuthority("ADMIN")
                .requestMatchers("/users/profile", "/users/profile/**").authenticated()
                .requestMatchers(HttpMethod.GET, "/donation-requests/open").hasAuthority("DONOR")
                .requestMatchers(HttpMethod.POST, "/donation-requests").hasAuthority("NGO")
                .requestMatchers(HttpMethod.GET, "/donation-requests/mine").hasAuthority("NGO")
                .requestMatchers(HttpMethod.POST, "/donations").hasAuthority("DONOR")
                .requestMatchers(HttpMethod.GET, "/donations/available").hasAuthority("NGO")
                .requestMatchers(HttpMethod.PUT, "/donations/*/accept").hasAuthority("NGO")
                .requestMatchers(HttpMethod.GET, "/donations/accepted").hasAuthority("VOLUNTEER")
                .requestMatchers(HttpMethod.PUT, "/donations/*/assign", "/donations/*/pickup", "/donations/*/deliver").hasAuthority("VOLUNTEER")
                .requestMatchers(HttpMethod.GET, "/donations/my-donations", "/donations/*/history").authenticated()
                .requestMatchers(HttpMethod.GET, "/donations").hasAuthority("ADMIN")
                .requestMatchers("/users/**").permitAll()
                .anyRequest().authenticated())
            .addFilterBefore(jwtFilter, UsernamePasswordAuthenticationFilter.class);
        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOrigins(List.of("http://localhost:5173", "http://127.0.0.1:5173"));
        configuration.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(List.of("*"));
        configuration.setAllowCredentials(true);
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}
