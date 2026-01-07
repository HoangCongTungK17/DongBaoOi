package com.devansh.service;

import com.devansh.request.ChatRequest;
import com.devansh.response.ChatResponse;

public interface GroqChatService {
    ChatResponse chat(ChatRequest request);
}
