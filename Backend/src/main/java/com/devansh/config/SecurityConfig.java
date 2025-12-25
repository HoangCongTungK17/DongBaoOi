package com.devansh.config;

import com.devansh.model.enums.Role;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.CsrfConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.security.web.authentication.logout.LogoutHandler;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthFilter;
    private final AuthenticationProvider authenticationProvider;
    private final LogoutHandler logoutHandler;
    private final CustomCorsConfiguration corsConfiguration;

    public SecurityConfig(JwtAuthenticationFilter jwtAuthFilter,
                          AuthenticationProvider authenticationProvider,
                          LogoutHandler logoutHandler,
                          CustomCorsConfiguration corsConfiguration) {
        this.jwtAuthFilter = jwtAuthFilter;
        this.authenticationProvider = authenticationProvider;
        this.logoutHandler = logoutHandler;
        this.corsConfiguration = corsConfiguration;
    }

    @Bean
    public SecurityFilterChain configure(HttpSecurity http) throws Exception {

        http
                .csrf(CsrfConfigurer::disable) // Tắt CSRF để cho phép Seeder/Postman gọi API
                .authorizeHttpRequests(authorize -> authorize
                        // 1. Cho phép truy cập tự do vào Auth (Login/Signup)
                        .requestMatchers("/auth/**").permitAll()
                        
                        // 2. [QUAN TRỌNG] Cho phép truy cập API SOS để Seeder nạp dữ liệu
                        // Sau khi nạp xong, bạn có thể comment dòng này lại để bảo mật
                        .requestMatchers("/sos/**").permitAll() 
                        .requestMatchers("/zones/**").permitAll() 

                        // 3. Cấu hình quyền Admin
                        // Lưu ý: Dùng hasAuthority an toàn hơn hasRole nếu DB lưu "ADMIN" thay vì "ROLE_ADMIN"
                        .requestMatchers("/admin/**").hasAuthority(Role.ADMIN.name())

                        // 4. Các request còn lại bắt buộc phải có Token
                        .anyRequest().authenticated()
                )
                .sessionManagement(session ->
                        session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authenticationProvider(authenticationProvider)
                .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class)
                .logout(logout ->
                        logout.logoutUrl("/auth/logout")
                                .addLogoutHandler(logoutHandler)
                                .logoutSuccessHandler((request, response, authentication) ->
                                        SecurityContextHolder.clearContext()
                                ))
                .cors(c -> c.configurationSource(corsConfiguration));

        return http.build();
    }
}



















