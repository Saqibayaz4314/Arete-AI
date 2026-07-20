import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { useToast } from '../../../context/ToastContext'
const Register = () => {
  const navigate = useNavigate()
  const [username, setUsername] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [localError, setLocalError] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const { handleRegister } = useAuth()
  const toast = useToast()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLocalError("")
    if (password !== confirmPassword) {
      toast.showError("Passwords do not match")
      setLocalError("Passwords do not match")
      return
    }

    setIsSubmitting(true)
    try {
      const success = await handleRegister({username, email, password, confirmPassword})
      if (success) {
        navigate("/")
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main className="auth-main">
      <div className="auth-container">
        <h1>Register</h1>
        {localError && <div className="error-msg">{localError}</div>}
        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <label htmlFor="username">Username</label>
            <input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              type="text" id='username' name='username' placeholder='Enter your username' required disabled={isSubmitting} />
          </div>
          <div className="input-group">
            <label htmlFor="email">Email</label>
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              type="email" id='email' name='email' placeholder='Enter email address' required disabled={isSubmitting} />
          </div>
          <div className="input-group">
            <label htmlFor="password">Password</label>
            <input
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              type="password" id='password' name='password' placeholder='Enter password' required disabled={isSubmitting} />
          </div>
          <div className="input-group">
            <label htmlFor="confirmPassword">Confirm Password</label>
            <input
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              type="password" id='confirmPassword' name='confirmPassword' placeholder='Confirm password' required disabled={isSubmitting} />
          </div>
          <button className='btn-submit' disabled={isSubmitting}>
            {isSubmitting ? 'Registering...' : 'Register'}
          </button>
        </form>
        <div className="auth-footer">
          <p>Already have an account? <Link to="/login">Login</Link></p>
        </div>
      </div>
    </main>
  )
}

export default Register
