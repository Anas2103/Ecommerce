import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import api from '../services/api'
import toast from 'react-hot-toast'

const labelStyle = { display: 'block', fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-1)', marginBottom: 8 }

export default function ResetPasswordPage() {
  const [params] = useSearchParams()
  const navigate = useNavigate()
  const token = params.get('token') || ''
  const [email, setEmail] = useState(params.get('email') || '')
  const [password, setPassword] = useState('')
  const [confirmation, setConfirmation] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (password !== confirmation) return toast.error('Passwords do not match.')
    setLoading(true)
    try {
      await api.post('/reset-password', { token, email, password, password_confirmation: confirmation })
      toast.success('Password updated, you can sign in now')
      navigate('/login', { replace: true })
    } catch (err) {
      const errors = err.response?.data?.errors
      toast.error((errors && Object.values(errors)[0]?.[0]) || err.response?.data?.message || 'An error occurred')
    } finally { setLoading(false) }
  }

  return (
    <div className="auth-page">
      <div className="auth-card">

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '32px' }}>
          <div style={{ width: 36, height: 36, background: 'var(--primary-btn)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <span style={{ fontSize: 16, fontWeight: 800, color: '#fff', lineHeight: 1 }}>E</span>
          </div>
          <Link to="/" style={{ fontSize: '1.0625rem', fontWeight: 800, color: 'var(--text-1)', textDecoration: 'none' }}>
            Ecommerce
          </Link>
        </div>

        <h1 style={{ fontSize: '1.625rem', fontWeight: 800, color: 'var(--text-1)', marginBottom: 6 }}>
          Choose a new password
        </h1>
        <p style={{ fontSize: '0.9rem', color: 'var(--text-2)', marginBottom: 32 }}>
          At least 8 characters.
        </p>

        {!token ? (
          <div style={{ textAlign: 'center' }}>
            <p style={{ color: 'var(--text-2)', marginBottom: 24, fontSize: '0.9rem' }}>
              This reset link is invalid or incomplete.
            </p>
            <Link to="/forgot-password" className="auth-btn" style={{ display: 'flex' }}>Request a new link</Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div>
              <label style={labelStyle}>Email address</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="auth-input" />
            </div>
            <div>
              <label style={labelStyle}>New password</label>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={8} autoComplete="new-password" className="auth-input" />
            </div>
            <div>
              <label style={labelStyle}>Confirm new password</label>
              <input type="password" value={confirmation} onChange={(e) => setConfirmation(e.target.value)} required minLength={8} autoComplete="new-password" className="auth-input" />
            </div>
            <div style={{ marginTop: 4 }}>
              <button type="submit" disabled={loading} className="auth-btn">
                {loading
                  ? <span style={{ width: 20, height: 20, border: '2.5px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.7s linear infinite' }} />
                  : 'Update password'
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
