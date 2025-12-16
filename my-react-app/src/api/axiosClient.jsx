// src/api/axiosClient.js
import axios from "axios";

const axiosClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:8080/api/v1",
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Axios instance rieng cho crawl operations (timeout dai hon)
export const axiosClientForCrawl = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:8080/api/v1",
  timeout: 60000, // 60 seconds for crawl operations
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor
axiosClient.interceptors.request.use(
  (config) => {
    // Thử các key token khác nhau trong localStorage
    const token =
      localStorage.getItem("accessToken") ||
      localStorage.getItem("token") ||
      localStorage.getItem("adminToken");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    console.log("Request Headers:", config.headers);
    console.log(
      "Token being sent:",
      token ? `${token.substring(0, 20)}...` : "No token"
    );
    console.log("Request:", config.method?.toUpperCase(), config.url);

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
axiosClient.interceptors.response.use(
  (response) => {
    console.log("Response:", response.status, response.config.url);
    
    // Unwrap ApiResponse: Tự động trả về response.data.result nếu code === 1000
    if (response.data && response.data.code === 1000 && response.data.result !== undefined) {
      return response.data.result;
    }
    
    // Nếu không có cấu trúc ApiResponse, trả về data như cũ
    return response.data || response;
  },
  (error) => {
    console.error(
      "API Error:",
      error.response?.status,
      error.response?.data || error.message
    );

    if (error.response?.status === 401) {
      console.log("Unauthorized - clearing tokens and redirecting to login");
      // Clear all possible token keys
      localStorage.removeItem("accessToken");
      localStorage.removeItem("token");
      localStorage.removeItem("adminToken");
      localStorage.removeItem("userRoles");
      localStorage.removeItem("username");

      // Redirect to login if not already there
      if (!window.location.pathname.includes("/login")) {
        window.location.href = "/login";
      }
    }

    return Promise.reject(error);
  }
);

// Apply same interceptors to crawl client
axiosClientForCrawl.interceptors.request.use(
  (config) => {
    const token =
      localStorage.getItem("accessToken") ||
      localStorage.getItem("token") ||
      localStorage.getItem("adminToken");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    console.log("Crawl Request:", config.method?.toUpperCase(), config.url);
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

axiosClientForCrawl.interceptors.response.use(
  (response) => {
    console.log("Crawl Response:", response.status, response.config.url);
    
    if (response.data && response.data.code === 1000 && response.data.result !== undefined) {
      return response.data.result;
    }
    
    return response.data || response;
  },
  (error) => {
    console.error("Crawl Error:", error.response?.status, error.message);
    
    if (error.response?.status === 401) {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("token");
      localStorage.removeItem("adminToken");
      window.location.href = "/login";
    }
    
    return Promise.reject(error);
  }
);

export default axiosClient;
