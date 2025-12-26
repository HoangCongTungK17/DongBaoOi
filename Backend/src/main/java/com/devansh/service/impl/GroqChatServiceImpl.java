package com.devansh.service.impl;

import com.devansh.request.ChatRequest;
import com.devansh.response.ChatResponse;
import com.devansh.service.GroqChatService;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@Slf4j
public class GroqChatServiceImpl implements GroqChatService {

    @Value("${groq.api.key:}")
    private String groqApiKey;

    @Value("${groq.api.url:https://api.groq.com/openai/v1/chat/completions}")
    private String groqApiUrl;

    @Value("${groq.api.model:llama-3.3-70b-versatile}")
    private String groqModel;

    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;

    private static final String SYSTEM_PROMPT = """
        Bạn là DongBaoOi AI Assistant - trợ lý khẩn cấp thông minh chuyên về ứng phó thảm họa và cứu hộ tại Việt Nam.

        NHIỆM VỤ CHÍNH:
        1. Hướng dẫn sơ tán và di chuyển an toàn khi có thảm họa
        2. Cung cấp hướng dẫn sơ cứu cơ bản
        3. Tư vấn cách ứng phó với các loại thảm họa: lũ lụt, động đất, sạt lở, bão, cháy rừng, cháy nhà
        4. Cung cấp số điện thoại khẩn cấp và thông tin liên hệ cứu hộ
        5. Hướng dẫn chuẩn bị đồ dùng khẩn cấp và lên kế hoạch ứng phó

        NGUYÊN TẮC:
        - Luôn ưu tiên AN TOÀN TÍNH MẠNG
        - Trả lời ngắn gọn, rõ ràng, dễ hiểu
        - Sử dụng tiếng Việt, có thể dùng tiếng Anh khi cần thiết
        - Nếu tình huống khẩn cấp, hướng dẫn GỌI 113 (Công an), 114 (Cứu hỏa), 115 (Cấp cứu) NGAY
        - Không đưa ra lời khuyên y tế chuyên sâu, khuyên người dùng đến cơ sở y tế

        SỐ ĐIỆN THOẠI KHẨN CẤP:
        - Công an: 113
        - Cứu hỏa: 114
        - Cấp cứu y tế: 115
        - Cứu nạn cứu hộ: 112
        - Đường dây nóng thiên tai: 1900 0091

        Hãy trả lời thân thiện, bình tĩnh và chuyên nghiệp. Nếu người dùng đang hoảng loạn, hãy giúp họ bình tĩnh trước.
        """;

    public GroqChatServiceImpl() {
        this.restTemplate = new RestTemplate();
        this.objectMapper = new ObjectMapper();
    }

    @Override
    public ChatResponse chat(ChatRequest request) {
        try {
            if (groqApiKey == null || groqApiKey.isEmpty()) {
                log.error("Groq API key is not configured");
                return ChatResponse.builder()
                        .success(false)
                        .error("AI service is not configured. Please contact administrator.")
                        .build();
            }

            // Build messages array
            List<Map<String, String>> messages = new ArrayList<>();

            // Add system prompt with context if available
            String systemPrompt = SYSTEM_PROMPT;
            if (request.getContext() != null && !request.getContext().isEmpty()) {
                systemPrompt += "\n\nNGỮ CẢNH HIỆN TẠI: " + request.getContext();
            }
            messages.add(Map.of("role", "system", "content", systemPrompt));

            // Add conversation history
            if (request.getHistory() != null) {
                for (ChatRequest.ChatMessage msg : request.getHistory()) {
                    messages.add(Map.of("role", msg.getRole(), "content", msg.getContent()));
                }
            }

            // Add current message
            messages.add(Map.of("role", "user", "content", request.getMessage()));

            // Build request body
            Map<String, Object> requestBody = new HashMap<>();
            requestBody.put("model", groqModel);
            requestBody.put("messages", messages);
            requestBody.put("temperature", 0.7);
            requestBody.put("max_tokens", 1024);

            // Set headers
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.setBearerAuth(groqApiKey);

            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);

            // Make API call
            ResponseEntity<String> response = restTemplate.exchange(
                    groqApiUrl,
                    HttpMethod.POST,
                    entity,
                    String.class
            );

            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                JsonNode jsonNode = objectMapper.readTree(response.getBody());
                String assistantMessage = jsonNode
                        .path("choices")
                        .path(0)
                        .path("message")
                        .path("content")
                        .asText();

                return ChatResponse.builder()
                        .success(true)
                        .message(assistantMessage)
                        .build();
            } else {
                log.error("Groq API error: {}", response.getBody());
                return ChatResponse.builder()
                        .success(false)
                        .error("Failed to get response from AI service")
                        .build();
            }

        } catch (Exception e) {
            log.error("Error calling Groq API: ", e);
            return ChatResponse.builder()
                    .success(false)
                    .error("An error occurred: " + e.getMessage())
                    .build();
        }
    }
}
