import { useState, useRef, useEffect } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { ShoppingCart, Heart, User, Menu, X, Search, LogOut, Package, LayoutDashboard, Settings, Sun, Moon, Globe, Palette } from 'lucide-react'
import { toggleCart, toggleMobileMenu, setMobileMenuOpen } from '../store/uiSlice'
import { toggleTheme, togglePalette } from '../store/themeSlice'
import { logoutUser } from '../store/authSlice'
import { useTranslation } from 'react-i18next'
import api from '../services/api'
import toast from 'react-hot-toast'

const NAV_BG   = 'var(--nav-bg)'
const CAT_BG   = 'var(--nav-cat-bg)'
const BORDER   = '1px solid var(--nav-line)'

function IconBtn({ onClick, children, badge, title, to }) {
  const style = {
    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
    gap: 2, padding: '6px 10px', borderRadius: 10, border: '1px solid transparent',
    color: 'var(--nav-text)', background: 'transparent', cursor: 'pointer',
    transition: 'all 0.18s', position: 'relative', textDecoration: 'none',
    fontSize: 'inherit', fontFamily: 'inherit',
  }
  const enter = (e) => {
    e.currentTarget.style.background = 'var(--brand-md)'
    e.currentTarget.style.color = '#fff'
    e.currentTarget.style.borderColor = 'var(--brand-lg)'
    e.currentTarget.style.boxShadow = '0 0 14px var(--brand-br)'
  }
  const leave = (e) => {
    e.currentTarget.style.background = 'transparent'
    e.currentTarget.style.color = 'var(--nav-text)'
    e.currentTarget.style.borderColor = 'transparent'
    e.currentTarget.style.boxShadow = 'none'
  }
  if (to) return (
    <Link to={to} style={style} onMouseEnter={enter} onMouseLeave={leave}>
      {children}
      {badge}
    </Link>
  )
  return (
    <button title={title} onClick={onClick} style={style} onMouseEnter={enter} onMouseLeave={leave}>
      {children}
      {badge}
    </button>
  )
}

export default function Navbar() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { t, i18n } = useTranslation()
  const LANGS = [
    { code: 'en', label: 'English' },
    { code: 'fr', label: 'Français' },
    { code: 'ar', label: 'العربية' },
  ]
  const currentLang = i18n.language?.slice(0, 2) || 'en'
  const LANG_LABELS = { en: 'EN', fr: 'FR', ar: 'ع' }
  const [langMenuOpen,    setLangMenuOpen]    = useState(false)
  const [paletteMenuOpen, setPaletteMenuOpen] = useState(false)
  const langMenuRef    = useRef(null)
  const paletteMenuRef = useRef(null)
  const switchLang = (code) => {
    i18n.changeLanguage(code)
    localStorage.setItem('language', code)
    setLangMenuOpen(false)
  }
  const [urlParams] = useSearchParams()
  const activeCatId = urlParams.get('category_id') || ''
  const { user } = useSelector((s) => s.auth)
  const { itemCount } = useSelector((s) => s.cart)
  const { mobileMenuOpen } = useSelector((s) => s.ui)
  const { mode, palette } = useSelector((s) => s.theme)
  const [search, setSearch] = useState('')
  const [suggestions, setSuggestions] = useState([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const [categories, setCategories] = useState([])
  const searchRef = useRef(null)
  const userMenuRef = useRef(null)

  useEffect(() => {
    api.get('/categories').then(({ data }) => setCategories(data.data || [])).catch(() => {})
  }, [])

  useEffect(() => {
    const handler = (e) => {
      if (!searchRef.current?.contains(e.target)) setShowSuggestions(false)
      if (!userMenuRef.current?.contains(e.target)) setUserMenuOpen(false)
      if (!langMenuRef.current?.contains(e.target))    setLangMenuOpen(false)
      if (!paletteMenuRef.current?.contains(e.target)) setPaletteMenuOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  useEffect(() => {
    if (!search.trim() || search.length < 2) { setSuggestions([]); return }
    const timer = setTimeout(async () => {
      try {
        const { data } = await api.get(`/products?search=${encodeURIComponent(search)}&per_page=6`)
        setSuggestions(data.data || [])
        setShowSuggestions(true)
      } catch {}
    }, 300)
    return () => clearTimeout(timer)
  }, [search])

  const handleSearch = (e) => {
    e.preventDefault()
    if (search.trim()) {
      navigate(`/products?search=${encodeURIComponent(search)}`)
      setShowSuggestions(false)
      setSearch('')
    }
  }

  const handleLogout = async () => {
    await dispatch(logoutUser())
    toast.success(t('auth.logoutSuccess'))
    navigate('/')
    setUserMenuOpen(false)
  }

  return (
    <header className="sticky top-0 z-40">

      {/* ── Announcement bar ── */}
      <div className="nav-announce hidden sm:flex" style={{ background: 'var(--nav-anno-bg)', borderBottom: BORDER, padding: '6px 24px', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ color: 'var(--nav-accent)', fontSize: '0.72rem', fontWeight: 600 }}>
          🚚 {t('nav.freeShipping')}
        </span>
        <span style={{ color: 'var(--nav-dim)', fontSize: '0.72rem' }}>
          Tél: 0522 000 000 &nbsp;·&nbsp;
          <span style={{ color: 'var(--nav-accent)', cursor: 'pointer' }}>support@ecommerce.ma</span>
        </span>
      </div>

      {/* ── Main header ── */}
      <div style={{ background: NAV_BG, borderBottom: BORDER, padding: '0 20px' }}>
        <div className="nav-main-row" style={{ display: 'flex', alignItems: 'center', gap: 16, height: 64, width: '100%' }}>

          {/* Logo */}
          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none', flexShrink: 0 }}>
            <div style={{
              width: 38, height: 38, background: 'var(--primary-btn)', borderRadius: 10,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 0 20px var(--brand-xl)', flexShrink: 0,
            }}>
              <span style={{ color: '#fff', fontWeight: 900, fontSize: 17, lineHeight: 1 }}>E</span>
            </div>
            <span style={{ color: '#fff', fontWeight: 800, fontSize: 16, letterSpacing: '-0.01em' }} className="hidden sm:block">
              Ecommerce
            </span>
          </Link>

          {/* Search bar */}
          <div ref={searchRef} className="nav-search" style={{ flex: 1, position: 'relative' }}>
            <form onSubmit={handleSearch} style={{ display: 'flex' }}>
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onFocus={(e) => {
                  suggestions.length > 0 && setShowSuggestions(true)
                  e.target.style.borderColor = 'var(--primary)'
                  e.target.style.boxShadow = '0 0 0 3px var(--brand-md)'
                  e.target.style.background = 'rgba(255,255,255,0.1)'
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = 'rgba(255,255,255,0.12)'
                  e.target.style.boxShadow = 'none'
                  e.target.style.background = 'var(--nav-line-md)'
                }}
                placeholder={t('nav.search')}
                style={{
                  flex: 1, padding: '9px 16px', fontSize: '0.875rem',
                  background: 'var(--nav-line-md)',
                  border: '1px solid var(--nav-line-lg)', borderRight: 'none',
                  borderRadius: '10px 0 0 10px', color: '#fff', outline: 'none',
                  transition: 'all 0.15s',
                }}
              />
              <button
                type="submit"
                style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  padding: '9px 20px', background: 'var(--primary-btn)', color: '#fff',
                  border: 'none', borderRadius: '0 10px 10px 0',
                  fontSize: '0.875rem', fontWeight: 700, cursor: 'pointer',
                  flexShrink: 0, transition: 'all 0.15s',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--primary-btn-hover)'; e.currentTarget.style.boxShadow = '0 0 16px var(--brand-brd)' }}
                onMouseLeave={(e) => { e.currentTarget.style.background = 'var(--primary-btn)'; e.currentTarget.style.boxShadow = 'none' }}
              >
                <Search size={15} />
                <span className="hidden sm:inline">{t('nav.searchBtn')}</span>
              </button>
            </form>

            {/* Search suggestions */}
            {showSuggestions && suggestions.length > 0 && (
              <div style={{
                position: 'absolute', top: '100%', left: 0, right: 0, marginTop: 6,
                background: 'var(--nav-dropdown)', borderRadius: 12,
                border: '1px solid var(--brand-br)',
                boxShadow: '0 16px 48px rgba(0,0,0,0.5)', zIndex: 50, overflow: 'hidden',
              }}>
                {suggestions.map((p) => (
                  <Link
                    key={p.id}
                    to={`/products/${p.slug}`}
                    onClick={() => { setShowSuggestions(false); setSearch('') }}
                    style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 16px', borderBottom: '1px solid var(--nav-line)', textDecoration: 'none', transition: 'background 0.15s' }}
                    onMouseEnter={(e) => e.currentTarget.style.background = 'var(--brand-sm)'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                  >
                    <img
                      src={p.primary_image_url} alt={p.name}
                      style={{ width: 36, height: 36, objectFit: 'contain', background: 'var(--nav-line)', borderRadius: 8, flexShrink: 0 }}
                      onError={(e) => e.target.src = 'https://placehold.co/36x36/0c1a32/0066CC?text=P'}
                    />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontSize: '0.875rem', color: '#d0e8f7', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.name}</p>
                      <p style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--nav-accent)', margin: 0 }}>{(p.final_price ?? p.price)?.toLocaleString()} MAD</p>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Right icon buttons */}
          <div className="nav-icons" style={{ display: 'flex', alignItems: 'center', gap: 4, flexShrink: 0 }}>

            <IconBtn onClick={() => dispatch(toggleTheme())} title={mode === 'dark' ? 'Mode clair' : 'Mode sombre'}>
              {mode === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
              <span style={{ fontSize: '0.65rem' }} className="hidden sm:block">{mode === 'dark' ? 'Clair' : 'Sombre'}</span>
            </IconBtn>

            <div ref={paletteMenuRef} style={{ position: 'relative' }}>
              <button
                onClick={() => setPaletteMenuOpen(!paletteMenuOpen)}
                title="Theme"
                style={{
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2,
                  padding: '6px 10px', borderRadius: 10,
                  border: paletteMenuOpen ? '1px solid var(--brand-brd)' : '1px solid transparent',
                  background: paletteMenuOpen ? 'var(--brand-md)' : 'transparent',
                  color: 'var(--nav-text)', cursor: 'pointer', transition: 'all 0.18s',
                }}
                onMouseEnter={(e) => { if (!paletteMenuOpen) { e.currentTarget.style.background = 'var(--brand-md)'; e.currentTarget.style.borderColor = 'var(--brand-lg)'; e.currentTarget.style.color = '#fff' } }}
                onMouseLeave={(e) => { if (!paletteMenuOpen) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = 'transparent'; e.currentTarget.style.color = 'var(--nav-text)' } }}
              >
                <Palette size={18} />
                <span style={{ fontSize: '0.65rem', fontWeight: 700 }} className="hidden sm:block">Theme</span>
              </button>

              {paletteMenuOpen && (
                <div style={{
                  position: 'absolute', right: 0, top: '100%', marginTop: 8,
                  width: 220, background: 'var(--nav-dropdown)',
                  border: '1px solid var(--brand-br)',
                  borderRadius: 12, boxShadow: '0 16px 48px rgba(0,0,0,0.5)',
                  overflow: 'hidden', zIndex: 50,
                }}>
                  {[
                    {
                      value: 'blue',
                      label: 'Blue & Cyan',
                      colors: [
                        { name: 'Navy',    hex: '#09111f' },
                        { name: 'Blue',    hex: '#0066CC' },
                        { name: 'Cyan',    hex: '#4da6ff' },
                        { name: 'Sky',     hex: '#8ab0d0' },
                        { name: 'Ice',     hex: '#e8f4fd' },
                      ],
                    },
                    {
                      value: 'neutral',
                      label: 'Black & White',
                      colors: [
                        { name: 'Black',   hex: '#09090b' },
                        { name: 'Charcoal',hex: '#27272a' },
                        { name: 'Slate',   hex: '#52525b' },
                        { name: 'Silver',  hex: '#a1a1aa' },
                        { name: 'White',   hex: '#fafafa' },
                      ],
                    },
                  ].map(({ value, label, colors }) => {
                    const isActive = palette === value
                    return (
                      <button
                        key={value}
                        onClick={() => { if (!isActive) dispatch(togglePalette()); setPaletteMenuOpen(false) }}
                        style={{
                          display: 'flex', flexDirection: 'column', gap: 8,
                          width: '100%', padding: '12px 14px',
                          background: isActive ? 'var(--brand-bd)' : 'transparent',
                          border: 'none', cursor: 'pointer',
                          borderBottom: '1px solid var(--nav-line)',
                          transition: 'background 0.15s', textAlign: 'left',
                        }}
                        onMouseEnter={(e) => { if (!isActive) e.currentTarget.style.background = 'var(--brand-sm)' }}
                        onMouseLeave={(e) => { if (!isActive) e.currentTarget.style.background = 'transparent' }}
                      >
                        {/* Row: label + active dot */}
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <span style={{ fontSize: '0.8rem', fontWeight: isActive ? 700 : 500, color: isActive ? '#fff' : 'var(--nav-text)' }}>
                            {label}
                          </span>
                          {isActive && <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--nav-accent)', flexShrink: 0 }} />}
                        </div>
                        {/* Color swatches with names */}
                        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                          {colors.map(({ name, hex }) => (
                            <div key={name} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}>
                              <span style={{
                                display: 'block', width: 18, height: 18, borderRadius: 4,
                                background: hex,
                                border: '1px solid rgba(255,255,255,0.15)',
                                boxShadow: '0 1px 3px rgba(0,0,0,0.3)',
                              }} />
                              <span style={{ fontSize: '0.55rem', color: 'var(--nav-cat)', lineHeight: 1, whiteSpace: 'nowrap' }}>{name}</span>
                            </div>
                          ))}
                        </div>
                      </button>
                    )
                  })}
                </div>
              )}
            </div>

            <div ref={langMenuRef} style={{ position: 'relative' }}>
              <button
                onClick={() => setLangMenuOpen(!langMenuOpen)}
                title="Language"
                style={{
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2,
                  padding: '6px 10px', borderRadius: 10,
                  border: langMenuOpen ? '1px solid var(--brand-brd)' : '1px solid transparent',
                  background: langMenuOpen ? 'var(--brand-md)' : 'transparent',
                  color: 'var(--nav-text)', cursor: 'pointer', transition: 'all 0.18s',
                }}
                onMouseEnter={(e) => { if (!langMenuOpen) { e.currentTarget.style.background = 'var(--brand-md)'; e.currentTarget.style.borderColor = 'var(--brand-lg)'; e.currentTarget.style.color = '#fff' } }}
                onMouseLeave={(e) => { if (!langMenuOpen) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = 'transparent'; e.currentTarget.style.color = 'var(--nav-text)' } }}
              >
                <Globe size={18} />
                <span style={{ fontSize: '0.65rem', fontWeight: 700 }} className="hidden sm:block">{LANG_LABELS[currentLang]}</span>
              </button>

              {langMenuOpen && (
                <div style={{
                  position: 'absolute', right: 0, top: '100%', marginTop: 8,
                  width: 150, background: 'var(--nav-dropdown)',
                  border: '1px solid var(--brand-br)',
                  borderRadius: 12, boxShadow: '0 16px 48px rgba(0,0,0,0.5)',
                  overflow: 'hidden', zIndex: 50,
                }}>
                  {LANGS.map(({ code, label }) => (
                    <button
                      key={code}
                      onClick={() => switchLang(code)}
                      style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        width: '100%', padding: '10px 14px',
                        background: currentLang === code ? 'var(--brand-bd)' : 'transparent',
                        color: currentLang === code ? '#fff' : 'var(--nav-text)',
                        border: 'none', cursor: 'pointer', fontSize: '0.875rem',
                        fontWeight: currentLang === code ? 700 : 400,
                        borderBottom: '1px solid var(--nav-line)',
                        transition: 'all 0.15s',
                      }}
                      onMouseEnter={(e) => { if (currentLang !== code) { e.currentTarget.style.background = 'var(--brand-sm)'; e.currentTarget.style.color = '#fff' } }}
                      onMouseLeave={(e) => { if (currentLang !== code) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--nav-text)' } }}
                    >
                      {label}
                      {currentLang === code && <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--nav-accent)', flexShrink: 0 }} />}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {user && (
              <IconBtn to="/wishlist">
                <Heart size={18} />
                <span style={{ fontSize: '0.65rem' }} className="hidden sm:block">{t('nav.wishlist')}</span>
              </IconBtn>
            )}

            <IconBtn onClick={() => dispatch(toggleCart())}>
              <ShoppingCart size={18} />
              <span style={{ fontSize: '0.65rem' }} className="hidden sm:block">{t('nav.cart')}</span>
              {itemCount > 0 && (
                <span style={{
                  position: 'absolute', top: 2, right: 2,
                  minWidth: 16, height: 16, padding: '0 3px',
                  background: '#ef4444', color: '#fff',
                  fontSize: '0.6rem', fontWeight: 800,
                  borderRadius: 99, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  boxShadow: '0 0 8px rgba(239,68,68,0.6)',
                }}>
                  {itemCount > 99 ? '99+' : itemCount}
                </span>
              )}
            </IconBtn>

            {user ? (
              <div ref={userMenuRef} style={{ position: 'relative' }}>
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  style={{
                    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2,
                    padding: '6px 10px', borderRadius: 10,
                    border: userMenuOpen ? '1px solid var(--brand-brd)' : '1px solid transparent',
                    background: userMenuOpen ? 'var(--brand-md)' : 'transparent',
                    color: 'var(--nav-text)', cursor: 'pointer', transition: 'all 0.18s',
                  }}
                  onMouseEnter={(e) => { if (!userMenuOpen) { e.currentTarget.style.background = 'var(--brand-md)'; e.currentTarget.style.borderColor = 'var(--brand-lg)'; e.currentTarget.style.color = '#fff' } }}
                  onMouseLeave={(e) => { if (!userMenuOpen) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = 'transparent'; e.currentTarget.style.color = 'var(--nav-text)' } }}
                >
                  <User size={18} />
                  <span style={{ fontSize: '0.65rem', maxWidth: 64, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} className="hidden sm:block">
                    {user.name.split(' ')[0]}
                  </span>
                </button>

                {userMenuOpen && (
                  <div style={{
                    position: 'absolute', right: 0, top: '100%', marginTop: 8,
                    width: 220, background: 'var(--nav-dropdown)',
                    border: '1px solid var(--brand-br)',
                    borderRadius: 14, boxShadow: '0 20px 60px rgba(0,0,0,0.6)',
                    overflow: 'hidden', zIndex: 50,
                  }}>
                    <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--nav-line)' }}>
                      <p style={{ color: '#fff', fontWeight: 700, fontSize: '0.9rem', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user.name}</p>
                      <p style={{ color: 'var(--nav-muted)', fontSize: '0.75rem', margin: '2px 0 0' }}>{user.email}</p>
                    </div>

                    {[
                      { to: '/profile', icon: User,    label: t('nav.profile') },
                      { to: '/orders',  icon: Package, label: t('nav.orders') },
                    ].map(({ to, icon: Icon, label }) => (
                      <Link key={to} to={to} onClick={() => setUserMenuOpen(false)}
                        style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 16px', color: 'var(--nav-text)', textDecoration: 'none', fontSize: '0.875rem', transition: 'all 0.15s' }}
                        onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--brand-sm)'; e.currentTarget.style.color = '#fff' }}
                        onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--nav-text)' }}
                      >
                        <Icon size={14} style={{ opacity: 0.6 }} /> {label}
                      </Link>
                    ))}

                    {user.role === 'admin' && (
                      <Link to="/admin" onClick={() => setUserMenuOpen(false)}
                        style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 16px', color: 'var(--nav-accent)', textDecoration: 'none', fontSize: '0.875rem', fontWeight: 600, transition: 'all 0.15s' }}
                        onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--brand-sm)'; e.currentTarget.style.color = '#fff' }}
                        onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--nav-accent)' }}
                      >
                        <LayoutDashboard size={14} /> {t('nav.admin')}
                      </Link>
                    )}

                    {user.role === 'seller' && (
                      <Link to="/seller" onClick={() => setUserMenuOpen(false)}
                        style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 16px', color: 'var(--nav-accent)', textDecoration: 'none', fontSize: '0.875rem', fontWeight: 600, transition: 'all 0.15s' }}
                        onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--brand-sm)'; e.currentTarget.style.color = '#fff' }}
                        onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--nav-accent)' }}
                      >
                        <Settings size={14} /> {t('nav.seller')}
                      </Link>
                    )}

                    <div style={{ borderTop: '1px solid var(--nav-line)', margin: '4px 0 0' }}>
                      <button onClick={handleLogout}
                        style={{ display: 'flex', alignItems: 'center', gap: 10, width: '100%', padding: '10px 16px', color: '#f87171', background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '0.875rem', transition: 'all 0.15s' }}
                        onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(239,68,68,0.12)'; e.currentTarget.style.color = '#ef4444' }}
                        onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#f87171' }}
                      >
                        <LogOut size={14} /> {t('nav.logout')}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <IconBtn to="/login">
                <User size={18} />
                <span style={{ fontSize: '0.65rem' }} className="hidden sm:block">{t('nav.login')}</span>
              </IconBtn>
            )}

            <button onClick={() => dispatch(toggleMobileMenu())}
              className="md:hidden"
              style={{
                padding: '8px', borderRadius: 10, border: '1px solid var(--nav-line-lg)',
                background: 'var(--nav-line-md)', color: 'var(--nav-text)', cursor: 'pointer',
                transition: 'all 0.18s',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--brand-md)'; e.currentTarget.style.color = '#fff' }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'var(--nav-line-md)'; e.currentTarget.style.color = 'var(--nav-text)' }}
            >
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </div>

      {/* ── Category bar ── */}
      <div style={{ background: CAT_BG, borderBottom: BORDER }}>
        <div style={{ padding: '0 20px' }}>
          <div className="category-scroll" style={{ alignItems: 'stretch' }}>
            {/* All Products — active when no category is selected */}
            <Link
              to="/products"
              style={{
                flexShrink: 0, padding: '9px 18px',
                fontSize: '0.78rem', fontWeight: !activeCatId ? 700 : 500,
                color: !activeCatId ? '#fff' : 'var(--nav-cat)',
                background: !activeCatId ? 'var(--primary-btn)' : 'transparent',
                textDecoration: 'none', whiteSpace: 'nowrap',
                display: 'flex', alignItems: 'center', transition: 'all 0.15s',
                boxShadow: !activeCatId ? '0 0 16px var(--brand-lg)' : 'none',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = !activeCatId ? 'var(--primary-btn-hover)' : 'var(--brand-md)'
                e.currentTarget.style.color = '#fff'
                if (!activeCatId) e.currentTarget.style.boxShadow = '0 0 22px var(--brand-xl)'
                else e.currentTarget.style.boxShadow = 'inset 0 -2px 0 var(--primary)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = !activeCatId ? 'var(--primary-btn)' : 'transparent'
                e.currentTarget.style.color = !activeCatId ? '#fff' : 'var(--nav-cat)'
                e.currentTarget.style.boxShadow = !activeCatId ? '0 0 16px var(--brand-lg)' : 'none'
              }}
            >
              {t('nav.allProducts')}
            </Link>

            {categories.slice(0, 14).map((cat) => {
              const isActive = activeCatId == cat.id
              return (
                <Link
                  key={cat.id}
                  to={`/products?category_id=${cat.id}`}
                  style={{
                    flexShrink: 0, padding: '9px 16px',
                    fontSize: '0.78rem', fontWeight: isActive ? 700 : 500,
                    color: isActive ? '#fff' : 'var(--nav-cat)',
                    background: isActive ? 'var(--primary-btn)' : 'transparent',
                    textDecoration: 'none', whiteSpace: 'nowrap',
                    display: 'flex', alignItems: 'center',
                    borderLeft: '1px solid var(--nav-line)',
                    transition: 'all 0.15s',
                    boxShadow: isActive ? '0 0 16px var(--brand-lg)' : 'none',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = '#fff'
                    e.currentTarget.style.background = isActive ? 'var(--primary-btn-hover)' : 'var(--brand-md)'
                    e.currentTarget.style.boxShadow = isActive ? '0 0 22px var(--brand-xl)' : 'inset 0 -2px 0 var(--primary)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = isActive ? '#fff' : 'var(--nav-cat)'
                    e.currentTarget.style.background = isActive ? 'var(--primary-btn)' : 'transparent'
                    e.currentTarget.style.boxShadow = isActive ? '0 0 16px var(--brand-lg)' : 'none'
                  }}
                >
                  {cat.name_en || cat.name_fr || cat.name}
                </Link>
              )
            })}
          </div>
        </div>
      </div>

      {/* ── Mobile menu ── */}
      {mobileMenuOpen && (
        <div className="md:hidden" style={{ background: 'var(--nav-dropdown)', borderBottom: BORDER, boxShadow: '0 8px 32px rgba(0,0,0,0.4)' }}>
          {[
            { to: '/',         label: t('nav.home') },
            { to: '/products', label: t('nav.products') },
          ].map(({ to, label }) => (
            <Link key={to} to={to} onClick={() => dispatch(setMobileMenuOpen(false))}
              style={{ display: 'block', padding: '11px 20px', fontSize: '0.875rem', color: 'var(--nav-text)', textDecoration: 'none', borderBottom: '1px solid var(--nav-line)', transition: 'all 0.15s' }}
              onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--brand-sm)'; e.currentTarget.style.color = '#fff' }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--nav-text)' }}
            >{label}</Link>
          ))}
          {categories.slice(0, 10).map((cat) => (
            <Link key={cat.id} to={`/products?category_id=${cat.id}`} onClick={() => dispatch(setMobileMenuOpen(false))}
              style={{ display: 'block', padding: '9px 20px 9px 36px', fontSize: '0.82rem', color: 'var(--nav-muted)', textDecoration: 'none', borderBottom: '1px solid var(--nav-line)', transition: 'all 0.15s' }}
              onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--brand-sm)'; e.currentTarget.style.color = 'var(--nav-text)' }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--nav-muted)' }}
            >
              {cat.name_fr || cat.name}
            </Link>
          ))}
          {!user && (
            <Link to="/login" onClick={() => dispatch(setMobileMenuOpen(false))}
              style={{ display: 'block', padding: '11px 20px', fontSize: '0.875rem', fontWeight: 700, color: 'var(--nav-accent)', textDecoration: 'none', transition: 'all 0.15s' }}
              onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--brand-sm)'; e.currentTarget.style.color = '#fff' }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--nav-accent)' }}
            >{t('nav.login')}</Link>
          )}
        </div>
      )}
    </header>
  )
}
