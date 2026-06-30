import './ResetPassword.css'
import { useState, useEffect } from 'react'

function ResetPassword({ onNavigate }) {
  const [formData, setFormData] = useState({
    newPassword: '',
    confirmPassword: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [token, setToken] = useState('')
  const [email, setEmail] = useState('')
  const [isSuccess, setIsSuccess] = useState(false)

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const tokenParam = params.get('token')
    const emailParam = params.get('email')
    
    if (tokenParam && emailParam) {
      setToken(tokenParam)
      setEmail(emailParam)
    } else {
      setError('Invalid reset link. Please request a new one.')
    }
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setMessage('')
    setError('')
    setIsLoading(true)

    if (formData.newPassword !== formData.confirmPassword) {
      setError('Passwords do not match!')
      setIsLoading(false)
      return
    }

    if (formData.newPassword.length < 6) {
      setError('Password must be at least 6 characters long.')
      setIsLoading(false)
      return
    }

    try {
      const response = await fetch('http://localhost:5001/api/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token: token,
          email: email,
          newPassword: formData.newPassword
        })
      })

      const data = await response.json()

      if (response.ok) {
        setMessage('✅ ' + data.message)
        setIsSuccess(true)
      } else {
        setError(data.error || 'Something went wrong')
      }
    } catch (error) {
      setError('Cannot connect to server')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="reset-password-page">
      <div className="reset-password-container">
        <div className="reset-password-header">
          <h1>SIDDHI JEWELLS</h1>
          <p>🔐 Reset Your Password</p>
        </div>
        
        <div className="reset-password-body">
          {isSuccess ? (
            <>
              <div className="reset-success-message">
                <div className="success-icon">✅</div>
                <h2>Password Reset Successfully!</h2>
                <p>{message}</p>
                <button className="login-now-btn" onClick={() => {
                  window.location.href = '/'
                }}>
                  Login Now →
                </button>
              </div>
            </>
          ) : (
            <>
              <h2>Create New Password</h2>
              <p style={{ color: '#666', fontSize: '14px', textAlign: 'center', marginBottom: '20px' }}>
                Enter your new password below.
              </p>
              
              {error && (
                <div className="reset-error-message">
                  {error}
                </div>
              )}
              
              <form onSubmit={handleSubmit}>
                <div className="reset-password-field">
                  <label>New Password</label>
                  <div className="password-input-container">
                    <input 
                      type={showPassword ? "text" : "password"} 
                      placeholder="Enter new password" 
                      required
                      value={formData.newPassword}
                      onChange={(e) => setFormData({...formData, newPassword: e.target.value})}
                    />
                    <button 
                      type="button" 
                      className="toggle-password-btn"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? "🙈" : "👁️"}
                    </button>
                  </div>
                </div>
                
                <div className="reset-password-field">
                  <label>Confirm New Password</label>
                  <div className="password-input-container">
                    <input 
                      type={showPassword ? "text" : "password"} 
                      placeholder="Confirm new password" 
                      required
                      value={formData.confirmPassword}
                      onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                    />
                  </div>
                </div>
                
                <button type="submit" className="reset-password-btn" disabled={isLoading}>
                  {isLoading ? 'Resetting...' : 'Reset Password'}
                </button>
              </form>
              
              <button className="back-to-login-btn" onClick={() => {
                window.location.href = '/'
              }}>
                ← Back to Login
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default ResetPassword