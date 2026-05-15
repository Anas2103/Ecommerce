import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { Eye, EyeOff } from 'lucide-react'
import { loginUser, clearError } from '../store/authSlice'
import { fetchCart } from '../store/cartSlice'
import toast from 'react-hot-toast'

const DEMO = [
  { role: 'Admin',   email: 'admin@ecommerce.com' },
  { role: 'Vendeur', email: 'seller@ecommerce.com' },
  { role: 'Client',  email: 'client@ecommerce.com' },
]

export default function LoginPage() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const location = useLocation()
  const { isLoading, error } = useSelector((s) => s.auth)
  const [form, setForm] = useState({ email: '', password: '' })
  const [showPw, setShowPw] = useState(false)
  const from = location.state?.from?.pathname || '/'

  const handleSubmit = async (e) => {
    e.preventDefault()
    dispatch(clearError())
    try {
      await dispatch(loginUser(form)).unwrap()
      await dispatch(fetchCart())
      toast.success('Bienvenue !')
      navigate(from, { replace: true })
    } catch {}
  }

  return (
    <div className="auth-page">
      <div className="auth-card">

        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '32px' }}>
          <div style={{ width: 36, height: 36, background: '#0066CC', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <span style={{ fontSize: 16, fontWeight: 800, color: '#fff', lineHeight: 1 }}>E</span>
          </div>
          <Link to="/" style={{ fontSize: '1.0625rem', fontWeight: 800, color: 'var(--text-1)', textDecoration: 'none' }}>
            Ecommerce
          </Link>
        </div>

        {/* Heading */}
        <h1 style={{ fontSize: '1.625rem', fontWeight: 800, color: 'var(--text-1)', marginBottom: 6 }}>
          Sign in
        </h1>
        <p style={{ fontSize: '0.9rem', color: 'var(--text-2)', marginBottom: 32 }}>
          Sign in to your account
        </p>

        {/* Error */}
        {error && (
          <div style={{
            marginBottom: 24, padding: '12px 16px',
            background: '#fff1f2', border: '1.5px solid #fecaca',
            borderRadius: 10, color: '#dc2626', fontSize: '0.875rem',
            fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
          }}>
            {typeof error === 'string' ? error : Object.values(error).flat()[0]}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-1)', marginBottom: 8 }}>
              Email address
            </label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder="vous@exemple.com"
              className="auth-input"
              required
              autoComplete="email"
            />
          </div>

          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
              <label style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-1)' }}>
                Password
              </label>
              <Link to="/forgot-password" className="auth-link" style={{ fontSize: '0.8125rem' }}>
                Forgot password?
              </Link>
            </div>
            <div className="auth-input-wrap">
              <input
                type={showPw ? 'text' : 'password'}
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                placeholder="••••••••"
                className="auth-input has-icon"
                required
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowPw(!showPw)}
                style={{
                  position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)',
                  background: 'none', border: 'none', cursor: 'pointer', color: '#9bbdd6',
                  display: 'flex', alignItems: 'center', padding: 0,
                }}
              >
                {showPw ? <EyeOff size={17} /> : <Eye size={17} />}
              </button>
            </div>
          </div>

          <div style={{ marginTop: 4 }}>
            <button type="submit" disabled={isLoading} className="auth-btn">
              {isLoading
                ? <span style={{ width: 20, height: 20, border: '2.5px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.7s linear infinite' }} />
                : 'Sign in'
              }
            </button>
          </div>
        </form>

        {/* Register link */}
        <p style={{ textAlign: 'center', fontSize: '0.875rem', color: 'var(--text-2)', marginTop: 24 }}>
          No account yet?{' '}
          <Link to="/register" className="auth-link">Sign up</Link>
        </p>

        {/* Demo accounts */}
        <div style={{ marginTop: 28, border: '1.5px solid var(--border-light)', borderRadius: 12, overflow: 'hidden', background: 'var(--bg-page)' }}>
          <p style={{ padding: '10px 16px', fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.06em', color: 'var(--text-3)', textTransform: 'uppercase', borderBottom: '1px solid var(--border-light)' }}>
            Demo accounts
          </p>
          {DEMO.map(({ role, email }, idx) => (
            <button
              key={email}
              onClick={() => setForm({ email, password: 'password' })}
              style={{
                width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '12px 16px', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left',
                borderBottom: idx < DEMO.length - 1 ? '1px solid var(--border-light)' : 'none',
                transition: 'background 0.12s',
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg-accent)'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'none'}
            >
              <div>
                <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--text-1)' }}>{role}</span>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-3)', marginLeft: 8 }}>{email}</span>
              </div>
              <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: '#0066CC' }}>Use →</span>
            </button>
          ))}
        </div>

      </div>

      {/* Spinner keyframe injected globally via CSS already, but as fallback: */}
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}

