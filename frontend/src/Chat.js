import React, { useState, useRef, useEffect } from "react";
import { chat, getChatHistory } from "./api";
import styles from "./App.module.css";

function Chat() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const messagesEndRef = useRef(null);

  // Load chat history on component mount
  useEffect(() => {
    loadChatHistory();
  }, []);

  // Auto-scroll to bottom when new messages are added
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const loadChatHistory = async () => {
    try {
      const response = await getChatHistory();
      const history = response.history || [];
      
      // Convert history to message format
      const historyMessages = [];
      history.forEach((item) => {
        historyMessages.push({ sender: "user", text: item.question });
        historyMessages.push({ sender: "bot", text: item.answer });
      });
      
      setMessages(historyMessages);
    } catch (error) {
      console.error("Error loading chat history:", error);
    } finally {
      setLoadingHistory(false);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const sendMessage = async () => {
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    setInput("");
    setLoading(true);
    
    // Add user message immediately
    setMessages((prev) => [...prev, { sender: "user", text: userMessage }]);

    try {
      const response = await chat(userMessage);
      
      // Add bot response
      setMessages((prev) => [
        ...prev,
        { sender: "bot", text: response.answer }
      ]);
    } catch (error) {
      console.error("Chat error:", error);
      const errorMessage = error.response?.data?.detail || "Sorry, I encountered an error. Please try again.";
      
      setMessages((prev) => [
        ...prev,
        { sender: "bot", text: errorMessage, isError: true }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleInputChange = (e) => {
    setInput(e.target.value);
  };

  const clearChat = () => {
    if (window.confirm("Are you sure you want to clear the chat? This will only clear the current session, not your saved history.")) {
      setMessages([]);
    }
  };

  if (loadingHistory) {
    return (
      <div className={styles.chatContainer}>
        <div className={styles.chatHeader}>
          Chat
        </div>
        <div className={styles.loading}>
          <div className={styles.spinner}></div>
          Loading chat history...
        </div>
      </div>
    );
  }

  return (
    <div className={styles.chatContainer}>
      <div className={styles.chatHeader}>
        Chat with RAG Assistant
        <button 
          onClick={clearChat}
          style={{
            float: "right",
            background: "rgba(255,255,255,0.2)",
            border: "1px solid rgba(255,255,255,0.3)",
            color: "white",
            padding: "4px 12px",
            borderRadius: "4px",
            fontSize: "12px",
            cursor: "pointer"
          }}
        >
          Clear Chat
        </button>
      </div>
      
      <div className={styles.messages}>
        {messages.length === 0 ? (
          <div className={styles.textCenter} style={{ color: "#666", marginTop: "50px" }}>
            <p>Welcome! Upload a document and start asking questions.</p>
            <p>Your previous conversations will appear here.</p>
          </div>
        ) : (
          messages.map((msg, index) => (
            <div
              key={index}
              className={`${styles.message} ${
                msg.sender === "user" ? styles.userMsg : styles.botMsg
              } ${msg.isError ? styles.errorMsg : ""}`}
            >
              {msg.text}
            </div>
          ))
        )}
        
        {loading && (
          <div className={`${styles.message} ${styles.botMsg} ${styles.typing}`}>
            <div className={styles.loading}>
              <div className={styles.spinner}></div>
              Thinking...
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>
      
      <div className={styles.inputContainer}>
        <div className={styles.inputRow}>
          <textarea
            className={styles.chatInput}
            value={input}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder="Ask a question about your documents..."
            disabled={loading}
            rows={1}
            style={{
              resize: "none",
              overflow: "hidden",
              minHeight: "20px",
              maxHeight: "100px"
            }}
            onInput={(e) => {
              e.target.style.height = "auto";
              e.target.style.height = Math.min(e.target.scrollHeight, 100) + "px";
            }}
          />
          <button 
            onClick={sendMessage} 
            disabled={loading || !input.trim()}
            className={styles.sendBtn}
          >
            {loading ? "..." : "Send"}
          </button>
        </div>
        <div style={{ marginTop: "8px", fontSize: "12px", color: "#666" }}>
          Press Enter to send, Shift+Enter for new line
        </div>
      </div>
    </div>
  );
}

export default Chat;
