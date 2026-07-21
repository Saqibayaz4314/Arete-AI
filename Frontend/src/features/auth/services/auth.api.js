import API_BASE, { api } from "../../../utils/api"

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