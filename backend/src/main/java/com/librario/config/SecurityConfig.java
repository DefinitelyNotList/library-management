package com.librario.config;

import com.librario.service.CustomUserDetailsService;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.http.HttpMethod;

import java.util.List;

@Configuration
@EnableMethodSecurity
public class SecurityConfig {

    private final JwtFilter jwtFilter;
    private final CustomUserDetailsService userDetailsService;

    public SecurityConfig(JwtFilter jwtFilter, CustomUserDetailsService userDetailsService) {
        this.jwtFilter = jwtFilter;
        this.userDetailsService = userDetailsService;
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        return http
                .cors(cors -> cors
                        .configurationSource(request -> {
                            var corsConfig = new org.springframework.web.cors.CorsConfiguration();
                            String frontendUrls = System.getenv().getOrDefault("APP_FRONTEND_URL", "");
                            java.util.List<String> patterns = new java.util.ArrayList<>();
                            
                            // Mặc định hỗ trợ localhost và tất cả domain vercel
                            patterns.add("http://localhost:*");
                            patterns.add("https://*.vercel.app");

                            if (!frontendUrls.isBlank()) {
                                for (String url : frontendUrls.split(",")) {
                                    String trimmed = url.trim();
                                    if (trimmed.endsWith("/")) {
                                        trimmed = trimmed.substring(0, trimmed.length() - 1);
                                    }
                                    if (!trimmed.isEmpty() && !patterns.contains(trimmed)) {
                                        patterns.add(trimmed);
                                    }
                                }
                            }

                            corsConfig.setAllowedOriginPatterns(patterns);
                            corsConfig.setAllowedMethods(java.util.List.of("GET", "POST", "PUT", "DELETE", "OPTIONS", "HEAD"));
                            corsConfig.setAllowedHeaders(java.util.List.of("*"));
                            corsConfig.setExposedHeaders(java.util.List.of("Authorization", "Content-Type"));
                            corsConfig.setAllowCredentials(true);
                            return corsConfig;
                        })
                )
                .csrf(csrf -> csrf.disable())
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers(
                                "/api/auth/**",
                                "/api/users/login",
                                "/api/users/register",
                                "/api/users/forgot-password",
                                "/api/users/reset-password"
                        ).permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/books/**").permitAll()
                        .requestMatchers("/api/library/statistics", "/api/library/top-books")
                        .authenticated()
                        .requestMatchers("/api/library/borrows/history")
                        .authenticated()
                        .requestMatchers("/api/library/**")
                        .hasAnyRole("ADMIN", "LIBRARIAN")
                        .anyRequest().authenticated()
                )
                .sessionManagement(sess -> sess.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authenticationProvider(authenticationProvider())
                .addFilterBefore(jwtFilter, UsernamePasswordAuthenticationFilter.class)
                .build();
    }

    @Bean
    public AuthenticationProvider authenticationProvider() {
        DaoAuthenticationProvider provider = new DaoAuthenticationProvider();
        provider.setUserDetailsService(userDetailsService);
        provider.setPasswordEncoder(passwordEncoder());
        return provider;
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }
}
