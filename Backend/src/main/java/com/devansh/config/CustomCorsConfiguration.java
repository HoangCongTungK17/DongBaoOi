package com.devansh.config;

import jakarta.servlet.http.HttpServletRequest;
import org.springframework.stereotype.Component;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;

import java.util.List;

@Component
public class CustomCorsConfiguration implements CorsConfigurationSource {
    @Override
    public CorsConfiguration getCorsConfiguration(HttpServletRequest request) {
        CorsConfiguration config = new CorsConfiguration();
        
        // --- THAY ĐỔI QUAN TRỌNG NHẤT ---
        // Thay vì liệt kê từng link, ta dùng Pattern "*"
        // Nó cho phép MỌI nguồn truy cập nhưng vẫn bảo mật (cho phép Credentials)
        config.setAllowedOriginPatterns(List.of("*")); 
        // ---------------------------------
        
        config.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        config.setAllowedHeaders(List.of("*"));
        config.setAllowCredentials(true);
        return config;
    }
}