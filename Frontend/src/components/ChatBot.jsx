import React, { useState, useRef, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { MessageCircle, X, Send, Trash2, Bot, User, AlertTriangle, Phone, Loader2 } from "lucide-react";
import { sendMessage, clearChat } from "../Redux/Chat/Action";

function ChatBot() {
  const dispatch = useDispatch();
  const { messages, loading, context } = useSelector((store) => store.chatStore);
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Auto scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Focus input when chat opens
  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus();
    }
  }, [isOpen]);

  const handleSend = () => {
    if (input.trim() && !loading) {
      const history = messages
        .filter((m) => !m.isError)
        .map((m) => ({ role: m.role, content: m.content }));
      dispatch(sendMessage(input.trim(), history, context));
      setInput("");
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const quickActions = [
    { text: "Cách sơ tán khi lũ lụt?", icon: "🌊" },
    { text: "Sơ cứu người bị thương", icon: "🩹" },
    { text: "Số điện thoại khẩn cấp", icon: "📞" },
    { text: "Chuẩn bị đồ khẩn cấp", icon: "🎒" },
  ];

  const handleQuickAction = (text) => {
    if (!loading) {
      const history = messages
        .filter((m) => !m.isError)
        .map((m) => ({ role: m.role, content: m.content }));
      dispatch(sendMessage(text, history, context));
    }
  };

  return (
    <>
      {/* Floating Chat Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed bottom-6 right-6 z-50 p-4 rounded-full shadow-lg transition-all duration-300 ${
          isOpen
            ? "bg-slate-700 hover:bg-slate-600"
            : "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 animate-pulse hover:animate-none"
        }`}
      >
        {isOpen ? (
          <X className="h-6 w-6 text-white" />
        ) : (
          <MessageCircle className="h-6 w-6 text-white" />
        )}
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 z-50 w-[380px] max-w-[calc(100vw-2rem)] h-[550px] max-h-[calc(100vh-8rem)] bg-slate-900 rounded-2xl shadow-2xl border border-slate-700 flex flex-col overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/20 rounded-lg">
                <Bot className="h-5 w-5 text-white" />
              </div>
              <div>
                <h3 className="text-white font-semibold text-sm">DongBaoOi AI Assistant</h3>
                <p className="text-white/70 text-xs">Trợ lý khẩn cấp 24/7</p>
              </div>
            </div>
            <button
              onClick={() => dispatch(clearChat())}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              title="Xóa lịch sử chat"
            >
              <Trash2 className="h-4 w-4 text-white/70" />
            </button>
          </div>

          {/* Emergency Banner */}
          <div className="bg-red-900/50 border-b border-red-800/50 px-4 py-2 flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-red-400 flex-shrink-0" />
            <p className="text-red-200 text-xs">
              Nếu khẩn cấp, gọi ngay:{" "}
              <a href="tel:112" className="font-bold underline">
                112
              </a>{" "}
              |{" "}
              <a href="tel:113" className="font-bold underline">
                113
              </a>{" "}
              |{" "}
              <a href="tel:115" className="font-bold underline">
                115
              </a>
            </p>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex gap-3 ${msg.role === "user" ? "flex-row-reverse" : ""}`}
              >
                {/* Avatar */}
                <div
                  className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                    msg.role === "user"
                      ? "bg-blue-600"
                      : msg.isError
                      ? "bg-red-600"
                      : "bg-indigo-600"
                  }`}
                >
                  {msg.role === "user" ? (
                    <User className="h-4 w-4 text-white" />
                  ) : (
                    <Bot className="h-4 w-4 text-white" />
                  )}
                </div>

                {/* Message Bubble */}
                <div
                  className={`max-w-[75%] rounded-2xl px-4 py-2.5 ${
                    msg.role === "user"
                      ? "bg-blue-600 text-white rounded-tr-none"
                      : msg.isError
                      ? "bg-red-900/50 text-red-200 border border-red-800 rounded-tl-none"
                      : "bg-slate-800 text-slate-100 rounded-tl-none"
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                </div>
              </div>
            ))}

            {/* Loading indicator */}
            {loading && (
              <div className="flex gap-3">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center">
                  <Bot className="h-4 w-4 text-white" />
                </div>
                <div className="bg-slate-800 rounded-2xl rounded-tl-none px-4 py-3">
                  <div className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 text-indigo-400 animate-spin" />
                    <span className="text-slate-400 text-sm">Đang trả lời...</span>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick Actions */}
          {messages.length <= 2 && (
            <div className="px-4 py-2 border-t border-slate-800">
              <p className="text-slate-500 text-xs mb-2">Hỏi nhanh:</p>
              <div className="flex flex-wrap gap-2">
                {quickActions.map((action, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleQuickAction(action.text)}
                    disabled={loading}
                    className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs rounded-full transition-colors disabled:opacity-50 flex items-center gap-1"
                  >
                    <span>{action.icon}</span>
                    <span>{action.text}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input Area */}
          <div className="p-4 border-t border-slate-800 bg-slate-900/50">
            <div className="flex gap-2">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Nhập câu hỏi của bạn..."
                disabled={loading}
                className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50"
              />
              <button
                onClick={handleSend}
                disabled={!input.trim() || loading}
                className="p-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-700 disabled:cursor-not-allowed rounded-xl transition-colors"
              >
                <Send className="h-5 w-5 text-white" />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default ChatBot;
