import axios from "axios";
import { endpoints } from "./endpoints";
import { storage } from "@/stores/storage";

export const apiClient = axios.create({
  baseURL: process.env.EXPO_PUBLIC_API_BASE_URL,
  withCredentials: true,
  timeout: 60000, // 60 seconds timeout (file uploads need longer timeout)
});

apiClient.interceptors.request.use(async (config) => {
  const accessToken = await storage.getItem("accessToken");
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }

  // Log request details for debugging
  if (config.data instanceof FormData) {
    console.log("=== FormData Request ===");
    console.log("URL:", config.url);
    console.log("Method:", config.method);
    console.log("Content-Type: multipart/form-data");
  }

  return config;
});

apiClient.interceptors.response.use(undefined, async (error) => {
  const originalRequest = error.config;

  // Log detailed error information
  console.error("=== API Error Details ===");
  console.error("URL:", originalRequest?.url);
  console.error("Method:", originalRequest?.method);
  console.error("Status:", error.response?.status);
  console.error("Error message:", error.message);
  console.error("Response data:", error.response?.data);
  console.error(
    "Network error:",
    !error.response
      ? "YES - Network/Connection Issue"
      : "NO - Server responded",
  );

  // Skip refresh logic for auth endpoints (login, register, etc.) to avoid
  // premature page reloads that swallow error toasts and network responses.
  const isAuthEndpoint = originalRequest?.url?.includes("/auth/");

  if (
    error.response?.status === 401 &&
    !originalRequest._retry &&
    !isAuthEndpoint
  ) {
    originalRequest._retry = true;

    const refreshToken = await storage.getItem("refreshToken");
    if (!refreshToken) {
      console.error("Unauthorized: missing refresh token");
      return Promise.reject(error);
    }

    try {
      const { data } = await axios.post(
        `${process.env.EXPO_PUBLIC_API_BASE_URL}${endpoints.auth}/refresh`,
        { refreshToken },
      );
      //debug (nhbt):
      console.log("REFRESH NEW TOKEN: ", data);
      const newTokens = data.data.tokens;
      await storage.setItem("accessToken", newTokens.accessToken);
      await storage.setItem("refreshToken", newTokens.refreshToken);
      originalRequest.headers.Authorization = `Bearer ${newTokens.accessToken}`;
      return apiClient(originalRequest);
    } catch (refreshError) {
      console.error("Refresh token failed", refreshError);
      return Promise.reject(refreshError);
    }
  }

  return Promise.reject(error);
});
