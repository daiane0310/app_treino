package com.apptreino.config;

import com.apptreino.security.JwtAuthenticationFilter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthenticationFilter;

    public SecurityConfig(JwtAuthenticationFilter jwtAuthenticationFilter) {
        this.jwtAuthenticationFilter = jwtAuthenticationFilter;
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .csrf(AbstractHttpConfigurer::disable)
                .formLogin(AbstractHttpConfigurer::disable)
                .httpBasic(AbstractHttpConfigurer::disable)
                .sessionManagement(session ->
                        session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(authorize -> authorize
                        .requestMatchers(HttpMethod.GET, "/").permitAll()
                        .requestMatchers(HttpMethod.POST, "/usuarios", "/auth/login").permitAll()
                        .requestMatchers(HttpMethod.GET, "/auth/teste-admin").hasRole("ADMIN")
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
                        .requestMatchers(HttpMethod.POST, "/exercicios")
                        .hasAnyRole("ADMIN", "PERSONAL")
                        .requestMatchers(HttpMethod.PUT, "/exercicios/*")
                        .hasAnyRole("ADMIN", "PERSONAL")
                        .requestMatchers(HttpMethod.POST, "/treinos/*/exercicios")
                        .hasAnyRole("ADMIN", "PERSONAL")
                        .requestMatchers(HttpMethod.GET, "/treinos/*/exercicios")
                        .hasAnyRole("ADMIN", "PERSONAL", "ALUNO")
                        .requestMatchers(HttpMethod.PUT, "/treinos/*")
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
    public BCryptPasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}
