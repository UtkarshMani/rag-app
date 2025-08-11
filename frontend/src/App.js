import React, { useState, useEffect } from "react";
import { login, setAuthToken, getAuthToken, logout, getUserProfile } from "./api";
import Chat from "./Chat";
import FileUpload from "./FileUpload";
import styles from "./App.module.css";

function App() {
  const [token, setToken] = useState("");
  const [user, setUser] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

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
      
      setError("");
    } catch (error) {
      console.error("Login error:", error);
      setError("Login failed. Please check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    setToken("");
    setUser(null);
    setError("");
  };

  if (loading) {
    return (
      <div className={styles.container}>
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
        <>
          <div className={styles.header}>
            <h1>RAG Chat</h1>
            <p>Retrieval-Augmented Generation Application</p>
          </div>
          <form onSubmit={handleLogin} className={styles.loginForm}>
            <input 
              name="username" 
              placeholder="Username (admin or user)" 
              required 
              disabled={loading}
            />
            <input 
              name="password" 
              type="password" 
              placeholder="Password (adminpass or userpass)" 
              required 
              disabled={loading}
            />
            <button type="submit" disabled={loading}>
              {loading ? "Logging in..." : "Login"}
            </button>
            {error && <div className={styles.error}>{error}</div>}
            <div className={styles.loginHint}>
              <p><strong>Demo Credentials:</strong></p>
              <p>Admin: admin / adminpass</p>
              <p>User: user / userpass</p>
            </div>
          </form>
        </>
      ) : (
        <>
          <div className={styles.header}>
            <h1>RAG Chat Application</h1>
          </div>
          
          {user && (
            <div className={styles.userProfile}>
              <div className={styles.userInfo}>
                <h3>Welcome, {user.full_name}</h3>
                <p>Role: {user.role} | Username: {user.username}</p>
              </div>
              <button onClick={handleLogout} className={styles.logoutBtn}>
                Logout
              </button>
            </div>
          )}
          
          <FileUpload />
          <Chat />
        </>
      )}
    </div>
  );
}

export default App;
