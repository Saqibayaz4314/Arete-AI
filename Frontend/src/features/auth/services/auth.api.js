import axios from "axios"
import API_BASE from "../../../utils/api"

const api = axios.create({
  baseURL: API_BASE,
  withCredentials: true
})

// Automatically attach Bearer token from localStorage as a fail-safe backup for cross-origin cloud environments
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export async function register({ username, email, password, confirmPassword }) {
  try {
    const response = await api.post('/api/auth/register', {
      username, email, password, confirmPassword
    })
    if (response.data?.token) {
      localStorage.setItem("token", response.data.token);
    }
    return response.data
  }
  catch (err) {
    console.error(err);
    throw err;
  }
}

export async function login({ email, password }) {
  try {
    const response = await api.post("/api/auth/login", {
      email, password
    })
    if (response.data?.token) {
      localStorage.setItem("token", response.data.token);
    }
    return response.data
  }
  catch (err) {
    console.error(err);
    throw err;
  }
}

export async function logout() {
  try {
    const response = await api.get("/api/auth/logout")
    localStorage.removeItem("token");
    return response.data
  }
  catch (err) {
    localStorage.removeItem("token");
    console.error(err);
    throw err;
  }
}

export async function getMe() {
  try {
    const response = await api.get("/api/auth/get-me")
    return response.data
  }
  catch (err) {
    if (err.response?.status === 401) {
      localStorage.removeItem("token");
    }
    console.error(err);
    throw err;
  }
}