import React, { useState, useRef, useEffect } from "react";
import { chat, uploadFile, getDocuments } from "./api";
import styles from "./App.module.css";

function ChatInterface({ currentChat, onUpdateChat }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [uploadingFile, setUploadingFile] = useState(false);
  const [documents, setDocuments] = useState([]);
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);

  // Load current chat messages when currentChat changes
  useEffect(() => {
    if (currentChat && currentChat.messages) {
      const chatMessages = [];
      currentChat.messages.forEach((item) => {
        chatMessages.push({ sender: "user", text: item.question });
        chatMessages.push({ sender: "bot", text: item.answer });
      });
      setMessages(chatMessages);
    } else {
      setMessages([]);
    }
  }, [currentChat]);

  // Load documents on component mount
  useEffect(() => {
    loadDocuments();
  }, []);

  // Auto-scroll to bottom when new messages are added
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const loadDocuments = async () => {
    try {
      const response = await getDocuments();
      setDocuments(response.documents || []);
    } catch (error) {
      console.error("Error loading documents:", error);
    }
  };

  const sendMessage = async () => {
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    setInput("");
    setLoading(true);
    
    // Add user message immediately
    const newMessages = [...messages, { sender: "user", text: userMessage }];
    setMessages(newMessages);

    try {
      const response = await chat(userMessage);
      
      // Add bot response
      const updatedMessages = [
        ...newMessages,
        { sender: "bot", text: response.answer }
      ];
      setMessages(updatedMessages);

      // Update the current chat if needed
      if (onUpdateChat) {
        onUpdateChat(userMessage, response.answer);
      }
    } catch (error) {
      console.error("Chat error:", error);
      const errorMessage = error.response?.data?.detail || "Sorry, I encountered an error. Please try again.";
      
      setMessages(prev => [
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

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Check file type
    const allowedTypes = ['pdf', 'txt', 'docx', 'md'];
    const fileExtension = file.name.split('.').pop().toLowerCase();
    
    if (!allowedTypes.includes(fileExtension)) {
      alert("Unsupported file type. Please upload PDF, TXT, DOCX, or MD files.");
      return;
    }

    // Check file size (10MB limit)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      alert("File too large. Please upload files smaller than 10MB.");
      return;
    }

    setUploadingFile(true);

    try {
      await uploadFile(file);
      
      // Add system message about file upload
      setMessages(prev => [
        ...prev,
        { 
          sender: "system", 
          text: `📄 Document "${file.name}" uploaded successfully. You can now ask questions about it.`,
          isSystemMessage: true 
        }
      ]);

      // Reload documents to update count
      await loadDocuments();
      
    } catch (error) {
      console.error("Upload error:", error);
      const errorMessage = error.response?.data?.detail || "Upload failed. Please try again.";
      
      setMessages(prev => [
        ...prev,
        { 
          sender: "system", 
          text: `❌ Upload failed: ${errorMessage}`,
          isError: true,
          isSystemMessage: true 
        }
      ]);
    } finally {
      setUploadingFile(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const triggerFileUpload = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className={styles.chatInterface}>
      {/* Header */}
      <div className={styles.chatHeader}>
        <h2>
          {currentChat ? currentChat.title : "New Chat"}
        </h2>
        {documents.length > 0 && (
          <div className={styles.documentsIndicator}>
            📁 {documents.length} document{documents.length !== 1 ? 's' : ''} available
          </div>
        )}
      </div>

      {/* Messages Area */}
      <div className={styles.messagesContainer}>
        {messages.length === 0 ? (
          <div className={styles.welcomeMessage}>
            <div className={styles.welcomeIcon}>💬</div>
            <h3>Welcome to RAG Chat</h3>
            <p>Upload documents and start asking questions!</p>
            <div className={styles.suggestions}>
              <div>💡 Try asking:</div>
              <div className={styles.suggestionsList}>
                <span>"What is this document about?"</span>
                <span>"Summarize the main points"</span>
                <span>"What are the key findings?"</span>
              </div>
            </div>
          </div>
        ) : (
          messages.map((message, index) => (
            <div
              key={index}
              className={`${styles.message} ${
                message.sender === "user" 
                  ? styles.userMessage
                  : message.isSystemMessage 
                    ? styles.systemMessage
                    : styles.botMessage
              } ${message.isError ? styles.errorMessage : ""}`}
            >
              <div className={styles.messageContent}>
                {message.text}
              </div>
            </div>
          ))
        )}
        {loading && (
          <div className={`${styles.message} ${styles.botMessage}`}>
            <div className={styles.messageContent}>
              <div className={styles.typingIndicator}>
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className={styles.inputContainer}>
        <div className={styles.inputWrapper}>
          <button
            className={styles.attachBtn}
            onClick={triggerFileUpload}
            disabled={uploadingFile}
            title="Upload document"
          >
            {uploadingFile ? "📤" : "📎"}
          </button>
          
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.txt,.docx,.md"
            onChange={handleFileUpload}
            style={{ display: 'none' }}
          />
          
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Message RAG Chat..."
            className={styles.messageInput}
            disabled={loading}
            rows={1}
          />
          
          <button
            onClick={sendMessage}
            disabled={!input.trim() || loading}
            className={styles.sendBtn}
          >
            {loading ? "..." : "↑"}
          </button>
        </div>
        
        {uploadingFile && (
          <div className={styles.uploadProgress}>
            Uploading document...
          </div>
        )}
      </div>
    </div>
  );
}

export default ChatInterface;