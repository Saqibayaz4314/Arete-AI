import axios from "axios";

// Central API base URL resolver.
// In production, if VITE_API_URL is omitted or empty, defaults to "" (relative path)
// so Nginx proxy handles requests seamlessly without calling localhost.
// In development, defaults to "http://localhost:3000".
const API_BASE = (import.meta.env.VITE_API_URL && import.meta.env.VITE_API_URL.trim() !== "")
  ? import.meta.env.VITE_API_URL
  : (import.meta.env.PROD ? "" : "http://localhost:3000");

export const api = axios.create({
  baseURL: API_BASE,
  withCredentials: true,
});

// Automatically attach Bearer token from localStorage as a fail-safe backup for cross-origin cloud environments
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default API_BASE;
