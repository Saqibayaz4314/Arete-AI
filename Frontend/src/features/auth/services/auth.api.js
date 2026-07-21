import axios from "axios"
import API_BASE from "../../../utils/api"

const api = axios.create({
  baseURL: API_BASE,
  withCredentials: true
})

export async function register({ username, email, password, confirmPassword }) {
  try {
    const response = await api.post('/api/auth/register', {
      username, email, password, confirmPassword
    })
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
    return response.data
  }
  catch (err) {
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
    console.error(err);
    throw err;
  }
}