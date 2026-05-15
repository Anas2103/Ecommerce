import { useState, useRef, useEffect } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { ShoppingCart, Heart, User, Menu, X, Search, LogOut, Package, LayoutDashboard, Settings, Sun, Moon, Globe } from 'lucide-react'
import { toggleCart, toggleMobileMenu, setMobileMenuOpen } from '../store/uiSlice'
import { toggleTheme } from '../store/themeSlice'
import { logoutUser } from '../store/authSlice'
import { useTranslation } from 'react-i18next'
import api from '../services/api'
import toast from 'react-hot-toast'

const NAV_BG   = 'linear-gradient(135deg, #09111f 0%, #0c1a32 100%)'
const CAT_BG   = '#071018'
const BORDER   = '1px solid rgba(255,255,255,0.07)'

function IconBtn({ onClick, children, badge, title, to }) {
  const style = {
    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
    gap: 2, padding: '6px 10px', borderRadius: 10, border: '1px solid transparent',
    color: '#8ab0d0', background: 'transparent', cursor: 'pointer',
    transition: 'all 0.18s', position: 'relative', textDecoration: 'none',
    fontSize: 'inherit', fontFamily: 'inherit',
  }
  const enter = (e) => {
    e.currentTarget.style.background = 'rgba(0,102,204,0.2)'
    e.currentTarget.style.color = '#fff'
    e.currentTarget.style.borderColor = 'rgba(0,102,204,0.4)'
    e.currentTarget.style.boxShadow = '0 0 14px rgba(0,102,204,0.3)'
  }
  const leave = (e) => {
    e.currentTarget.style.background = 'transparent'
    e.currentTarget.style.color = '#8ab0d0'
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
  const [langMenuOpen, setLangMenuOpen] = useState(false)
  const langMenuRef = useRef(null)
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
  const { mode } = useSelector((s) => s.theme)
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
      if (!langMenuRef.current?.contains(e.target)) setLangMenuOpen(false)
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
      <div style={{ background: '#060e1a', borderBottom: BORDER, padding: '6px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ color: '#4da6ff', fontSize: '0.72rem', fontWeight: 600 }}>
          🚚 {t('nav.freeShipping')}
        </span>
        <span style={{ color: '#3d5a78', fontSize: '0.72rem' }}>
          Tél: 0522 000 000 &nbsp;·&nbsp;
          <span style={{ color: '#4da6ff', cursor: 'pointer' }}>support@ecommerce.ma</span>
        </span>
      </div>

      {/* ── Main header ── */}
      <div style={{ background: NAV_BG, borderBottom: BORDER, padding: '0 20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, height: 64, width: '100%' }}>

          {/* Logo */}
          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none', flexShrink: 0 }}>
            <div style={{
              width: 38, height: 38, background: '#0066CC', borderRadius: 10,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 0 20px rgba(0,102,204,0.55)', flexShrink: 0,
            }}>
              <span style={{ color: '#fff', fontWeight: 900, fontSize: 17, lineHeight: 1 }}>E</span>
            </div>
            <span style={{ color: '#fff', fontWeight: 800, fontSize: 16, letterSpacing: '-0.01em' }} className="hidden sm:block">
              Ecommerce
            </span>
          </Link>

          {/* Search bar */}
          <div ref={searchRef} style={{ flex: 1, position: 'relative' }}>
            <form onSubmit={handleSearch} style={{ display: 'flex' }}>
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onFocus={(e) => {
                  suggestions.length > 0 && setShowSuggestions(true)
                  e.target.style.borderColor = '#0066CC'
                  e.target.style.boxShadow = '0 0 0 3px rgba(0,102,204,0.2)'
                  e.target.style.background = 'rgba(255,255,255,0.1)'
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = 'rgba(255,255,255,0.12)'
                  e.target.style.boxShadow = 'none'
                  e.target.style.background = 'rgba(255,255,255,0.07)'
                }}
                placeholder={t('nav.search')}
                style={{
                  flex: 1, padding: '9px 16px', fontSize: '0.875rem',
                  background: 'rgba(255,255,255,0.07)',
                  border: '1px solid rgba(255,255,255,0.12)', borderRight: 'none',
                  borderRadius: '10px 0 0 10px', color: '#fff', outline: 'none',
                  transition: 'all 0.15s',
                }}
              />
              <button
                type="submit"
                style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  padding: '9px 20px', background: '#0066CC', color: '#fff',
                  border: 'none', borderRadius: '0 10px 10px 0',
                  fontSize: '0.875rem', fontWeight: 700, cursor: 'pointer',
                  flexShrink: 0, transition: 'all 0.15s',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = '#0052A3'; e.currentTarget.style.boxShadow = '0 0 16px rgba(0,102,204,0.5)' }}
                onMouseLeave={(e) => { e.currentTarget.style.background = '#0066CC'; e.currentTarget.style.boxShadow = 'none' }}
              >
                <Search size={15} />
                <span className="hidden sm:inline">{t('nav.searchBtn')}</span>
              </button>
            </form>

            {/* Search suggestions */}
            {showSuggestions && suggestions.length > 0 && (
              <div style={{
                position: 'absolute', top: '100%', left: 0, right: 0, marginTop: 6,
                background: '#0c1a32', borderRadius: 12,
                border: '1px solid rgba(0,102,204,0.3)',
                boxShadow: '0 16px 48px rgba(0,0,0,0.5)', zIndex: 50, overflow: 'hidden',
              }}>
                {suggestions.map((p) => (
                  <Link
                    key={p.id}
                    to={`/products/${p.slug}`}
                    onClick={() => { setShowSuggestions(false); setSearch('') }}
                    style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 16px', borderBottom: '1px solid rgba(255,255,255,0.05)', textDecoration: 'none', transition: 'background 0.15s' }}
                    onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(0,102,204,0.15)'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                  >
                    <img
                      src={p.primary_image_url} alt={p.name}
                      style={{ width: 36, height: 36, objectFit: 'contain', background: 'rgba(255,255,255,0.05)', borderRadius: 8, flexShrink: 0 }}
                      onError={(e) => e.target.src = 'https://placehold.co/36x36/0c1a32/0066CC?text=P'}
                    />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontSize: '0.875rem', color: '#d0e8f7', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.name}</p>
                      <p style={{ fontSize: '0.75rem', fontWeight: 700, color: '#4da6ff', margin: 0 }}>{(p.final_price ?? p.price)?.toLocaleString()} MAD</p>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Right icon buttons */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, flexShrink: 0 }}>

            <IconBtn onClick={() => dispatch(toggleTheme())} title={mode === 'dark' ? 'Mode clair' : 'Mode sombre'}>
              {mode === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
              <span style={{ fontSize: '0.65rem' }} className="hidden sm:block">{mode === 'dark' ? 'Clair' : 'Sombre'}</span>
            </IconBtn>

            <div ref={langMenuRef} style={{ position: 'relative' }}>
              <button
                onClick={() => setLangMenuOpen(!langMenuOpen)}
                title="Language"
                style={{
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2,
                  padding: '6px 10px', borderRadius: 10,
                  border: langMenuOpen ? '1px solid rgba(0,102,204,0.5)' : '1px solid transparent',
                  background: langMenuOpen ? 'rgba(0,102,204,0.2)' : 'transparent',
                  color: '#8ab0d0', cursor: 'pointer', transition: 'all 0.18s',
                }}
                onMouseEnter={(e) => { if (!langMenuOpen) { e.currentTarget.style.background = 'rgba(0,102,204,0.2)'; e.currentTarget.style.borderColor = 'rgba(0,102,204,0.4)'; e.currentTarget.style.color = '#fff' } }}
                onMouseLeave={(e) => { if (!langMenuOpen) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = 'transparent'; e.currentTarget.style.color = '#8ab0d0' } }}
              >
                <Globe size={18} />
                <span style={{ fontSize: '0.65rem', fontWeight: 700 }} className="hidden sm:block">{LANG_LABELS[currentLang]}</span>
              </button>

              {langMenuOpen && (
                <div style={{
                  position: 'absolute', right: 0, top: '100%', marginTop: 8,
                  width: 150, background: '#0c1a32',
                  border: '1px solid rgba(0,102,204,0.3)',
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
                        background: currentLang === code ? 'rgba(0,102,204,0.25)' : 'transparent',
                        color: currentLang === code ? '#fff' : '#8ab0d0',
                        border: 'none', cursor: 'pointer', fontSize: '0.875rem',
                        fontWeight: currentLang === code ? 700 : 400,
                        borderBottom: '1px solid rgba(255,255,255,0.05)',
                        transition: 'all 0.15s',
                      }}
                      onMouseEnter={(e) => { if (currentLang !== code) { e.currentTarget.style.background = 'rgba(0,102,204,0.15)'; e.currentTarget.style.color = '#fff' } }}
                      onMouseLeave={(e) => { if (currentLang !== code) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#8ab0d0' } }}
                    >
                      {label}
                      {currentLang === code && <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#4da6ff', flexShrink: 0 }} />}
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
                    border: userMenuOpen ? '1px solid rgba(0,102,204,0.5)' : '1px solid transparent',
                    background: userMenuOpen ? 'rgba(0,102,204,0.2)' : 'transparent',
                    color: '#8ab0d0', cursor: 'pointer', transition: 'all 0.18s',
                  }}
                  onMouseEnter={(e) => { if (!userMenuOpen) { e.currentTarget.style.background = 'rgba(0,102,204,0.2)'; e.currentTarget.style.borderColor = 'rgba(0,102,204,0.4)'; e.currentTarget.style.color = '#fff' } }}
                  onMouseLeave={(e) => { if (!userMenuOpen) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = 'transparent'; e.currentTarget.style.color = '#8ab0d0' } }}
                >
                  <User size={18} />
                  <span style={{ fontSize: '0.65rem', maxWidth: 64, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} className="hidden sm:block">
                    {user.name.split(' ')[0]}
                  </span>
                </button>

                {userMenuOpen && (
                  <div style={{
                    position: 'absolute', right: 0, top: '100%', marginTop: 8,
                    width: 220, background: '#0c1a32',
                    border: '1px solid rgba(0,102,204,0.3)',
                    borderRadius: 14, boxShadow: '0 20px 60px rgba(0,0,0,0.6)',
                    overflow: 'hidden', zIndex: 50,
                  }}>
                    <div style={{ padding: '14px 16px', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
                      <p style={{ color: '#fff', fontWeight: 700, fontSize: '0.9rem', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user.name}</p>
                      <p style={{ color: '#4d6b8c', fontSize: '0.75rem', margin: '2px 0 0' }}>{user.email}</p>
                    </div>

                    {[
                      { to: '/profile', icon: User,    label: t('nav.profile') },
                      { to: '/orders',  icon: Package, label: t('nav.orders') },
                    ].map(({ to, icon: Icon, label }) => (
                      <Link key={to} to={to} onClick={() => setUserMenuOpen(false)}
                        style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 16px', color: '#8ab0d0', textDecoration: 'none', fontSize: '0.875rem', transition: 'all 0.15s' }}
                        onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(0,102,204,0.18)'; e.currentTarget.style.color = '#fff' }}
                        onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#8ab0d0' }}
                      >
                        <Icon size={14} style={{ opacity: 0.6 }} /> {label}
                      </Link>
                    ))}

                    {user.role === 'admin' && (
                      <Link to="/admin" onClick={() => setUserMenuOpen(false)}
                        style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 16px', color: '#4da6ff', textDecoration: 'none', fontSize: '0.875rem', fontWeight: 600, transition: 'all 0.15s' }}
                        onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(0,102,204,0.18)'; e.currentTarget.style.color = '#fff' }}
                        onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#4da6ff' }}
                      >
                        <LayoutDashboard size={14} /> {t('nav.admin')}
                      </Link>
                    )}

                    {user.role === 'seller' && (
                      <Link to="/seller" onClick={() => setUserMenuOpen(false)}
                        style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 16px', color: '#4da6ff', textDecoration: 'none', fontSize: '0.875rem', fontWeight: 600, transition: 'all 0.15s' }}
                        onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(0,102,204,0.18)'; e.currentTarget.style.color = '#fff' }}
                        onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#4da6ff' }}
                      >
                        <Settings size={14} /> {t('nav.seller')}
                      </Link>
                    )}

                    <div style={{ borderTop: '1px solid rgba(255,255,255,0.07)', margin: '4px 0 0' }}>
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
                padding: '8px', borderRadius: 10, border: '1px solid rgba(255,255,255,0.12)',
                background: 'rgba(255,255,255,0.06)', color: '#8ab0d0', cursor: 'pointer',
                transition: 'all 0.18s',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(0,102,204,0.2)'; e.currentTarget.style.color = '#fff' }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; e.currentTarget.style.color = '#8ab0d0' }}
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
                color: !activeCatId ? '#fff' : '#6a90b4',
                background: !activeCatId ? '#0066CC' : 'transparent',
                textDecoration: 'none', whiteSpace: 'nowrap',
                display: 'flex', alignItems: 'center', transition: 'all 0.15s',
                boxShadow: !activeCatId ? '0 0 16px rgba(0,102,204,0.4)' : 'none',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = !activeCatId ? '#0052A3' : 'rgba(0,102,204,0.2)'
                e.currentTarget.style.color = '#fff'
                if (!activeCatId) e.currentTarget.style.boxShadow = '0 0 22px rgba(0,102,204,0.6)'
                else e.currentTarget.style.boxShadow = 'inset 0 -2px 0 #0066CC'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = !activeCatId ? '#0066CC' : 'transparent'
                e.currentTarget.style.color = !activeCatId ? '#fff' : '#6a90b4'
                e.currentTarget.style.boxShadow = !activeCatId ? '0 0 16px rgba(0,102,204,0.4)' : 'none'
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
                    color: isActive ? '#fff' : '#6a90b4',
                    background: isActive ? '#0066CC' : 'transparent',
                    textDecoration: 'none', whiteSpace: 'nowrap',
                    display: 'flex', alignItems: 'center',
                    borderLeft: '1px solid rgba(255,255,255,0.05)',
                    transition: 'all 0.15s',
                    boxShadow: isActive ? '0 0 16px rgba(0,102,204,0.4)' : 'none',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = '#fff'
                    e.currentTarget.style.background = isActive ? '#0052A3' : 'rgba(0,102,204,0.2)'
                    e.currentTarget.style.boxShadow = isActive ? '0 0 22px rgba(0,102,204,0.6)' : 'inset 0 -2px 0 #0066CC'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = isActive ? '#fff' : '#6a90b4'
                    e.currentTarget.style.background = isActive ? '#0066CC' : 'transparent'
                    e.currentTarget.style.boxShadow = isActive ? '0 0 16px rgba(0,102,204,0.4)' : 'none'
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
        <div className="md:hidden" style={{ background: '#0c1a32', borderBottom: BORDER, boxShadow: '0 8px 32px rgba(0,0,0,0.4)' }}>
          {[
            { to: '/',         label: t('nav.home') },
            { to: '/products', label: t('nav.products') },
          ].map(({ to, label }) => (
            <Link key={to} to={to} onClick={() => dispatch(setMobileMenuOpen(false))}
              style={{ display: 'block', padding: '11px 20px', fontSize: '0.875rem', color: '#8ab0d0', textDecoration: 'none', borderBottom: '1px solid rgba(255,255,255,0.04)', transition: 'all 0.15s' }}
              onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(0,102,204,0.15)'; e.currentTarget.style.color = '#fff' }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#8ab0d0' }}
            >{label}</Link>
          ))}
          {categories.slice(0, 10).map((cat) => (
            <Link key={cat.id} to={`/products?category_id=${cat.id}`} onClick={() => dispatch(setMobileMenuOpen(false))}
              style={{ display: 'block', padding: '9px 20px 9px 36px', fontSize: '0.82rem', color: '#4d6b8c', textDecoration: 'none', borderBottom: '1px solid rgba(255,255,255,0.03)', transition: 'all 0.15s' }}
              onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(0,102,204,0.12)'; e.currentTarget.style.color = '#8ab0d0' }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#4d6b8c' }}
            >
              {cat.name_fr || cat.name}
            </Link>
          ))}
          {!user && (
            <Link to="/login" onClick={() => dispatch(setMobileMenuOpen(false))}
              style={{ display: 'block', padding: '11px 20px', fontSize: '0.875rem', fontWeight: 700, color: '#4da6ff', textDecoration: 'none', transition: 'all 0.15s' }}
              onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(0,102,204,0.15)'; e.currentTarget.style.color = '#fff' }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#4da6ff' }}
            >{t('nav.login')}</Link>
          )}
        </div>
      )}
    </header>
  )
}
