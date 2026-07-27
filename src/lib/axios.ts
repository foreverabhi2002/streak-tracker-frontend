import axios from "axios";
import { toast } from "sonner";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001",
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor to append authorization token
api.interceptors.request.use(
  (config) => {
    // We only access localStorage in the browser environment
    if (typeof window !== "undefined") {
      const userStr = localStorage.getItem("user");
      if (userStr) {
        try {
          const user = JSON.parse(userStr);
          // Check if your user object stores the token as user.accessToken or another property
          if (user.accessToken) {
            config.headers.Authorization = `Bearer ${user.accessToken}`;
          }
        } catch (error) {
          console.error("Error parsing user data from localStorage", error);
        }
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// Response interceptor to handle global errors
api.interceptors.response.use(
  (response) => {
    // Show success toast if there's a message and it's a mutation request
    if (
      response.data?.message &&
      response.config.method?.toLowerCase() !== "get"
    ) {
      toast.success(response.data.message);
    }
    return response;
  },
  (error) => {
    // Show error toast
    const message =
      error.response?.data?.message || error.message || "An error occurred";
    toast.error(message);

    if (error.response) {
      // Handle 401 Unauthorized globally
      if (error.response.status === 401) {
        if (typeof window !== "undefined") {
          // Clear session data
          localStorage.removeItem("user");
          // Optional: redirect to login if not already there
          if (window.location.pathname !== "/login") {
            window.location.href = "/login";
          }
        }
      }
    }
    return Promise.reject(error);
  },
);

export default api;
