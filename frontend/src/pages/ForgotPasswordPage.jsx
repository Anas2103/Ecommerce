import { useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../services/api'
import toast from 'react-hot-toast'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await api.post('/auth/forgot-password', { email })
      setSent(true)
      toast.success('Reset email sent')
    } catch (err) {
      toast.error(err.response?.data?.message || 'An error occurred')
    } finally { setLoading(false) }
  }

  return (
    <div className="auth-page">
      <div className="auth-card">

        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '32px' }}>
          <div style={{ width: 36, height: 36, background: 'var(--primary-btn)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <span style={{ fontSize: 16, fontWeight: 800, color: '#fff', lineHeight: 1 }}>E</span>
          </div>
          <Link to="/" style={{ fontSize: '1.0625rem', fontWeight: 800, color: 'var(--text-1)', textDecoration: 'none' }}>
            Ecommerce
          </Link>
        </div>

        <h1 style={{ fontSize: '1.625rem', fontWeight: 800, color: 'var(--text-1)', marginBottom: 6 }}>
          Forgot password
        </h1>
        <p style={{ fontSize: '0.9rem', color: 'var(--text-2)', marginBottom: 32 }}>
          Enter your email to receive a reset link
        </p>

        {sent ? (
          <div style={{ textAlign: 'center' }}>
            <div style={{ width: 64, height: 64, background: 'var(--bg-accent)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
              <span style={{ fontSize: 28, color: 'var(--primary)' }}>✓</span>
            </div>
            <p style={{ color: 'var(--text-1)', marginBottom: 8, fontSize: '0.9rem' }}>
              An email was sent to <strong>{email}</strong>
            </p>
            <p style={{ fontSize: '0.84rem', color: 'var(--text-2)', marginBottom: 24 }}>
              Check your inbox and follow the instructions.
            </p>
            <Link to="/login" className="auth-btn" style={{ display: 'flex' }}>Back to sign in</Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-1)', marginBottom: 8 }}>
                Email address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="you@example.com"
                className="auth-input"
              />
            </div>
            <div style={{ marginTop: 4 }}>
              <button type="submit" disabled={loading} className="auth-btn">
                {loading
                  ? <span style={{ width: 20, height: 20, border: '2.5px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.7s linear infinite' }} />
                  : 'Send reset link'
                }
              </button>
            </div>
            <p style={{ textAlign: 'center', fontSize: '0.875rem', color: 'var(--text-2)', marginTop: 4 }}>
              <Link to="/login" className="auth-link">← Back to sign in</Link>
            </p>
          </form>
        )}
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}
