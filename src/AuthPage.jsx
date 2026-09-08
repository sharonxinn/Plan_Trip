import React, { useState, useEffect } from 'react'
import {
  Compass, User, Lock, Eye, EyeOff, ArrowRight, ArrowLeft,
  CheckCircle2, AlertCircle, Sparkles, Plane
} from 'lucide-react'
import './auth.css'

export default function AuthPage({
  initialMode = 'login', // 'login' | 'register'
  isGate = false,
  onAuthSuccess,
  onBackToDashboard
}) {
  const [mode, setMode] = useState(initialMode)
  const [username, setUsername] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(true)

  const [isLoading, setIsLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [successMessage, setSuccessMessage] = useState('')

  // Reset errors and messages when switching tabs
  useEffect(() => {
    setErrorMessage('')
    setSuccessMessage('')
  }, [mode])

  // Password strength calculator for registration
  const calculateStrength = pass => {
    if (!pass) return { score: 0, label: '', color: '' }
    let score = 0
    if (pass.length >= 6) score += 1
    if (pass.length >= 8) score += 1
    if (/[A-Z]/.test(pass) && /[a-z]/.test(pass)) score += 1
    if (/[0-9]/.test(pass) || /[^A-Za-z0-9]/.test(pass)) score += 1

    if (score <= 1) return { score: 1, label: 'Weak', percent: 25, color: '#7dd3fc' }
    if (score === 2) return { score: 2, label: 'Fair', percent: 50, color: '#7dd3fc' }
    if (score === 3) return { score: 3, label: 'Good', percent: 75, color: '#7dd3fc' }
    return { score: 4, label: 'Strong', percent: 100, color: '#7dd3fc' }
  }

  const strength = calculateStrength(password)
  const passwordsMatch = mode === 'register' && confirmPassword.length > 0 && password === confirmPassword

  // Handle Login submission
  const handleLoginSubmit = async e => {
    e.preventDefault()
    setErrorMessage('')
    setSuccessMessage('')

    const cleanUsername = username.trim().toLowerCase()
    const cleanPassword = password.trim()

    if (!cleanUsername) {
      setErrorMessage('Please enter your username.')
      return
    }
    if (!cleanPassword) {
      setErrorMessage('Please enter your password.')
      return
    }

    setIsLoading(true)

    try {
      // 1. Try server endpoint
      let userObj = null
      try {
        const response = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username: cleanUsername, password: cleanPassword })
        })
        const data = await response.json()
        if (!response.ok) {
          throw new Error(data.error || 'Failed to sign in.')
        }
        userObj = data.user
      } catch (networkOrApiError) {
        // 2. Fallback to localStorage for offline or local cache
        const localUsersStr = localStorage.getItem('plantrip_registered_users')
        let localUsers = {}
        try {
          if (localUsersStr) localUsers = JSON.parse(localUsersStr)
        } catch {}

        // Check if demo user
        if (cleanUsername === 'traveller' && cleanPassword === 'password123') {
          userObj = {
            id: 'u_traveller',
            username: 'traveller',
            name: 'Alex Explorer',
            createdAt: Date.now()
          }
        } else if (localUsers[cleanUsername]) {
          if (localUsers[cleanUsername].password === cleanPassword) {
            userObj = {
              id: localUsers[cleanUsername].id,
              username: localUsers[cleanUsername].username,
              name: localUsers[cleanUsername].name || cleanUsername,
              createdAt: localUsers[cleanUsername].createdAt
            }
          } else {
            throw new Error('Invalid username or password.')
          }
        } else {
          throw networkOrApiError
        }
      }

      if (userObj) {
        if (rememberMe) {
          localStorage.setItem('plantrip_current_user', JSON.stringify(userObj))
        } else {
          sessionStorage.setItem('plantrip_current_user', JSON.stringify(userObj))
        }

        setSuccessMessage(`Welcome back, ${userObj.name || userObj.username}!`)
        setTimeout(() => {
          if (onAuthSuccess) onAuthSuccess(userObj)
        }, 600)
      }
    } catch (err) {
      setErrorMessage(err.message || 'Login failed. Please check your credentials.')
    } finally {
      setIsLoading(false)
    }
  }

  // Handle Register submission
  const handleRegisterSubmit = async e => {
    e.preventDefault()
    setErrorMessage('')
    setSuccessMessage('')

    const cleanUsername = username.trim().toLowerCase()
    const cleanPassword = password.trim()
    const cleanName = displayName.trim() || cleanUsername

    if (!cleanUsername || cleanUsername.length < 3) {
      setErrorMessage('Username must be at least 3 characters long.')
      return
    }
    if (!/^[a-zA-Z0-9_-]+$/.test(cleanUsername)) {
      setErrorMessage('Username can only contain letters, numbers, hyphens, and underscores.')
      return
    }
    if (!cleanPassword || cleanPassword.length < 6) {
      setErrorMessage('Password must be at least 6 characters long.')
      return
    }
    if (cleanPassword !== confirmPassword) {
      setErrorMessage('Passwords do not match. Please re-type to verify.')
      return
    }

    setIsLoading(true)

    try {
      let createdUser = null
      try {
        const response = await fetch('/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            username: cleanUsername,
            password: cleanPassword,
            name: cleanName
          })
        })
        const data = await response.json()
        if (!response.ok) {
          throw new Error(data.error || 'Failed to create account.')
        }
        createdUser = data.user
      } catch (apiErr) {
        // If server failed because user already exists or server is unreachable, check local
        if (apiErr.message && apiErr.message.includes('already taken')) {
          throw apiErr
        }

        // Fallback local registration
        const localUsersStr = localStorage.getItem('plantrip_registered_users')
        let localUsers = {}
        try {
          if (localUsersStr) localUsers = JSON.parse(localUsersStr)
        } catch {}

        if (localUsers[cleanUsername] || cleanUsername === 'traveller') {
          throw new Error('Username already taken. Please choose another.')
        }

        createdUser = {
          id: `u_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
          username: cleanUsername,
          password: cleanPassword,
          name: cleanName,
          createdAt: Date.now()
        }

        localUsers[cleanUsername] = createdUser
        localStorage.setItem('plantrip_registered_users', JSON.stringify(localUsers))
      }

      if (createdUser) {
        // Also cache locally for offline access
        try {
          const localUsersStr = localStorage.getItem('plantrip_registered_users')
          const localUsers = localUsersStr ? JSON.parse(localUsersStr) : {}
          localUsers[cleanUsername] = {
            id: createdUser.id,
            username: createdUser.username,
            password: cleanPassword,
            name: createdUser.name,
            createdAt: createdUser.createdAt
          }
          localStorage.setItem('plantrip_registered_users', JSON.stringify(localUsers))
        } catch {}

        // Auto login the new user
        localStorage.setItem('plantrip_current_user', JSON.stringify(createdUser))

        setSuccessMessage(`Account created! Welcome aboard, ${createdUser.name || createdUser.username}!`)
        setTimeout(() => {
          if (onAuthSuccess) onAuthSuccess(createdUser)
        }, 700)
      }
    } catch (err) {
      setErrorMessage(err.message || 'Registration failed. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="auth-page-container">
      {/* Background Animated Flight Path & Ambient Light Orbs */}
      <div className="auth-ambient-orb orb-1" aria-hidden="true" />
      <div className="auth-ambient-orb orb-2" aria-hidden="true" />
      <div className="auth-flight-path" aria-hidden="true">
        <svg viewBox="0 0 1000 240" className="auth-flight-svg" preserveAspectRatio="none">
          <path d="M -50,140 Q 250,20 520,130 T 1050,90" className="flight-dashed-path" />
        </svg>
        <div className="flight-airplane-mover">
          <Plane size={32} className="flight-plane-icon" />
        </div>
      </div>

      <div className={`auth-header-bar ${isGate ? 'is-gate' : ''}`}>
        {!isGate && (
          <button
            type="button"
            className="auth-back-btn"
            onClick={onBackToDashboard}
            aria-label="Back to planner"
          >
            <ArrowLeft size={16} />
            <span>Back to Planner</span>
          </button>
        )}

        <div className="auth-brand-badge" role="banner">
          <div className="auth-brand-icon">
            <Compass size={18} />
          </div>
          <span className="auth-brand-title">PlanTrip</span>
        </div>

        {!isGate && (
          <button
            type="button"
            className="auth-guest-link"
            onClick={onBackToDashboard}
          >
            Continue as Guest
          </button>
        )}
      </div>

      <div className="auth-card-wrapper">
        {/* Auth Form Card */}
        <main className="auth-form-card">
          {/* Animated Segmented Mode Switcher with Glider */}
          <div className="auth-mode-tabs" role="tablist" aria-label="Sign in or Register">
            <span
              className="auth-tab-glider"
              style={{
                transform: mode === 'login' ? 'translateX(0%)' : 'translateX(100%)'
              }}
              aria-hidden="true"
            />
            <button
              type="button"
              role="tab"
              aria-selected={mode === 'login'}
              className={`auth-tab-btn ${mode === 'login' ? 'active' : ''}`}
              onClick={() => setMode('login')}
            >
              Sign In
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={mode === 'register'}
              className={`auth-tab-btn ${mode === 'register' ? 'active' : ''}`}
              onClick={() => setMode('register')}
            >
              Create Account
            </button>
          </div>

          {/* Form Header */}
          <div className="auth-form-header">
            <h1 key={`title-${mode}`} className="auth-title-slide">
              {mode === 'login' ? 'Welcome back' : 'Create your account'}
            </h1>
            <p key={`subtitle-${mode}`} className="auth-sub-slide">
              {mode === 'login'
                ? 'Enter your username and password to access your trips.'
                : 'Start planning your next adventure in seconds.'}
            </p>
          </div>

          {/* Feedback Messages */}
          {errorMessage && (
            <div className="auth-alert error auth-alert-animated" role="alert">
              <AlertCircle size={18} />
              <span>{errorMessage}</span>
            </div>
          )}

          {successMessage && (
            <div className="auth-alert success auth-alert-animated" role="alert">
              <CheckCircle2 size={18} />
              <span>{successMessage}</span>
            </div>
          )}

          {/* Animated Form Container */}
          <div key={mode} className="auth-form-animated">
            {mode === 'login' ? (
              <form className="auth-form" onSubmit={handleLoginSubmit}>
                <div className="auth-field-group">
                  <label htmlFor="login-username">Username</label>
                  <div className="auth-input-wrapper">
                    <User size={18} className="input-icon" />
                    <input
                      id="login-username"
                      name="username"
                      type="text"
                      autoComplete="username"
                      placeholder="e.g. traveller"
                      value={username}
                      onChange={e => setUsername(e.target.value)}
                      disabled={isLoading}
                      required
                    />
                  </div>
                </div>

                <div className="auth-field-group">
                  <div className="auth-label-row">
                    <label htmlFor="login-password">Password</label>
                  </div>
                  <div className="auth-input-wrapper">
                    <Lock size={18} className="input-icon" />
                    <input
                      id="login-password"
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      autoComplete="current-password"
                      placeholder="Enter your password"
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      disabled={isLoading}
                      required
                    />
                    <button
                      type="button"
                      className="btn-toggle-eye"
                      onClick={() => setShowPassword(prev => !prev)}
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                <div className="auth-options-row">
                  <label className="auth-checkbox-label">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={e => setRememberMe(e.target.checked)}
                    />
                    <span>Remember me</span>
                  </label>
                </div>

                <button
                  type="submit"
                  className="auth-submit-btn animated-btn"
                  aria-busy={isLoading}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <span>Signing In...</span>
                  ) : (
                    <>
                      <span>Sign In</span>
                      <ArrowRight size={18} className="btn-arrow-icon" />
                    </>
                  )}
                </button>

                <div className="auth-footer-switch">
                  <span>Don't have an account yet?</span>
                  <button
                    type="button"
                    className="auth-switch-btn"
                    onClick={() => setMode('register')}
                  >
                    Create one now
                  </button>
                </div>
              </form>
            ) : (
              <form className="auth-form" onSubmit={handleRegisterSubmit}>
                <div className="auth-field-group">
                  <label htmlFor="register-username">Username</label>
                  <div className="auth-input-wrapper">
                    <User size={18} className="input-icon" />
                    <input
                      id="register-username"
                      name="username"
                      type="text"
                      autoComplete="username"
                      placeholder="Choose a username (min 3 chars)"
                      value={username}
                      onChange={e => setUsername(e.target.value)}
                      disabled={isLoading}
                      required
                    />
                  </div>
                  <small className="auth-field-hint">
                    Only letters, numbers, hyphens, and underscores.
                  </small>
                </div>

                <div className="auth-field-group">
                  <label htmlFor="register-displayname">
                    Full Name / Nickname <span className="text-muted">(Optional)</span>
                  </label>
                  <div className="auth-input-wrapper">
                    <Sparkles size={18} className="input-icon" />
                    <input
                      id="register-displayname"
                      name="displayName"
                      type="text"
                      autoComplete="name"
                      placeholder="e.g. Alex Tan"
                      value={displayName}
                      onChange={e => setDisplayName(e.target.value)}
                      disabled={isLoading}
                    />
                  </div>
                </div>

                <div className="auth-field-group">
                  <label htmlFor="register-password">Password</label>
                  <div className="auth-input-wrapper">
                    <Lock size={18} className="input-icon" />
                    <input
                      id="register-password"
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      autoComplete="new-password"
                      placeholder="Create a password (min 6 chars)"
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      disabled={isLoading}
                      required
                    />
                    <button
                      type="button"
                      className="btn-toggle-eye"
                      onClick={() => setShowPassword(prev => !prev)}
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                  {password && (
                    <div className="auth-strength-meter">
                      <div className="strength-bar-track">
                        <div
                          className="strength-bar-fill animated-bar"
                          style={{ width: `${strength.percent}%`, backgroundColor: strength.color }}
                        />
                      </div>
                      <span className="strength-label">
                        {strength.label}
                      </span>
                    </div>
                  )}
                </div>

                <div className="auth-field-group">
                  <label htmlFor="register-confirm-password">Confirm Password</label>
                  <div className="auth-input-wrapper">
                    <Lock size={18} className="input-icon" />
                    <input
                      id="register-confirm-password"
                      name="confirmPassword"
                      type={showConfirmPassword ? 'text' : 'password'}
                      autoComplete="new-password"
                      placeholder="Re-type your password"
                      value={confirmPassword}
                      onChange={e => setConfirmPassword(e.target.value)}
                      disabled={isLoading}
                      required
                    />
                    <button
                      type="button"
                      className="btn-toggle-eye"
                      onClick={() => setShowConfirmPassword(prev => !prev)}
                      aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                    >
                      {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                  {confirmPassword && (
                    <div className="auth-field-hint">
                      {passwordsMatch ? (
                        <span className="match-success pop-badge">
                          <CheckCircle2 size={13} /> Passwords match
                        </span>
                      ) : (
                        <span className="match-fail pop-badge">
                          <AlertCircle size={13} /> Passwords do not match
                        </span>
                      )}
                    </div>
                  )}
                </div>

                <button
                  type="submit"
                  className="auth-submit-btn animated-btn"
                  aria-busy={isLoading}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <span>Creating Account...</span>
                  ) : (
                    <>
                      <span>Create Account</span>
                      <ArrowRight size={18} className="btn-arrow-icon" />
                    </>
                  )}
                </button>

                <div className="auth-footer-switch">
                  <span>Already have an account?</span>
                  <button
                    type="button"
                    className="auth-switch-btn"
                    onClick={() => setMode('login')}
                  >
                    Sign in here
                  </button>
                </div>
              </form>
            )}
          </div>
        </main>
      </div>
    </div>
  )
}
