import axios from "axios";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:8000";

// Create axios instance with base configuration
const api = axios.create({
  baseURL: API_URL,
  timeout: 30000, // 30 seconds timeout
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle token expiration
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      window.location.href = "/";
    }
    return Promise.reject(error);
  }
);

// Auth functions
export const setAuthToken = (token) => {
  if (token) {
    localStorage.setItem("token", token);
    api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  } else {
    localStorage.removeItem("token");
    delete api.defaults.headers.common["Authorization"];
  }
};

export const getAuthToken = () => {
  return localStorage.getItem("token");
};

export const login = async (username, password) => {
  const formData = new URLSearchParams();
  formData.append("username", username);
  formData.append("password", password);
  
  const response = await api.post("/token", formData, {
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
  });
  
  return response.data;
};

export const signup = async (username, password) => {
  const formData = new URLSearchParams();
  formData.append("username", username);
  formData.append("password", password);
  
  const response = await api.post("/signup", formData, {
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
  });
  
  return response.data;
};

export const logout = () => {
  setAuthToken(null);
};

// Chat functions
export const chat = async (question) => {
  const response = await api.post("/chat", { question });
  return response.data;
};

export const getChatHistory = async () => {
  const response = await api.get("/chat/history");
  return response.data;
};

// Streaming chat function
export const chatStream = (question, onMessage, onError, onComplete) => {
  const token = getAuthToken();
  const eventSource = new EventSource(
    `${API_URL}/chat/stream?token=${token}`
  );
  
  eventSource.onmessage = (event) => {
    try {
      const data = JSON.parse(event.data);
      if (data.done) {
        onComplete && onComplete();
        eventSource.close();
      } else if (data.error) {
        onError && onError(data.error);
        eventSource.close();
      } else {
        onMessage && onMessage(data.chunk);
      }
    } catch (error) {
      onError && onError("Error parsing response");
      eventSource.close();
    }
  };
  
  eventSource.onerror = (error) => {
    onError && onError("Connection error");
    eventSource.close();
  };
  
  // Send the question to start streaming
  api.post("/chat/stream", { question }).catch((error) => {
    onError && onError(error.message);
    eventSource.close();
  });
  
  return eventSource;
};

// File upload function
export const uploadFile = async (file, onProgress) => {
  const formData = new FormData();
  formData.append("file", file);
  
  const response = await api.post("/ingest", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
    onUploadProgress: (progressEvent) => {
      if (onProgress) {
        const percentCompleted = Math.round(
          (progressEvent.loaded * 100) / progressEvent.total
        );
        onProgress(percentCompleted);
      }
    },
  });
  
  return response.data;
};

// User profile functions
export const getUserProfile = async () => {
  const response = await api.get("/user/profile");
  return response.data;
};

export const getRateLimitStatus = async () => {
  const response = await api.get("/rate-limit");
  return response.data;
};

// Documents functions
export const getDocuments = async () => {
  const response = await api.get("/documents");
  return response.data;
};

export default api;
