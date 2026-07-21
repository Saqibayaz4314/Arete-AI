// Central API base URL resolver.
// In production, if VITE_API_URL is omitted or empty, defaults to "" (relative path)
// so Nginx proxy handles requests seamlessly without calling localhost.
// In development, defaults to "http://localhost:3000".
const API_BASE = (import.meta.env.VITE_API_URL && import.meta.env.VITE_API_URL.trim() !== "")
  ? import.meta.env.VITE_API_URL
  : (import.meta.env.PROD ? "" : "http://localhost:3000");

export default API_BASE;
