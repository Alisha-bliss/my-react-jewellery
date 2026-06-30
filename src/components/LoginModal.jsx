import { useState } from 'react'

function LoginModal({ onClose, onLoginSuccess }) {
  const [isLogin, setIsLogin] = useState(true)
  const [formData, setFormData] = useState({ name: '', email: '', password: '' })
  const [showPassword, setShowPassword] = useState(false)
  const [isForgotPassword, setIsForgotPassword] = useState(false)
  const [resetEmail, setResetEmail] = useState('')
  const [resetMessage, setResetMessage] = useState('')
  const [resetError, setResetError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    setResetMessage('')
    setResetError('')
    
    const endpoint = isLogin ? 'http://localhost:5001/api/login' : 'http://localhost:5001/api/register'
    
    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })
      
      const data = await response.json()
      
      if (response.ok) {
        if (isLogin) {
          onLoginSuccess(data)
          onClose()
          alert(`Welcome back ${data.name}!`)
        } else {
          alert('Registration successful! Please check your email to verify your account.')
          setIsLogin(true)
          setFormData({ name: '', email: '', password: '' })
        }
      } else {
        if (data.needsVerification) {
          alert(data.error)
        } else {
          alert(data.error || 'Something went wrong')
        }
      }
    } catch (error) {
      alert('Cannot connect to server')
    } finally {
      setIsLoading(false)
    }
  }

  const handleForgotPassword = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    setResetMessage('')
    setResetError('')
    
    try {
      const response = await fetch('http://localhost:5001/api/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: resetEmail })
      })
      
      const data = await response.json()
      
      if (response.ok) {
        setResetMessage('✅ Password reset link has been sent to your email! Please check your inbox.')
        setResetEmail('')
      } else {
        setResetError(data.error || 'Something went wrong')
      }
    } catch (error) {
      setResetError('Cannot connect to server')
    } finally {
      setIsLoading(false)
    }
  }

  const handleResendVerification = async () => {
    try {
      const response = await fetch('http://localhost:5001/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: formData.email, password: formData.password })
      })
      const data = await response.json()
      if (data.needsVerification) {
        alert('A new verification link has been sent to your email.')
      }
    } catch (error) {
      alert('Error sending verification email')
    }
  }

  return (
    <div className="modal" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        {!isForgotPassword ? (
          <>
            <h2>{isLogin ? 'Welcome Back' : 'Create Account'}</h2>
            
            {!isLogin && (
              <p style={{ color: '#666', fontSize: '13px', textAlign: 'center', marginBottom: '15px' }}>
                We'll send a verification email to confirm your account.
              </p>
            )}
            
            <form onSubmit={handleSubmit}>
              {!isLogin && (
                <input 
                  type="text" 
                  placeholder="Full Name" 
                  required 
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})} 
                />
              )}
              <input 
                type="email" 
                placeholder="Email" 
                required 
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})} 
              />
              <div className="password-container">
                <input 
                  type={showPassword ? "text" : "password"} 
                  placeholder="Password" 
                  required 
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})} 
                />
                <button 
                  type="button" 
                  className="toggle-password"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? "🙈" : "👁️"}
                </button>
              </div>
              <button type="submit" disabled={isLoading}>
                {isLoading ? 'Loading...' : (isLogin ? 'Login' : 'Register')}
              </button>
            </form>
            
            {isLogin && (
              <button 
                className="forgot-password-btn" 
                onClick={() => setIsForgotPassword(true)}
                style={{ 
                  background: 'none', 
                  border: 'none', 
                  color: '#8B4513', 
                  cursor: 'pointer', 
                  fontSize: '13px',
                  marginTop: '10px',
                  textDecoration: 'underline'
                }}
              >
                Forgot Password?
              </button>
            )}
            
            <button className="toggle-btn" onClick={() => {
              setIsLogin(!isLogin)
              setFormData({ name: '', email: '', password: '' })
            }}>
              {isLogin ? "New to Siddhi Jewells? Create account" : "Already have an account? Login"}
            </button>
            <button className="close-btn" onClick={onClose}>Close</button>
          </>
        ) : (
          <>
            <h2>Forgot Password?</h2>
            <p style={{ color: '#666', fontSize: '14px', textAlign: 'center', marginBottom: '15px' }}>
              Enter your email address and we'll send you a link to reset your password.
            </p>
            
            {resetMessage && (
              <div style={{ 
                background: '#e8f5e9', 
                color: '#2e7d32', 
                padding: '10px', 
                borderRadius: '8px', 
                marginBottom: '15px',
                fontSize: '13px',
                textAlign: 'center'
              }}>
                {resetMessage}
              </div>
            )}
            
            {resetError && (
              <div style={{ 
                background: '#ffebee', 
                color: '#c62828', 
                padding: '10px', 
                borderRadius: '8px', 
                marginBottom: '15px',
                fontSize: '13px',
                textAlign: 'center'
              }}>
                {resetError}
              </div>
            )}
            
            <form onSubmit={handleForgotPassword}>
              <input 
                type="email" 
                placeholder="Email Address" 
                required 
                value={resetEmail}
                onChange={(e) => setResetEmail(e.target.value)} 
              />
              <button type="submit" disabled={isLoading}>
                {isLoading ? 'Sending...' : 'Send Reset Link'}
              </button>
            </form>
            
            <button className="toggle-btn" onClick={() => {
              setIsForgotPassword(false)
              setResetMessage('')
              setResetError('')
            }}>
              ← Back to Login
            </button>
          </>
        )}
      </div>
    </div>
  )
}

export default LoginModal