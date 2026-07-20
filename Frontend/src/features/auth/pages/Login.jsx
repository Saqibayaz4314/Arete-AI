import '../auth.form.scss'
import { Link } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

const Login = () => {
  const { handleLogin } = useAuth()
  const navigate = useNavigate()

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      const success = await handleLogin(email, password)
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
        <h1>Login</h1>
        <form onSubmit={handleSubmit}>
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
          <Link to="/forgot-password" className="forgot-pass-link">Forgot password?</Link>
          <button className='btn-submit' disabled={isSubmitting}>
            {isSubmitting ? 'Logging in...' : 'Login'}
          </button>
        </form>
        <div className="auth-footer">
          <p>Don't have an account? <Link to="/register">Register</Link></p>
        </div>
      </div>
    </main>
  )
}

export default Login
