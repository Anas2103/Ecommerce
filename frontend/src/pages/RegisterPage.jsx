import { useState, useRef, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { Eye, EyeOff, User, Briefcase, Sun, Moon, Palette } from 'lucide-react'
import { registerUser, clearError } from '../store/authSlice'
import { fetchCart } from '../store/cartSlice'
import { toggleTheme, togglePalette } from '../store/themeSlice'
import toast from 'react-hot-toast'

function getStrength(pw) {
  if (!pw) return 0
  let score = 0
  if (pw.length >= 8) score++
  if (/[A-Z]/.test(pw)) score++
  if (/[0-9]/.test(pw)) score++
  if (/[^A-Za-z0-9]/.test(pw)) score++
  return score
}

const STRENGTH_LABELS = ['', 'Weak', 'Fair', 'Good', 'Strong']
const STRENGTH_COLORS = ['', '#ef4444', '#f59e0b', '#3b82f6', '#22c55e']

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

export default function RegisterPage() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { isLoading, error } = useSelector((s) => s.auth)
  const { mode, palette } = useSelector((s) => s.theme)
  const [form, setForm] = useState({ name: '', email: '', phone: '', role: 'client', password: '', password_confirmation: '' })
  const [showPw, setShowPw] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [touched, setTouched] = useState({})
  const [paletteMenuOpen, setPaletteMenuOpen] = useState(false)
  const paletteMenuRef = useRef(null)

  useEffect(() => {
    const handler = (e) => { if (paletteMenuRef.current && !paletteMenuRef.current.contains(e.target)) setPaletteMenuOpen(false) }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const strength = getStrength(form.password)

  const validate = {
    name: form.name.trim().length >= 2,
    email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email),
    password: form.password.length >= 8,
    password_confirmation: !!form.password_confirmation && form.password === form.password_confirmation,
  }

  const mark = (field) => setTouched((t) => ({ ...t, [field]: true }))
  const fieldErr = (field, msg) =>
    touched[field] && !validate[field]
      ? <p style={{ fontSize: '0.74rem', color: '#ef4444', marginTop: 3 }}>{msg}</p>
      : null

  const handleSubmit = async (e) => {
    e.preventDefault()
    setTouched({ name: true, email: true, password: true, password_confirmation: true })
    dispatch(clearError())
    if (form.password !== form.password_confirmation) return toast.error('Passwords do not match.')
    try {
      await dispatch(registerUser(form)).unwrap()
      await dispatch(fetchCart())
      toast.success('Account created!')
      navigate('/')
    } catch {}
  }

  const labelStyle = { display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-1)', marginBottom: 6 }
  const inputBase = { width: '100%', height: 44, padding: '0 14px', borderRadius: 10, border: '1.5px solid var(--border)', background: 'var(--bg-input)', color: 'var(--text-1)', fontSize: '0.875rem', outline: 'none', boxSizing: 'border-box', transition: 'border-color 0.15s, box-shadow 0.15s' }
  const onFocus = (e) => { e.target.style.borderColor = 'var(--primary)'; e.target.style.boxShadow = '0 0 0 3px var(--primary-ring)'; e.target.style.background = 'var(--bg-card)' }
  const onBlur = (e) => { e.target.style.borderColor = 'var(--border)'; e.target.style.boxShadow = 'none'; e.target.style.background = 'var(--bg-input)' }
  const eyeBtn = (show, toggle) => (
    <button type="button" onClick={toggle} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-3)', display: 'flex', alignItems: 'center', padding: 0 }}>
      {show ? <EyeOff size={16} /> : <Eye size={16} />}
    </button>
  )

  return (
    <div className="auth-page" style={{ padding: '1rem' }}>

      {/* Theme controls */}
      <div className="auth-theme-controls" style={{ position: 'fixed', top: 16, right: 16, zIndex: 50, display: 'flex', alignItems: 'center', gap: 8 }}>
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

      <div style={{ width: '100%', maxWidth: 440, background: 'var(--bg-card)', border: '1.5px solid var(--border-light)', borderRadius: 16, padding: '28px 36px 24px', boxShadow: 'var(--shadow-card)', animation: 'authFadeIn 0.45s cubic-bezier(0.22,1,0.36,1) both' }}>

        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 18 }}>
          <div style={{ width: 32, height: 32, background: 'var(--primary-btn)', borderRadius: 7, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <span style={{ fontSize: 14, fontWeight: 800, color: '#fff', lineHeight: 1 }}>E</span>
          </div>
          <Link to="/" style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text-1)', textDecoration: 'none' }}>Ecommerce</Link>
        </div>

        <h1 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-1)', marginBottom: 2 }}>Create an account</h1>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-2)', marginBottom: 18 }}>Join our store</p>

        {error && (
          <div style={{ marginBottom: 14, padding: '10px 14px', background: '#fff1f2', border: '1.5px solid #fecaca', borderRadius: 10, color: '#dc2626', fontSize: '0.84rem' }}>
            {typeof error === 'string' ? error : Object.values(error).flat()[0]}
          </div>
        )}

        {/* Role selector */}
        <div style={{ marginBottom: 16 }}>
          <label style={{ ...labelStyle, marginBottom: 8 }}>I want to…</label>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            {[
              { value: 'client',  icon: User,      label: 'Buy',  desc: 'Find products' },
              { value: 'seller',  icon: Briefcase, label: 'Sell', desc: 'Manage my store' },
            ].map(({ value, icon: Icon, label, desc }) => {
              const active = form.role === value
              return (
                <button key={value} type="button" onClick={() => setForm({ ...form, role: value })} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '9px 12px', border: active ? '2px solid var(--primary)' : '1.5px solid var(--border-light)', borderRadius: 10, background: active ? 'var(--bg-accent)' : 'var(--bg-page)', cursor: 'pointer', textAlign: 'left', transition: 'all 0.13s' }}>
                  <div style={{ width: 26, height: 26, borderRadius: 7, flexShrink: 0, background: active ? 'var(--primary-btn)' : 'var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: active ? '#fff' : 'var(--text-3)' }}>
                    <Icon size={13} />
                  </div>
                  <div>
                    <p style={{ fontSize: '0.8125rem', fontWeight: 700, color: active ? 'var(--primary)' : 'var(--text-1)', lineHeight: 1.2 }}>{label}</p>
                    <p style={{ fontSize: '0.72rem', color: 'var(--text-3)', marginTop: 1 }}>{desc}</p>
                  </div>
                </button>
              )
            })}
          </div>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <div>
              <label style={labelStyle}>Full name</label>
              <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} onBlur={() => mark('name')} placeholder="Your name" autoComplete="name" required
                style={{ ...inputBase, borderColor: touched.name ? (validate.name ? '#22c55e' : '#ef4444') : 'var(--border)' }}
                onFocus={onFocus}
              />
              {fieldErr('name', 'Min. 2 characters')}
            </div>
            <div>
              <label style={labelStyle}>Phone <span style={{ color: 'var(--text-3)', fontWeight: 400 }}>(optional)</span></label>
              <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="+212 6 00 00 00" autoComplete="tel"
                style={inputBase} onFocus={onFocus} onBlur={onBlur}
              />
            </div>
          </div>

          <div>
            <label style={labelStyle}>Email address</label>
            <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} onBlur={() => mark('email')} placeholder="you@example.com" autoComplete="email" required
              style={{ ...inputBase, borderColor: touched.email ? (validate.email ? '#22c55e' : '#ef4444') : 'var(--border)' }}
              onFocus={onFocus}
            />
            {fieldErr('email', 'Invalid email address')}
          </div>

          <div>
            <label style={labelStyle}>Password</label>
            <div style={{ position: 'relative' }}>
              <input type={showPw ? 'text' : 'password'} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} onBlur={() => mark('password')} placeholder="Minimum 8 characters" autoComplete="new-password" required minLength={8}
                style={{ ...inputBase, paddingRight: 44, borderColor: touched.password ? (validate.password ? '#22c55e' : '#ef4444') : 'var(--border)' }}
                onFocus={onFocus}
              />
              {eyeBtn(showPw, () => setShowPw(!showPw))}
            </div>
            {form.password && (
              <div style={{ marginTop: 6, display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ flex: 1, display: 'flex', gap: 3 }}>
                  {[1,2,3,4].map((i) => (
                    <div key={i} style={{ flex: 1, height: 3, borderRadius: 99, background: i <= strength ? STRENGTH_COLORS[strength] : 'var(--border)', transition: 'background 0.3s' }} />
                  ))}
                </div>
                <span style={{ fontSize: '0.72rem', fontWeight: 700, color: STRENGTH_COLORS[strength], minWidth: 40 }}>{STRENGTH_LABELS[strength]}</span>
              </div>
            )}
            {fieldErr('password', 'Min. 8 characters required')}
          </div>

          <div>
            <label style={labelStyle}>Confirm password</label>
            <div style={{ position: 'relative' }}>
              <input type={showConfirm ? 'text' : 'password'} value={form.password_confirmation} onChange={(e) => setForm({ ...form, password_confirmation: e.target.value })} onBlur={() => mark('password_confirmation')} placeholder="Repeat your password" autoComplete="new-password" required
                style={{ ...inputBase, paddingRight: 44, borderColor: touched.password_confirmation ? (validate.password_confirmation ? '#22c55e' : '#ef4444') : 'var(--border)' }}
                onFocus={onFocus}
              />
              {eyeBtn(showConfirm, () => setShowConfirm(!showConfirm))}
            </div>
            {fieldErr('password_confirmation', 'Passwords do not match')}
          </div>

          <div style={{ marginTop: 4 }}>
            <button type="submit" disabled={isLoading} className="auth-btn">
              {isLoading
                ? <span style={{ width: 20, height: 20, border: '2.5px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.7s linear infinite' }} />
                : 'Create my account'
              }
            </button>
          </div>
        </form>

        <p style={{ textAlign: 'center', fontSize: '0.84rem', color: 'var(--text-2)', marginTop: 16 }}>
          Already have an account?{' '}
          <Link to="/login" className="auth-link">Sign in</Link>
        </p>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}
