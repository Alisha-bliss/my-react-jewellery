import { useState } from 'react'

function LoginModal({ onClose, onLoginSuccess }) {
  const [isLogin, setIsLogin] = useState(true)
  const [formData, setFormData] = useState({ name: '', email: '', password: '' })
  const [showPassword, setShowPassword] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
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
          alert('Registration successful! Please login.')
          setIsLogin(true)
          setFormData({ name: '', email: '', password: '' })
        }
      } else {
        alert(data.error || 'Something went wrong')
      }
    } catch (error) {
      alert('Cannot connect to server')
    }
  }

  return (
    <div className="modal" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <h2>{isLogin ? 'Welcome Back' : 'Create Account'}</h2>
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
          <button type="submit">{isLogin ? 'Login' : 'Register'}</button>
        </form>
        <button className="toggle-btn" onClick={() => setIsLogin(!isLogin)}>
          {isLogin ? "New to Siddhi Jewells? Create account" : "Already have an account? Login"}
        </button>
        <button className="close-btn" onClick={onClose}>Close</button>
      </div>
    </div>
  )
}

export default LoginModal