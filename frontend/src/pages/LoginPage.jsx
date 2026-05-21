import { useState, useRef, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { Eye, EyeOff, Sun, Moon, Palette } from 'lucide-react'
import { loginUser, clearError } from '../store/authSlice'
import { fetchCart } from '../store/cartSlice'
import { toggleTheme, togglePalette } from '../store/themeSlice'
import toast from 'react-hot-toast'

const DEMO = [
  { role: 'Admin',   email: 'admin@ecommerce.com' },
  { role: 'Vendeur', email: 'seller@ecommerce.com' },
  { role: 'Client',  email: 'client@ecommerce.com' },
]

const PALETTES = [
  { value: 'blue', label: 'Blue & Cyan', colors: [
    { name: 'Navy', hex: '#09111f' }, { name: 'Blue', hex: '#0066CC' },
    { name: 'Cyan', hex: '#4da6ff' }, { name: 'Sky', hex: '#8ab0d0' },
    { name: 'Ice', hex: '#e8f4fd' },
  ]},
  { value: 'neutral', label: 'Black & White', colors: [
    { name: 'Black', hex: '#09090b' }, { name: 'Charcoal', hex: '#27272a' },
    { name: 'Slate', hex: '#52525b' }, { name: 'Silver', hex: '#a1a1aa' },
    { name: 'White', hex: '#fafafa' },
  ]},
]

export default function LoginPage() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const location = useLocation()
  const { isLoading, error } = useSelector((s) => s.auth)
  const { mode, palette } = useSelector((s) => s.theme)
  const [form, setForm] = useState({ email: '', password: '' })
  const [showPw, setShowPw] = useState(false)
  const [paletteMenuOpen, setPaletteMenuOpen] = useState(false)
  const paletteMenuRef = useRef(null)
  const from = location.state?.from?.pathname || '/'

  useEffect(() => {
    const handler = (e) => { if (paletteMenuRef.current && !paletteMenuRef.current.contains(e.target)) setPaletteMenuOpen(false) }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

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

      {/* Theme controls */}
      <div style={{ position: 'fixed', top: 16, right: 16, zIndex: 50, display: 'flex', alignItems: 'center', gap: 8 }}>
        <button
          onClick={() => dispatch(toggleTheme())}
          title={mode === 'dark' ? 'Light mode' : 'Dark mode'}
          style={{ width: 36, height: 36, borderRadius: 10, border: '1.5px solid var(--border-light)', background: 'var(--bg-card)', color: 'var(--text-2)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.15s' }}
        >
          {mode === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
        </button>
        <div ref={paletteMenuRef} style={{ position: 'relative' }}>
          <button
            onClick={() => setPaletteMenuOpen(!paletteMenuOpen)}
            title="Theme"
            style={{ width: 36, height: 36, borderRadius: 10, border: '1.5px solid var(--border-light)', background: 'var(--bg-card)', color: 'var(--text-2)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.15s' }}
          >
            <Palette size={16} />
          </button>
          {paletteMenuOpen && (
            <div style={{ position: 'absolute', top: 44, right: 0, width: 220, zIndex: 60, background: 'var(--bg-card)', border: '1.5px solid var(--border-light)', borderRadius: 12, overflow: 'hidden', boxShadow: 'var(--shadow-card)' }}>
              {PALETTES.map(({ value, label, colors }) => {
                const active = palette === value
                return (
                  <button
                    key={value}
                    onClick={() => { if (palette !== value) dispatch(togglePalette()); setPaletteMenuOpen(false) }}
                    style={{ width: '100%', padding: '12px 14px', background: active ? 'var(--bg-accent)' : 'none', border: 'none', borderBottom: value === 'blue' ? '1px solid var(--border-light)' : 'none', cursor: 'pointer', textAlign: 'left' }}
                  >
                    <p style={{ fontSize: '0.8125rem', fontWeight: 700, color: active ? 'var(--primary)' : 'var(--text-1)', marginBottom: 6 }}>
                      {active && '✓ '}{label}
                    </p>
                    <div style={{ display: 'flex', gap: 4 }}>
                      {colors.map(({ name, hex }) => (
                        <div key={name} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                          <div style={{ width: 18, height: 18, borderRadius: 4, background: hex, border: '1px solid rgba(0,0,0,0.1)' }} />
                          <span style={{ fontSize: '0.6rem', color: 'var(--text-3)' }}>{name}</span>
                        </div>
                      ))}
                    </div>
                  </button>
                )
              })}
            </div>
          )}
        </div>
      </div>

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
              <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--primary)' }}>Use →</span>
            </button>
          ))}
        </div>

      </div>

      {/* Spinner keyframe injected globally via CSS already, but as fallback: */}
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}

