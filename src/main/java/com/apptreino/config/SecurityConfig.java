package com.apptreino.config;

import com.apptreino.security.JwtAuthenticationFilter;
import com.apptreino.security.RestAccessDeniedHandler;
import com.apptreino.security.RestAuthenticationEntryPoint;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;
import java.util.List;

@Configuration
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthenticationFilter;
    private final RestAuthenticationEntryPoint restAuthenticationEntryPoint;
    private final RestAccessDeniedHandler restAccessDeniedHandler;

    public SecurityConfig(
            JwtAuthenticationFilter jwtAuthenticationFilter,
            RestAuthenticationEntryPoint restAuthenticationEntryPoint,
            RestAccessDeniedHandler restAccessDeniedHandler
    ) {
        this.jwtAuthenticationFilter = jwtAuthenticationFilter;
        this.restAuthenticationEntryPoint = restAuthenticationEntryPoint;
        this.restAccessDeniedHandler = restAccessDeniedHandler;
    }

    @Bean
    public SecurityFilterChain securityFilterChain(
            HttpSecurity http,
            CorsConfigurationSource corsConfigurationSource
    ) throws Exception {
        http
                .cors(cors -> cors.configurationSource(corsConfigurationSource))
                .csrf(AbstractHttpConfigurer::disable)
                .formLogin(AbstractHttpConfigurer::disable)
                .httpBasic(AbstractHttpConfigurer::disable)
                .exceptionHandling(exception -> exception
                        .authenticationEntryPoint(restAuthenticationEntryPoint)
                        .accessDeniedHandler(restAccessDeniedHandler))
                .sessionManagement(session ->
                        session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(authorize -> authorize
                        .requestMatchers(HttpMethod.GET, "/").permitAll()
                        .requestMatchers(HttpMethod.POST, "/usuarios", "/auth/login").permitAll()
                        .requestMatchers(HttpMethod.GET, "/auth/teste-admin").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.GET, "/usuarios/me")
                        .hasAnyRole("ADMIN", "PERSONAL", "ALUNO")
                        .requestMatchers(HttpMethod.GET, "/personais/me/alunos")
                        .hasRole("PERSONAL")
                        .requestMatchers(HttpMethod.POST, "/personais/*/alunos/*")
                        .hasAnyRole("ADMIN", "PERSONAL")
                        .requestMatchers(HttpMethod.POST, "/alunos/*/treinos")
                        .hasAnyRole("ADMIN", "PERSONAL")
                        .requestMatchers(HttpMethod.GET, "/alunos/me/treinos")
                        .hasRole("ALUNO")
                        .requestMatchers(HttpMethod.GET, "/alunos/*/treinos")
                        .hasAnyRole("ADMIN", "PERSONAL")
                        .requestMatchers(HttpMethod.GET, "/alunos/me/execucoes")
                        .hasRole("ALUNO")
                        .requestMatchers(HttpMethod.GET, "/alunos/*/execucoes")
                        .hasAnyRole("ADMIN", "PERSONAL")
                        .requestMatchers(HttpMethod.GET, "/exercicios")
                        .hasAnyRole("ADMIN", "PERSONAL")
                        .requestMatchers(HttpMethod.POST, "/exercicios")
                        .hasAnyRole("ADMIN", "PERSONAL")
                        .requestMatchers(HttpMethod.PUT, "/exercicios/*")
                        .hasAnyRole("ADMIN", "PERSONAL")
                        .requestMatchers(HttpMethod.POST, "/treinos/*/exercicios")
                        .hasAnyRole("ADMIN", "PERSONAL")
                        .requestMatchers(HttpMethod.GET, "/treinos/*/exercicios")
                        .hasAnyRole("ADMIN", "PERSONAL", "ALUNO")
                        .requestMatchers(HttpMethod.GET, "/treinos/*")
                        .hasAnyRole("ADMIN", "PERSONAL", "ALUNO")
                        .requestMatchers(HttpMethod.PUT, "/treinos/*")
                        .hasAnyRole("ADMIN", "PERSONAL")
                        .requestMatchers(HttpMethod.PUT, "/treinos/*/exercicios/ordem")
                        .hasAnyRole("ADMIN", "PERSONAL")
                        .requestMatchers(HttpMethod.PUT, "/treinos/*/exercicios/*")
                        .hasAnyRole("ADMIN", "PERSONAL")
                        .requestMatchers(HttpMethod.DELETE, "/treinos/*/exercicios/*")
                        .hasAnyRole("ADMIN", "PERSONAL")
                        .requestMatchers(HttpMethod.POST, "/treinos/*/execucoes")
                        .hasRole("ALUNO")
                        .requestMatchers(HttpMethod.PUT, "/execucoes/*/exercicios/*")
                        .hasRole("ALUNO")
                        .requestMatchers(HttpMethod.POST, "/execucoes/*/finalizar")
                        .hasRole("ALUNO")
                        .requestMatchers(HttpMethod.GET, "/execucoes/*")
                        .hasAnyRole("ADMIN", "PERSONAL", "ALUNO")
                        .anyRequest().authenticated()
                )
                .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource(
            @Value("${app.cors.allowed-origins}") String allowedOriginsProperty
    ) {
        List<String> allowedOrigins = Arrays.stream(allowedOriginsProperty.split(",", -1))
                .map(String::trim)
                .toList();

        if (allowedOrigins.isEmpty() || allowedOrigins.stream().anyMatch(String::isBlank)) {
            throw new IllegalArgumentException("A lista de origens CORS não pode ser vazia");
        }
        if (allowedOrigins.stream().anyMatch(origin -> origin.contains("*"))) {
            throw new IllegalArgumentException("Origens CORS não podem conter wildcard");
        }
        if (allowedOrigins.stream().anyMatch(origin -> origin.endsWith("/"))) {
            throw new IllegalArgumentException("Origens CORS não podem terminar com barra");
        }

        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOrigins(allowedOrigins);
        configuration.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(List.of("Authorization", "Content-Type", "Accept"));
        configuration.setAllowCredentials(false);
        configuration.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }

    @Bean
    public BCryptPasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}
