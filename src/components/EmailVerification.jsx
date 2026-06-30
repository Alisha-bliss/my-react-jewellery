import './EmailVerification.css'
import { useState, useEffect } from 'react'

function EmailVerification({ onNavigate }) {
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [token, setToken] = useState('')
  const [email, setEmail] = useState('')

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const tokenParam = params.get('token')
    const emailParam = params.get('email')
    
    if (tokenParam && emailParam) {
      setToken(tokenParam)
      setEmail(emailParam)
      verifyEmail(tokenParam, emailParam)
    } else {
      setError('Invalid verification link.')
      setIsLoading(false)
    }
  }, [])

  const verifyEmail = async (token, email) => {
    try {
      const response = await fetch('http://localhost:5001/api/verify-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, email })
      })

      const data = await response.json()

      if (response.ok) {
        setMessage(data.message || 'Email verified successfully! You can now login.')
      } else {
        setError(data.error || 'Verification failed')
      }
    } catch (error) {
      setError('Cannot connect to server')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="email-verification-page">
      <div className="email-verification-container">
        <div className="email-verification-header">
          <h1>SIDDHI JEWELLS</h1>
          <p>📧 Email Verification</p>
        </div>
        
        <div className="email-verification-body">
          {isLoading ? (
            <div className="verification-loading">
              <div className="spinner"></div>
              <p>Verifying your email...</p>
            </div>
          ) : message ? (
            <div className="verification-success">
              <div className="success-icon">✅</div>
              <h2>Email Verified!</h2>
              <p>{message}</p>
              <button className="login-now-btn" onClick={() => {
                window.location.href = '/'
              }}>
                Login Now →
              </button>
            </div>
          ) : error ? (
            <div className="verification-error">
              <div className="error-icon">❌</div>
              <h2>Verification Failed</h2>
              <p>{error}</p>
              <button className="resend-link-btn" onClick={() => window.location.href = '/'}>
                Return to Home
              </button>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  )
}

export default EmailVerification