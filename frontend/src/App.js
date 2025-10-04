import React, { useState, useEffect } from "react";
import { login, signup, setAuthToken, getAuthToken, logout, getUserProfile } from "./api";
import Sidebar from "./Sidebar";
import ChatInterface from "./ChatInterface";
import styles from "./App.module.css";

function App() {
  const [token, setToken] = useState("");
  const [user, setUser] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [currentChat, setCurrentChat] = useState(null);
  const [currentChatId, setCurrentChatId] = useState(null);
  const [chatHistory, setChatHistory] = useState([]);
  const [isSignup, setIsSignup] = useState(false);

  // Check for existing token on app load
  useEffect(() => {
    const existingToken = getAuthToken();
    if (existingToken) {
      setToken(existingToken);
      setAuthToken(existingToken);
      // Fetch user profile
      getUserProfile()
        .then((userData) => {
          setUser(userData);
        })
        .catch((error) => {
          console.error("Error fetching user profile:", error);
          logout();
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    const username = e.target.username.value;
    const password = e.target.password.value;
    
    setLoading(true);
    setError("");
    
    try {
      const response = await login(username, password);
      setToken(response.access_token);
      setAuthToken(response.access_token);
      
      // Fetch user profile after successful login
      const userData = await getUserProfile();
      setUser(userData);
      
      // Start with a new chat when user logs in
      handleNewChat();
      
      setError("");
    } catch (error) {
      console.error("Login error:", error);
      setError("Login failed. Please check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    const username = e.target.username.value;
    const password = e.target.password.value;
    const confirmPassword = e.target.confirmPassword.value;
    
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    
    if (password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }
    
    setLoading(true);
    setError("");
    
    try {
      const response = await signup(username, password);
      setToken(response.access_token);
      setAuthToken(response.access_token);
      
      // Fetch user profile after successful signup
      const userData = await getUserProfile();
      setUser(userData);
      
      // Start with a new chat when user signs up
      handleNewChat();
      
      setError("");
    } catch (error) {
      console.error("Signup error:", error);
      const errorMessage = error.response?.data?.detail || "Signup failed. Please try again.";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    setToken("");
    setUser(null);
    setError("");
    setCurrentChat(null);
    setCurrentChatId(null);
  };

  const handleNewChat = () => {
    const newChatId = `chat_${Date.now()}`;
    const newChat = {
      id: newChatId,
      title: "New Chat",
      timestamp: new Date().toISOString(),
      messages: []
    };
    
    // Add to chat history immediately
    setChatHistory(prev => [newChat, ...prev]);
    setCurrentChat(newChat);
    setCurrentChatId(newChatId);
  };

  const handleSelectChat = (chat) => {
    setCurrentChat(chat);
    setCurrentChatId(chat.id);
  };

  const handleDeleteChat = async (chatId) => {
    // Remove from chat history
    const updatedHistory = chatHistory.filter(chat => chat.id !== chatId);
    setChatHistory(updatedHistory);
    
    // If deleting current chat, either select another chat or create new one
    if (currentChatId === chatId) {
      if (updatedHistory.length > 0) {
        // Select the first remaining chat
        const firstChat = updatedHistory[0];
        setCurrentChat(firstChat);
        setCurrentChatId(firstChat.id);
      } else {
        // No chats left, create a new one
        const newChatId = `chat_${Date.now()}`;
        const newChat = {
          id: newChatId,
          title: "New Chat",
          timestamp: new Date().toISOString(),
          messages: []
        };
        setChatHistory([newChat]);
        setCurrentChat(newChat);
        setCurrentChatId(newChatId);
      }
    }
    
    return Promise.resolve();
  };

  const handleUpdateChat = (question, answer) => {
    if (currentChat) {
      const updatedChat = {
        ...currentChat,
        messages: [
          ...(currentChat.messages || []),
          { question, answer, timestamp: new Date().toISOString() }
        ],
        title: currentChat.title === "New Chat" 
          ? (question.length > 30 ? question.substring(0, 30) + "..." : question)
          : currentChat.title
      };
      
      // Update current chat
      setCurrentChat(updatedChat);
      
      // Update in chat history
      setChatHistory(prev => 
        prev.map(chat => 
          chat.id === currentChat.id ? updatedChat : chat
        )
      );
    }
  };

  if (loading) {
    return (
      <div className={styles.loginContainer}>
        <div className={styles.loading}>
          <div className={styles.spinner}></div>
          Loading...
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {!token ? (
        <div className={styles.loginContainer}>
          <div className={styles.header}>
            <h1>RAG Chat</h1>
            <p>Retrieval-Augmented Generation Application</p>
          </div>
          
          <div className={styles.authToggle}>
            <button 
              className={`${styles.toggleBtn} ${!isSignup ? styles.active : ''}`}
              onClick={() => {setIsSignup(false); setError('');}}
              type="button"
            >
              Sign In
            </button>
            <button 
              className={`${styles.toggleBtn} ${isSignup ? styles.active : ''}`}
              onClick={() => {setIsSignup(true); setError('');}}
              type="button"
            >
              Create Account
            </button>
          </div>

          <form onSubmit={isSignup ? handleSignup : handleLogin} className={styles.loginForm}>
            <input 
              name="username" 
              placeholder={isSignup ? "Choose a username" : "Username"} 
              required 
              disabled={loading}
            />
            <input 
              name="password" 
              type="password" 
              placeholder={isSignup ? "Choose a password (min 6 characters)" : "Password"} 
              required 
              disabled={loading}
              minLength={isSignup ? "6" : undefined}
            />
            {isSignup && (
              <input 
                name="confirmPassword" 
                type="password" 
                placeholder="Confirm password" 
                required 
                disabled={loading}
                minLength="6"
              />
            )}
            <button type="submit" disabled={loading}>
              {loading ? (isSignup ? "Creating Account..." : "Signing In...") : (isSignup ? "Create Account" : "Sign In")}
            </button>
            {error && <div className={styles.error}>{error}</div>}
            
            {!isSignup && (
              <div className={styles.loginHint}>
                <p><strong>Demo Credentials:</strong></p>
                <p>Admin: admin / adminpass</p>
                <p>User: user / userpass</p>
              </div>
            )}
            
            {isSignup && (
              <div className={styles.signupHint}>
                <p>Create your own account to get started!</p>
                <p>Your account will have user permissions.</p>
                <p><small>Note: "admin" and "user" are reserved usernames.</small></p>
              </div>
            )}
          </form>
        </div>
      ) : (
        <div className={styles.chatApp}>
          <Sidebar
            currentChatId={currentChatId}
            chatHistory={chatHistory}
            onNewChat={handleNewChat}
            onSelectChat={handleSelectChat}
            onDeleteChat={handleDeleteChat}
            user={user}
            onLogout={handleLogout}
          />
          <ChatInterface
            currentChat={currentChat}
            onUpdateChat={handleUpdateChat}
          />
        </div>
      )}
    </div>
  );
}

export default App;
