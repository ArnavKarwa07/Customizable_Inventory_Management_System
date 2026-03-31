import axios, { AxiosError } from "axios";

import { clearTokens, getTokens, setTokens } from "@/lib/auth-storage";

const baseURL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api/v1";

export const apiClient = axios.create({ baseURL });

let isRefreshing = false;
let pendingQueue: Array<(token: string | null) => void> = [];

function processQueue(token: string | null): void {
  pendingQueue.forEach((resolve) => resolve(token));
  pendingQueue = [];
}

apiClient.interceptors.request.use((config) => {
  const tokens = getTokens();
  if (tokens?.accessToken) {
    config.headers.Authorization = `Bearer ${tokens.accessToken}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config;
    if (!originalRequest) {
      return Promise.reject(error);
    }

    const status = error.response?.status;
    const isRetryAttempt = (originalRequest as { _retry?: boolean })._retry;

    if (status !== 401 || isRetryAttempt) {
      return Promise.reject(error);
    }

    const tokens = getTokens();
    if (!tokens?.refreshToken) {
      clearTokens();
      return Promise.reject(error);
    }

    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        pendingQueue.push((newToken) => {
          if (!newToken) {
            reject(error);
            return;
          }
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          resolve(apiClient(originalRequest));
        });
      });
    }

    (originalRequest as { _retry?: boolean })._retry = true;
    isRefreshing = true;

    try {
      const refreshResponse = await axios.post(`${baseURL}/auth/refresh`, {
        refresh_token: tokens.refreshToken,
      });

      const newAccess = refreshResponse.data.access_token as string;
      const newRefresh = refreshResponse.data.refresh_token as string;
      setTokens({ accessToken: newAccess, refreshToken: newRefresh });
      processQueue(newAccess);
      originalRequest.headers.Authorization = `Bearer ${newAccess}`;
      return apiClient(originalRequest);
    } catch (refreshError) {
      clearTokens();
      processQueue(null);
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  },
);
