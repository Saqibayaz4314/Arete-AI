import { useContext, useEffect } from "react";
import { AuthContext } from "../auth.context";
import { login, register, logout, getMe } from "../services/auth.api";
import { useToast } from "../../../context/ToastContext";

export const useAuth = ()=> {
  const context = useContext(AuthContext)
  const {user, setUser, loading, setLoading} = context
  const toast = useToast()

  const handleLogin = async (email, password) => {
    setLoading(true)
    try {
      const data = await login({email, password})
      setUser(data.user)
      toast.showSuccess(`Welcome back, ${data.user.username || 'User'}!`)
      return true
    } catch (err) {
      console.error(err)
      const msg = err.response?.data?.message || "Invalid email or password. Please try again."
      toast.showError(msg)
      return false
    } finally {
      setLoading(false)
    }
  }

  const handleRegister = async ({username, email, password, confirmPassword})=>{
    setLoading(true)
    try {
      const data = await register({username, email, password, confirmPassword})
      setUser(data.user)
      toast.showSuccess("Registration successful! Welcome to Arete.")
      return true
    } catch (err) {
      console.error(err)
      const msg = err.response?.data?.message || "Registration failed. Please check your details."
      toast.showError(msg)
      return false
    } finally {
      setLoading(false)
    }
  }  

  const handleLogout = async () => {
    setLoading(true)
    try {
      await logout()
      setUser(null)
      toast.showSuccess("Logged out successfully.")
    } catch (err) {
      console.error(err)
      toast.showError("Failed to log out cleanly.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(()=>{
    const getAndSetUser = async()=>{
      try{
        const data = await getMe()
        setUser(data.user)
      }catch{}finally{
        setLoading(false)
      }
    }
    getAndSetUser()
  }, []) // Add empty dependency array to prevent infinite effect triggers!

  return {user, loading, handleLogin, handleRegister, handleLogout}
}
