import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { useTranslation } from 'react-i18next'
import { ArrowRight, Zap, Shield, RotateCcw, Truck, Flame } from 'lucide-react'
import api from '../services/api'
import ProductCard from '../components/ProductCard'

function useCountdown() {
  const getRemaining = () => {
    const now = new Date()
    const midnight = new Date(now); midnight.setHours(24, 0, 0, 0)
    const diff = Math.max(0, Math.floor((midnight - now) / 1000))
    return { h: Math.floor(diff / 3600), m: Math.floor((diff % 3600) / 60), s: diff % 60 }
  }
  const [time, setTime] = useState(getRemaining)
  useEffect(() => {
    const id = setInterval(() => setTime(getRemaining()), 1000)
    return () => clearInterval(id)
  }, [])
  return time
}

/* ── Demo products (shown when the API returns nothing) ── */
function Countdown() {
  const countdown = useCountdown()
  return (
    <>
      {[
        { val: countdown.h, label: 'h' },
        { val: countdown.m, label: 'm' },
        { val: countdown.s, label: 's' },
      ].map(({ val, label }, i) => (
        <span key={label} style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          {i > 0 && <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#ef4444' }}>:</span>}
          <span style={{
            minWidth: 32, height: 28, display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            background: '#ef4444', color: '#fff', fontWeight: 800, fontSize: '0.8125rem',
            borderRadius: 6, fontVariantNumeric: 'tabular-nums',
          }}>
            {String(val).padStart(2, '0')}{label}
          </span>
        </span>
      ))}
    </>
  )
}

export default function HomePage() {
  const { t } = useTranslation()
  const { user } = useSelector((s) => s.auth)
  const [featured, setFeatured] = useState([])
  const [loading, setLoading] = useState(true)
  const [recentlyViewed, setRecentlyViewed] = useState(() => {
    try { return JSON.parse(localStorage.getItem('recentlyViewed') || '[]') } catch { return [] }
  })
  const [flashProducts, setFlashProducts] = useState([])

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await api.get('/products/featured')
        setFeatured(data.data || [])
      } catch {}
      finally { setLoading(false) }
    }
    const loadFlash = async () => {
      try {
        const { data } = await api.get('/products', { params: { sort: 'discount', per_page: 8 } })
        setFlashProducts((data.data || []).filter((p) => p.discount_percent > 0).slice(0, 8))
      } catch {}
    }
    load()
    loadFlash()
  }, [])

  const displayProducts = featured

  return (
    <div style={{ background: 'var(--bg-page)' }}>

      {/* ── Hero ─────────────────────────────────────────── */}
      <section style={{ padding: '8px 16px 16px', boxSizing: 'border-box' }}>
        <div style={{
          background: 'linear-gradient(135deg, var(--primary-btn) 0%, var(--primary-btn-hover) 100%)',
          borderRadius: '12px',
          overflow: 'hidden',
          boxSizing: 'border-box',
          padding: '1.5rem 2rem',
        }}>
          <div className="flex flex-col lg:flex-row items-center gap-10">

            {/* Left: text */}
            <div style={{ flex: 1, minWidth: 0, boxSizing: 'border-box' }} className="text-center lg:text-left">
              <p className="text-[10px] font-semibold uppercase tracking-widest mb-3" style={{ color: 'rgba(255,255,255,0.60)' }}>
                {t('home.welcome')}
              </p>
              <h1 className="text-xl lg:text-2xl font-bold leading-snug mb-3" style={{ color: '#fff' }}>
                {t('home.heroTitle')}
              </h1>
              <p className="text-xs leading-relaxed mb-6 max-w-sm mx-auto lg:mx-0" style={{ color: 'rgba(255,255,255,0.75)' }}>
                {t('home.heroSub')}
              </p>
              <div className="flex items-center gap-2 flex-wrap justify-center lg:justify-start" style={{ marginTop: '1rem' }}>
                <Link
                  to="/products"
                  className="inline-flex items-center justify-center gap-2 font-semibold transition-all"
                  style={{ background: '#fff', color: 'var(--primary-btn)', borderRadius: 10, border: '1.5px solid rgba(255,255,255,0.6)', boxShadow: '0 2px 10px rgba(0,0,0,0.15)', padding: '12px 28px', fontSize: '0.95rem' }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = '#f0f0f0'; e.currentTarget.style.transform = 'translateY(-1px)' }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = '#fff'; e.currentTarget.style.transform = 'none' }}
                >
                  {t('home.exploreBtn')} <ArrowRight size={15} />
                </Link>
                {!user && (
                  <Link
                    to="/register"
                    className="inline-flex items-center gap-2 font-semibold transition-all"
                    style={{ border: '1.5px solid rgba(255,255,255,0.40)', color: '#fff', borderRadius: 8, padding: '12px 28px', fontSize: '0.95rem' }}
                    onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.12)'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                  >
                    {t('home.createAccount')}
                  </Link>
                )}
              </div>
            </div>

            {/* Right: promo card */}
            <div
              className="flex-shrink-0 w-full lg:w-56"
              style={{
                background: 'var(--bg-card)',
                border: '1px solid var(--border-light)',
                borderRadius: 12,
                padding: '1.5rem',
                textAlign: 'center',
                boxSizing: 'border-box',
                boxShadow: '0 12px 40px rgba(0,0,0,0.18)',
              }}
            >
              <p className="text-4xl font-extrabold mb-1" style={{ color: 'var(--primary)', lineHeight: 1 }}>-10%</p>
              <p className="text-sm font-bold mb-2" style={{ color: 'var(--text-1)' }}>{t('home.firstOrderOff')}</p>
              <p className="text-xs mb-3" style={{ color: 'var(--text-2)' }}>{t('home.useCode')}</p>
              <div
                className="inline-block font-mono font-bold rounded-lg"
                style={{ background: 'var(--bg-accent)', color: 'var(--primary)', border: '1.5px solid var(--border-accent)', letterSpacing: '0.1em', padding: '10px 22px', fontSize: '1rem' }}
              >
                WELCOME10
              </div>
              <p className="text-xs mt-2" style={{ color: 'var(--text-3)' }}>{t('home.validFirst')}</p>
            </div>

          </div>
        </div>
      </section>

      {/* ── Trust strip ──────────────────────────────────── */}
      <section style={{ padding: '0 16px 16px', boxSizing: 'border-box' }}>
        <div style={{ background: 'var(--bg-card)', border: '1.5px solid var(--border-light)', borderRadius: 12, overflow: 'hidden' }}>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-center">
            {[
              { icon: Truck,     key: 'delivery' },
              { icon: Shield,    key: 'securePay' },
              { icon: RotateCcw, key: 'freeReturns' },
              { icon: Zap,       key: 'support' },
            ].map(({ icon: Icon, key }, i) => (
              <div
                key={key}
                className="flex items-center gap-3 px-8 py-4 text-sm flex-1 justify-center"
                style={{ color: 'var(--text-2)', borderRight: i < 3 ? '1px solid var(--border-light)' : 'none' }}
              >
                <Icon size={16} className="flex-shrink-0" style={{ color: 'var(--primary)' }} />
                <span className="font-medium">{t(`home.${key}`)}</span>
              </div>
            ))}
          </div>
        </div>
      </section>


      {/* ── Featured Products ────────────────────────────── */}
      <section style={{ padding: '0 16px 16px', boxSizing: 'border-box' }}>
        <div style={{ background: 'var(--bg-card)', border: '1.5px solid var(--border-light)', borderRadius: 12, padding: '20px' }}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div style={{ width: 4, height: 24, background: 'var(--primary)', borderRadius: 3, flexShrink: 0 }} />
              <h2 className="text-base font-bold" style={{ color: 'var(--text-1)' }}>
                {featured.length > 0 ? t('home.featuredProducts') : t('home.popularProducts')}
              </h2>
            </div>
            <Link to="/products" className="text-xs font-semibold flex items-center gap-1" style={{ color: 'var(--primary)' }}
              onMouseEnter={(e) => e.currentTarget.style.textDecoration = 'underline'}
              onMouseLeave={(e) => e.currentTarget.style.textDecoration = 'none'}
            >
              {t('home.viewAll')} <ArrowRight size={12} />
            </Link>
          </div>

          <div style={{ borderTop: '1px solid var(--border-light)', marginBottom: 20 }} />

          {loading ? (
            <div className="product-grid">
              {Array.from({ length: 12 }).map((_, i) => (
                <div key={i} style={{ borderRadius: 12, border: '1.5px solid var(--border)', overflow: 'hidden', background: 'var(--bg-card)' }}>
                  <div className="skeleton" style={{ height: 220 }} />
                  <div className="p-3 space-y-2">
                    <div className="skeleton h-3 w-full" />
                    <div className="skeleton h-3 w-2/3" />
                    <div className="skeleton h-4 w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="product-grid">
              {displayProducts.map((p) => <ProductCard key={p.id} product={p} />)}
            </div>
          )}
        </div>
      </section>

      {/* ── Flash Sale ───────────────────────────────────── */}
      {(
        <section style={{ padding: '0 16px 16px', boxSizing: 'border-box' }}>
          <div style={{ background: 'var(--bg-card)', border: '1.5px solid var(--border-light)', borderRadius: 12, padding: '20px' }}>
            {/* Header row */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16, flexWrap: 'wrap', gap: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 4, height: 24, background: '#ef4444', borderRadius: 3, flexShrink: 0 }} />
                <Flame size={18} style={{ color: '#ef4444', flexShrink: 0 }} />
                <h2 style={{ fontSize: '0.9375rem', fontWeight: 800, color: 'var(--text-1)', margin: 0 }}>{t('home.flashSale')}</h2>
              </div>
              {/* Countdown */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-3)', fontWeight: 500 }}>{t('home.flashSaleEnds')}:</span>
                <Countdown />
              </div>
              <Link to="/products?sort=discount" style={{ fontSize: '0.78rem', fontWeight: 600, color: '#ef4444', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 4 }}
                onMouseEnter={(e) => e.currentTarget.style.textDecoration = 'underline'}
                onMouseLeave={(e) => e.currentTarget.style.textDecoration = 'none'}
              >
                {t('home.viewAll')} <ArrowRight size={12} />
              </Link>
            </div>
            <div style={{ borderTop: '1px solid var(--border-light)', marginBottom: 16 }} />
            {flashProducts.length === 0 ? (
              <p style={{ textAlign: 'center', padding: '32px 0', color: 'var(--text-3)', fontSize: '0.875rem' }}>{t('home.flashSaleEmpty')}</p>
            ) : (
              <div className="product-grid">
                {flashProducts.map((p) => <ProductCard key={p.id} product={p} />)}
              </div>
            )}
          </div>
        </section>
      )}

      {/* ── Recently Viewed ──────────────────────────────── */}
      {recentlyViewed.length > 0 && (
        <section style={{ padding: '0 16px 16px', boxSizing: 'border-box' }}>
          <div style={{ background: 'var(--bg-card)', border: '1.5px solid var(--border-light)', borderRadius: 12, padding: '20px 20px 16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 4, height: 20, background: 'var(--primary)', borderRadius: 3, flexShrink: 0 }} />
                <h2 style={{ fontSize: '0.9375rem', fontWeight: 700, color: 'var(--text-1)', margin: 0 }}>{t('home.recentlyViewed')}</h2>
              </div>
              <button
                onClick={() => { localStorage.removeItem('recentlyViewed'); setRecentlyViewed([]) }}
                style={{ fontSize: '0.72rem', color: 'var(--text-3)', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}
              >{t('common.clear')}</button>
            </div>
            <div style={{ display: 'flex', gap: 12, overflowX: 'auto', paddingBottom: 4 }}>
              {recentlyViewed.map((p) => (
                <Link
                  key={p.id}
                  to={`/products/${p.slug}`}
                  style={{ flexShrink: 0, width: 140, textDecoration: 'none', display: 'flex', flexDirection: 'column', gap: 8, padding: 10, background: 'var(--bg-page)', border: '1.5px solid var(--border-light)', borderRadius: 10, transition: 'border-color 0.15s' }}
                  onMouseEnter={(e) => e.currentTarget.style.borderColor = 'var(--border-accent)'}
                  onMouseLeave={(e) => e.currentTarget.style.borderColor = 'var(--border-light)'}
                >
                  <img
                    src={p.primary_image_url}
                    alt={p.name}
                    style={{ width: '100%', height: 90, objectFit: 'cover', borderRadius: 7 }}
                    onError={(e) => e.target.src = '/placeholder.jpg'}
                  />
                  <p style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-1)', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.name}</p>
                  <p style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--primary)', margin: 0 }}>{Number(p.final_price).toLocaleString()} MAD</p>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── Promo banner ─────────────────────────────────── */}
      <section style={{ padding: '0 16px 16px', boxSizing: 'border-box' }}>
        <div
          style={{
            background: 'var(--bg-card)',
            border: '1.5px solid var(--border)',
            borderRadius: 12,
            boxShadow: '0 2px 12px var(--brand-sm)',
            padding: '20px 24px',
            boxSizing: 'border-box',
            overflow: 'hidden',
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            gap: 16,
          }}
        >
          <div style={{ flex: 1, minWidth: 0 }}>
            <p className="text-xs font-semibold uppercase tracking-widest mb-1" style={{ color: 'var(--text-3)' }}>{t('home.limitedOffer')}</p>
            <h2 className="text-base font-bold mb-1" style={{ color: 'var(--text-1)' }}>{t('home.promoTitle')}</h2>
            <p className="text-sm" style={{ color: 'var(--text-2)' }}>
              {t('home.promoSub', { code: 'WELCOME10' })}
            </p>
          </div>
          <Link to="/products" className="btn-primary inline-flex items-center gap-2 px-5 py-2 text-sm" style={{ flexShrink: 0, marginLeft: 'auto' }}>
            {t('home.orderNow')} <ArrowRight size={13} />
          </Link>
        </div>
      </section>

    </div>
  )
}
