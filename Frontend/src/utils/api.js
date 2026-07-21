// Central API base URL resolver.
// Uses ?? (nullish coalescing) — only falls back for undefined/null,
// NOT for empty string. So VITE_API_URL="" works correctly as relative path.
const API_BASE = import.meta.env.VITE_API_URL ?? "http://localhost:3000";

export default API_BASE;
